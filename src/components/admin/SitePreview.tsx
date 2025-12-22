import { HeroBannerEditable } from './preview/HeroBannerEditable';
import { CategoriesEditable } from './preview/CategoriesEditable';
import { BestsellersEditable } from './preview/BestsellersEditable';
import { CTASectionEditable } from './preview/CTASectionEditable';
import { NavbarEditable } from './preview/NavbarEditable';
import { FooterEditable } from './preview/FooterEditable';

export function SitePreview() {
  return (
    <div className="bg-background">
      {/* Navbar always visible at top */}
      <NavbarEditable />
      
      {/* Scrollable content area */}
      <div className="max-h-[60vh] overflow-y-auto">
        <main>
          <HeroBannerEditable />
          <CategoriesEditable />
          <BestsellersEditable />
          <CTASectionEditable />
        </main>
        <FooterEditable />
      </div>
    </div>
  );
}
