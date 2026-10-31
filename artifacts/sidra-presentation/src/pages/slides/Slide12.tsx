export default function Slide12() {
  return (
    <div className="sidra-slide scene scene-closing relative w-screen h-screen overflow-hidden">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <div className="story-photo">
        <img src={`${import.meta.env.BASE_URL}images/beauty-thank-you.jpg`} crossOrigin="anonymous" alt="هدية عناية بالجمال بشريط بنفسجي وزهور للخاتمة" />
      </div>
      <svg className="background-mark absolute bottom-[7vh] left-[5vw] h-[68vh] w-[39vw]" viewBox="0 0 500 500" fill="none" aria-hidden="true">
        <path d="M246 451C211 349 218 220 252 83M246 422C181 376 114 309 82 224C159 235 215 285 246 354M248 364C303 307 360 254 434 239C405 314 338 369 248 403M251 266C200 222 168 157 166 84C223 121 246 181 251 266M256 229C306 184 327 125 324 63C275 100 255 154 256 229Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="closing-copy">
        <h1 className="closing-title">شكرًا لحسن استماعكم</h1>
        <p className="closing-name">Taha Mahmoud Metwally Nour El-Dein</p>
        <p className="closing-subtitle">سدرة | تجربة جمال متكاملة</p>
      </div>
    </div>
  );
}
