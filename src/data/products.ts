export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  volume: string;
  description: string;
  image: string;
  colors?: string[];
  isBestseller?: boolean;
  isNew?: boolean;
}

export const categories = [
  { name: "Avto bo'yoqlar", slug: "avto", icon: "🚗", count: 24 },
  { name: "Qurilish bo'yoqlari", slug: "qurilish", icon: "🏗️", count: 45 },
  { name: "Yog'och uchun", slug: "yogoch", icon: "🪵", count: 32 },
  { name: "Metall uchun", slug: "metall", icon: "🔩", count: 28 },
  { name: "Aerozol bo'yoqlar", slug: "aerozol", icon: "🎨", count: 18 },
  { name: "Aksesuarlar", slug: "aksesuar", icon: "🖌️", count: 56 },
];

export const mainCategories = [
  { name: "Kiraska", slug: "kiraska", description: "Turli xil bo'yoqlar" },
  { name: "Lak", slug: "lak", description: "Yog'och va metall uchun" },
  { name: "Emal", slug: "emal", description: "Yuqori sifatli emallar" },
  { name: "Gruntovka", slug: "gruntovka", description: "Asos qoplamalar" },
  { name: "Shpaklyovka", slug: "shpaklyovka", description: "Tekislash uchun" },
  { name: "Rang aralashmalari", slug: "rang", description: "Rang berish" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Akrilik Bo'yoq",
    brand: "ColorMaster",
    category: "Qurilish bo'yoqlari",
    categorySlug: "qurilish",
    price: 185000,
    originalPrice: 220000,
    volume: "3L",
    description: "Yuqori sifatli akrilik bo'yoq, ichki devorlar uchun. Tez quriydi, hidsiz, ekologik toza.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
    colors: ["Oq", "Krem", "Kulrang"],
    isBestseller: true,
  },
  {
    id: "2",
    name: "Avto Emal Spray",
    brand: "AutoPaint Pro",
    category: "Avto bo'yoqlar",
    categorySlug: "avto",
    price: 45000,
    volume: "400ml",
    description: "Professional avto bo'yoq spraylari. Metallik effekt, tez qurish, yuqori qoplamlilik.",
    image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=400&fit=crop",
    colors: ["Qora", "Kumush", "Qizil"],
    isNew: true,
  },
  {
    id: "3",
    name: "Yog'och Laki",
    brand: "WoodCare",
    category: "Yog'och uchun",
    categorySlug: "yogoch",
    price: 125000,
    volume: "1L",
    description: "Yog'och yuzalar uchun maxsus lak. Suvga chidamli, UV himoya, tabiiy ko'rinish.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    isBestseller: true,
  },
  {
    id: "4",
    name: "Metall Gruntovkasi",
    brand: "MetalShield",
    category: "Metall uchun",
    categorySlug: "metall",
    price: 95000,
    originalPrice: 110000,
    volume: "1L",
    description: "Zanglanishga qarshi gruntovka. Metall yuzalarni himoya qiladi va bo'yoq yaxshi yopishadi.",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Dekorativ Shpaklyovka",
    brand: "DecorPro",
    category: "Qurilish bo'yoqlari",
    categorySlug: "qurilish",
    price: 78000,
    volume: "5kg",
    description: "Dekorativ tekstura yaratish uchun shpaklyovka. Oson surtiladi, chiroyli natija.",
    image: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=400&h=400&fit=crop",
    isNew: true,
  },
  {
    id: "6",
    name: "Professional Valik To'plami",
    brand: "PaintTools",
    category: "Aksesuarlar",
    categorySlug: "aksesuar",
    price: 35000,
    volume: "3 dona",
    description: "Turli o'lchamdagi valiklar to'plami. Yuqori sifatli material, uzoq xizmat muddati.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
    isBestseller: true,
  },
  {
    id: "7",
    name: "Aerozol Bo'yoq Universal",
    brand: "SprayMaster",
    category: "Aerozol bo'yoqlar",
    categorySlug: "aerozol",
    price: 32000,
    volume: "500ml",
    description: "Universal aerozol bo'yoq. Metall, plastik, yog'och uchun mos. Tez qurish.",
    image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop",
    colors: ["Oq", "Qora", "Ko'k", "Yashil"],
  },
  {
    id: "8",
    name: "Fasad Bo'yoqi Premium",
    brand: "ColorMaster",
    category: "Qurilish bo'yoqlari",
    categorySlug: "qurilish",
    price: 320000,
    originalPrice: 380000,
    volume: "10L",
    description: "Tashqi devorlar uchun yuqori sifatli bo'yoq. Ob-havoga chidamli, 10+ yil xizmat.",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop",
    isBestseller: true,
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
};
