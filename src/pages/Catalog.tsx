import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Star, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, formatPrice } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const initialCategorySlug = searchParams.get("category");
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Find initial category ID from slug
  const initialCategory = categories.find(c => c.slug === initialCategorySlug);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory.id] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach(p => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 500000]);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || (product.category_id && selectedCategories.includes(product.category_id));
    const matchesBrand = selectedBrands.length === 0 || (product.brand && selectedBrands.includes(product.brand));
    const matchesPrice = (product.price || 0) >= priceRange[0] && (product.price || 0) <= priceRange[1];
    return matchesCategory && matchesBrand && matchesPrice;
  });

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 500000;
  const isLoading = productsLoading || categoriesLoading;

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl text-center">
            {getText('nav_catalog', 'Katalog')}
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-center max-w-xl mx-auto">
            {getText('catalog_page_description', "Bo'yoq, lak, emal, gruntovka va boshqa mahsulotlarni filtrlang")}
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 space-y-6 bg-card p-6 rounded-3xl shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Filtrlar</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive">
                      <X className="h-4 w-4 mr-1" />
                      Tozalash
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Kategoriyalar</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <span className="text-sm text-muted-foreground">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Brendlar</h3>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <span className="text-sm text-muted-foreground">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Narx</h3>
                  <Slider
                    min={0}
                    max={500000}
                    step={10000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
              <Button onClick={() => setShowFilters(true)} className="shadow-lg rounded-full">
                🎨 Filtrlar {hasActiveFilters && `(${selectedCategories.length + selectedBrands.length})`}
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredProducts.length} ta mahsulot topildi
                </p>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
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
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                  <Button variant="outline" className="mt-4 rounded-full" onClick={clearFilters}>
                    Filterni tozalash
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-background p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Filtrlar</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Kategoriyalar</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <span className="text-sm text-muted-foreground">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Brendlar</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <span className="text-sm text-muted-foreground">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Narx</h3>
                <Slider
                  min={0}
                  max={500000}
                  step={10000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button variant="outline" className="flex-1 rounded-full" onClick={clearFilters}>
                Tozalash
              </Button>
              <Button variant="accent" className="flex-1 rounded-full" onClick={() => setShowFilters(false)}>
                Qo'llash
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Catalog;
