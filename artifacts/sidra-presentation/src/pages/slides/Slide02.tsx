const base = import.meta.env.BASE_URL;

export default function Slide02() {
  return (
    <div className="sidra-slide scene scene-overview relative w-screen h-screen overflow-hidden" dir="rtl">
      <img className="replit-slide-logo" src={`${import.meta.env.BASE_URL}replit-logo.png`} crossOrigin="anonymous" alt="Replit" />
      <h1 className="slide-title">سدرة في لمحة</h1>
      <div className="story-photo">
        <img className="photo" src={`${base}images/skincare.jpg`} crossOrigin="anonymous" alt="مجموعة من منتجات العناية والجمال" />
      </div>
      <ul className="story-copy">
        <li>متجر عربي لمنتجات العناية والجمال</li>
        <li>واجهة من اليمين إلى اليسار مناسبة للهاتف والكمبيوتر</li>
        <li>مجموعات للعناية بالبشرة والمكياج</li>
        <li>مجلة بمحتوى متعلق بالجمال</li>
      </ul>
    </div>
  );
}
