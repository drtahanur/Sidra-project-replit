import { products as rawProducts, type Product } from '@workspace/catalog';
export const img = (n: string) => `${import.meta.env.BASE_URL}images/${n}`;
export const brand = (n: string) => `${import.meta.env.BASE_URL}brand/${n}`;

export type { Variant, Product } from '@workspace/catalog';
export type Collection = { handle: string; title: string; blurb: string; image: string };

export const collections: Collection[] = [
  { handle: 'skincare', title: 'العناية بالبشرة', blurb: 'غسول، مرطبات، وسيروم لروتين يومي هادئ.', image: img('cat-skincare.jpg') },
  { handle: 'makeup', title: 'المكياج', blurb: 'لمسات لونية ناعمة للوجه والعينين والشفاه.', image: img('cat-makeup.jpg') },
  { handle: 'sunscreen', title: 'واقي الشمس', blurb: 'حماية يومية تناسب شمس الخليج.', image: img('cat-sun.jpg') },
  { handle: 'serums', title: 'السيروم', blurb: 'تركيبات مركّزة بقوام خفيف.', image: img('cat-serum.jpg') },
  { handle: 'lips', title: 'العناية بالشفاه', blurb: 'ترطيب ولمعة ولون توتي.', image: img('cat-lips.jpg') },
  { handle: 'sets', title: 'مجموعات الجمال', blurb: 'اختيارات مجمّعة للإهداء والسفر.', image: img('cat-sets.jpg') },
  { handle: 'bestsellers', title: 'الأكثر طلبًا', blurb: 'مجموعة يحددها فريق المتجر من Shopify.', image: img('editorial-texture.jpg') },
  { handle: 'new', title: 'وصل حديثًا', blurb: 'أحدث ما أضيف إلى رفوف سدرة.', image: img('editorial-ritual.jpg') },
  { handle: 'all', title: 'كل المنتجات', blurb: 'تصفّحي جميع منتجات المعاينة.', image: img('hero.jpg') },
];


export const products: Product[] = rawProducts.map((p) => ({ ...p, image: img(p.image) }));
export const getProduct = (h: string) => products.find((p) => p.handle === h);

export const needs = [
  { key: 'hydration', label: 'الترطيب' }, { key: 'dryness', label: 'الجفاف' }, { key: 'oily', label: 'البشرة الدهنية' },
  { key: 'sensitive', label: 'البشرة الحساسة' }, { key: 'tone', label: 'المظهر غير المتجانس' }, { key: 'sun', label: 'الحماية من الشمس' },
];

export const articles = [
  { handle: 'layering-order', title: 'ترتيب خطوات الروتين: من الأخف إلى الأثقل', excerpt: 'قاعدة بسيطة تساعدكِ على ترتيب الغسول والسيروم والمرطب وواقي الشمس.', image: img('editorial-ritual.jpg'), tag: 'روتين' },
  { handle: 'sun-in-gulf', title: 'واقي الشمس في أجواء الخليج', excerpt: 'متى تجدّدين واقي الشمس، وكيف تختارين القوام المناسب لبشرتكِ.', image: img('cat-sun.jpg'), tag: 'حماية' },
  { handle: 'berry-lips', title: 'درجات التوت: دليل اختيار أحمر الشفاه', excerpt: 'كيف تختارين بين التوتي والوردي العتيق والنبيذي حسب الإطلالة.', image: img('editorial-portrait.jpg'), tag: 'مكياج' },
];

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
export const inCollection = (h: string) => (h === 'all' ? products : products.filter((p) => p.collections.includes(h)));
