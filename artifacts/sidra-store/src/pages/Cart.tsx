import { Link } from 'wouter';
import { Minus, Plus, Trash2, Truck, Lock } from 'lucide-react';
import { SHIPPING_POLICY, shippingFor } from '@workspace/catalog';
import { getProduct, usd } from '@/data/catalog';
import { DELIVERY_TEXT } from '@/data/support';
import { useStore } from '@/lib/store';
import { Empty } from '@/pages/Collection';

export default function CartPage() {
  const { lines, setQty, remove, subtotal } = useStore();
  const shipping = shippingFor(subtotal);
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <h1 className="my-10 font-display text-[30px] font-extrabold text-wine md:text-5xl">سلّة التسوق</h1>
      {lines.length === 0 ? <Empty text="سلّتكِ فارغة" /> : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((l, i) => { const p = getProduct(l.handle); const v = p?.variants.find((x) => x.id === l.variantId); if (!p || !v) return null; return (
              <li key={i} className="flex gap-5 py-6">
                <Link href={`/products/${p.handle}`}><img src={p.image} alt={p.title} className="h-32 w-28 rounded-2xl object-cover" /></Link>
                <div className="flex flex-1 flex-col">
                  <p className="text-xs text-taupe">{p.vendor}</p>
                  <Link href={`/products/${p.handle}`} className="font-display text-lg font-bold text-wine">{p.title}</Link>
                  <p className="text-sm text-taupe">{v.title} · {usd(v.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line bg-snow">
                      <button onClick={() => setQty(i, l.qty + 1)} className="p-2.5" aria-label="زيادة"><Plus className="h-4 w-4" /></button>
                      <span className="num w-7 text-center">{l.qty}</span>
                      <button onClick={() => setQty(i, l.qty - 1)} className="p-2.5" aria-label="إنقاص"><Minus className="h-4 w-4" /></button>
                    </div>
                    <div className="flex items-center gap-4"><span className="font-medium text-wine">{usd(v.price * l.qty)}</span>
                      <button onClick={() => remove(i)} className="text-taupe hover:text-berry" aria-label="حذف" data-testid={`button-remove-${i}`}><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                </div>
              </li>); })}
          </ul>
          <aside className="h-fit rounded-[24px] bg-snow p-7 lg:sticky lg:top-24">
            <div className="flex justify-between text-wine"><span>المجموع الفرعي</span><span data-testid="text-subtotal">{usd(subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-taupe"><span>الشحن</span><span>{shipping ? usd(shipping) : 'مجاني'}</span></div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-xl text-wine"><span>الإجمالي</span><span data-testid="text-cart-total">{usd(subtotal + shipping)}</span></div>
            <p className="mt-4 flex gap-2 text-sm leading-7 text-taupe"><Truck className="mt-1 h-4 w-4 shrink-0" />التوصيل {DELIVERY_TEXT}. الشحن مجاني من ${SHIPPING_POLICY.freeOver}.</p>
            <Link href="/checkout" data-testid="button-checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-berry py-4 text-pearl transition hover:bg-wine"><Lock className="h-4 w-4" />إتمام الطلب والدفع</Link>
            <p className="mt-3 text-center text-xs leading-6 text-taupe">ادفعي بأمان عبر Stripe أو PayPal أو العملات الرقمية.</p>
            <Link href="/collections/all" className="mt-4 block text-center text-sm text-taupe hover:text-berry">متابعة التسوق</Link>
          </aside>
        </div>)}
    </div>
  );
}
