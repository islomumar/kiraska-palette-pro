import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart,
  Users,
  LogOut,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, userRole, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const allLinks = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'manager'] },
      { name: 'Buyurtmalar', path: '/admin/orders', icon: ShoppingCart, roles: ['superadmin', 'admin', 'manager'] },
      { name: 'Mahsulotlar', path: '/admin/products', icon: Package, roles: ['superadmin', 'admin'] },
      { name: 'Kategoriyalar', path: '/admin/categories', icon: FolderTree, roles: ['superadmin', 'admin'] },
      { name: 'Foydalanuvchilar', path: '/admin/users', icon: Users, roles: ['superadmin'] },
    ];

    if (!userRole) return [];
    
    return allLinks.filter(link => link.roles.includes(userRole));
  };

  const sidebarLinks = getSidebarLinks();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    manager: 'Menejer',
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">K</span>
            </div>
            <span className="font-bold text-foreground">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="mb-1 px-3 text-xs text-muted-foreground">
              {user.email}
            </div>
            {userRole && (
              <div className="mb-3 px-3">
                <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {roleLabels[userRole] || userRole}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Chiqish
            </Button>
            <Link to="/" className="mt-2 block">
              <Button variant="outline" className="w-full text-sm">
                Saytga qaytish
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
