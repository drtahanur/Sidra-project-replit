export default function Slide05() {
  return (
    <div className="sidra-slide scene scene-favorites relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">السلة والمفضلة</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/cart-favorites.jpg`} crossOrigin="anonymous" alt="تصور بصري لحقيبة تسوق بمنتجات تجميل وقلب يرمز للمفضلة" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[7vw] h-[32vh] w-[28vw]" viewBox="0 0 400 280" fill="none" aria-hidden="true">
        <path d="M45 91H178L163 237H61L45 91Z M82 93V70C82 27 143 27 143 70V93" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
        <path d="M240 106C217 74 170 91 172 128C174 165 222 193 264 222C304 193 354 164 355 128C356 91 309 74 287 106L264 130L240 106Z" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      </svg>
      <ul className="story-copy copy-pairs">
        <li>حفظ المنتجات المفضلة للرجوع إليها</li>
        <li>تعديل كميات المنتجات داخل السلة</li>
        <li>عرض المجموع وتكلفة الشحن قبل الدفع</li>
        <li>ربط السلة والمفضلة بالحساب عند تسجيل الدخول</li>
      </ul>
    </div>
  );
}
