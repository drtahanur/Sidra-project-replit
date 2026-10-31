import { Link } from 'wouter';
import { ArrowLeft, Sparkles, ShieldCheck, FileText, MessageCircle } from 'lucide-react';
import { articles, collections, img, needs, products } from '@/data/catalog';
import { ProductCard, SectionHead } from '@/components/sidra/ProductCard';
import { Newsletter } from '@/pages/shared';

export default function Home() {
  const best = products.filter((p) => p.collections.includes('bestsellers'));
  const picks = products.filter((p) => p.collections.includes('new'));
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-12 md:px-8 md:pb-24 md:pt-14">
          <div className="md:col-span-6 md:pl-6">
            <p className="reveal mb-6 flex items-center gap-3 text-xs tracking-[.25em] text-gold"><span className="h-px w-10 bg-gold" />اللؤلؤ والتوت</p>
            <h1 className="reveal font-display text-[38px] font-extrabold leading-[1.25] text-wine md:text-[62px]" style={{ animationDelay: '80ms' }}>
              جمالكِ، بتفاصيل <span className="relative text-berry">تستحق<svg className="absolute -bottom-2 right-0 w-full" viewBox="0 0 200 12" fill="none"><path d="M2 9C50 2 150 2 198 8" stroke="#B99A65" strokeWidth="2" strokeLinecap="round" /></svg></span> العناية.
            </h1>
            <p className="reveal mt-6 max-w-md text-base leading-8 text-taupe md:text-lg" style={{ animationDelay: '160ms' }}>اكتشفي اختيارات مميزة للعناية ببشرتكِ وإبراز جمالكِ كل يوم.</p>
            <div className="reveal mt-9 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
              <Link href="/collections/all" data-testid="link-hero-shop" className="group inline-flex items-center gap-3 rounded-full bg-berry px-7 py-4 text-pearl transition hover:bg-wine">تسوّقي الآن<ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></Link>
              <Link href="/collections/skincare" className="rounded-full border border-wine/25 px-7 py-4 text-wine transition hover:border-berry hover:text-berry">اكتشفي العناية بالبشرة</Link>
            </div>
          </div>
          <div className="relative md:col-span-6">
            <div className="arch img-zoom reveal relative mx-auto aspect-[4/5] max-w-[520px] overflow-hidden bg-blush" style={{ animationDelay: '120ms' }}>
              <img src={img('hero.jpg')} alt="منتجات عناية على أحجار لؤلؤية مع غصن سدر" fetchPriority="high" className="h-full w-full object-cover" />
            </div>
            <div className="arch absolute -bottom-6 left-0 hidden aspect-[3/4] w-40 overflow-hidden border-[6px] border-pearl md:block lg:-left-6">
              <img src={img('editorial-texture.jpg')} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -right-2 top-10 hidden rounded-2xl bg-snow/90 px-5 py-4 shadow-xl backdrop-blur md:block">
              <p className="text-xs text-taupe">روتين الصباح</p><p className="font-display font-bold text-wine">غسول · سيروم · وقاية</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead kicker="تسوّقي حسب الفئة" title="من أين تبدئين اليوم؟" />
        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {collections.slice(0, 6).map((c, i) => (
            <Link key={c.handle} href={`/collections/${c.handle}`} data-testid={`link-category-${c.handle}`} className={`group w-40 shrink-0 snap-start md:w-auto ${i % 2 ? 'md:mt-10' : ''}`}>
              <div className="arch img-zoom overflow-hidden bg-blush"><img src={c.image} alt={c.title} loading="lazy" className="aspect-[3/4] w-full object-cover" /></div>
              <p className="mt-3 text-center font-display font-bold text-wine transition group-hover:text-berry">{c.title}</p>
            </Link>))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto mt-24 max-w-7xl px-5 md:px-8">
        <SectionHead kicker="الأكثر طلبًا" title="اختيارات يعود إليها الجميع">
          <Link href="/collections/bestsellers" className="group inline-flex items-center gap-2 text-sm text-berry">عرض الكل<ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></Link>
        </SectionHead>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">{best.map((p, i) => <ProductCard key={p.handle} p={p} i={i} />)}</div>
      </section>

      {/* ROUTINE EDITORIAL */}
      <section className="mt-28 bg-blush/45">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
          <div className="relative">
            <img src={img('editorial-ritual.jpg')} alt="يد تمسك قطّارة سيروم" loading="lazy" className="aspect-[5/6] w-full rounded-[28px] object-cover md:w-[85%]" />
            <div className="absolute -bottom-8 left-4 w-44 rounded-2xl bg-pearl p-5 shadow-xl md:left-0">
              <p className="font-display text-3xl font-extrabold text-berry">٣</p><p className="text-sm text-taupe">خطوات أساسية لروتين يومي واضح</p>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs tracking-[.2em] text-gold">اكتشفي روتين العناية</p>
            <h2 className="font-display text-3xl font-bold leading-snug text-wine md:text-[42px]">روتينكِ يبدأ من الاختيار الصحيح.</h2>
            <p className="mt-5 max-w-md leading-8 text-taupe">اكتشفي منتجات تساعدكِ على بناء روتين عناية يناسب احتياجاتكِ. نعرض المعلومات كما ترد من المصدر، دون وعود علاجية.</p>
            <ol className="mt-8 space-y-4">
              {[['التنظيف', 'غسول لطيف يناسب نوع بشرتكِ'], ['الترطيب', 'سيروم ومرطب بقوام مريح'], ['الحماية', 'واقي شمس يُجدَّد خلال اليوم']].map(([t, d], i) => (
                <li key={t} className="flex items-center gap-5 border-b border-wine/10 pb-4">
                  <span className="font-display text-2xl font-light text-rose">{['١', '٢', '٣'][i]}</span>
                  <div><p className="font-display font-bold text-wine">{t}</p><p className="text-sm text-taupe">{d}</p></div>
                </li>))}
            </ol>
            <Link href="/blogs/journal" className="mt-8 inline-flex items-center gap-2 text-berry">اقرئي دليل ترتيب الخطوات<ArrowLeft className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* SKIN NEEDS */}
      <section className="mx-auto mt-24 max-w-7xl px-5 text-center md:px-8">
        <p className="text-xs tracking-[.2em] text-gold">حسب احتياج بشرتكِ</p>
        <h2 className="mt-3 font-display text-[26px] font-bold text-wine md:text-4xl">ما الذي تحتاجه بشرتكِ الآن؟</h2>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
          {needs.map((n) => <Link key={n.key} href={`/search?need=${n.key}`} data-testid={`link-need-${n.key}`} className="rounded-full border border-line bg-snow px-6 py-3 text-wine transition hover:-translate-y-0.5 hover:border-rose hover:bg-blush/50">{n.label}</Link>)}
        </div>
      </section>

      {/* SIDRA PICKS */}
      <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="relative overflow-hidden rounded-[28px] md:col-span-5">
            <img src={img('editorial-portrait.jpg')} alt="إطلالة بمكياج ناعم" loading="lazy" className="h-full min-h-[420px] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-wine/85 to-transparent p-8 text-pearl">
              <p className="text-xs tracking-[.2em] text-gold">مختارات سدرة</p>
              <h3 className="mt-2 font-display text-3xl font-bold">لمسة توتية لكل يوم</h3>
              <Link href="/collections/new" className="mt-4 inline-flex items-center gap-2 text-sm">اكتشفي الجديد<ArrowLeft className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:col-span-7 md:grid-cols-3">{picks.map((p, i) => <ProductCard key={p.handle} p={p} i={i} />)}</div>
        </div>
      </section>

      {/* OFFERS (honest) */}
      <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <div className="relative grid overflow-hidden rounded-[28px] bg-wine text-pearl md:grid-cols-2">
          <div className="p-10 md:p-14">
            <p className="text-xs tracking-[.2em] text-gold">عروض ومجموعات مميزة</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">مجموعات الإهداء والسفر</h2>
            <p className="mt-4 max-w-sm leading-8 text-blush/85">مساحة لحملات المتجر الموسمية. تُعرض شروط أي عرض ومدته بوضوح عند تفعيله من لوحة Shopify — دون عدادات وهمية.</p>
            <Link href="/collections/sets" className="mt-8 inline-flex rounded-full bg-pearl px-7 py-3.5 text-wine transition hover:bg-blush">تصفّحي المجموعات</Link>
          </div>
          <img src={img('cat-sets.jpg')} alt="صندوق هدايا لؤلؤي" loading="lazy" className="h-72 w-full object-cover md:h-full" />
        </div>
      </section>

      {/* WHY SIDRA */}
      <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <SectionHead kicker="لماذا سدرة؟" title="ما نلتزم به معكِ" />
        <div className="grid gap-px overflow-hidden rounded-[24px] bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[[Sparkles, 'منتجات مختارة بعناية', 'نختار ما نعرضه بعد مراجعة معلوماته.'], [FileText, 'معلومات واضحة', 'المكونات وطريقة الاستخدام والتحذيرات في مكان واحد.'], [ShieldCheck, 'تجربة شراء آمنة', 'إتمام الطلب عبر Shopify Checkout.'], [MessageCircle, 'دعم للعملاء', 'فريقنا يجيب عن أسئلتكِ قبل الطلب وبعده.']].map(([I, t, d]) => { const Icon = I as typeof Sparkles; return (
            <div key={t as string} className="bg-pearl p-8 transition hover:bg-snow">
              <Icon className="h-6 w-6 text-rose" strokeWidth={1.4} />
              <h3 className="mt-6 font-display text-lg font-bold text-wine">{t as string}</h3>
              <p className="mt-2 text-sm leading-7 text-taupe">{d as string}</p>
            </div>); })}
        </div>
      </section>

      {/* JOURNAL */}
      <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <SectionHead kicker="مجلة سدرة" title="نصائح هادئة للعناية والجمال">
          <Link href="/blogs/journal" className="text-sm text-berry">كل المقالات</Link>
        </SectionHead>
        <div className="grid gap-8 md:grid-cols-3">
          {articles.map((a, i) => (
            <Link key={a.handle} href="/blogs/journal" className={`group ${i === 1 ? 'md:mt-12' : ''}`}>
              <div className="img-zoom overflow-hidden rounded-[22px]"><img src={a.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /></div>
              <p className="mt-4 text-xs text-gold">{a.tag}</p>
              <h3 className="mt-1 font-display text-lg font-bold leading-snug text-wine group-hover:text-berry">{a.title}</h3>
            </Link>))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
