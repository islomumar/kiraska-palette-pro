import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { products, formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Star, Check, Truck, Shield, Phone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      volume: product.volume,
    });
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} savatga qo'shildi`,
    });
  };

  if (!product) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Mahsulot topilmadi</h1>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Mahsulotlarga qaytish
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Bosh sahifa</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Mahsulotlar</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary/30 p-8">
              {product.isBestseller && (
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <Star className="h-4 w-4" />
                  Bestseller
                </span>
              )}
              {product.originalPrice && (
                <span className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}% chegirma
                </span>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">{product.brand}</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
                <p className="mt-2 text-muted-foreground">{product.category} • {product.volume}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>

              {/* Colors */}
              {product.colors && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Mavjud ranglar:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span key={color} className="px-4 py-2 bg-secondary rounded-full text-sm font-medium text-secondary-foreground">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Tavsif:</p>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl">
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Bepul yetkazib berish</p>
                    <p className="text-xs text-muted-foreground">100,000 so'mdan oshsa</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Kafolat</p>
                    <p className="text-xs text-muted-foreground">Original mahsulot</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="accent" size="xl" className="flex-1 rounded-full" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Savatga qo'shish
                </Button>
                <Button variant="outline" size="xl" asChild className="rounded-full">
                  <a href="tel:+998901234567">
                    <Phone className="h-5 w-5 mr-2" />
                    Qo'ng'iroq qilish
                  </a>
                </Button>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Sotuvda mavjud</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
