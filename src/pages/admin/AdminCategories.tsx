import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { MultiLangValue, getLocalizedText, jsonToMultiLang } from '@/components/admin/MultiLangInput';
import { GlobalLangTabs } from '@/components/admin/GlobalLangTabs';
import { SingleLangInput } from '@/components/admin/SingleLangInput';
import { Json } from '@/integrations/supabase/types';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface Category {
  id: string;
  name: string;
  name_ml: MultiLangValue;
  slug: string;
  description: string | null;
  description_ml: MultiLangValue;
  image_url: string | null;
  is_active: boolean;
}

interface CategoryFormData {
  name_ml: MultiLangValue;
  slug: string;
  description_ml: MultiLangValue;
  image_url: string | null;
  is_active: boolean;
}

const ITEMS_PER_PAGE = 50;

export default function AdminCategories() {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslations();
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
  const [formLanguage, setFormLanguage] = useState<Language>('uz');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name_ml: {},
    slug: '',
    description_ml: {},
    image_url: '',
    is_active: true,
  });

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(start, start + ITEMS_PER_PAGE);
  }, [categories, currentPage]);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, name_ml, slug, description, description_ml, image_url, is_active')
      .order('name');

    if (error) {
      toast({
        title: t('common.error'),
        description: t('admin.categories.loadError'),
        variant: 'destructive',
      });
    } else {
      setCategories((data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        name_ml: jsonToMultiLang(cat.name_ml),
        slug: cat.slug,
        description: cat.description,
        description_ml: jsonToMultiLang(cat.description_ml),
        image_url: cat.image_url,
        is_active: cat.is_active,
      })));
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t('common.error'),
        description: t('image.typeError'),
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('image.sizeError'),
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
        title: t('common.error'),
        description: t('image.uploadError'),
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
      title: t('common.success'),
      description: t('image.uploadSuccess'),
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

  const handleNameChange = (value: MultiLangValue) => {
    setFormData((prev) => ({
      ...prev,
      name_ml: value,
    }));
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name_ml: {}, slug: '', description_ml: {}, image_url: '', is_active: true });
    setErrors({});
    setImageInputMode('url');
    setFormLanguage('uz');
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_ml: category.name_ml || { uz: category.name },
      slug: category.slug,
      description_ml: category.description_ml || { uz: category.description || '' },
      image_url: category.image_url || '',
      is_active: category.is_active,
    });
    setErrors({});
    setImageInputMode('url');
    setFormLanguage('uz');
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', categoryId);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('admin.categories.statusError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: isActive ? t('admin.categories.activated') : t('admin.categories.deactivated'),
      });
      fetchCategories();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate required fields
    if (!formData.name_ml.uz) {
      setErrors({ name: t('hint.nameRequired') });
      return;
    }
    if (!formData.slug) {
      setErrors({ slug: t('hint.slugRequired') });
      return;
    }

    setIsSaving(true);

    const categoryData = {
      name: formData.name_ml.uz || '',
      name_ml: formData.name_ml as Json,
      slug: formData.slug,
      description: formData.description_ml.uz || null,
      description_ml: formData.description_ml as Json,
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
        title: t('common.error'),
        description: t('admin.categories.saveError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: editingCategory ? t('admin.categories.updated') : t('admin.categories.created'),
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
        title: t('common.error'),
        description: t('admin.categories.deleteError'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: t('admin.categories.deleted'),
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
            <h1 className="text-3xl font-bold text-foreground">{t('admin.categories.title')}</h1>
            <p className="text-muted-foreground">
              {t('admin.categories.subtitle')}
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.categories.new')}
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.categories.list')} ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">{t('admin.categories.notFound')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{t('form.image')}</TableHead>
                        <TableHead>{t('form.name')}</TableHead>
                        <TableHead>{t('form.slug')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary">
                              {category.image_url ? (
                                <img
                                  src={category.image_url}
                                  alt={getLocalizedText(category.name_ml, currentLanguage) || category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {getLocalizedText(category.name_ml, currentLanguage) || category.name}
                          </TableCell>
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
                                {category.is_active ? t('common.active') : t('common.inactive')}
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
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={categories.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog with fixed height and scroll */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-[700px] md:max-w-[800px] max-h-[85vh] flex flex-col p-6">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingCategory ? t('admin.categories.edit') : t('admin.categories.new')}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? t('admin.categories.edit')
                  : t('admin.categories.new')}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <form id="category-form" onSubmit={handleSubmit} className="space-y-4 py-2">
                <GlobalLangTabs activeLanguage={formLanguage} onLanguageChange={setFormLanguage} />
                
                <SingleLangInput
                  label={t('form.name')}
                  value={formData.name_ml}
                  activeLanguage={formLanguage}
                  onChange={handleNameChange}
                  type="input"
                  placeholder={t('placeholder.enterName')}
                  required
                  error={errors.name}
                />

                <div className="space-y-2">
                  <Label htmlFor="cat-slug">{t('form.slug')} *</Label>
                  <Input
                    id="cat-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                </div>

                <SingleLangInput
                  label={t('form.description')}
                  value={formData.description_ml}
                  activeLanguage={formLanguage}
                  onChange={(value) => setFormData((prev) => ({ ...prev, description_ml: value }))}
                  type="textarea"
                  placeholder={t('placeholder.enterDescription')}
                  rows={2}
                />

                <div className="space-y-2">
                  <Label>{t('section.categoryImage')}</Label>
                  <Tabs value={imageInputMode} onValueChange={(v) => setImageInputMode(v as 'url' | 'upload')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {t('common.url')}
                      </TabsTrigger>
                      <TabsTrigger value="upload">
                        <Upload className="mr-2 h-4 w-4" />
                        {t('common.upload')}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-2">
                      <Input
                        placeholder={t('placeholder.enterUrl')}
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
                      <p className="text-sm text-muted-foreground mb-2">{t('common.preview')}:</p>
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is-active">{t('form.activeStatus')}</Label>
                  <Switch
                    id="is-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </form>
            </ScrollArea>

            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="category-form" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.categories.deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.categories.deleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.deleting')}
                  </>
                ) : (
                  t('common.delete')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
