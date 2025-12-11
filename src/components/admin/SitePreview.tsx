import { HeroBannerEditable } from './preview/HeroBannerEditable';
import { CategoriesEditable } from './preview/CategoriesEditable';
import { BestsellersEditable } from './preview/BestsellersEditable';
import { CTASectionEditable } from './preview/CTASectionEditable';
import { NavbarEditable } from './preview/NavbarEditable';
import { FooterEditable } from './preview/FooterEditable';

export function SitePreview() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarEditable />
      <main>
        <HeroBannerEditable />
        <CategoriesEditable />
        <BestsellersEditable />
        <CTASectionEditable />
      </main>
      <FooterEditable />
    </div>
  );
}
