import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Phone, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { name: "Bosh sahifa", path: "/" },
  { name: "Katalog", path: "/catalog" },
  { name: "Mahsulotlar", path: "/products" },
  { name: "Biz haqimizda", path: "/about" },
  { name: "Aloqa", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();

  const handleAdminClick = () => {
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground">K</span>
          </div>
          <span className="text-xl font-bold text-foreground">Kiraska<span className="text-primary">.uz</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:text-primary",
                location.pathname === link.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary transition-colors">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
          <a href="tel:+998901234567" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Phone className="h-4 w-4" />
            <span>+998 90 123 45 67</span>
          </a>
          <Button variant="accent" size="sm" className="rounded-full relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-4 w-4" />
              <span>Savat</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
          <button
            onClick={handleAdminClick}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary transition-colors"
            title="Admin Panel"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-foreground lg:hidden hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-card p-4 lg:hidden animate-fade-in">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors rounded-lg",
                  location.pathname === link.path
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <a href="tel:+998901234567" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="h-4 w-4" />
                +998 90 123 45 67
              </a>
              <Button variant="accent" className="w-full rounded-full relative" asChild>
                <Link to="/cart" onClick={() => setIsOpen(false)}>
                  <ShoppingCart className="h-4 w-4" />
                  Savat
                  {totalItems > 0 && (
                    <span className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
