import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { basePath } from '@/lib/clerk';
import { CountryField, PhoneField } from '@/components/sidra/CountryFields';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex min-h-[70dvh] max-w-6xl items-center justify-center px-4 py-12 md:px-8">{children}</div>
);

export function SignInPage() {
  // path يجب أن يكون المسار الكامل في المتصفح — Clerk يقرأ window.location.pathname مباشرة
  return (
    <Frame>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/` || '/'} />
    </Frame>
  );
}

export function SignUpPage() {
  const [profile, setProfile] = useState<{ gender: 'male' | 'female' | ''; countryCode: string; phone: string } | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [countryCode, setCountryCode] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <Frame>
      {profile ? (
        <div className="grid w-full justify-items-center gap-5">
          <button type="button" onClick={() => setProfile(null)} className="text-sm text-berry underline underline-offset-4">تعديل بيانات التسجيل</button>
          <SignUp
            routing="path"
            path={`${basePath}/sign-up`}
            signInUrl={`${basePath}/sign-in`}
            fallbackRedirectUrl={`${basePath}/account?welcome=1`}
            unsafeMetadata={{ gender: profile.gender, countryCode: profile.countryCode || null, phone: profile.phone || null }}
          />
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); if (gender) setProfile({ gender, countryCode, phone }); }}
          className="grid w-full max-w-[440px] gap-5 rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_80px_-40px_rgba(66,35,51,.45)] md:p-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-wine">أنشئي حسابكِ في سدرة</h1>
            <p className="mt-2 text-sm leading-7 text-taupe">أضيفي بياناتكِ ثم تابعي لإنشاء الحساب بالبريد أو Google.</p>
          </div>
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-medium text-wine">النوع <span className="text-berry">*</span></legend>
            <div className="grid grid-cols-2 gap-3">
              {([{ value: 'female', label: 'أنثى' }, { value: 'male', label: 'ذكر' }] as const).map((option) => (
                <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition ${gender === option.value ? 'border-berry bg-blush/40 text-wine' : 'border-line bg-snow text-taupe'}`}>
                  <input required type="radio" name="gender" value={option.value} checked={gender === option.value}
                    onChange={() => setGender(option.value)} className="accent-[#853F54]" />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <CountryField value={countryCode} onChange={setCountryCode} />
          <PhoneField value={phone} onChange={setPhone} />
          <button type="submit" disabled={!gender} className="rounded-full bg-berry px-7 py-3.5 font-medium text-pearl transition hover:bg-wine disabled:cursor-not-allowed disabled:opacity-50">
            متابعة إنشاء الحساب
          </button>
        </form>
      )}
    </Frame>
  );
}
