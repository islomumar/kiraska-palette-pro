import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, FolderTree, Loader2, Upload, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

const categorySchema = z.object({
  name: z.string().min(1, 'Kategoriya nomi kiritilishi shart'),
  slug: z.string().min(1, 'Slug kiritilishi shart'),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, is_active')
      .order('name');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Kategoriyalarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Xatolik',
        description: 'Faqat JPG, PNG, WEBP va GIF formatlarida rasm yuklash mumkin',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Xatolik',
        description: 'Rasm hajmi 5MB dan oshmasligi kerak',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `category-${Date.now()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Xatolik',
        description: 'Rasmni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    setFormData((prev) => ({ ...prev, image_url: publicUrlData.publicUrl }));
    setIsUploading(false);
    toast({
      title: 'Muvaffaqiyat',
      description: 'Rasm muvaffaqiyatli yuklandi',
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image_url: '', is_active: true });
    setErrors({});
    setImageInputMode('url');
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
    });
    setErrors({});
    setImageInputMode('url');
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', categoryId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Holatni o\'zgartirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: isActive ? 'Kategoriya faollashtirildi' : 'Kategoriya o\'chirildi',
      });
      fetchCategories();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = categorySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    let error;
    if (editingCategory) {
      ({ error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id));
    } else {
      ({ error } = await supabase.from('categories').insert([categoryData]));
    }

    if (error) {
      toast({
        title: 'Xatolik',
        description: `Kategoriyani ${editingCategory ? 'yangilash' : 'qo\'shish'}da xatolik yuz berdi`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: `Kategoriya muvaffaqiyatli ${editingCategory ? 'yangilandi' : 'qo\'shildi'}`,
      });
      setIsDialogOpen(false);
      fetchCategories();
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Kategoriyani o\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Kategoriya muvaffaqiyatli o\'chirildi',
      });
      fetchCategories();
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kategoriyalar</h1>
            <p className="text-muted-foreground">
              Barcha kategoriyalarni boshqarish
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi kategoriya
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kategoriyalar ro'yxati ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Kategoriyalar topilmadi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rasm</TableHead>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Holati</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary">
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.slug}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={category.is_active}
                              onCheckedChange={(checked) => handleToggleActive(category.id, checked)}
                            />
                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                              {category.is_active ? 'Faol' : 'Nofaol'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? 'Kategoriya ma\'lumotlarini yangilang'
                  : 'Yangi kategoriya qo\'shing'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nomi *</Label>
                <Input
                  id="cat-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug *</Label>
                <Input
                  id="cat-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-description">Tavsif</Label>
                <Textarea
                  id="cat-description"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Kategoriya rasmi</Label>
                <Tabs value={imageInputMode} onValueChange={(v) => setImageInputMode(v as 'url' | 'upload')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Yuklash
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </TabsContent>
                </Tabs>
                {formData.image_url && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Ko'rib chiqish:</p>
                    <div className="h-24 w-24 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
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
                    'Saqlash'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kategoriyani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham bu kategoriyani o'chirmoqchimisiz? Bu amalni qaytarib
                bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    O'chirilmoqda...
                  </>
                ) : (
                  "O'chirish"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
