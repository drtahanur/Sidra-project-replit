import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@clerk/react';
import { getMyCart, getMyWishlist, saveMyCart, saveMyWishlist } from '@workspace/api-client-react';
import { getProduct } from '@/data/catalog';
import { toast } from '@/hooks/use-toast';

export type Line = { handle: string; variantId: string; qty: number };
type Ctx = {
  lines: Line[]; wishlist: string[]; drawerOpen: boolean; setDrawer: (o: boolean) => void;
  add: (handle: string, variantId: string, qty?: number) => void; setQty: (i: number, q: number) => void; remove: (i: number) => void;
  clearCart: () => void; toggleWish: (h: string) => void; count: number; subtotal: number;
};
const C = createContext<Ctx | null>(null);
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return d; } };

function mergeLines(a: Line[], b: Line[]): Line[] {
  const out = new Map<string, Line>();
  for (const l of [...a, ...b]) {
    const k = `${l.handle}::${l.variantId}`;
    const prev = out.get(k);
    out.set(k, { ...l, qty: Math.min(10, Math.max(prev?.qty ?? 0, l.qty)) });
  }
  return [...out.values()];
}

/**
 * السلة والمفضلة: للزائر في المتصفح فقط. عند تسجيل الدخول تُدمج مع بيانات الحساب المحفوظة في قاعدة البيانات
 * وتُحفظ كل تغييرات لاحقة في الحساب. عند الخروج يُفرَّغ المتصفح حتى لا تظهر بيانات حساب لشخص آخر.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [lines, setLines] = useState<Line[]>(() => load('sidra-cart', []));
  const [wishlist, setWish] = useState<string[]>(() => load('sidra-wish', []));
  const [drawerOpen, setDrawer] = useState(false);
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const hadUser = useRef(false);

  useEffect(() => localStorage.setItem('sidra-cart', JSON.stringify(lines)), [lines]);
  useEffect(() => localStorage.setItem('sidra-wish', JSON.stringify(wishlist)), [wishlist]);

  // تسجيل الدخول: دمج مع الحساب. تسجيل الخروج: تفريغ.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      if (hadUser.current) { setLines([]); setWish([]); }
      hadUser.current = false;
      setSyncedFor(null);
      return;
    }
    hadUser.current = true;
    if (syncedFor === userId) return;
    let cancelled = false;
    (async () => {
      try {
        const [cart, wish] = await Promise.all([getMyCart(), getMyWishlist()]);
        if (cancelled) return;
        setLines((cur) => mergeLines(cart.lines, cur));
        setWish((cur) => [...new Set([...wish.handles, ...cur])]);
        setSyncedFor(userId);
      } catch {
        if (!cancelled) toast({ variant: 'destructive', title: 'تعذّر تحميل سلّتكِ ومفضلتكِ من الحساب', description: 'سنحاول مجددًا عند إعادة تحميل الصفحة.' });
      }
    })();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, userId, syncedFor]);

  // حفظ التغييرات في الحساب بعد اكتمال الدمج الأول.
  useEffect(() => {
    if (!userId || syncedFor !== userId) return;
    const t = setTimeout(() => {
      saveMyCart({ lines }).catch(() => toast({ variant: 'destructive', title: 'تعذّر حفظ السلة في حسابكِ' }));
    }, 400);
    return () => clearTimeout(t);
  }, [lines, userId, syncedFor]);
  useEffect(() => {
    if (!userId || syncedFor !== userId) return;
    const t = setTimeout(() => {
      saveMyWishlist({ handles: wishlist }).catch(() => toast({ variant: 'destructive', title: 'تعذّر حفظ المفضلة في حسابكِ' }));
    }, 400);
    return () => clearTimeout(t);
  }, [wishlist, userId, syncedFor]);

  const add = (handle: string, variantId: string, qty = 1) => {
    setLines((ls) => { const i = ls.findIndex((l) => l.handle === handle && l.variantId === variantId);
      if (i > -1) return ls.map((l, j) => (j === i ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
      return [...ls, { handle, variantId, qty }]; });
    setDrawer(true);
  };
  const setQty = (i: number, q: number) => setLines((ls) => (q < 1 ? ls.filter((_, j) => j !== i) : ls.map((l, j) => (j === i ? { ...l, qty: Math.min(10, q) } : l))));
  const remove = (i: number) => setLines((ls) => ls.filter((_, j) => j !== i));
  const clearCart = () => setLines([]);
  const toggleWish = (h: string) => setWish((w) => (w.includes(h) ? w.filter((x) => x !== h) : [...w, h]));
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = lines.reduce((a, l) => a + (getProduct(l.handle)?.variants.find((v) => v.id === l.variantId)?.price ?? 0) * l.qty, 0);
  return <C.Provider value={{ lines, wishlist, drawerOpen, setDrawer, add, setQty, remove, clearCart, toggleWish, count, subtotal }}>{children}</C.Provider>;
}
export const useStore = () => { const c = useContext(C); if (!c) throw new Error('store'); return c; };
