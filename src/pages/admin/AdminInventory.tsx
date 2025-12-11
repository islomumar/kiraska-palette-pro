import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  History, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatNumberWithSpaces } from '@/components/ui/formatted-number-input';

interface Product {
  id: string;
  name: string;
  slug: string;
  stock_quantity: number;
  low_stock_threshold: number;
  in_stock: boolean;
  image_url: string | null;
  category?: {
    name: string;
  };
}

interface StockHistoryItem {
  id: string;
  change: number;
  type: string;
  timestamp: string;
  notes: string | null;
}

const typeLabels: Record<string, string> = {
  add: 'Qo\'shildi',
  remove: 'Olib tashlandi',
  sale: 'Sotildi',
  return: 'Qaytarildi',
  adjustment: 'Tuzatish',
};

const typeColors: Record<string, string> = {
  add: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  remove: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  sale: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  return: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  adjustment: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [stockForm, setStockForm] = useState({
    action: 'add' as 'add' | 'remove',
    quantity: 1,
    notes: '',
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        stock_quantity,
        low_stock_threshold,
        in_stock,
        image_url,
        categories:category_id (name)
      `)
      .order('name');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Mahsulotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      const mappedData = (data || []).map((item: any) => ({
        ...item,
        category: item.categories,
      }));
      setProducts(mappedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchStockHistory = async (productId: string) => {
    setIsLoadingHistory(true);
    const { data, error } = await supabase
      .from('stock_history')
      .select('*')
      .eq('product_id', productId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Tarixni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      setStockHistory((data as StockHistoryItem[]) || []);
    }
    setIsLoadingHistory(false);
  };

  const handleOpenStockDialog = (product: Product, action: 'add' | 'remove') => {
    setSelectedProduct(product);
    setStockForm({ action, quantity: 1, notes: '' });
    setIsStockDialogOpen(true);
  };

  const handleOpenHistoryDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryDialogOpen(true);
    fetchStockHistory(product.id);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSaving(true);

    const change = stockForm.action === 'add' ? stockForm.quantity : -stockForm.quantity;
    const newQuantity = Math.max(0, selectedProduct.stock_quantity + change);

    try {
      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0,
        })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // Record in stock history
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          product_id: selectedProduct.id,
          change: change,
          type: stockForm.action,
          notes: stockForm.notes || null,
        });

      if (historyError) throw historyError;

      toast({
        title: 'Muvaffaqiyat',
        description: `Zaxira ${stockForm.action === 'add' ? 'qo\'shildi' : 'olib tashlandi'}`,
      });

      setIsStockDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'in_stock') {
      matchesFilter = product.in_stock && product.stock_quantity > product.low_stock_threshold;
    } else if (filterStatus === 'out_of_stock') {
      matchesFilter = !product.in_stock || product.stock_quantity === 0;
    } else if (filterStatus === 'low_stock') {
      matchesFilter = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
    }
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.in_stock && p.stock_quantity > 0).length,
    outOfStock: products.filter(p => !p.in_stock || p.stock_quantity === 0).length,
    lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length,
  };

  const getStockStatus = (product: Product) => {
    if (!product.in_stock || product.stock_quantity === 0) {
      return { label: 'Mavjud emas', color: 'text-destructive', icon: XCircle };
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Kam qoldi', color: 'text-yellow-600', icon: AlertTriangle };
    }
    return { label: 'Mavjud', color: 'text-green-600', icon: CheckCircle };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ombor</h1>
          <p className="text-muted-foreground">Mahsulotlar zaxirasini boshqaring</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami mahsulotlar</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mavjud</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mavjud emas</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kam qoldi</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Mahsulot qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="in_stock">Mavjud</SelectItem>
                  <SelectItem value="out_of_stock">Mavjud emas</SelectItem>
                  <SelectItem value="low_stock">Kam qoldi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mahsulotlar zaxirasi</CardTitle>
            <CardDescription>
              {filteredProducts.length} ta mahsulot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">Mahsulotlar topilmadi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahsulot</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead className="text-center">Zaxira</TableHead>
                      <TableHead className="text-center">Chegara</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      const StatusIcon = status.icon;
                      const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
                      
                      return (
                        <TableRow 
                          key={product.id}
                          className={isLowStock ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.category?.name || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${isLowStock ? 'text-yellow-600' : product.stock_quantity === 0 ? 'text-destructive' : ''}`}>
                              {formatNumberWithSpaces(product.stock_quantity)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {formatNumberWithSpaces(product.low_stock_threshold)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`inline-flex items-center gap-1 ${status.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm">{status.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenStockDialog(product, 'add')}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenStockDialog(product, 'remove')}
                                disabled={product.stock_quantity === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenHistoryDialog(product)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {stockForm.action === 'add' ? 'Zaxira qo\'shish' : 'Zaxira olib tashlash'}
              </DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStockSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Miqdor</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={stockForm.action === 'remove' ? selectedProduct?.stock_quantity : undefined}
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Izoh (ixtiyoriy)</Label>
                  <Input
                    id="notes"
                    value={stockForm.notes}
                    onChange={(e) => setStockForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Sabab yoki izoh..."
                  />
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    Hozirgi zaxira: <span className="font-semibold text-foreground">{formatNumberWithSpaces(selectedProduct?.stock_quantity || 0)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Yangi zaxira: <span className="font-semibold text-foreground">
                      {formatNumberWithSpaces(Math.max(0, (selectedProduct?.stock_quantity || 0) + (stockForm.action === 'add' ? stockForm.quantity : -stockForm.quantity)))}
                    </span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Saqlash
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Zaxira tarixi</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : stockHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Tarix mavjud emas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeColors[item.type] || typeColors.adjustment}`}>
                          {typeLabels[item.type] || item.type}
                        </span>
                        <div>
                          <p className={`font-semibold ${item.change > 0 ? 'text-green-600' : 'text-destructive'}`}>
                            {item.change > 0 ? '+' : ''}{formatNumberWithSpaces(item.change)}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString('uz-UZ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
