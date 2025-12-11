import { ReactNode, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { EditContentModal } from './EditContentModal';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AdminSiteContentLayoutProps {
  children: ReactNode;
}

export function AdminSiteContentLayout({ children }: AdminSiteContentLayoutProps) {
  const { setEditMode } = useEditMode();

  useEffect(() => {
    setEditMode(true);
    return () => setEditMode(false);
  }, [setEditMode]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header Bar */}
      <div className="sticky top-0 z-[100] bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin panel
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <span className="font-semibold text-foreground">Sayt kontentini tahrirlash</span>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Eye className="h-4 w-4" />
            Tahrirlash rejimi
          </Badge>
        </div>
      </div>

      {/* Site Preview */}
      <div className="min-h-[calc(100vh-56px)]">
        {children}
      </div>

      {/* Edit Modal */}
      <EditContentModal />

      {/* Help Tooltip */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
        <div className="bg-card/95 backdrop-blur border border-border rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-muted-foreground">
            💡 Matn ustiga kursorni olib boring va <Pencil className="h-3 w-3 inline text-primary" /> tugmasini bosing
          </p>
        </div>
      </div>
    </div>
  );
}

function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
