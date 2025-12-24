import { AdminLayout } from '@/components/admin/AdminLayout';
import { SiteContentEditor } from '@/components/admin/SiteContentEditor';

const footerSections = [
  {
    title: 'Umumiy ma\'lumotlar',
    fields: [
      { key: 'footer_description', label: 'Tavsif', description: 'footer_description' },
      { key: 'footer_copyright', label: 'Mualliflik huquqi', description: 'footer_copyright' },
    ],
  },
  {
    title: 'Ijtimoiy tarmoqlar',
    fields: [
      { key: 'social_telegram', label: 'Telegram havolasi', description: 'social_telegram' },
      { key: 'social_instagram', label: 'Instagram havolasi', description: 'social_instagram' },
    ],
  },
  {
    title: 'Bo\'lim sarlavhalari',
    fields: [
      { key: 'footer_categories_title', label: 'Kategoriyalar sarlavhasi', description: 'footer_categories_title' },
      { key: 'footer_links_title', label: 'Tezkor havolalar sarlavhasi', description: 'footer_links_title' },
      { key: 'footer_contact_title', label: 'Aloqa sarlavhasi', description: 'footer_contact_title' },
    ],
  },
  {
    title: 'Aloqa ma\'lumotlari',
    fields: [
      { key: 'footer_address', label: 'Manzil', description: 'footer_address' },
      { key: 'header_phone', label: 'Telefon raqami', description: 'header_phone' },
      { key: 'footer_email', label: 'Email', description: 'footer_email' },
      { key: 'footer_hours', label: 'Ish vaqti', description: 'footer_hours' },
    ],
  },
];

export default function AdminFooterContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Footer kontenti</h1>
          <p className="text-muted-foreground">
            Sayt pastki qismidagi barcha matnlarni tahrirlash
          </p>
        </div>

        <SiteContentEditor sections={footerSections} />
      </div>
    </AdminLayout>
  );
}
