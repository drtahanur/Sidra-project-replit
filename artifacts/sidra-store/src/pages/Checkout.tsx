import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Show } from '@clerk/react';
import { Bitcoin, CreditCard, Lock, MessageCircle, Truck, Wallet } from 'lucide-react';
import {
  type AddressInput, type CheckoutInputProvider, useCreateCheckout, useGetMe, useGetPaymentMethods, useListMyAddresses,
} from '@workspace/api-client-react';
import { SHIPPING_POLICY, shippingFor } from '@workspace/catalog';
import { getProduct, usd } from '@/data/catalog';
import { DELIVERY_TEXT, SUPPORT_WHATSAPP, supportWhatsappUrl } from '@/data/support';
import { basePath } from '@/lib/clerk';
import { useStore } from '@/lib/store';
import { AddressFields, cleanAddress, emptyAddress } from '@/components/sidra/AddressForm';
import { Empty } from '@/pages/Collection';

const providers: { key: CheckoutInputProvider; title: string; note: string; icon: typeof CreditCard }[] = [
  { key: 'stripe', title: 'بطاقة بنكية (Stripe)', note: 'فيزا · ماستركارد وغيرها، بالدولار الأمريكي', icon: CreditCard },
  { key: 'paypal', title: 'PayPal', note: 'ادفعي بحسابكِ في PayPal أو ببطاقتكِ، بالدولار الأمريكي', icon: Wallet },
  { key: 'crypto', title: 'عملات رقمية (Bitcoin)', note: 'بيتكوين وعملات أخرى متاحة، عبر فاتورة مؤقتة آمنة', icon: Bitcoin },
];

