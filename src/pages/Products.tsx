import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { products, formatPrice, categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Star, Filter } from "lucide-react";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl text-center">
            Barcha mahsulotlar
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-center max-w-xl mx-auto">
            1000+ dan ortiq sifatli bo'yoq va lak mahsulotlarini tanlang
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="shrink-0"
              >
                Barchasi
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.slug}
                  variant={selectedCategory === cat.slug ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="shrink-0"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Badges */}
                <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                  {product.isBestseller && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      <Star className="h-3 w-3" />
                      Bestseller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Yangi
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="inline-flex items-center rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Image */}
                <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                {/* Content */}
                <div className="p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.volume}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatPrice(product.price)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <Button size="icon" variant="accent" className="rounded-full h-10 w-10">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Mahsulot topilmadi</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                Filterni tozalash
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Products;
