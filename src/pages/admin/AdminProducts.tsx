import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  in_stock: boolean | null;
  is_featured: boolean | null;
  image_url: string | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, brand, price, in_stock, is_featured, image_url, category_id,
        categories(name)
      `)
      .order('created_at', { ascending: false });

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

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.categories?.name?.toLowerCase().includes(query)
    );
  });

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rasm</TableHead>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Brend</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Narxi</TableHead>
                      <TableHead>Holati</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
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
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(product.id)}
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
