import { useMemo, useState } from 'react';
import { useSearch, useLocation } from 'wouter';
import { Search as SearchIcon } from 'lucide-react';
import { needs, products } from '@/data/catalog';
import { ProductCard } from '@/components/sidra/ProductCard';
import { Empty, Filters } from '@/pages/Collection';

export default function SearchPage() {
  const params = new URLSearchParams(useSearch());
  const [, go] = useLocation();
  const q0 = params.get('q') ?? '';
  const need = params.get('need') ?? '';
  const [q, setQ] = useState(q0);
  const base = useMemo(() => products.filter((p) => (!q0 || [p.title, p.vendor, p.type, p.short].join(' ').includes(q0.trim())) && (!need || p.needs.includes(need))), [q0, need]);
  const needLabel = needs.find((n) => n.key === need)?.label;
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="mx-auto my-12 max-w-2xl text-center">
        <h1 className="font-display text-[30px] font-extrabold text-wine md:text-5xl">{needLabel ? `احتياج: ${needLabel}` : 'البحث'}</h1>
        <form onSubmit={(e) => { e.preventDefault(); go(`/search?q=${encodeURIComponent(q)}`); }} className="mt-8 flex items-center gap-3 rounded-full border border-line bg-snow p-2 pr-6 focus-within:border-rose">
          <SearchIcon className="h-5 w-5 text-taupe" />
          <input data-testid="input-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="سيروم، أحمر شفاه، واقي شمس…" className="flex-1 bg-transparent py-2 outline-none" aria-label="البحث" />
          <button className="rounded-full bg-berry px-6 py-2.5 text-pearl">بحث</button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">{needs.map((n) => <button key={n.key} onClick={() => go(`/search?need=${n.key}`)} className={`rounded-full px-3 py-1 ${n.key === need ? 'bg-blush text-berry' : 'text-taupe hover:text-berry'}`}>{n.label}</button>)}</div>
        {(q0 || need) && <p className="mt-6 text-sm text-taupe">{base.length} نتيجة{q0 && <> لـ «{q0}»</>}</p>}
      </div>
      <Filters base={base}>{(l) => l.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">{l.map((p, i) => <ProductCard key={p.handle} p={p} i={i} />)}</div> : <Empty text="لم نجد نتائج — جرّبي كلمة أخرى" />}</Filters>
    </div>
  );
}
