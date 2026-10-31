import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <div className="arch mb-8 h-40 w-28 bg-blush/60" />
      <p className="font-display text-6xl font-extrabold text-rose">٤٠٤</p>
      <h1 className="mt-3 font-display text-2xl font-bold text-wine">لم نجد هذه الصفحة</h1>
      <p className="mt-2 text-taupe">ربما تغيّر الرابط. عودي إلى الرئيسية وتابعي الاكتشاف.</p>
      <Link href="/" className="mt-6 rounded-full bg-berry px-7 py-3.5 text-pearl">العودة إلى الرئيسية</Link>
    </div>
  );
}
