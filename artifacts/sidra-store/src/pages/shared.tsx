import { useState } from 'react';
import { Check } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'ok'>('idle');
  return (
    <section className="mx-auto mt-28 max-w-4xl px-5 text-center md:px-8">
      <svg viewBox="0 0 60 40" className="mx-auto h-10 w-16" aria-hidden><path d="M30 38C14 30 12 14 22 2c10 12 14 26 8 36z" fill="#E5D0CB" /><path d="M32 38c6-12 14-18 26-20-4 12-14 18-26 20z" fill="#B99A65" /></svg>
      <h2 className="mt-4 font-display text-3xl font-bold text-wine md:text-4xl">لمسة جمال تصلكِ من سدرة</h2>
      <p className="mt-3 text-taupe">تابعي أحدث المنتجات ونصائح الجمال والعروض المميزة.</p>
      <form noValidate onSubmit={(e) => { e.preventDefault(); setState(/^\S+@\S+\.\S+$/.test(email) ? 'ok' : 'error'); }} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <label htmlFor="nl" className="sr-only">البريد الإلكتروني</label>
        <input id="nl" data-testid="input-newsletter" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState('idle'); }} placeholder="بريدكِ الإلكتروني" className="flex-1 rounded-full border border-line bg-snow px-6 py-3.5 text-right outline-none focus:border-rose" />
        <button data-testid="button-subscribe" className="rounded-full bg-berry px-8 py-3.5 text-pearl transition hover:bg-wine active:scale-95">اشتراك</button>
      </form>
      <p className="mt-3 min-h-5 text-sm" role="status">
        {state === 'error' && <span className="text-berry">يرجى إدخال بريد إلكتروني صحيح.</span>}
        {state === 'ok' && <span className="inline-flex items-center gap-1 text-wine"><Check className="h-4 w-4" />تم التحقق — في المعاينة لا يُحفظ الاشتراك، ويعمل فعليًا عبر نموذج Shopify.</span>}
      </p>
      <p className="text-xs text-taupe">بالاشتراك توافقين على تلقي رسائل تسويقية، ويمكنكِ إلغاء الاشتراك في أي وقت.</p>
    </section>
  );
}
