export default function Slide08() {
  return (
    <div className="sidra-slide scene scene-address relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">العناوين ومتابعة الطلبات</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/delivery-address.jpg`} crossOrigin="anonymous" alt="تصور بصري لخريطة عنوان التوصيل على الهاتف مع طرد منتجات العناية" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[6vw] h-[34vh] w-[30vw]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <path d="M204 343C204 343 105 240 105 157C105 102 149 58 204 58C259 58 303 102 303 157C303 240 204 343 204 343Z" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
          <circle cx="204" cy="153" r="38" stroke="currentColor" strokeWidth="9" />
          <path d="M70 327C97 309 129 298 163 292M338 327C311 309 279 298 245 292" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <ul className="story-copy">
        <li>إضافة عناوين التوصيل وحفظها في الحساب</li>
        <li>اختيار عنوان محفوظ أو إدخال عنوان جديد</li>
        <li>عرض الطلبات وحالاتها وتفاصيلها</li>
        <li>الاحتفاظ ببيانات الاتصال والعنوان لتسهيل الشراء</li>
      </ul>
    </div>
  );
}
