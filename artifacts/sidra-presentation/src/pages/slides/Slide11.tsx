const base = import.meta.env.BASE_URL;

export default function Slide11() {
  return (
    <div className="sidra-slide scene scene-technology relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">الدعم والتقنيات</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/support-technology.jpg`} crossOrigin="anonymous" alt="حاسوب يعرض منتجات العناية وسماعة دعم للتعبير عن تقنيات المتجر وخدمة العملاء" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[6vw] h-[30vh] w-[30vw]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <path d="M40 100H115V57H218M360 300H290V343H183M44 301H98V255H143M357 100H304V145H257" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <circle cx="40" cy="100" r="8" fill="currentColor" /><circle cx="360" cy="300" r="8" fill="currentColor" /><circle cx="44" cy="301" r="8" fill="currentColor" /><circle cx="357" cy="100" r="8" fill="currentColor" />
      </svg>
      <div className="logo-window absolute top-[7vh] left-[6vw]">
        <img src={`${base}replit-logo.png`} crossOrigin="anonymous" alt="شعار Replit المرفق" />
      </div>
      <ul className="story-copy">
        <li>رابط دعم عبر واتساب؛ الرقم الحالي تجريبي</li>
        <li>صفحات للشروط والخصوصية والشحن والاسترجاع</li>
        <li>React وExpress وPostgreSQL وClerk</li>
        <li>المشروع على Replit، مع قالب Shopify أصلي</li>
      </ul>
    </div>
  );
}
