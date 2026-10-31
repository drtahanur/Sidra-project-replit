export default function Slide09() {
  return (
    <div className="sidra-slide scene scene-shipping relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">إتمام الطلب والشحن</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/beauty-shipping.jpg`} crossOrigin="anonymous" alt="صندوق شحن يحمي منتجات العناية بتغليف منظم" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[6vw] h-[35vh] w-[30vw]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <path d="M55 112H236V260H55V112ZM236 163H296L342 213V260H236V163Z" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
          <circle cx="115" cy="267" r="28" fill="#e5d3f3" stroke="currentColor" strokeWidth="9" />
          <circle cx="286" cy="267" r="28" fill="#e5d3f3" stroke="currentColor" strokeWidth="9" />
          <path d="M265 163V213H335M50 316H343" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray="10 15" />
      </svg>
      <ul className="story-copy copy-pairs">
        <li>تسجيل الدخول مطلوب لإتمام الطلب</li>
        <li>مراجعة المنتجات والمجموع والموافقة على الشروط</li>
        <li>الشحن ٧ دولارات، ومجاني للطلبات من ٨٠ دولارًا</li>
        <li>مدة التوصيل المعروضة من ٢ إلى ٧ أيام عمل</li>
      </ul>
    </div>
  );
}
