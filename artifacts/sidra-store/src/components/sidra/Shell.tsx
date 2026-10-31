import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingBag, User, Heart, Menu, X, Minus, Plus, Trash2, Instagram, Download, MessageCircle } from 'lucide-react';
import { useUser } from '@clerk/react';
import { brand, getProduct, usd } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { SUPPORT_WHATSAPP, supportWhatsappUrl } from '@/data/support';

export const Logo = ({ light = false, className = 'h-10' }: { light?: boolean; className?: string }) => (
  <img
    src={brand(light ? 'logo-light.svg' : 'logo-header.svg')}
    alt="سدرة"
    className={`${className} w-auto`}
    decoding="async"
  />
);

const nav = [
  ['/', 'الرئيسية'], ['/collections/skincare', 'العناية بالبشرة'], ['/collections/makeup', 'المكياج'],
  ['/collections/bestsellers', 'الأكثر طلبًا'], ['/collections/new', 'وصل حديثًا'], ['/collections/sets', 'المجموعات'],
  ['/blogs/journal', 'مجلة سدرة'], ['/pages/about', 'قصتنا'],
];

function CartDrawer() {
  const { lines, drawerOpen, setDrawer, setQty, remove, subtotal } = useStore();
  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
      <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-wine/40 transition-opacity duration-500 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside role="dialog" aria-label="السلة" className={`absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-pearl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl font-bold text-wine">سلّتكِ</h2>
          <button data-testid="button-close-cart" onClick={() => setDrawer(false)} className="rounded-full p-2 hover:bg-blush/60" aria-label="إغلاق"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="arch mb-6 grid h-32 w-24 place-items-center bg-blush/60"><ShoppingBag className="h-8 w-8 text-berry" strokeWidth={1.3} /></div>
              <p className="font-display text-lg text-wine">السلة فارغة الآن</p>
              <p className="mt-1 text-sm text-taupe">ابدئي من مختاراتنا للعناية اليومية.</p>
              <Link href="/collections/all" onClick={() => setDrawer(false)} className="mt-6 rounded-full bg-berry px-6 py-3 text-sm text-pearl">تسوّقي الآن</Link>
            </div>
          ) : lines.map((l, i) => { const p = getProduct(l.handle); const v = p?.variants.find((x) => x.id === l.variantId); if (!p || !v) return null;
            return (
              <div key={i} className="flex gap-4 border-b border-line py-4" data-testid={`cart-line-${i}`}>
                <img src={p.image} alt={p.title} className="h-24 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-xs text-taupe">{p.vendor}</p>
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-taupe">{v.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line bg-snow">
                      <button onClick={() => setQty(i, l.qty + 1)} className="p-2" aria-label="زيادة"><Plus className="h-3.5 w-3.5" /></button>
                      <span className="num w-6 text-center text-sm">{l.qty}</span>
                      <button onClick={() => setQty(i, l.qty - 1)} className="p-2" aria-label="إنقاص"><Minus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="text-sm font-medium text-wine">{usd(v.price * l.qty)}</span>
                  </div>
                </div>
                <button onClick={() => remove(i)} className="self-start p-1 text-taupe hover:text-berry" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
              </div>); })}
        </div>
        {lines.length > 0 && (
          <div className="border-t border-line bg-snow px-6 py-5">
            <div className="flex justify-between font-display text-lg text-wine"><span>المجموع الفرعي</span><span>{usd(subtotal)}</span></div>
            <p className="mt-1 text-xs text-taupe">الشحن مجاني للطلبات من $٨٠، ويصل طلبكِ خلال أسبوع كحد أقصى.</p>
            <Link href="/cart" onClick={() => setDrawer(false)} data-testid="link-view-cart" className="mt-4 block rounded-full bg-berry py-3.5 text-center text-pearl transition hover:bg-wine">عرض السلة وإتمام الطلب</Link>
            <button onClick={() => setDrawer(false)} className="mt-2 w-full py-2 text-sm text-taupe underline-offset-4 hover:underline">متابعة التسوق</button>
          </div>)}
      </aside>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { count, setDrawer, wishlist } = useStore();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loc, go] = useLocation();
  const [q, setQ] = useState('');
  const { user, isSignedIn } = useUser();
  useEffect(() => { const f = () => setScrolled(window.scrollY > 40); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [loc]);
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-pearl text-ink">
      <div className="overflow-hidden bg-wine py-2 text-center text-xs tracking-wide text-blush">
        <span>اكتشفي اختياراتكِ المفضلة للجمال مع سدرة</span>
      </div>
      <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'bg-pearl/90 shadow-[0_8px_30px_-18px_rgba(66,35,51,.35)] backdrop-blur-md' : 'bg-pearl'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button data-testid="button-menu" onClick={() => setMenu(true)} className="rounded-full p-2 hover:bg-blush/60 lg:hidden" aria-label="القائمة"><Menu className="h-5 w-5" /></button>
            <Link href="/" data-testid="link-home" aria-label="سدرة — الرئيسية"><Logo className={`transition-all duration-500 ${scrolled ? 'h-12' : 'h-14'}`} /></Link>
          </div>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="القائمة الرئيسية">
            {nav.slice(1).map(([h, t]) => (
              <Link key={h} href={h} className={`group relative py-2 text-[15px] transition-colors hover:text-berry ${loc === h ? 'text-berry' : 'text-ink'}`}>
                {t}<span className={`absolute -bottom-0.5 right-0 h-px bg-gold transition-all duration-300 ${loc === h ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>))}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/search" data-testid="link-search" className="rounded-full p-2.5 hover:bg-blush/60" aria-label="البحث"><Search className="h-5 w-5" strokeWidth={1.6} /></Link>
            <Link href={isSignedIn ? '/account' : '/sign-in'} data-testid="link-account" className="rounded-full p-2.5 hover:bg-blush/60" aria-label={isSignedIn ? 'حسابي' : 'تسجيل الدخول'}>
              {isSignedIn && user?.hasImage ? <img src={user.imageUrl} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-blush" /> : <User className="h-5 w-5" strokeWidth={1.6} />}
            </Link>
            <Link href="/pages/wishlist" data-testid="link-wishlist" className="relative rounded-full p-2.5 hover:bg-blush/60" aria-label="المفضلة">
              <Heart className="h-5 w-5" strokeWidth={1.6} />{wishlist.length > 0 && <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-rose" />}
            </Link>
            <button data-testid="button-open-cart" onClick={() => setDrawer(true)} className="relative rounded-full p-2.5 hover:bg-blush/60" aria-label="السلة">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
              {count > 0 && <span key={count} className="reveal num absolute -left-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-berry px-1 text-[10px] text-pearl" data-testid="text-cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? '' : 'pointer-events-none'}`}>
        <div onClick={() => setMenu(false)} className={`absolute inset-0 bg-wine/40 transition-opacity ${menu ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-pearl p-6 transition-transform duration-500 ${menu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between"><Logo className="h-14" /><button onClick={() => setMenu(false)} aria-label="إغلاق" className="p-2"><X className="h-5 w-5" /></button></div>
          <form onSubmit={(e) => { e.preventDefault(); go(`/search?q=${encodeURIComponent(q)}`); }} className="mt-6 flex items-center gap-2 rounded-full border border-line bg-snow px-4">
            <Search className="h-4 w-4 text-taupe" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي عن منتج" className="w-full bg-transparent py-3 text-sm outline-none" />
          </form>
          <nav className="mt-6 flex flex-col">
            <Link href={isSignedIn ? '/account' : '/sign-in'} className="border-b border-line py-4 font-display text-lg text-berry">{isSignedIn ? 'حسابي' : 'تسجيل الدخول / إنشاء حساب'}</Link>
            {nav.map(([h, t], i) => <Link key={h} href={h} style={{ animationDelay: `${i * 40}ms` }} className={`${menu ? 'reveal' : ''} border-b border-line py-4 font-display text-lg text-wine`}>{t}</Link>)}
          </nav>
        </aside>
      </div>

      <main>{children}</main>

      <footer className="mt-24 bg-wine text-blush">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-12 md:px-8">
          <div className="md:col-span-4">
            <Logo light className="h-24" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-blush/80">سدرة متجر عربي للعناية بالبشرة والمكياج، يجمع اختيارات هادئة ومعلومات واضحة لتجربة تسوق مطمئنة.</p>
            <a href={supportWhatsappUrl()} target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp" className="mt-5 inline-flex items-center gap-2 text-sm text-blush/90 hover:text-pearl"><MessageCircle className="h-4 w-4" />الدعم الفني: <span className="num">{SUPPORT_WHATSAPP.display}</span></a>
            <p className="mt-3 text-xs text-blush/60">ندفع بأمان عبر Stripe · PayPal · Bitcoin</p>
            <div className="mt-6 flex gap-2"><a href="#" aria-label="إنستغرام" className="rounded-full border border-blush/30 p-2.5 hover:bg-blush/10"><Instagram className="h-4 w-4" /></a></div>
          </div>
          {[
            ['التصنيفات', [['/collections/skincare', 'العناية بالبشرة'], ['/collections/makeup', 'المكياج'], ['/collections/sunscreen', 'واقي الشمس'], ['/collections/sets', 'مجموعات الجمال']]],
            ['خدمة العملاء', [['/pages/contact', 'تواصل معنا'], ['/account', 'حسابي وطلباتي'], ['/pages/faq', 'الأسئلة الشائعة'], ['/pages/shipping', 'الشحن والتوصيل'], ['/pages/returns', 'الاستبدال والاسترجاع']]],
            ['السياسات', [['/pages/privacy', 'سياسة الخصوصية'], ['/pages/terms', 'الشروط والأحكام'], ['/pages/about', 'من نحن'], ['/blogs/journal', 'مجلة سدرة']]],
          ].map(([t, links]) => (
            <div key={t as string} className="md:col-span-2">
              <h3 className="font-display text-sm font-bold text-gold">{t as string}</h3>
              <ul className="mt-4 space-y-3 text-sm">{(links as string[][]).map(([h, l]) => <li key={h}><Link href={h} className="text-blush/80 transition hover:text-pearl">{l}</Link></li>)}</ul>
            </div>))}
          <div className="md:col-span-2">
            <h3 className="font-display text-sm font-bold text-gold">ملفات القالب</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href={`${import.meta.env.BASE_URL}downloads/sidra-shopify-theme.zip`} className="inline-flex items-center gap-2 text-blush/80 hover:text-pearl"><Download className="h-4 w-4" />قالب Shopify</a></li>
              <li><a href={brand('logo.svg')} download className="text-blush/80 hover:text-pearl">الشعار الداكن</a></li>
              <li><a href={brand('logo-header.svg')} download className="text-blush/80 hover:text-pearl">شعار الهيدر</a></li>
              <li><a href={brand('logo-light.svg')} download className="text-blush/80 hover:text-pearl">الشعار الفاتح</a></li>
              <li><a href={brand('logo-mark.svg')} download className="text-blush/80 hover:text-pearl">الرمز المختصر</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blush/15 py-5 text-center text-xs text-blush/60">© سدرة. جميع الحقوق محفوظة.</div>
      </footer>
      <CartDrawer />
      <a href={supportWhatsappUrl()} target="_blank" rel="noreferrer" aria-label="الدعم الفني عبر واتساب" data-testid="button-whatsapp"
        className="fixed bottom-4 left-4 z-40 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.7)] transition hover:scale-105"><MessageCircle className="h-7 w-7" /></a>
      <div className="fixed bottom-3 right-3 z-40 rounded-full border border-line bg-snow/90 px-3 py-1 text-[11px] text-taupe backdrop-blur" data-testid="text-preview-label">منتجات توضيحية</div>
    </div>
  );
}
