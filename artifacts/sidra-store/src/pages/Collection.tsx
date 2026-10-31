import { useMemo, useState, type ReactNode } from 'react';
import { useParams, Link } from 'wouter';
import { SlidersHorizontal, X } from 'lucide-react';
import { collections, inCollection, products, type Product } from '@/data/catalog';
import { ProductCard } from '@/components/sidra/ProductCard';

const sorts = [['featured', 'المميز'], ['best', 'الأكثر طلبًا'], ['new', 'الأحدث'], ['asc', 'السعر: من الأقل إلى الأعلى'], ['desc', 'السعر: من الأعلى إلى الأقل'], ['az', 'أبجديًا']] as const;

export function sortList(list: Product[], s: string) {
  const min = (p: Product) => Math.min(...p.variants.map((v) => v.price));
  const l = [...list];
  if (s === 'best') l.sort((a, b) => b.popularity - a.popularity);
  if (s === 'new') l.sort((a, b) => b.createdRank - a.createdRank);
  if (s === 'asc') l.sort((a, b) => min(a) - min(b));
  if (s === 'desc') l.sort((a, b) => min(b) - min(a));
  if (s === 'az') l.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  return l;
}

export function Filters({ base, children }: { base: Product[]; children: (l: Product[], count: number) => ReactNode }) {
  const [vendors, setVendors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [avail, setAvail] = useState(false);
  const [max, setMax] = useState(80);
  const [sort, setSort] = useState('featured');
  const [open, setOpen] = useState(false);
  const allV = [...new Set(products.map((p) => p.vendor))];
  const allT = [...new Set(base.map((p) => p.type))];
  const list = useMemo(() => sortList(base.filter((p) => (!vendors.length || vendors.includes(p.vendor)) && (!types.length || types.includes(p.type)) && (!avail || p.variants.some((v) => v.available)) && Math.min(...p.variants.map((v) => v.price)) <= max), sort), [base, vendors, types, avail, max, sort]);
  const tog = (a: string[], f: (x: string[]) => void, v: string) => f(a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);
  const Chip = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button onClick={onClick} aria-pressed={on} className={`rounded-full border px-4 py-2 text-sm transition ${on ? 'border-berry bg-berry text-pearl' : 'border-line bg-snow text-ink hover:border-rose'}`}>{label}</button>);
  const panel = (
    <div className="space-y-8">
      <div><h3 className="mb-3 font-display font-bold text-wine">الماركة</h3><div className="flex flex-wrap gap-2">{allV.map((v) => <Chip key={v} on={vendors.includes(v)} label={v} onClick={() => tog(vendors, setVendors, v)} />)}</div></div>
      <div><h3 className="mb-3 font-display font-bold text-wine">نوع المنتج</h3><div className="flex flex-wrap gap-2">{allT.map((v) => <Chip key={v} on={types.includes(v)} label={v} onClick={() => tog(types, setTypes, v)} />)}</div></div>
      <div><h3 className="mb-3 font-display font-bold text-wine">السعر حتى <span className="num">${max}</span></h3><input type="range" min={20} max={80} step={1} value={max} onChange={(e) => setMax(+e.target.value)} className="w-full accent-[#853F54]" aria-label="الحد الأعلى للسعر" /></div>
      <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={avail} onChange={(e) => setAvail(e.target.checked)} className="h-4 w-4 accent-[#853F54]" />المتوفر فقط</label>
      <button onClick={() => { setVendors([]); setTypes([]); setAvail(false); setMax(80); }} className="text-sm text-taupe underline underline-offset-4">مسح الفلاتر</button>
    </div>);
  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">{panel}</aside>
      <div>
        <div className="mb-8 flex items-center justify-between gap-3 border-b border-line pb-4">
          <button onClick={() => setOpen(true)} aria-expanded={open} data-testid="button-filters" className="inline-flex items-center gap-2 rounded-full border border-line bg-snow px-4 py-2 text-sm lg:hidden"><SlidersHorizontal className="h-4 w-4" />الفلاتر</button>
          <p className="hidden text-sm text-taupe lg:block">{list.length} منتجات</p>
          <label className="flex items-center gap-2 text-sm"><span className="text-taupe">الترتيب</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="select-sort" className="rounded-full border border-line bg-snow px-4 py-2 outline-none">{sorts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
          </label>
        </div>
        {children(list, list.length)}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-wine/40" onClick={() => setOpen(false)} />
          <div className="reveal absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-pearl p-6">
            <div className="mb-6 flex justify-between"><h2 className="font-display text-xl font-bold text-wine">الفلاتر</h2><button onClick={() => setOpen(false)} aria-label="إغلاق"><X className="h-5 w-5" /></button></div>
            {panel}<button onClick={() => setOpen(false)} className="mt-8 w-full rounded-full bg-berry py-3.5 text-pearl">عرض {list.length} منتجات</button>
          </div></div>)}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (<div className="flex flex-col items-center py-20 text-center"><div className="arch mb-6 h-28 w-20 bg-blush/60" /><p className="font-display text-lg text-wine">{text}</p><Link href="/collections/all" className="mt-4 text-sm text-berry">تصفّحي كل المنتجات</Link></div>);
}

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>();
  const c = collections.find((x) => x.handle === handle) ?? { handle, title: 'تصنيف', blurb: 'لا توجد منتجات في هذا التصنيف بعد.', image: '' };
  const base = inCollection(handle);
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <header className="relative my-8 grid items-center gap-8 overflow-hidden rounded-[28px] bg-blush/50 md:grid-cols-2">
        <div className="p-8 md:p-14">
          <nav className="mb-4 text-xs text-taupe"><Link href="/">الرئيسية</Link> / <span>{c.title}</span></nav>
          <h1 className="font-display text-[30px] font-extrabold text-wine md:text-5xl">{c.title}</h1>
          <p className="mt-3 max-w-sm text-taupe">{c.blurb}</p>
          <p className="mt-4 text-sm text-berry">{base.length} منتجات</p>
        </div>
        {c.image && <img src={c.image} alt="" className="h-56 w-full object-cover md:h-80" />}
      </header>
      <Filters base={base}>{(l) => l.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">{l.map((p, i) => <ProductCard key={p.handle} p={p} i={i} />)}</div> : <Empty text="لا توجد منتجات تطابق اختياركِ" />}</Filters>
    </div>
  );
}
