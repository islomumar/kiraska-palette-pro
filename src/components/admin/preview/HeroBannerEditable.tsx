import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroPaint from "@/assets/hero-paint-new.jpg";
import { EditableText } from '../EditableText';

export function HeroBannerEditable() {
  return (
    <section className="relative overflow-hidden bg-secondary/50">
      {/* Paint drip effect */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
          <path 
            fill="hsl(var(--primary))" 
            d="M0,0 L1440,0 L1440,40 
               Q1400,40 1380,70 Q1360,100 1340,70 Q1320,40 1280,40
               Q1200,40 1180,60 Q1160,80 1140,60 Q1120,40 1080,40
               Q1000,40 980,55 Q960,70 940,55 Q920,40 880,40
               Q800,40 780,80 Q760,120 740,80 Q720,40 680,40
               Q600,40 580,50 Q560,60 540,50 Q520,40 480,40
               Q400,40 380,65 Q360,90 340,65 Q320,40 280,40
               Q200,40 180,75 Q160,110 140,75 Q120,40 80,40
               Q40,40 20,55 Q0,70 0,40 Z"
          />
        </svg>
      </div>

      <div className="container relative z-20 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              <EditableText contentKey="hero_title_1" fallback="Eksklyuziv" />
              <span className="block text-primary">
                <EditableText contentKey="hero_title_2" fallback="Bo'yoq Mahsulotlari" />
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              <EditableText contentKey="hero_description" fallback="O'zbekistondagi eng katta tanlash imkoniyati. Kiraska, lak, emal, gruntovka va shpaklyovka - barchasi bir joyda. Bepul yetkazib berish!" />
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="accent" size="xl" className="rounded-full shadow-glow">
                <EditableText contentKey="hero_btn_shop" fallback="Xarid qilish" />
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
              <Button variant="outline" size="xl" className="rounded-full border-2">
                <EditableText contentKey="hero_btn_catalog" fallback="Katalogni ko'rish" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg">🚚</span>
                </div>
                <span className="text-sm font-medium">
                  <EditableText contentKey="hero_badge_delivery" fallback="Bepul yetkazish" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg">✓</span>
                </div>
                <span className="text-sm font-medium">
                  <EditableText contentKey="hero_badge_original" fallback="Original" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg">🎨</span>
                </div>
                <span className="text-sm font-medium">
                  <EditableText contentKey="hero_badge_colors" fallback="1000+ ranglar" />
                </span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[3rem] -rotate-6 scale-95" />
              <img
                src={heroPaint}
                alt="Bo'yoq mahsulotlari"
                className="relative rounded-[2.5rem] object-cover w-full shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curved bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <ellipse cx="720" cy="80" rx="900" ry="80" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
