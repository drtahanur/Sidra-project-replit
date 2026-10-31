import { articles } from '@/data/catalog';

export default function Journal() {
  const [lead, ...rest] = articles;
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <header className="my-12 text-center">
        <p className="text-xs tracking-[.25em] text-gold">مجلة سدرة</p>
        <h1 className="mt-3 font-display text-[32px] font-extrabold text-wine md:text-6xl">حكايات العناية والجمال</h1>
      </header>
      <article className="grid items-center gap-8 md:grid-cols-2">
        <img src={lead.image} alt="" className="aspect-[4/3] w-full rounded-[28px] object-cover" />
        <div><p className="text-sm text-gold">{lead.tag}</p><h2 className="mt-2 font-display text-3xl font-bold leading-snug text-wine">{lead.title}</h2><p className="mt-4 leading-8 text-taupe">{lead.excerpt}</p>
          <p className="mt-6 text-xs text-taupe">محتوى توضيحي للمعاينة — المقالات الفعلية تُدار من مدونة Shopify.</p></div>
      </article>
      <div className="mt-16 grid gap-10 md:grid-cols-2">
        {rest.map((a) => (
          <article key={a.handle} className="group">
            <div className="img-zoom overflow-hidden rounded-[22px]"><img src={a.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" /></div>
            <p className="mt-4 text-xs text-gold">{a.tag}</p><h3 className="mt-1 font-display text-xl font-bold text-wine">{a.title}</h3><p className="mt-2 text-taupe">{a.excerpt}</p>
          </article>))}
      </div>
    </div>
  );
}
