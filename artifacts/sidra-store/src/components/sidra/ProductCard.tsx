import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { Heart, Plus } from 'lucide-react';
import { usd, type Product } from '@/data/catalog';
import { useStore } from '@/lib/store';

export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { add, toggleWish, wishlist } = useStore();
  const wished = wishlist.includes(p.handle);
  const v = p.variants.find((x) => x.available) ?? p.variants[0];
  const min = Math.min(...p.variants.map((x) => x.price));
  return (
    <article className="group reveal" style={{ animationDelay: `${i * 60}ms` }} data-testid={`card-product-${p.handle}`}>
      <div className="img-zoom relative overflow-hidden rounded-[22px] bg-snow">
        <Link href={`/products/${p.handle}`} aria-label={p.title}>
          <img src={p.image} alt={p.title} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        </Link>
        <button onClick={() => toggleWish(p.handle)} aria-pressed={wished} aria-label="أضيفي إلى المفضلة" data-testid={`button-wish-${p.handle}`}
          className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-pearl/85 backdrop-blur transition active:scale-90">
          <Heart className={`h-4 w-4 transition ${wished ? 'fill-berry text-berry' : 'text-wine'}`} strokeWidth={1.6} />
        </button>
        <button onClick={() => v.available && add(p.handle, v.id)} disabled={!v.available} data-testid={`button-quick-add-${p.handle}`}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-full bg-berry/95 py-2.5 text-sm text-pearl opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100 max-md:translate-y-0 max-md:opacity-100 disabled:bg-taupe">
          <Plus className="h-4 w-4" />{v.available ? 'أضيفي إلى السلة' : 'غير متوفر'}
        </button>
      </div>
      <div className="mt-4 px-1">
        <p className="text-xs text-taupe">{p.vendor}</p>
        <Link href={`/products/${p.handle}`} className="mt-0.5 block text-[15px] font-medium text-ink hover:text-berry md:text-base">{p.title}</Link>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm text-wine">{p.variants.length > 1 && new Set(p.variants.map((x) => x.price)).size > 1 ? 'من ' : ''}{usd(min)}</span>
          {p.variants[0].swatch && <span className="flex gap-1">{p.variants.map((x) => <span key={x.id} className="h-3 w-3 rounded-full ring-1 ring-line" style={{ background: x.swatch }} />)}</span>}
        </div>
      </div>
    </article>
  );
}

export function SectionHead({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="mb-3 flex items-center gap-3 text-xs tracking-[.2em] text-gold"><span className="h-px w-8 bg-gold" />{kicker}</p>}
        <h2 className="font-display text-[26px] font-bold leading-tight text-wine md:text-4xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}
