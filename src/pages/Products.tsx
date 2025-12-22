import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, formatPrice } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (product.brand?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLoading = productsLoading || categoriesLoading;

  return (
    <>
      {/* Header */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl text-center">
            {getText('nav_products', 'Barcha mahsulotlar')}
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-center max-w-xl mx-auto">
            {getText('products_page_description', "1000+ dan ortiq sifatli bo'yoq, lak, emal va boshqa mahsulotlarni tanlang")}
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
                className="pl-10 h-12 rounded-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={selectedCategory === null ? "accent" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="shrink-0 rounded-full"
              >
                Barchasi
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "accent" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="shrink-0 rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-card p-5">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="mt-4 h-4 w-20" />
                  <Skeleton className="mt-2 h-6 w-full" />
                  <Skeleton className="mt-2 h-4 w-16" />
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Badges */}
                  <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                    {product.is_bestseller && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        <Star className="h-3 w-3" />
                        Bestseller
                      </span>
                    )}
                    {product.old_price && (
                      <span className="inline-flex items-center rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
                        -{Math.round((1 - (product.price || 0) / product.old_price) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <Link to={`${linkPrefix}/products/${product.slug}`} className="block aspect-square overflow-hidden bg-secondary/30 p-4">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name || ''}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-xs font-medium text-primary uppercase tracking-wide">
                      {product.brand}
                    </p>
                    <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      <Link to={`${linkPrefix}/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{product.volume}</p>
                    {product.short_description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.short_description}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(product.price || 0)}
                        </p>
                        {product.old_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.old_price)}
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
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Mahsulot topilmadi</p>
              <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                Filterni tozalash
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
