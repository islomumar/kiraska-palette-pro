import { Link } from "react-router-dom";
import { ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from '../EditableText';

export function NavbarEditable() {
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
          <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
            <EditableText contentKey="nav_home" fallback="Bosh sahifa" />
          </span>
          <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
            <EditableText contentKey="nav_catalog" fallback="Katalog" />
          </span>
          <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
            <EditableText contentKey="nav_products" fallback="Mahsulotlar" />
          </span>
          <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
            <EditableText contentKey="nav_about" fallback="Biz haqimizda" />
          </span>
          <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
            <EditableText contentKey="nav_contact" fallback="Aloqa" />
          </span>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Phone className="h-4 w-4" />
            <EditableText contentKey="header_phone" fallback="+998 90 123 45 67" />
          </span>
          <Button variant="outline" size="sm" className="rounded-full border-border text-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <EditableText contentKey="header_call_btn" fallback="Qo'ng'iroq" />
          </Button>
          <Button variant="accent" size="sm" className="rounded-full">
            <ShoppingCart className="h-4 w-4" />
            <EditableText contentKey="header_cart_btn" fallback="Savat" />
          </Button>
        </div>
      </div>
    </header>
  );
}
