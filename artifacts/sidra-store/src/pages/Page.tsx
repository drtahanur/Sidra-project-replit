import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useParams, Link } from 'wouter';
import { img, products } from '@/data/catalog';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/sidra/ProductCard';
import { Empty } from '@/pages/Collection';
import { policies } from '@/data/policies';
import { DELIVERY_TEXT, SUPPORT_WHATSAPP, supportWhatsappUrl } from '@/data/support';

const pages: Record<string, { title: string; body: string[] }> = {
  about: { title: 'قصتنا', body: ['السدرة شجرة راسخة في ذاكرة الجزيرة العربية؛ ظلٌّ وارف وأوراق صغيرة لا تتكلّف. من هذا المعنى وُلدت سدرة: متجر يختار بهدوء، ويشرح بوضوح.', 'نؤمن بأن الجمال تفاصيل يومية صغيرة، وأن ثقتكِ تبدأ من معلومة صحيحة عن المنتج قبل شرائه.'] },
  faq: { title: 'الأسئلة الشائعة', body: ['كيف أتابع طلبي؟ من «حسابي ← الطلبات» تجدين حالة كل طلب بعد تسجيل الدخول.', 'ما طرق الدفع المتاحة؟ البطاقات عبر Stripe، وPayPal، والعملات الرقمية (Bitcoin).', 'كم تستغرق مدة التوصيل؟ ' + DELIVERY_TEXT + '.', 'كيف أختار المنتج المناسب؟ راجعي تفاصيل المكونات وطريقة الاستخدام، أو تواصلي معنا.'] },
};

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-10 grid gap-4">
      {[['name', 'الاسم', 'text'], ['email', 'البريد الإلكتروني', 'email'], ['phone', 'رقم الجوال', 'tel']].map(([n, l, t]) => (
        <label key={n} className="grid gap-2 text-sm text-wine">{l}<input required={n !== 'phone'} name={n} type={t} className="rounded-2xl border border-line bg-snow px-5 py-3.5 outline-none focus:border-rose" /></label>))}
      <label className="grid gap-2 text-sm text-wine">رسالتكِ<textarea required rows={5} className="rounded-2xl border border-line bg-snow px-5 py-3.5 outline-none focus:border-rose" /></label>
      <button className="rounded-full bg-berry py-4 text-pearl hover:bg-wine" data-testid="button-contact">إرسال</button>
      {sent && <p role="status" className="text-sm text-wine">لا يتوفر إرسال النموذج بالبريد حاليًا. للدعم الفوري راسلينا على واتساب.</p>}
    </form>);
}

export default function StaticPage() {
  const { handle } = useParams<{ handle: string }>();
  const { wishlist } = useStore();
  if (handle === 'wishlist') {
    const list = products.filter((p) => wishlist.includes(p.handle));
    return (<div className="mx-auto max-w-7xl px-5 md:px-8"><h1 className="my-10 font-display text-[30px] font-extrabold text-wine md:text-5xl">المفضلة</h1>
      {list.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{list.map((p, i) => <ProductCard key={p.handle} p={p} i={i} />)}</div> : <Empty text="لم تضيفي منتجات إلى المفضلة بعد" />}</div>);
  }
  const policy = policies[handle];
  if (policy) {
    return (
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 py-12 lg:grid-cols-[1fr_260px]">
          <article data-testid={`policy-${handle}`}>
            <nav className="mb-4 text-xs text-taupe"><Link href="/">الرئيسية</Link> / {policy.title}</nav>
            <h1 className="font-display text-[30px] font-extrabold text-wine md:text-5xl">{policy.title}</h1>
            {policy.updated && <p className="mt-3 text-sm text-taupe">آخر تحديث: {policy.updated}</p>}
            {policy.intro && <p className="mt-8 text-[17px] leading-9 text-ink/85">{policy.intro}</p>}
            <div className="mt-10 space-y-10">
              {policy.sections.map((sec, i) => (
                <section key={sec.h} id={`s${i + 1}`} className="scroll-mt-28">
                  <h2 className="font-display text-xl font-bold text-wine md:text-2xl">{sec.h}</h2>
                  <div className="mt-3 space-y-4 text-[16px] leading-9 text-ink/85">{sec.p.map((t) => <p key={t}>{t}</p>)}</div>
                </section>))}
            </div>
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[24px] bg-snow p-6 text-sm">
              <p className="mb-3 font-display font-bold text-wine">محتويات الصفحة</p>
              <ul className="space-y-2">{policy.sections.map((sec, i) => <li key={sec.h}><a href={`#s${i + 1}`} className="text-taupe transition hover:text-berry">{sec.h}</a></li>)}</ul>
            </div>
          </aside>
        </div>
      </div>);
  }
  const pg = handle === 'contact' ? { title: 'تواصل معنا', body: ['يسعدنا سماعكِ. اكتبي سؤالكِ وسيعود إليكِ فريق خدمة العملاء.'] } : pages[handle] ?? { title: 'الصفحة غير موجودة', body: ['لم نجد هذه الصفحة.'] };
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="grid gap-12 py-12 md:grid-cols-[1fr_320px]">
        <article>
          <nav className="mb-4 text-xs text-taupe"><Link href="/">الرئيسية</Link> / {pg.title}</nav>
          <h1 className="font-display text-[30px] font-extrabold text-wine md:text-5xl">{pg.title}</h1>
          <div className="mt-8 space-y-5 text-[17px] leading-9 text-ink/85">{pg.body.map((b) => <p key={b}>{b}</p>)}</div>
          {handle === 'contact' && (
            <a href={supportWhatsappUrl()} target="_blank" rel="noreferrer" data-testid="link-support-whatsapp" className="mt-8 flex items-center gap-4 rounded-[24px] bg-snow p-5 transition hover:bg-blush/40">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-6 w-6" /></span>
              <span><b className="block font-display text-wine">الدعم الفني عبر واتساب</b><span className="num text-taupe">{SUPPORT_WHATSAPP.display}</span></span>
            </a>)}
          {handle === 'contact' && <Contact />}
        </article>
        <div className="arch hidden overflow-hidden md:block"><img src={img(handle === 'about' ? 'editorial-portrait.jpg' : 'editorial-texture.jpg')} alt="" className="h-full w-full object-cover" /></div>
      </div>
    </div>
  );
}
