import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Percent } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24 lg:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left animate-fade-in-up">
            {/* Sale Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-sm font-medium text-accent-foreground backdrop-blur-sm">
              <Percent className="h-4 w-4" />
              <span>30% gacha chegirma!</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Sifatli bo'yoq va lak mahsulotlari
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto lg:mx-0">
              O'zbekistondagi eng katta tanlash imkoniyati. 1000+ mahsulot, 50+ brend, bepul yetkazib berish va professional maslahat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild variant="hero" size="xl">
                <Link to="/products">
                  Mahsulotlarni ko'rish
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Link to="/contact">
                  Bepul maslahat
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-lg">🚚</span>
                </div>
                <span className="text-sm font-medium">Bepul yetkazib berish</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-lg">✓</span>
                </div>
                <span className="text-sm font-medium">Original mahsulotlar</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-lg">💬</span>
                </div>
                <span className="text-sm font-medium">24/7 qo'llab-quvvatlash</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rotate-6" />
              <div className="absolute inset-0 rounded-3xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 -rotate-3" />
              <img
                src="https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&h=600&fit=crop"
                alt="Bo'yoq mahsulotlari"
                className="relative rounded-3xl object-cover w-full h-full shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
