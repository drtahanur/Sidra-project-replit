export const orderStatusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: 'بانتظار تأكيد الدفع', cls: 'bg-gold/20 text-wine' },
  paid: { text: 'مدفوع', cls: 'bg-[#DDEBE2] text-[#24533C]' },
  failed: { text: 'فشل الدفع', cls: 'bg-[#F3D9DE] text-[#7A1F33]' },
  cancelled: { text: 'ملغي', cls: 'bg-line text-taupe' },
  expired: { text: 'انتهت مهلة الدفع', cls: 'bg-line text-taupe' },
};

export const providerLabel: Record<string, string> = {
  stripe: 'بطاقة (Stripe)',
  paypal: 'PayPal',
  crypto: 'عملات رقمية (Bitcoin)',
};

export const dateAr = (d: string | Date) =>
  new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