function CheckoutForm() {
  const { lines, subtotal } = useStore();
  const { data: me } = useGetMe();
  const { data: saved } = useListMyAddresses();
  const { data: methods } = useGetPaymentMethods();
  const create = useCreateCheckout();
  const [addressId, setAddressId] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<AddressInput>(emptyAddress());
  const [save, setSave] = useState(true);
  const [provider, setProvider] = useState<CheckoutInputProvider | null>(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (me && !draft.fullName) setDraft((d) => ({ ...d, fullName: me.name, phone: me.phone ?? '' })); }, [me]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (saved && addressId === null) setAddressId(saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? 'new'); }, [saved, addressId]);
  useEffect(() => { if (methods && !provider) setProvider(providers.find((p) => methods[p.key])?.key ?? null); }, [methods, provider]);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const anyMethod = methods ? Object.values(methods).some(Boolean) : true;
  const chosenSaved = useMemo(() => (typeof addressId === 'number' ? saved?.find((a) => a.id === addressId) : undefined), [addressId, saved]);

  if (lines.length === 0) return <div className="mx-auto max-w-3xl px-5 py-10"><Empty text="سلّتكِ فارغة" /><Link href="/collections/all" className="mt-6 block text-center text-berry">تابعي التسوق</Link></div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    setError(null);
    const address: AddressInput = chosenSaved
      ? { label: chosenSaved.label, fullName: chosenSaved.fullName, phone: chosenSaved.phone, country: chosenSaved.country, city: chosenSaved.city, line1: chosenSaved.line1, line2: chosenSaved.line2, postalCode: chosenSaved.postalCode }
      : cleanAddress(draft);
    try {
      const res = await create.mutateAsync({ data: {
        provider, lines, address, saveAddress: !chosenSaved && save,
        returnUrl: `${window.location.origin}${basePath}/checkout/result`,
      } });
      window.location.assign(res.redirectUrl);
    } catch (err) {
      const data = (err as { data?: { error?: string; code?: string } }).data;
      setError(data?.code === 'provider_not_configured'
        ? 'طريقة الدفع هذه غير مفعّلة بعد في المتجر. اختاري وسيلة أخرى أو تواصلي مع الدعم.'
        : data?.error ?? 'تعذّر إتمام الطلب. حاولي مرة أخرى.');
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl px-5 md:px-8">
      <h1 className="my-10 font-display text-[30px] font-extrabold text-wine md:text-5xl">إتمام الطلب</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-10">
          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-wine">١. عنوان التوصيل</h2>
            {saved && saved.length > 0 && (
              <div className="mb-4 grid gap-3">
                {saved.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-sm leading-7 ${addressId === a.id ? 'border-berry bg-blush/30' : 'border-line bg-snow'}`}>
                    <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-2 accent-[#853F54]" />
                    <span><b className="text-wine">{a.label}</b> — {a.fullName} · <span className="num">{a.phone}</span><br /><span className="text-taupe">{a.line1}، {a.city}، {a.country}</span></span>
                  </label>))}
                <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-sm ${addressId === 'new' ? 'border-berry bg-blush/30' : 'border-line bg-snow'}`}>
                  <input type="radio" name="address" checked={addressId === 'new'} onChange={() => setAddressId('new')} className="accent-[#853F54]" />عنوان جديد</label>
              </div>)}
            {!chosenSaved && (
              <div className="rounded-[24px] border border-line bg-snow p-6">
                <AddressFields value={draft} onChange={setDraft} />
                <label className="mt-5 flex items-center gap-3 text-sm text-wine"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-4 w-4 accent-[#853F54]" />احفظي هذا العنوان في حسابي</label>
              </div>)}
            <p className="mt-4 flex items-start gap-3 rounded-2xl bg-blush/40 p-4 text-sm leading-7 text-wine"><Truck className="mt-1 h-4 w-4 shrink-0" />مدة التوصيل: {DELIVERY_TEXT}. الشحن مجاني للطلبات من ${SHIPPING_POLICY.freeOver}.</p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-bold text-wine">٢. طريقة الدفع</h2>
            <div className="grid gap-3" role="radiogroup" aria-label="طريقة الدفع">
              {providers.map(({ key, title, note, icon: Icon }) => { const on = !!methods?.[key]; return (
                <label key={key} data-testid={`pay-${key}`} className={`flex items-start gap-4 rounded-2xl border p-4 transition ${!on ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'} ${provider === key ? 'border-berry bg-blush/30' : 'border-line bg-snow'}`}>
                  <input type="radio" name="provider" disabled={!on} checked={provider === key} onChange={() => setProvider(key)} className="mt-2 accent-[#853F54]" />
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-berry" strokeWidth={1.6} />
                  <span className="flex-1"><b className="text-wine">{title}</b>{!on && <span className="mr-2 rounded-full bg-line px-2.5 py-0.5 text-[11px] text-taupe">غير مفعّلة بعد</span>}<br /><span className="text-sm text-taupe">{note}</span></span>
                </label>); })}
            </div>
            {methods && !anyMethod && (
              <p role="alert" className="mt-4 rounded-2xl bg-[#F3D9DE] p-4 text-sm leading-7 text-[#7A1F33]">لم تُفعَّل أي طريقة دفع في المتجر بعد، لذلك لا يمكن إتمام الطلب الآن. تواصلي مع الدعم الفني على <a className="underline" href={supportWhatsappUrl()} target="_blank" rel="noreferrer">واتساب</a>.</p>)}
          </section>
        </div>

        <aside className="h-fit rounded-[24px] bg-snow p-7 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold text-wine">ملخص الطلب</h2>
          <ul className="mt-4 divide-y divide-line text-sm">
            {lines.map((l, i) => { const p = getProduct(l.handle); const v = p?.variants.find((x) => x.id === l.variantId); if (!p || !v) return null; return (
              <li key={i} className="flex gap-3 py-3"><img src={p.image} alt="" className="h-16 w-14 rounded-xl object-cover" />
                <div className="flex-1"><p className="font-medium text-ink">{p.title}</p><p className="text-xs text-taupe">{v.title} × <span className="num">{l.qty}</span></p></div>
                <span className="text-wine">{usd(v.price * l.qty)}</span></li>); })}
          </ul>
          <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-taupe"><dt>المجموع الفرعي</dt><dd>{usd(subtotal)}</dd></div>
            <div className="flex justify-between text-taupe"><dt>الشحن</dt><dd data-testid="text-shipping">{shipping ? usd(shipping) : 'مجاني'}</dd></div>
            <div className="flex justify-between font-display text-xl text-wine"><dt>الإجمالي</dt><dd data-testid="text-total">{usd(total)}</dd></div>
          </dl>
          <label className="mt-5 flex items-start gap-3 text-sm leading-7 text-wine"><input required type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} data-testid="checkbox-terms" className="mt-2 h-4 w-4 accent-[#853F54]" />
            <span>أوافق على <Link href="/pages/terms" className="text-berry underline-offset-4 hover:underline">الشروط والأحكام</Link> و<Link href="/pages/returns" className="text-berry underline-offset-4 hover:underline">سياسة الاستبدال والاسترجاع</Link>.</span></label>
          {error && <p role="alert" data-testid="text-checkout-error" className="mt-4 rounded-2xl bg-[#F3D9DE] p-4 text-sm leading-7 text-[#7A1F33]">{error}</p>}
          <button disabled={!provider || create.isPending || !agree} data-testid="button-pay" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-berry py-4 text-pearl transition hover:bg-wine disabled:cursor-not-allowed disabled:opacity-50">
            <Lock className="h-4 w-4" />{create.isPending ? 'جارٍ تحويلكِ للدفع…' : `ادفعي ${usd(total)}`}</button>
          <p className="mt-3 text-center text-xs leading-6 text-taupe">يتم الدفع على صفحة المزوّد الآمنة؛ لا نخزّن بيانات بطاقتكِ.</p>
          <a href={supportWhatsappUrl()} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm text-taupe hover:text-berry"><MessageCircle className="h-4 w-4" />الدعم الفني: <span className="num">{SUPPORT_WHATSAPP.display}</span></a>
        </aside>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Show when="signed-in"><CheckoutForm /></Show>
      <Show when="signed-out">
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold text-wine">سجّلي الدخول لإتمام الطلب</h1>
          <p className="mt-3 leading-8 text-taupe">تُحفظ طلباتكِ وعناوينكِ في حسابكِ لتتابعيها في أي وقت. سلّتكِ الحالية ستبقى كما هي.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/sign-in?redirect_url=${encodeURIComponent(`${window.location.origin}${basePath}/checkout`)}`} data-testid="link-checkout-sign-in" className="rounded-full bg-berry px-8 py-3.5 text-pearl hover:bg-wine">تسجيل الدخول</Link>
            <Link href={`/sign-up?redirect_url=${encodeURIComponent(`${window.location.origin}${basePath}/checkout`)}`} className="rounded-full border border-line bg-snow px-8 py-3.5 text-wine hover:bg-blush/50">إنشاء حساب</Link>
          </div>
        </div>
      </Show>
    </>
  );
}
