import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16">
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
                Buyurtma berishga tayyormisiz?
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-lg mx-auto lg:mx-0">
                Biz bilan bog'laning va professional maslahat oling. Bepul yetkazib berish va qulay to'lov imkoniyatlari.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Button asChild variant="hero" size="xl">
                <Link to="/products">
                  Buyurtma berish
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button asChild size="xl" className="bg-primary-foreground/10 border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                <a href="tel:+998901234567">
                  <Phone className="h-5 w-5 mr-2" />
                  Qo'ng'iroq qilish
                </a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-primary-foreground/20 pt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">1000+</p>
              <p className="mt-1 text-sm text-primary-foreground/70">Mahsulotlar</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">50+</p>
              <p className="mt-1 text-sm text-primary-foreground/70">Brendlar</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">5000+</p>
              <p className="mt-1 text-sm text-primary-foreground/70">Mamnun mijozlar</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground md:text-4xl">10+</p>
              <p className="mt-1 text-sm text-primary-foreground/70">Yillik tajriba</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
