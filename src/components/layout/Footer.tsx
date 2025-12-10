import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Instagram, Send } from "lucide-react";

const categories = [
  { name: "Kiraska", path: "/catalog?category=kiraska" },
  { name: "Lak", path: "/catalog?category=lak" },
  { name: "Emal", path: "/catalog?category=emal" },
  { name: "Gruntovka", path: "/catalog?category=gruntovka" },
  { name: "Shpaklyovka", path: "/catalog?category=shpaklyovka" },
];

const quickLinks = [
  { name: "Bosh sahifa", path: "/" },
  { name: "Mahsulotlar", path: "/products" },
  { name: "Biz haqimizda", path: "/about" },
  { name: "Aloqa", path: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
                <span className="text-xl font-bold text-primary-foreground">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">Kiraska<span className="text-primary">.uz</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O'zbekistondagi eng katta bo'yoq va lak mahsulotlari do'koni. Sifatli mahsulotlar, qulay narxlar.
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/kiraska_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/kiraska_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Kategoriyalar</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Tezkor havolalar</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Aloqa</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Toshkent sh., Chilonzor tumani, 15-mavze, 25-uy
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+998901234567" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +998 90 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:info@kiraska.uz" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@kiraska.uz
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Dush-Shan: 09:00 - 18:00
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kiraska.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
