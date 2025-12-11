import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSiteContent } from '@/hooks/useSiteContent';

export function EditContentModal() {
  const { editingKey, setEditingKey } = useEditMode();
  const { getText, refetch } = useSiteContent();
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingKey) {
      setValue(getText(editingKey, ''));
    }
  }, [editingKey, getText]);

  const handleSave = async () => {
    if (!editingKey) return;

    setIsSaving(true);

    // Check if key exists
    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('key', editingKey)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('site_content')
        .update({ value })
        .eq('key', editingKey));
    } else {
      ({ error } = await supabase
        .from('site_content')
        .insert([{ key: editingKey, value, description: `Auto-created key: ${editingKey}` }]));
    }

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyat',
        description: 'Kontent muvaffaqiyatli saqlandi',
      });
      refetch();
      setEditingKey(null);
    }

    setIsSaving(false);
  };

  return (
    <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kontentni tahrirlash</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {editingKey}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Qiymat</Label>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              placeholder="Matn kiriting..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingKey(null)}>
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
  );
}
