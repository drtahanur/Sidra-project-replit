const base = import.meta.env.BASE_URL;

export default function Slide01() {
  return (
    <div className="sidra-slide scene scene-cover relative w-screen h-screen overflow-hidden">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <div className="cover-photo">
        <img src={`${base}images/beauty-cover.png`} crossOrigin="anonymous" alt="منتجات عناية بالبشرة بألوان بنفسجية" />
      </div>
      <div className="cover-copy">
        <h1 className="cover-title">سدرة | تجربة جمال متكاملة</h1>
        <p className="cover-subtitle">عرض شامل لخصائص متجر سدرة الإلكتروني</p>
        <p className="presenter">Taha Mahmoud Metwally Nour El-Dein</p>
      </div>
      <svg className="background-mark absolute bottom-[8vh] right-[7vw] h-[14vh] w-[15vw]" viewBox="0 0 300 150" fill="none" aria-hidden="true">
        <path d="M20 130C85 115 110 56 155 27C130 75 112 106 74 131M155 27C202 25 239 50 272 92C221 86 185 67 155 27Z" stroke="currentColor" strokeWidth="4" />
      </svg>
    </div>
  );
}
