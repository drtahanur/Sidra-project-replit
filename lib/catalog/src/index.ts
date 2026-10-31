// بيانات المنتجات المشتركة بين الواجهة والخادم. الخادم يعتمد على الأسعار هنا فقط عند إنشاء الطلبات والدفع،
// ولا يثق أبدًا بأي سعر يأتي من المتصفح. الصور أسماء ملفات فقط؛ تحدد الواجهة مسارها.
export type Variant = { id: string; title: string; price: number; available: boolean; swatch?: string };
export type Product = {
  handle: string; title: string; vendor: string; type: string; collections: string[];
  image: string; short: string; description: string; needs: string[];
  variants: Variant[]; details: { title: string; body: string }[]; createdRank: number; popularity: number;
};

export const CURRENCY = 'USD';

// سياسة الشحن والاسترجاع: مصدر واحد تقرأه الواجهة والخادم معًا.
export const SHIPPING_POLICY = {
  flatFee: 7,             // دولار
  freeOver: 80,           // شحن مجاني للطلبات من هذا المبلغ
  minDays: 2,
  maxDays: 7,             // مدة التوصيل لا تزيد عن أسبوع
  returnDays: 14,
} as const;

export const shippingFor = (subtotal: number) => (subtotal >= SHIPPING_POLICY.freeOver || subtotal === 0 ? 0 : SHIPPING_POLICY.flatFee);


const std = (how: string, ing: string) => [
  { title: 'طريقة الاستخدام', body: how },
  { title: 'المكونات', body: ing },
  { title: 'التحذيرات والاحتياطات', body: 'للاستخدام الخارجي فقط. يُنصح بتجربة المنتج على جزء صغير من البشرة أولًا، والتوقف عن الاستخدام عند ظهور أي تهيّج.' },
  { title: 'الشحن والاسترجاع', body: 'يصلكِ الطلب خلال ٢ إلى ٧ أيام عمل، ولا تزيد مدة التوصيل عن أسبوع. الشحن مجاني للطلبات من ٨٠ دولارًا، ويظهر سعر الشحن النهائي في صفحة الدفع. يمكنكِ الاستبدال أو الاسترجاع خلال ١٤ يومًا من الاستلام.' },
];

