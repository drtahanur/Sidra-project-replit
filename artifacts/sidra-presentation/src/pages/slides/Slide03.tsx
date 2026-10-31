const base = import.meta.env.BASE_URL;

export default function Slide03() {
  return (
    <div className="sidra-slide scene scene-discovery relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">اكتشاف المنتجات بسهولة</h1>
      <div className="story-photo">
        <img className="photo" src={`${base}images/beauty-shopping.png`} crossOrigin="anonymous" alt="اكتشاف منتجات التجميل على الهاتف" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] right-[7vw] h-[13vh] w-[16vw]" viewBox="0 0 260 120" fill="none" aria-hidden="true">
        <circle cx="45" cy="49" r="28" stroke="currentColor" strokeWidth="5" /><path d="M66 70L91 95M118 34H239M118 58H213M118 82H232" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <ul className="story-copy copy-index">
        <li>تصفح المجموعات والمنتجات الجديدة والأكثر طلبًا</li>
        <li>البحث عن المنتجات بالاسم</li>
        <li>التصفية حسب الماركة والنوع والسعر والتوفر</li>
        <li>ترتيب النتائج للوصول إلى الاختيار المناسب</li>
      </ul>
    </div>
  );
}
