import { useEffect, useRef } from 'react';
import { Link, useSearch } from 'wouter';
import { Show } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getGetMyOrderQueryKey, useCapturePaypalOrder, useGetMyOrder } from '@workspace/api-client-react';
import { usd } from '@/data/catalog';
import { SUPPORT_WHATSAPP, supportWhatsappUrl } from '@/data/support';
import { providerLabel } from '@/lib/format';
import { useStore } from '@/lib/store';

function Result() {
  const params = new URLSearchParams(useSearch());
  const orderId = Number(params.get('order'));
  const provider = params.get('provider');
  const cancelled = params.get('cancelled') === '1';
  const qc = useQueryClient();
  const { clearCart } = useStore();
  const capture = useCapturePaypalOrder();
  const captured = useRef(false);
  const valid = Number.isInteger(orderId) && orderId > 0;
  const { data: order, isError, error } = useGetMyOrder(orderId, {
    query: { enabled: valid, queryKey: getGetMyOrderQueryKey(orderId), refetchInterval: (q) => (q.state.data?.status === 'pending' && !cancelled ? 5000 : false) },
  });

  // PayPal: بعد عودة العميل نلتقط المبلغ على الخادم ثم نقرأ حالة الطلب.
  useEffect(() => {
    if (!valid || provider !== 'paypal' || cancelled || captured.current) return;
    captured.current = true;
    capture.mutate({ data: { orderId } }, { onSuccess: (o) => qc.setQueryData(getGetMyOrderQueryKey(orderId), o) });
  }, [valid, provider, cancelled, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = order?.status;
  useEffect(() => { if (status === 'paid') clearCart(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  let icon = <Clock className="h-9 w-9 text-berry" strokeWidth={1.4} />;
  let title = 'جارٍ التحقق من الدفع…';
  let body = 'لحظات ونؤكد حالة طلبكِ لدى مزوّد الدفع.';
  if (!valid) { icon = <XCircle className="h-9 w-9 text-berry" strokeWidth={1.4} />; title = 'رابط غير صالح'; body = 'لم نجد الطلب المطلوب.'; }
  else if (isError) { icon = <XCircle className="h-9 w-9 text-berry" strokeWidth={1.4} />; title = 'تعذّر تحميل الطلب'; body = (error as { data?: { error?: string } })?.data?.error ?? 'حاولي تحديث الصفحة، أو افتحي «حسابي ← الطلبات».'; }
  else if (capture.isError) { icon = <XCircle className="h-9 w-9 text-berry" strokeWidth={1.4} />; title = 'تعذّر تأكيد الدفع عبر PayPal'; body = 'لم نستلم تأكيدًا من PayPal. لم يُخصم شيء من خلالنا؛ إن ظهر خصم في حسابكِ فتواصلي مع الدعم.'; }
  else if (status === 'paid') { icon = <CheckCircle2 className="h-9 w-9 text-[#24533C]" strokeWidth={1.4} />; title = 'تم الدفع بنجاح'; body = 'شكرًا لكِ! استلمنا طلبكِ وسنجهّزه للشحن. تصلكِ الطلبات خلال ٢ إلى ٧ أيام عمل.'; }
  else if (cancelled || status === 'cancelled') { icon = <XCircle className="h-9 w-9 text-berry" strokeWidth={1.4} />; title = 'لم تكتمل عملية الدفع'; body = 'أُلغيت عملية الدفع ولم يُخصم أي مبلغ. سلّتكِ ما زالت محفوظة ويمكنكِ المحاولة مجددًا.'; }
  else if (status === 'failed' || status === 'expired') { icon = <XCircle className="h-9 w-9 text-berry" strokeWidth={1.4} />; title = status === 'expired' ? 'انتهت مهلة الدفع' : 'فشلت عملية الدفع'; body = 'لم يكتمل الدفع لهذا الطلب. سلّتكِ ما زالت محفوظة ويمكنكِ المحاولة مجددًا.'; }
  else if (status === 'pending') { title = 'بانتظار تأكيد الدفع'; body = provider === 'crypto' ? 'عمليات العملات الرقمية تحتاج إلى تأكيدات من الشبكة وقد تستغرق بعض الوقت. نحدّث الحالة تلقائيًا، ويمكنكِ إغلاق الصفحة ومتابعة الطلب من حسابكِ.' : 'نحدّث الحالة تلقائيًا فور وصول تأكيد المزوّد.'; }

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center" data-testid="checkout-result">
      <div className="arch mx-auto mb-8 grid h-36 w-28 place-items-center bg-blush/60">{icon}</div>
      <h1 className="font-display text-3xl font-extrabold text-wine" data-testid="text-result-title">{title}</h1>
      <p className="mt-3 leading-8 text-taupe">{body}</p>
      {order && (
        <div className="mt-8 rounded-[24px] bg-snow p-6 text-sm leading-8 text-wine">
          <p>رقم الطلب: <b className="num">#{order.id}</b> · {providerLabel[order.paymentProvider]}</p>
          <p>الإجمالي: <b>{usd(order.total)}</b></p>
        </div>)}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/account" className="rounded-full bg-berry px-8 py-3.5 text-pearl hover:bg-wine">طلباتي</Link>
        <Link href={status === 'paid' ? '/collections/all' : '/cart'} className="rounded-full border border-line bg-snow px-8 py-3.5 text-wine hover:bg-blush/50">{status === 'paid' ? 'متابعة التسوق' : 'العودة إلى السلة'}</Link>
      </div>
      <p className="mt-8 text-sm text-taupe">مشكلة في الدفع؟ <a className="text-berry hover:underline" href={supportWhatsappUrl(`مرحبًا، أحتاج مساعدة بخصوص الطلب رقم ${orderId}`)} target="_blank" rel="noreferrer">راسلي الدعم</a> <span className="num">{SUPPORT_WHATSAPP.display}</span></p>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <>
      <Show when="signed-in"><Result /></Show>
      <Show when="signed-out"><div className="py-24 text-center"><Link href="/sign-in" className="rounded-full bg-berry px-8 py-3.5 text-pearl">سجّلي الدخول لعرض طلبكِ</Link></div></Show>
    </>
  );
}
