import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Heart, Minus, Plus, ChevronDown, Truck, RotateCcw } from 'lucide-react';
import { getProduct, products, usd } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { ProductCard, SectionHead } from '@/components/sidra/ProductCard';
import NotFound from '@/pages/not-found';

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const p = getProduct(handle);
  const { add, toggleWish, wishlist } = useStore();
  const [vid, setVid] = useState(() => p?.variants.find((v) => v.available)?.id ?? p?.variants[0].id);
  const [qty, setQty] = useState(1);
  const [openI, setOpenI] = useState(0);
  const [added, setAdded] = useState(false);
  if (!p) return <NotFound />;
  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  const related = products.filter((x) => x.handle !== p.handle && x.collections.some((c) => p.collections.includes(c))).slice(0, 4);
  const wished = wishlist.includes(p.handle);
  const sections = [{ title: 'نبذة عن المنتج', body: p.description }, ...p.details];
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <nav className="my-6 text-xs text-taupe"><Link href="/">الرئيسية</Link> / <Link href={`/collections/${p.collections[0]}`}>{p.type}</Link> / <span className="text-ink">{p.title}</span></nav>
      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="arch img-zoom overflow-hidden bg-snow"><img src={p.image} alt={p.title} className="aspect-[4/5] w-full object-cover" /></div>
        </div>
        <div className="reveal">
          <p className="text-sm text-gold">{p.vendor}</p>
          <h1 className="mt-2 font-display text-[30px] font-extrabold leading-tight text-wine md:text-[44px]" data-testid="text-product-title">{p.title}</h1>
          <p className="mt-3 text-taupe">{p.short}</p>
          <p className="mt-6 font-display text-2xl text-berry" data-testid="text-product-price">{usd(v.price)}</p>
          <p className="mt-1 text-xs text-taupe">شامل الضريبة حيث ينطبق. الشحن يُحتسب عند الدفع.</p>

          <fieldset className="mt-8">
            <legend className="mb-3 text-sm text-ink">{v.swatch ? 'الدرجة' : 'الحجم'}: <span className="text-berry">{v.title}</span></legend>
            <div className="flex flex-wrap gap-2">
              {p.variants.map((x) => (
                <button key={x.id} onClick={() => setVid(x.id)} aria-pressed={x.id === v.id} data-testid={`button-variant-${x.id}`}
                  className={`relative flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition ${x.id === v.id ? 'border-berry bg-blush/50' : 'border-line bg-snow hover:border-rose'} ${!x.available ? 'text-taupe line-through' : ''}`}>
                  {x.swatch && <span className="h-4 w-4 rounded-full" style={{ background: x.swatch }} />}{x.title}
                </button>))}
            </div>
          </fieldset>
          <p className={`mt-4 text-sm ${v.available ? 'text-wine' : 'text-berry'}`} data-testid="status-stock">{v.available ? 'متوفر' : 'غير متوفر حاليًا'}</p>

          <div className="mt-6 flex gap-3">
            <div className="flex items-center rounded-full border border-line bg-snow">
              <button onClick={() => setQty(Math.min(10, qty + 1))} className="p-4" aria-label="زيادة"><Plus className="h-4 w-4" /></button>
              <span className="num w-8 text-center" data-testid="text-qty">{qty}</span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-4" aria-label="إنقاص"><Minus className="h-4 w-4" /></button>
            </div>
            <button disabled={!v.available || added} data-testid="button-add-to-cart" onClick={() => { add(p.handle, v.id, qty); setAdded(true); setTimeout(() => setAdded(false), 900); }}
              className="flex-1 rounded-full bg-berry py-4 text-pearl transition hover:bg-wine active:scale-[.98] disabled:bg-taupe/70">
              {!v.available ? 'غير متوفر' : added ? 'تمت الإضافة' : 'أضيفي إلى السلة'}
            </button>
            <button onClick={() => toggleWish(p.handle)} aria-pressed={wished} aria-label="المفضلة" data-testid="button-wishlist" className="grid w-14 place-items-center rounded-full border border-line bg-snow active:scale-90">
              <Heart className={`h-5 w-5 ${wished ? 'fill-berry text-berry' : 'text-wine'}`} strokeWidth={1.6} />
            </button>
          </div>
          <div className="mt-6 grid gap-3 rounded-2xl bg-blush/40 p-5 text-sm text-wine sm:grid-cols-2">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-rose" />مدة الشحن وتكلفته تظهر عند الدفع</span>
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-rose" /><Link href="/pages/returns" className="underline-offset-4 hover:underline">سياسة الاستبدال والاسترجاع</Link></span>
          </div>

          <div className="mt-10 border-t border-line">
            {sections.map((s, i) => (
              <div key={s.title} className="border-b border-line">
                <button onClick={() => setOpenI(openI === i ? -1 : i)} aria-expanded={openI === i} className="flex w-full items-center justify-between py-5 text-right font-display font-bold text-wine">
                  {s.title}<ChevronDown className={`h-4 w-4 transition ${openI === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-500 ${openI === i ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}><p className="overflow-hidden leading-8 text-taupe">{s.body}</p></div>
              </div>))}
          </div>
          <p className="mt-6 text-xs text-taupe">تظهر التقييمات الحقيقية هنا فقط عند تفعيل تطبيق مراجعات في المتجر.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-24"><SectionHead kicker="قد يعجبكِ أيضًا" title="منتجات مكمّلة" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{related.map((x, i) => <ProductCard key={x.handle} p={x} i={i} />)}</div></section>)}
    </div>
  );
}
