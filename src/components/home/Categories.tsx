import { Link } from "react-router-dom";
import { mainCategories } from "@/data/products";
import { ArrowRight } from "lucide-react";

const categoryImages: Record<string, string> = {
  kiraska: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop",
  lak: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
  emal: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=200&fit=crop",
  gruntovka: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=300&h=200&fit=crop",
  shpaklyovka: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&h=200&fit=crop",
  rang: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=300&h=200&fit=crop",
};

export function Categories() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Asosiy kategoriyalar
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Sizga kerakli mahsulotni toping. Qulay kategoriyalar bo'yicha ajratilgan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mainCategories.map((category, index) => (
            <Link
              key={category.slug}
              to={`/catalog?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={categoryImages[category.slug]}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{category.name}</h3>
                <p className="text-sm text-primary-foreground/70 mt-1">{category.description}</p>
                <div className="mt-3 flex items-center gap-2 text-accent font-medium text-sm opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Ko'rish <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
