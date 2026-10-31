const base = import.meta.env.BASE_URL;

export default function Slide04() {
  return (
    <div className="sidra-slide scene scene-product relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">صفحة المنتج</h1>
      <div className="story-photo">
        <img className="photo" src={`${base}images/beauty-product.png`} crossOrigin="anonymous" alt="صورة تفصيلية لسيروم وكريم للعناية بالبشرة" />
      </div>
      <ul className="story-copy">
        <li>صور ووصف ومعلومات عن المنتج</li>
        <li>اختيار الحجم أو اللون المتاح</li>
        <li>عرض السعر بالدولار الأمريكي</li>
        <li>تحديد الكمية والإضافة إلى السلة أو المفضلة</li>
      </ul>
    </div>
  );
}
