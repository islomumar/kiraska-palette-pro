import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Star, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, formatPrice } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Get price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 500000 };
    const prices = products.map(p => p.price || 0).filter(p => p > 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.brand?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      
      const minPrice = priceMin ? parseFloat(priceMin) : 0;
      const maxPrice = priceMax ? parseFloat(priceMax) : Infinity;
      const matchesPrice = (product.price || 0) >= minPrice && (product.price || 0) <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceMin, priceMax]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isLoading = productsLoading || categoriesLoading;
  const hasActiveFilters = selectedCategory || priceMin || priceMax;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPriceMin('');
    setPriceMax('');
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

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
          {/* Search and Filters */}
          <div className="space-y-4 mb-8">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Mahsulot qidirish..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-12 h-12 rounded-full text-base"
                />
              </div>
              
              {/* Filter Button - Mobile & Desktop */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="rounded-full h-12 px-4 gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="hidden sm:inline">Filtrlar</span>
                    {hasActiveFilters && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {(selectedCategory ? 1 : 0) + (priceMin || priceMax ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtrlar</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground">Narx (so'm)</h3>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          placeholder={formatPrice(priceRange.min)}
                          value={priceMin}
                          onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
                          className="h-10"
                        />
                        <span className="text-muted-foreground shrink-0">—</span>
                        <Input
                          type="number"
                          placeholder={formatPrice(priceRange.max)}
                          value={priceMax}
                          onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
                          className="h-10"
                        />
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1" onClick={clearFilters}>
                        Tozalash
                      </Button>
                      <Button className="flex-1" onClick={() => setShowFilters(false)}>
                        Qo'llash
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                className="shrink-0 rounded-full"
                size="sm"
              >
                Barchasi
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                  className="shrink-0 rounded-full"
                  size="sm"
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Faol filtrlar:</span>
                {selectedCategory && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full h-7 gap-1"
                    onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                  >
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {(priceMin || priceMax) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full h-7 gap-1"
                    onClick={() => { setPriceMin(''); setPriceMax(''); setCurrentPage(1); }}
                  >
                    {priceMin && priceMax 
                      ? `${formatPrice(parseFloat(priceMin))} - ${formatPrice(parseFloat(priceMax))}`
                      : priceMin 
                        ? `${formatPrice(parseFloat(priceMin))} dan`
                        : `${formatPrice(parseFloat(priceMax))} gacha`
                    }
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-7"
                  onClick={clearFilters}
                >
                  Barchasini tozalash
                </Button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} ta mahsulot topildi
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Sahifa {currentPage} / {totalPages}
              </p>
            )}
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
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product, index) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <Button
                        key={index}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        className="rounded-full w-10 h-10"
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2 text-muted-foreground">...</span>
                    )
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
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
      </section>
    </>
  );
};

export default Products;
