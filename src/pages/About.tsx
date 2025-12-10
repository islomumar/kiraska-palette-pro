import { Layout } from "@/components/layout/Layout";
import { Check, Users, Award, Clock, ThumbsUp, Target, Shield, Truck } from "lucide-react";

const stats = [
  { icon: Clock, value: "10+", label: "Yillik tajriba" },
  { icon: Users, value: "5000+", label: "Mamnun mijozlar" },
  { icon: Award, value: "50+", label: "Brendlar" },
  { icon: ThumbsUp, value: "99%", label: "Ijobiy fikrlar" },
];

const principles = [
  {
    icon: Target,
    title: "Sifat birinchi",
    description: "Faqat original va yuqori sifatli mahsulotlarni taklif qilamiz.",
  },
  {
    icon: Shield,
    title: "Kafolat",
    description: "Barcha mahsulotlarimiz ishlab chiqaruvchi kafolati bilan.",
  },
  {
    icon: Truck,
    title: "Tez yetkazib berish",
    description: "Toshkent bo'ylab 24 soat ichida bepul yetkazib beramiz.",
  },
  {
    icon: Users,
    title: "Professional maslahat",
    description: "Mutaxassislarimiz sizga eng to'g'ri tanlovni qilishda yordam beradi.",
  },
];

const reasons = [
  "1000+ dan ortiq mahsulotlar tanlovi",
  "Eng past narxlar kafolati",
  "Bepul yetkazib berish (100,000 so'mdan)",
  "Professional maslahat xizmati",
  "Original mahsulotlar kafolati",
  "Qulay to'lov usullari",
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">
              Biz haqimizda
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
              Kiraska.uz — O'zbekistondagi eng ishonchli bo'yoq va lak mahsulotlari do'koni. 
              Biz 10 yildan ortiq tajribaga ega bo'lib, minglab mijozlarimizga sifatli mahsulotlar 
              va professional xizmat ko'rsatib kelmoqdamiz.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background -mt-8 relative z-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Bizning hikoyamiz
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  2014-yilda kichik bir do'kon sifatida boshlagan yo'limiz, bugun O'zbekistonning 
                  eng yirik bo'yoq va lak mahsulotlari distributorlaridan biriga aylandi.
                </p>
                <p>
                  Biz har doim sifat va mijozlar ehtiyojini birinchi o'ringa qo'yamiz. 
                  Dunyo brendlarining eng yaxshi mahsulotlarini O'zbekiston bozoriga olib kelish — 
                  bizning asosiy maqsadimiz.
                </p>
                <p>
                  Professional jamoamiz sizga har qanday loyiha uchun — uyni ta'mirlash, 
                  avtomobilni bo'yash yoki sanoat ishlarida kerakli mahsulotlarni tanlashda yordam beradi.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=450&fit=crop"
                  alt="Bizning jamoa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-card-hover max-w-xs hidden md:block">
                <p className="text-2xl font-bold text-primary">10+ yil</p>
                <p className="text-muted-foreground mt-1">Bozordagi tajribamiz</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Nega aynan biz?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mijozlarimiz bizni tanlashining asosiy sabablari
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-5 bg-card rounded-xl shadow-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <Check className="h-5 w-5 text-accent" />
                </div>
                <span className="font-medium text-foreground">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Ishlash tamoyillarimiz
            </h2>
            <p className="mt-4 text-muted-foreground">
              Har bir mijoz uchun eng yaxshi xizmatni ko'rsatish — bizning asosiy maqsadimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                  <principle.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
