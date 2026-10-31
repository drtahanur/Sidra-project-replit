export default function Slide10() {
  return (
    <div className="sidra-slide scene scene-payments relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">خيارات الدفع</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/secure-payments.jpg`} crossOrigin="anonymous" alt="تصور بصري لبطاقة دفع وهاتف لتوضيح خيارات الدفع الإلكتروني" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[6vw] h-[28vh] w-[30vw]" viewBox="0 0 400 220" fill="none" aria-hidden="true">
          <rect x="25" y="27" width="340" height="180" rx="24" stroke="currentColor" strokeWidth="8" />
          <path d="M25 87H365M66 158H156M66 181H121" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <ul className="story-copy">
        <li>بطاقات الدفع عبر Stripe</li>
        <li>PayPal</li>
        <li>العملات الرقمية عبر BTCPay Server</li>
        <li>تظهر الوسيلة متاحة بعد تفعيل إعداداتها</li>
      </ul>
    </div>
  );
}
