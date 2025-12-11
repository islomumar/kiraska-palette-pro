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
  totalAmount: number;
}

async function sendTelegramNotification(order: any, products: OrderProduct[]) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

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

async function updateProductStock(supabase: any, products: OrderProduct[]) {
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

    // Validate input
    if (!body.customerName || !body.phone || !body.address || !body.products || !body.totalAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(body.products) || body.products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Products array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save order to database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customerName,
        phone: body.phone,
        address: body.address,
        notes: body.notes || null,
        products: body.products,
        total_amount: body.totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created:', order.id);

    // Update product stock quantities
    await updateProductStock(supabase, body.products);

    // Send Telegram notification
    await sendTelegramNotification(order, body.products);

    return new Response(
      JSON.stringify({ success: true, orderId: order.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
