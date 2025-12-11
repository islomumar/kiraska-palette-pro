import { Link } from "react-router-dom";
import { mainCategories } from "@/data/products";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/admin/EditableText";

export function Categories() {
  const { getText } = useSiteContent();
  const { isEditMode } = useEditMode();
  const linkPrefix = isEditMode ? '/admin/site-content' : '';

  const renderText = (key: string, fallback: string) => {
    if (isEditMode) {
      return <EditableText contentKey={key} fallback={fallback} />;
    }
    return getText(key, fallback);
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            {renderText('categories_title', 'Kategoriyalar')}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {renderText('categories_description', "Sizga kerakli bo'yoq mahsulotini toping. Qulay kategoriyalar bo'yicha ajratilgan.")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mainCategories.map((category, index) => (
            <Link
              key={category.slug}
              to={`${linkPrefix}/catalog?category=${category.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-card shadow-card hover:shadow-card-hover transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 p-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-primary font-medium text-sm opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Ko'rish <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
