import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { FlagImage, PhoneInput, defaultCountries, parseCountry } from 'react-international-phone';
import 'react-international-phone/style.css';

const countries = defaultCountries.map(parseCountry);
const names = new Intl.DisplayNames(['ar'], { type: 'region' });

export const countryNameAr = (iso2: string) =>
  names.of(iso2.toUpperCase()) ?? countries.find((country) => country.iso2 === iso2.toLowerCase())?.name ?? iso2;

export function CountryField({ value, onChange }: { value: string; onChange: (iso2: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const chosen = countries.find((country) => country.iso2 === value.toLowerCase());
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return countries;
    return countries.filter((country) =>
      country.name.toLocaleLowerCase().includes(needle)
      || countryNameAr(country.iso2).toLocaleLowerCase().includes(needle)
      || country.iso2.includes(needle)
      || country.dialCode.includes(needle.replace(/^\+/, '')),
    );
  }, [query]);

  return (
    <div className="relative grid gap-2 text-sm text-wine">
      <span>الدولة <span className="text-xs text-taupe">(اختياري)</span></span>
      <button type="button" aria-expanded={open} aria-haspopup="listbox" onClick={() => { setOpen((v) => !v); setQuery(''); }}
        className="flex min-h-[50px] items-center gap-3 rounded-2xl border border-line bg-snow px-4 text-right text-ink outline-none transition focus:border-rose">
        {chosen ? <><FlagImage iso2={chosen.iso2} size="20px" /><span className="flex-1">{countryNameAr(chosen.iso2)}</span></> : <span className="flex-1 text-taupe">اختاري الدولة</span>}
        <ChevronDown className="h-4 w-4 text-taupe" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <label className="flex items-center gap-2 border-b border-line px-4 py-3 text-taupe">
            <Search className="h-4 w-4 shrink-0" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحثي عن دولة أو رمز الاتصال"
              className="w-full bg-transparent text-sm text-ink outline-none" aria-label="البحث عن دولة" />
          </label>
          <ul role="listbox" aria-label="الدولة" className="max-h-60 overflow-y-auto p-1">
            {filtered.map((country) => (
              <li key={country.iso2}>
                <button type="button" role="option" aria-selected={value.toLowerCase() === country.iso2}
                  onClick={() => { onChange(country.iso2); setOpen(false); setQuery(''); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm hover:bg-blush/50">
                  <FlagImage iso2={country.iso2} size="20px" />
                  <span className="flex-1">{countryNameAr(country.iso2)}</span>
                  <span dir="ltr" className="text-xs text-taupe">+{country.dialCode}</span>
                  {value.toLowerCase() === country.iso2 && <Check className="h-4 w-4 text-berry" />}
                </button>
              </li>
            ))}
            {!filtered.length && <li className="px-4 py-5 text-center text-sm text-taupe">لا توجد دولة مطابقة</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PhoneField({
  value, onChange, required = false, label = 'رقم الجوال',
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-wine">
      <span>{label}{!required && <span className="mr-1 text-xs text-taupe">(اختياري)</span>}</span>
      <div dir="ltr" className="phone-field">
        <PhoneInput
          defaultCountry="sa"
          value={value}
          onChange={(phone) => onChange(phone)}
          required={required}
          inputProps={{ autoComplete: 'tel', 'aria-label': label, dir: 'ltr', pattern: required ? '\\+[1-9]\\d{7,14}' : undefined }}
          className="!w-full !rounded-2xl !border !border-line !bg-snow !px-3 !py-1.5 focus-within:!border-rose"
          inputClassName="!w-full !border-0 !bg-transparent !py-2 !text-left !text-ink !outline-none !shadow-none"
          countrySelectorStyleProps={{
            buttonClassName: '!border-0 !bg-transparent !px-1',
            dropdownStyleProps: { className: '!z-[60]' },
          }}
        />
      </div>
    </label>
  );
}
