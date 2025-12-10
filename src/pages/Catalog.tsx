import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { products, formatPrice, categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Star, Filter, X, ChevronDown } from "lucide-react";

const brands = ["ColorMaster", "AutoPaint Pro", "WoodCare", "MetalShield", "DecorPro", "PaintTools", "SprayMaster"];
const volumes = ["400ml", "500ml", "1L", "3L", "5kg", "10L"];

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleVolume = (volume: string) => {
    setSelectedVolumes((prev) =>
      prev.includes(volume) ? prev.filter((v) => v !== volume) : [...prev, volume]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedVolumes([]);
    setPriceRange([0, 500000]);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.categorySlug);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const matchesVolume = selectedVolumes.length === 0 || selectedVolumes.includes(product.volume);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesBrand && matchesVolume && matchesPrice;
  });

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedVolumes.length > 0 || priceRange[0] > 0 || priceRange[1] < 500000;

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl text-center">
            Katalog
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-center max-w-xl mx-auto">
            Kategoriyalar bo'yicha mahsulotlarni tanlang va filtrlang
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 space-y-6">
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
                      <label key={cat.slug} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={selectedCategories.includes(cat.slug)}
                          onCheckedChange={() => toggleCategory(cat.slug)}
                        />
                        <span className="text-sm text-muted-foreground">{cat.icon} {cat.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">({cat.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
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

                {/* Volume */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Hajmi</h3>
                  <div className="space-y-2">
                    {volumes.map((volume) => (
                      <label key={volume} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={selectedVolumes.includes(volume)}
                          onCheckedChange={() => toggleVolume(volume)}
                        />
                        <span className="text-sm text-muted-foreground">{volume}</span>
                      </label>
                    ))}
                  </div>
                </div>

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
              <Button onClick={() => setShowFilters(true)} className="shadow-lg">
                <Filter className="h-4 w-4 mr-2" />
                Filtrlar {hasActiveFilters && `(${selectedCategories.length + selectedBrands.length + selectedVolumes.length})`}
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
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
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
                    <label key={cat.slug} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedCategories.includes(cat.slug)}
                        onCheckedChange={() => toggleCategory(cat.slug)}
                      />
                      <span className="text-sm text-muted-foreground">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
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
              <Button variant="outline" className="flex-1" onClick={clearFilters}>
                Tozalash
              </Button>
              <Button variant="accent" className="flex-1" onClick={() => setShowFilters(false)}>
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
