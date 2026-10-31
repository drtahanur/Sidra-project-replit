import type { AddressInput } from '@workspace/api-client-react';
import { PhoneField } from '@/components/sidra/CountryFields';

export const emptyAddress = (fullName = '', phone = ''): AddressInput => ({
  label: 'المنزل', fullName, phone, country: 'السعودية', city: '', line1: '', line2: '', postalCode: '',
});

const fields: { key: keyof AddressInput; label: string; req: boolean; type?: string; span?: boolean; auto?: string }[] = [
  { key: 'fullName', label: 'الاسم الكامل', req: true, auto: 'name' },
  { key: 'phone', label: 'رقم الجوال', req: true, type: 'tel', auto: 'tel' },
  { key: 'country', label: 'الدولة', req: true, auto: 'country-name' },
  { key: 'city', label: 'المدينة', req: true, auto: 'address-level2' },
  { key: 'line1', label: 'العنوان (الحي والشارع ورقم المبنى)', req: true, span: true, auto: 'address-line1' },
  { key: 'line2', label: 'تفاصيل إضافية (اختياري)', req: false, span: true, auto: 'address-line2' },
  { key: 'postalCode', label: 'الرمز البريدي (اختياري)', req: false, auto: 'postal-code' },
];

export function AddressFields({ value, onChange }: { value: AddressInput; onChange: (v: AddressInput) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PhoneField
        value={value.phone}
        onChange={(phone) => onChange({ ...value, phone })}
        required
        label="رقم الجوال"
      />
      {fields.map((f) => (
        f.key === 'phone' ? null :
        <label key={f.key} className={`grid gap-2 text-sm text-wine ${f.span ? 'sm:col-span-2' : ''}`}>
          {f.label}
          <input
            required={f.req}
            type={f.type ?? 'text'}
            autoComplete={f.auto}
            data-testid={`input-address-${f.key}`}
            value={(value[f.key] as string | null | undefined) ?? ''}
            onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
            className="rounded-2xl border border-line bg-snow px-5 py-3.5 text-ink outline-none focus:border-rose"
          />
        </label>
      ))}
    </div>
  );
}

export const cleanAddress = (a: AddressInput): AddressInput => ({
  ...a,
  line2: a.line2?.trim() ? a.line2.trim() : null,
  postalCode: a.postalCode?.trim() ? a.postalCode.trim() : null,
});