export const products: Product[] = [
  { handle: 'pearl-dew-serum', title: 'سيروم ندى اللؤلؤ', vendor: 'دار نَدى', type: 'سيروم', collections: ['skincare', 'serums', 'bestsellers'], image: 'p-serum.jpg', short: 'سيروم مائي خفيف للترطيب اليومي.', description: 'قوام مائي سريع الامتصاص يُستخدم صباحًا ومساءً قبل المرطب، ويمنح البشرة إحساسًا بالانتعاش دون لزوجة.', needs: ['hydration', 'dryness'], createdRank: 4, popularity: 9,
    variants: [{ id: 's30', title: '30 مل', price: 49, available: true }, { id: 's50', title: '50 مل', price: 71, available: true }],
    details: std('ضعي ٣–٤ قطرات على بشرة نظيفة ثم ربّتي بلطف حتى الامتصاص.', 'يُعرض هنا جدول المكونات الكامل كما يرد من المورّد في حقول Shopify الإضافية.') },
  { handle: 'rose-cloud-cream', title: 'كريم سحابة الورد', vendor: 'دار نَدى', type: 'مرطب', collections: ['skincare', 'bestsellers', 'sets'], image: 'p-cream.jpg', short: 'مرطب كريمي ناعم للبشرة الجافة.', description: 'كريم مخفوق بقوام غني يناسب الأجواء المكيّفة، ويترك ملمسًا مخمليًا.', needs: ['dryness', 'sensitive'], createdRank: 2, popularity: 8,
    variants: [{ id: 'c50', title: '50 مل', price: 58, available: true }],
    details: std('دلّكي كمية صغيرة على الوجه والرقبة بعد السيروم.', 'يُعرض جدول المكونات من بيانات المنتج.') },
  { handle: 'veil-spf-fluid', title: 'سائل الوقاية «وشاح»', vendor: 'ضحى', type: 'واقي شمس', collections: ['skincare', 'sunscreen', 'new'], image: 'p-sunscreen.jpg', short: 'واقي شمس سائل بلمسة غير لامعة.', description: 'سائل خفيف يُستخدم كخطوة أخيرة في روتين الصباح، يُعاد وضعه حسب التعرّض للشمس.', needs: ['sun', 'oily'], createdRank: 9, popularity: 7,
    variants: [{ id: 'v40', title: '40 مل', price: 40, available: true }],
    details: std('ضعيه كخطوة أخيرة صباحًا وجدّديه خلال اليوم.', 'تُعرض درجة الحماية والمكونات كما هي معتمدة على العبوة.') },
  { handle: 'soft-foam-cleanser', title: 'غسول الرغوة الناعمة', vendor: 'ضحى', type: 'غسول', collections: ['skincare'], image: 'p-cleanser.jpg', short: 'غسول لطيف للاستخدام اليومي.', description: 'رغوة كثيفة تزيل بقايا اليوم برفق وتحافظ على راحة البشرة.', needs: ['oily', 'sensitive'], createdRank: 5, popularity: 5,
    variants: [{ id: 'f150', title: '150 مل', price: 25, available: true }],
    details: std('دلّكي الرغوة على بشرة مبللة ثم اشطفي بماء فاتر.', 'يُعرض جدول المكونات من بيانات المنتج.') },
  { handle: 'berry-velvet-lipstick', title: 'أحمر شفاه مخملي', vendor: 'لَمى', type: 'أحمر شفاه', collections: ['makeup', 'lips', 'bestsellers'], image: 'p-lipstick.jpg', short: 'لون كثيف بلمسة مخملية.', description: 'أحمر شفاه بلمسة نهائية مخملية ودرجات مستوحاة من التوت والورد.', needs: [], createdRank: 6, popularity: 10,
    variants: [{ id: 'l1', title: 'توتي', price: 34, available: true, swatch: '#853F54' }, { id: 'l2', title: 'وردي عتيق', price: 34, available: true, swatch: '#B76E79' }, { id: 'l3', title: 'نبيذي', price: 34, available: false, swatch: '#422333' }],
    details: std('ابدئي من منتصف الشفة نحو الأطراف.', 'يُعرض جدول المكونات من بيانات المنتج.') },
  { handle: 'blush-petal-cream', title: 'أحمر خدود «بتلة»', vendor: 'لَمى', type: 'أحمر خدود', collections: ['makeup', 'new'], image: 'p-blush.jpg', short: 'أحمر خدود كريمي قابل للدمج.', description: 'قوام كريمي يندمج بأطراف الأصابع ليمنح توردًا طبيعيًا.', needs: [], createdRank: 8, popularity: 6,
    variants: [{ id: 'b1', title: 'وردي', price: 37, available: true, swatch: '#E5A9A9' }, { id: 'b2', title: 'خوخي', price: 37, available: true, swatch: '#D99A86' }],
    details: std('ربّتي على وجنتيكِ وادمجي نحو الأعلى.', 'يُعرض جدول المكونات من بيانات المنتج.') },
  { handle: 'glaze-lip-oil', title: 'زيت الشفاه اللامع', vendor: 'لَمى', type: 'عناية بالشفاه', collections: ['lips', 'makeup', 'new', 'sets'], image: 'p-lipoil.jpg', short: 'لمعة مغذية بلون شفاف.', description: 'زيت شفاه غير لزج يمنح لمعة ولونًا شفافًا يناسب كل يوم.', needs: ['dryness'], createdRank: 10, popularity: 7,
    variants: [{ id: 'g1', title: 'توت شفاف', price: 24, available: true, swatch: '#B76E79' }],
    details: std('مرّري الفرشاة على الشفاه وحدها أو فوق أحمر الشفاه.', 'يُعرض جدول المكونات من بيانات المنتج.') },
  { handle: 'gold-eye-cream', title: 'كريم العين الذهبي', vendor: 'دار نَدى', type: 'عناية بالعين', collections: ['skincare'], image: 'p-eyecream.jpg', short: 'كريم خفيف لمحيط العين.', description: 'قوام جل كريمي مبرّد يُطبَّق صباحًا ومساءً حول العين.', needs: ['hydration', 'tone'], createdRank: 3, popularity: 4,
    variants: [{ id: 'e15', title: '15 مل', price: 47, available: true }],
    details: std('ربّتي بإصبع البنصر حول العين دون سحب البشرة.', 'يُعرض جدول المكونات من بيانات المنتج.') },
];


export const getProduct = (handle: string) => products.find((p) => p.handle === handle);
