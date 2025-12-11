import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Pencil, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SiteContentItem {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSiteContent() {
  const [content, setContent] = useState<SiteContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<SiteContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<SiteContentItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchContent = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('key');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      setContent(data || []);
      setFilteredContent(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent(content);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContent(
        content.filter(
          (item) =>
            item.key.toLowerCase().includes(query) ||
            item.value.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, content]);

  const openEditDialog = (item: SiteContentItem) => {
    setEditingItem(item);
    setEditValue(item.value);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('site_content')
      .update({ value: editValue })
      .eq('id', editingItem.id);

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Ma\'lumot muvaffaqiyatli saqlandi',
      });
      setEditingItem(null);
      fetchContent();
    }
    setIsSaving(false);
  };

  // Group content by category
  const groupedContent = filteredContent.reduce((acc, item) => {
    const prefix = item.key.split('_')[0];
    const category = {
      nav: 'Header menyusi',
      header: 'Header',
      hero: 'Hero bo\'limi',
      categories: 'Kategoriyalar bo\'limi',
      bestsellers: 'Bestsellers bo\'limi',
      cta: 'CTA bo\'limi',
      footer: 'Footer',
    }[prefix] || 'Boshqa';

    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SiteContentItem[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sayt kontenti</h1>
          <p className="text-muted-foreground">
            Saytdagi barcha matnlarni boshqarish
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content by Category */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(groupedContent).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Ma'lumot topilmadi</p>
          </div>
        ) : (
          Object.entries(groupedContent).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Kalit</TableHead>
                        <TableHead>Qiymat</TableHead>
                        <TableHead className="w-[200px]">Tavsif</TableHead>
                        <TableHead className="w-[80px] text-right">Amal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.key}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {item.value}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {item.description || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kontentni tahrirlash</DialogTitle>
              <DialogDescription>
                {editingItem?.description || editingItem?.key}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Kalit</Label>
                <Input value={editingItem?.key || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Qiymat</Label>
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
              >
                Bekor qilish
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
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
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
