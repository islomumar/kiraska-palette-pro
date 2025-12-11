import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';

interface Category {
  id: string;
  name: string;
}

const productSchema = z.object({
  name: z.string().min(1, 'Mahsulot nomi kiritilishi shart'),
  slug: z.string().min(1, 'Slug kiritilishi shart'),
  price: z.number().min(0, 'Narx 0 dan kam bo\'lmasligi kerak'),
  old_price: z.number().nullable(),
  brand: z.string().nullable(),
  volume: z.string().nullable(),
  color_name: z.string().nullable(),
  in_stock: z.boolean(),
  is_featured: z.boolean(),
  is_bestseller: z.boolean(),
  image_url: z.string().nullable(),
  short_description: z.string().nullable(),
  full_description: z.string().nullable(),
  category_id: z.string().nullable(),
  stock_quantity: z.number().min(0, 'Zaxira 0 dan kam bo\'lmasligi kerak'),
  low_stock_threshold: z.number().min(0, 'Chegara 0 dan kam bo\'lmasligi kerak'),
});

type ProductFormData = z.infer<typeof productSchema>;

const volumeOptions = ['1L', '3L', '5L', '10L', '15L', '20L'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    price: 0,
    old_price: null,
    brand: '',
    volume: '',
    color_name: '',
    in_stock: true,
    is_featured: false,
    is_bestseller: false,
    image_url: '',
    short_description: '',
    full_description: '',
    category_id: null,
    stock_quantity: 0,
    low_stock_threshold: 5,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          toast({
            title: 'Xatolik',
            description: 'Mahsulot topilmadi',
            variant: 'destructive',
          });
          navigate('/admin/products');
        } else {
          setFormData({
            name: data.name,
            slug: data.slug,
            price: Number(data.price),
            old_price: data.old_price ? Number(data.old_price) : null,
            brand: data.brand || '',
            volume: data.volume || '',
            color_name: data.color_name || '',
            in_stock: data.in_stock ?? true,
            is_featured: data.is_featured ?? false,
            is_bestseller: data.is_bestseller ?? false,
            image_url: data.image_url || '',
            short_description: data.short_description || '',
            full_description: data.full_description || '',
            category_id: data.category_id,
            stock_quantity: data.stock_quantity ?? 0,
            low_stock_threshold: data.low_stock_threshold ?? 5,
          });
        }
        setIsLoading(false);
      };

      fetchProduct();
    }
  }, [id, isEditing, navigate, toast]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleStockQuantityChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      stock_quantity: value,
      in_stock: value > 0,
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Xatolik',
        description: 'Faqat rasm fayllarini yuklash mumkin',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Xatolik',
        description: 'Fayl hajmi 5MB dan oshmasligi kerak',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: 'Muvaffaqiyat',
        description: 'Rasm muvaffaqiyatli yuklandi',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Xatolik',
        description: 'Rasmni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = productSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);

    const productData = {
      ...formData,
      brand: formData.brand || null,
      volume: formData.volume || null,
      color_name: formData.color_name || null,
      image_url: formData.image_url || null,
      short_description: formData.short_description || null,
      full_description: formData.full_description || null,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id));
    } else {
      ({ error } = await supabase.from('products').insert([{
        name: formData.name,
        slug: formData.slug,
        price: formData.price,
        old_price: formData.old_price,
        brand: formData.brand || null,
        volume: formData.volume || null,
        color_name: formData.color_name || null,
        in_stock: formData.in_stock,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        image_url: formData.image_url || null,
        short_description: formData.short_description || null,
        full_description: formData.full_description || null,
        category_id: formData.category_id,
        stock_quantity: formData.stock_quantity,
        low_stock_threshold: formData.low_stock_threshold,
      }]));
    }

    if (error) {
      toast({
        title: 'Xatolik',
        description: `Mahsulotni ${isEditing ? 'yangilash' : 'qo\'shish'}da xatolik yuz berdi`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: `Mahsulot muvaffaqiyatli ${isEditing ? 'yangilandi' : 'qo\'shildi'}`,
      });
      navigate('/admin/products');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Mahsulot ma\'lumotlarini yangilang' : 'Yangi mahsulot qo\'shing'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Asosiy ma'lumotlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nomi *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategoriya</Label>
                  <Select
                    value={formData.category_id || 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: value === 'none' ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategoriya tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanlanmagan</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brend</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Narx</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Narxi (so'm) *</Label>
                  <FormattedNumberInput
                    id="price"
                    value={formData.price}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, price: value }))
                    }
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="old_price">Eski narxi (so'm)</Label>
                  <FormattedNumberInput
                    id="old_price"
                    value={formData.old_price || 0}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        old_price: value > 0 ? value : null,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Hajmi</Label>
                  <Select
                    value={formData.volume || 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        volume: value === 'none' ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hajmini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanlanmagan</SelectItem>
                      {volumeOptions.map((vol) => (
                        <SelectItem key={vol} value={vol}>
                          {vol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color_name">Rang nomi</Label>
                  <Input
                    id="color_name"
                    value={formData.color_name || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color_name: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stock Management */}
            <Card>
              <CardHeader>
                <CardTitle>Zaxira boshqaruvi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Zaxira miqdori *</Label>
                  <FormattedNumberInput
                    id="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={(value) => handleStockQuantityChange(value)}
                  />
                  {errors.stock_quantity && <p className="text-sm text-destructive">{errors.stock_quantity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Kam zaxira chegarasi</Label>
                  <FormattedNumberInput
                    id="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, low_stock_threshold: value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Zaxira bu miqdordan kam bo'lganda ogohlantirish ko'rsatiladi
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="in_stock">Mavjud (In Stock)</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.in_stock ? 'Mahsulot sotuvda' : 'Mahsulot mavjud emas'}
                    </p>
                  </div>
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, in_stock: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="is_featured">Featured</Label>
                    <p className="text-xs text-muted-foreground">Bosh sahifada ko'rsatiladi</p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_featured: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="is_bestseller">Bestseller</Label>
                    <p className="text-xs text-muted-foreground">Eng ko'p sotilgan deb belgilanadi</p>
                  </div>
                  <Switch
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_bestseller: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Rasm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image input mode toggle */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={imageInputMode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputMode('upload')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Yuklash
                  </Button>
                  <Button
                    type="button"
                    variant={imageInputMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageInputMode('url')}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                  </Button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Yuklanmoqda...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Rasm tanlash
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Rasm URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {formData.image_url ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Rasm tanlanmagan</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Tavsif</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="short_description">Qisqa tavsif</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">To'liq tavsif</Label>
                  <Textarea
                    id="full_description"
                    value={formData.full_description || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, full_description: e.target.value }))
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
