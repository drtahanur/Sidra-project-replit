import { SHIPPING_POLICY } from '@workspace/catalog';

// رقم واتساب الدعم الفني — رقم تجريبي مؤقت. غيّريه هنا فقط وسيتحدث في كل الموقع.
export const SUPPORT_WHATSAPP = {
  display: '+966 50 000 0000',
  digits: '966500000000',
  message: 'مرحبًا سدرة، أحتاج مساعدة من الدعم الفني.',
};
export const supportWhatsappUrl = (text = SUPPORT_WHATSAPP.message) =>
  `https://wa.me/${SUPPORT_WHATSAPP.digits}?text=${encodeURIComponent(text)}`;

export const toArabicDigits = (n: number | string) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]!);

export const DELIVERY_TEXT = `من ${toArabicDigits(SHIPPING_POLICY.minDays)} إلى ${toArabicDigits(SHIPPING_POLICY.maxDays)} أيام عمل، ولا تزيد مدة التوصيل عن أسبوع`;
