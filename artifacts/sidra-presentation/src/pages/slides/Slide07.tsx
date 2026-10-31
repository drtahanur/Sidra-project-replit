export default function Slide07() {
  return (
    <div className="sidra-slide scene scene-security relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">الملف الشخصي وأمان الحساب</h1>
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/account-security.jpg`} crossOrigin="anonymous" alt="قفل ومفتاح ودرع زجاجي للتعبير عن حماية الحساب والبيانات" />
      </div>
      <svg className="background-mark absolute bottom-[5vh] left-[6vw] h-[36vh] w-[30vw]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <path d="M200 42L311 86V177C311 254 267 315 200 353C133 315 89 254 89 177V86L200 42Z" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
          <rect x="145" y="169" width="110" height="91" rx="15" stroke="currentColor" strokeWidth="9" />
          <path d="M166 169V146C166 101 234 101 234 146V169M200 205V225" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      </svg>
      <ul className="story-copy copy-index">
        <li>تعديل الاسم والصورة ورقم الجوال</li>
        <li>تغيير البريد بعد تأكيد كلمة المرور ورمز البريد الجديد</li>
        <li>إلغاء ربط Google بعد التحقق من كلمة المرور</li>
        <li>إضافة كلمة مرور أو تغييرها من إعدادات الحساب</li>
      </ul>
    </div>
  );
}
