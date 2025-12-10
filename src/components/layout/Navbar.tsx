import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Bosh sahifa", path: "/" },
  { name: "Mahsulotlar", path: "/products" },
  { name: "Katalog", path: "/catalog" },
  { name: "Biz haqimizda", path: "/about" },
  { name: "Aloqa", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
            <span className="text-xl font-bold text-primary-foreground">K</span>
          </div>
          <span className="text-xl font-bold text-foreground">Kiraska<span className="text-primary">.uz</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-secondary",
                location.pathname === link.path
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <a href="tel:+998901234567" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
            <span>+998 90 123 45 67</span>
          </a>
          <Button variant="accent" size="sm">
            <ShoppingCart className="h-4 w-4" />
            Savat
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-foreground md:hidden hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-background p-4 md:hidden animate-fade-in">
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
              <Button variant="accent" className="w-full">
                <ShoppingCart className="h-4 w-4" />
                Savat
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
