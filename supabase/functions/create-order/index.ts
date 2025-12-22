import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderRequest {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  products: OrderProduct[];
  totalAmount?: number; // Now optional - will be calculated server-side
}

interface ValidatedProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  serverPrice: number; // Actual price from database
}

async function validateAndCalculatePrices(
  supabase: any,
  products: OrderProduct[]
): Promise<{ validatedProducts: ValidatedProduct[]; calculatedTotal: number; errors: string[] }> {
  const errors: string[] = [];
  const validatedProducts: ValidatedProduct[] = [];
  let calculatedTotal = 0;

  // Get all product IDs
  const productIds = products.map(p => p.id);

  // Fetch actual product prices from database
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, name, price, in_stock, stock_quantity, is_active, image_url')
    .in('id', productIds);

  if (error) {
    console.error('Error fetching products:', error);
    errors.push('Ma\'lumotlar bazasidan mahsulotlarni olishda xatolik');
    return { validatedProducts: [], calculatedTotal: 0, errors };
  }

  // Create a map for quick lookup
  const dbProductMap = new Map(dbProducts?.map((p: any) => [p.id, p]) || []);

  for (const clientProduct of products) {
    const dbProduct = dbProductMap.get(clientProduct.id) as any;

    if (!dbProduct) {
      errors.push(`Mahsulot topilmadi: ${clientProduct.name} (ID: ${clientProduct.id})`);
      continue;
    }

    if (!dbProduct.is_active) {
      errors.push(`Mahsulot faol emas: ${dbProduct.name}`);
      continue;
    }

    if (!dbProduct.in_stock || (dbProduct.stock_quantity !== null && dbProduct.stock_quantity < clientProduct.quantity)) {
      errors.push(`Mahsulot omborda yetarli emas: ${dbProduct.name} (Mavjud: ${dbProduct.stock_quantity || 0}, So'ralgan: ${clientProduct.quantity})`);
      continue;
    }

    if (clientProduct.quantity <= 0) {
      errors.push(`Noto'g'ri miqdor: ${dbProduct.name}`);
      continue;
    }

    // Use server-side price, not client-provided price
    const serverPrice = dbProduct.price;
    const itemTotal = serverPrice * clientProduct.quantity;
    calculatedTotal += itemTotal;

    validatedProducts.push({
      id: clientProduct.id,
      name: dbProduct.name, // Use server-side name
      price: serverPrice, // Use server-side price
      quantity: clientProduct.quantity,
      image_url: dbProduct.image_url || clientProduct.image_url,
      serverPrice: serverPrice,
    });

    // Log price discrepancy for audit
    if (clientProduct.price !== serverPrice) {
      console.warn(
        `Price mismatch detected for product ${dbProduct.name}: ` +
        `Client sent ${clientProduct.price}, actual price is ${serverPrice}`
      );
    }
  }

  console.log(`Price validation complete: ${validatedProducts.length} products validated, total: ${calculatedTotal} so'm`);

  return { validatedProducts, calculatedTotal, errors };
}

async function sendTelegramNotification(supabase: any, order: any, products: ValidatedProduct[]) {
  // First try to get from site_settings (admin panel)
  const { data: telegramSettings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['telegram_bot_token', 'telegram_chat_id']);

  let botToken = telegramSettings?.find((s: any) => s.key === 'telegram_bot_token')?.value;
  let chatId = telegramSettings?.find((s: any) => s.key === 'telegram_chat_id')?.value;

  // Fall back to environment variables if not set in admin
  if (!botToken) botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!chatId) chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    console.log('Telegram credentials not configured, skipping notification');
    return;
  }

  const productsList = products
    .map((p) => `  • ${p.name} × ${p.quantity} = ${(p.price * p.quantity).toLocaleString()} so'm`)
    .join('\n');

  const message = `🛒 *Yangi buyurtma!*
ID: \`${order.id.slice(0, 8)}\`

👤 *Mijoz:* ${order.customer_name}
📞 *Telefon:* ${order.phone}
📍 *Manzil:* ${order.address || 'Ko\'rsatilmagan'}
${order.notes ? `📝 *Izoh:* ${order.notes}` : ''}

📦 *Mahsulotlar:*
${productsList}

💰 *Umumiy summa:* ${order.total_amount.toLocaleString()} so'm
🕒 *Sana:* ${new Date(order.created_at).toLocaleString('uz-UZ')}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram notification failed:', error);
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

async function updateProductStock(supabase: any, products: ValidatedProduct[]) {
  for (const product of products) {
    try {
      // Get current stock
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product.id)
        .single();

      if (fetchError) {
        console.error(`Error fetching product ${product.id}:`, fetchError);
        continue;
      }

      const newQuantity = Math.max(0, (currentProduct.stock_quantity || 0) - product.quantity);

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0,
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating stock for product ${product.id}:`, updateError);
        continue;
      }

      // Record stock history
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          product_id: product.id,
          change: -product.quantity,
          type: 'sale',
          notes: `Buyurtma orqali sotildi`,
        });

      if (historyError) {
        console.error(`Error recording stock history for product ${product.id}:`, historyError);
      } else {
        console.log(`Stock updated for product ${product.id}: -${product.quantity}`);
      }
    } catch (error) {
      console.error(`Error processing stock for product ${product.id}:`, error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: OrderRequest = await req.json();

    // Validate required input fields
    if (!body.customerName || !body.phone || !body.address || !body.products) {
      return new Response(
        JSON.stringify({ error: 'Majburiy maydonlar to\'ldirilmagan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(body.products) || body.products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Mahsulotlar ro\'yxati bo\'sh' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate products and calculate total server-side
    const { validatedProducts, calculatedTotal, errors } = await validateAndCalculatePrices(
      supabase,
      body.products
    );

    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return new Response(
        JSON.stringify({ error: 'Mahsulotlarni tekshirishda xatolik', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (validatedProducts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Hech qanday yaroqli mahsulot topilmadi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log if client total differs from calculated total
    if (body.totalAmount && body.totalAmount !== calculatedTotal) {
      console.warn(
        `Total amount mismatch: Client sent ${body.totalAmount}, calculated ${calculatedTotal}. Using calculated value.`
      );
    }

    // Prepare products for storage (without serverPrice field)
    const productsForStorage = validatedProducts.map(({ serverPrice, ...product }) => product);

    // Save order to database with SERVER-CALCULATED total
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customerName,
        phone: body.phone,
        address: body.address,
        notes: body.notes || null,
        products: productsForStorage,
        total_amount: calculatedTotal, // Always use server-calculated total
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Buyurtmani saqlashda xatolik' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Order created: ${order.id}, Total: ${calculatedTotal} so'm`);

    // Update product stock quantities
    await updateProductStock(supabase, validatedProducts);

    // Send Telegram notification
    await sendTelegramNotification(supabase, order, validatedProducts);

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        totalAmount: calculatedTotal // Return calculated total to client
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Ichki server xatosi' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
