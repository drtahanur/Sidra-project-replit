export default function Slide06() {
  return (
    <div className="sidra-slide scene scene-account relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">إنشاء الحساب وتسجيل الدخول</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/account-access.jpg`} crossOrigin="anonymous" alt="تصور بصري لحساب المستخدم والبريد والدول باستخدام هاتف ومظروف ومجسم كرة أرضية" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[6vw] h-[34vh] w-[30vw]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <circle cx="175" cy="126" r="58" stroke="currentColor" strokeWidth="9" />
          <path d="M68 307C68 241 115 210 175 210C235 210 282 241 282 307" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <circle cx="287" cy="280" r="66" fill="#f0e4f8" stroke="currentColor" strokeWidth="8" />
          <path d="M287 231V329M239 280H335M252 249C277 261 297 261 322 249M252 311C277 299 297 299 322 311M287 231C262 255 262 305 287 329M287 231C312 255 312 305 287 329" stroke="currentColor" strokeWidth="6" />
      </svg>
      <ul className="story-copy">
        <li>التسجيل بالبريد الإلكتروني أو Google</li>
        <li>اختيار النوع عند إنشاء الحساب</li>
        <li>اختيار الدولة اختياريًا من قائمة بالأعلام والبحث</li>
        <li>إدخال رقم جوال مع علم الدولة ورمز الاتصال</li>
      </ul>
    </div>
  );
}
