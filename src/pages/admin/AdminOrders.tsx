import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  products: any;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Kutilmoqda',
  processing: 'Jarayonda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buyurtmalar</h1>
          <p className="text-muted-foreground">Barcha buyurtmalarni boshqaring</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ID, ism yoki telefon bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status bo'yicha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="pending">Kutilmoqda</SelectItem>
              <SelectItem value="processing">Jarayonda</SelectItem>
              <SelectItem value="delivered">Yetkazildi</SelectItem>
              <SelectItem value="cancelled">Bekor qilindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.total_amount.toLocaleString()} so'm</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status]}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ko'rish
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Buyurtmalar topilmadi'
                : 'Hali buyurtmalar yo\'q'}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
