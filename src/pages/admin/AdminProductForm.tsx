import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

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
});

type ProductFormData = z.infer<typeof productSchema>;

const volumeOptions = ['1L', '3L', '5L', '10L', '15L', '20L'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

            {/* Pricing & Stock */}
            <Card>
              <CardHeader>
                <CardTitle>Narx va mavjudlik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Narxi (so'm) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="old_price">Eski narxi (so'm)</Label>
                  <Input
                    id="old_price"
                    type="number"
                    value={formData.old_price || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        old_price: e.target.value ? Number(e.target.value) : null,
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

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in_stock"
                      checked={formData.in_stock}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, in_stock: !!checked }))
                      }
                    />
                    <Label htmlFor="in_stock">Mavjud (In Stock)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_featured: !!checked }))
                      }
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_bestseller"
                      checked={formData.is_bestseller}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_bestseller: !!checked }))
                      }
                    />
                    <Label htmlFor="is_bestseller">Bestseller</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Rasm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                {formData.image_url && (
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
                )}
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Tavsif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="short_description">Qisqa tavsif</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                    }
                    rows={3}
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
                    rows={5}
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
