import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderTree, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  featuredCount: number;
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  created_at: string;
  image_url: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    featuredCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch categories count
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        // Fetch featured products count
        const { count: featuredCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true);

        setStats({
          productsCount: productsCount || 0,
          categoriesCount: categoriesCount || 0,
          featuredCount: featuredCount || 0,
        });

        // Fetch recent products
        const { data: recent } = await supabase
          .from('products')
          .select('id, name, price, created_at, image_url')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentProducts(recent || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Jami Mahsulotlar',
      value: stats.productsCount,
      icon: Package,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Kategoriyalar',
      value: stats.categoriesCount,
      icon: FolderTree,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Featured Mahsulotlar',
      value: stats.featuredCount,
      icon: TrendingUp,
      color: 'bg-green-500/10 text-green-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Admin panel umumiy ko'rinishi</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              So'nggi qo'shilgan mahsulotlar
            </CardTitle>
            <CardDescription>
              Eng so'nggi 5 ta mahsulot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Yuklanmoqda...</p>
            ) : recentProducts.length === 0 ? (
              <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-3"
                  >
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
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatPrice(Number(product.price))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
