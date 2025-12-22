import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Pencil, Trash2, Package, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  in_stock: boolean | null;
  is_featured: boolean | null;
  is_active: boolean;
  image_url: string | null;
  category_id: string | null;
  position: number;
  categories?: { name: string } | null;
}

const ITEMS_PER_PAGE = 50;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, brand, price, in_stock, is_featured, is_active, image_url, category_id, position,
        categories(name)
      `)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Xatolik',
        description: 'Mahsulotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Mahsulotni o\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Mahsulot muvaffaqiyatli o\'chirildi',
      });
      fetchProducts();
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Holatni o\'zgartirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: isActive ? 'Mahsulot faollashtirildi' : 'Mahsulot yashirildi',
      });
      fetchProducts();
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.categories?.name?.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleMoveUp = async (index: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (globalIndex === 0) return;
    const currentProduct = filteredProducts[globalIndex];
    const prevProduct = filteredProducts[globalIndex - 1];
    
    await supabase.from('products').update({ position: prevProduct.position }).eq('id', currentProduct.id);
    await supabase.from('products').update({ position: currentProduct.position }).eq('id', prevProduct.id);
    fetchProducts();
  };

  const handleMoveDown = async (index: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (globalIndex === filteredProducts.length - 1) return;
    const currentProduct = filteredProducts[globalIndex];
    const nextProduct = filteredProducts[globalIndex + 1];
    
    await supabase.from('products').update({ position: nextProduct.position }).eq('id', currentProduct.id);
    await supabase.from('products').update({ position: currentProduct.position }).eq('id', nextProduct.id);
    fetchProducts();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mahsulotlar</h1>
            <p className="text-muted-foreground">
              Barcha mahsulotlarni boshqarish
            </p>
          </div>
          <Link to="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yangi mahsulot
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nomi, brend yoki kategoriya bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mahsulotlar ro'yxati ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">№</TableHead>
                        <TableHead>Rasm</TableHead>
                        <TableHead>Nomi</TableHead>
                        <TableHead>Brend</TableHead>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead>Narxi</TableHead>
                        <TableHead>Faol</TableHead>
                        <TableHead>Holati</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product, index) => {
                        const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                <span>{globalIndex + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.brand || '-'}</TableCell>
                            <TableCell>{product.categories?.name || '-'}</TableCell>
                            <TableCell>{formatPrice(Number(product.price))}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={product.is_active}
                                  onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                                />
                                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                  {product.is_active ? 'Faol' : 'Nofaol'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {product.in_stock ? (
                                  <Badge variant="default" className="w-fit">Mavjud</Badge>
                                ) : (
                                  <Badge variant="destructive" className="w-fit">Tugagan</Badge>
                                )}
                                {product.is_featured && (
                                  <Badge variant="secondary" className="w-fit">Featured</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={globalIndex === 0}
                                  className="h-8 w-8"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={globalIndex === filteredProducts.length - 1}
                                  className="h-8 w-8"
                                >
                                  ↓
                                </Button>
                                <Link to={`/admin/products/${product.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteId(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
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
