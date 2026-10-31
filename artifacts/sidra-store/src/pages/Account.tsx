import { useRef, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { Camera, LogOut, Package, MapPin, Heart, UserRound, Trash2, Plus, Sparkles, ShieldCheck, Link2, Mail } from 'lucide-react';
import { Show, useClerk, useSession, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetMeQueryKey, getListMyAddressesQueryKey, useAddMyAddress, useDeleteMyAddress, useGetMe,
  useListMyAddresses, useListMyOrders, useSyncMe, useUpdateMe,
} from '@workspace/api-client-react';
import { usd } from '@/data/catalog';
import { SUPPORT_WHATSAPP, supportWhatsappUrl } from '@/data/support';
import { useToast } from '@/hooks/use-toast';
import { basePath } from '@/lib/clerk';
import { dateAr, orderStatusLabel, providerLabel } from '@/lib/format';
import { useStore } from '@/lib/store';
import { AddressFields, cleanAddress, emptyAddress } from '@/components/sidra/AddressForm';
import { countryNameAr, PhoneField } from '@/components/sidra/CountryFields';
import { Empty } from '@/pages/Collection';

type Tab = 'profile' | 'orders' | 'addresses' | 'security';
const tabs: { key: Tab; label: string; icon: typeof UserRound }[] = [
  { key: 'profile', label: 'ملفي الشخصي', icon: UserRound },
  { key: 'orders', label: 'طلباتي', icon: Package },
  { key: 'addresses', label: 'عناويني', icon: MapPin },
  { key: 'security', label: 'الأمان والحسابات', icon: ShieldCheck },
];

const Avatar = ({ src, name, size = 'h-24 w-24 text-3xl' }: { src: string | null | undefined; name: string; size?: string }) =>
  src
    ? <img src={src} alt={name} className={`${size} rounded-full object-cover ring-4 ring-blush/60`} />
    : <div className={`${size} grid place-items-center rounded-full bg-blush font-display font-bold text-wine ring-4 ring-blush/60`}>{(name.trim()[0] ?? '؟')}</div>;

function ProfileTab() {
  const { user } = useUser();
  const { data: me } = useGetMe();
  const qc = useQueryClient();
  const { toast } = useToast();
  const sync = useSyncMe();
  const update = useUpdateMe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  if (!me || !user) return <p className="text-taupe">جارٍ التحميل…</p>;
  const nameVal = name ?? me.name;
  const phoneVal = phone ?? me.phone ?? '';

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'اختاري صورة بصيغة صالحة لا يتجاوز حجمها ٥ ميجابايت' });
      return;
    }
    setUploading(true);
    try {
      await user.setProfileImage({ file });
      await sync.mutateAsync();
      await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: 'تم تحديث صورتكِ الشخصية' });
    } catch (err) {
      console.error('profile image upload failed', err);
      toast({ variant: 'destructive', title: 'تعذّر رفع الصورة. جرّبي صورة JPG أو PNG أخرى.' });
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const next = await update.mutateAsync({ data: { name: nameVal.trim(), phone: phoneVal.trim() || null } });
      qc.setQueryData(getGetMeQueryKey(), next);
      setName(null); setPhone(null);
      toast({ title: 'تم حفظ بياناتكِ' });
    } catch {
      toast({ variant: 'destructive', title: 'تعذّر حفظ البيانات' });
    }
  };

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar src={me.imageUrl} name={me.name} size="h-36 w-36 text-5xl" />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" data-testid="input-photo" onChange={(e) => onPhoto(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="button-change-photo"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-snow px-5 py-2.5 text-sm text-wine transition hover:bg-blush/50 disabled:opacity-60">
          <Camera className="h-4 w-4" />{uploading ? 'جارٍ الرفع…' : me.imageUrl ? 'تغيير الصورة' : 'إضافة صورة'}
        </button>
      </div>
      <form onSubmit={save} className="grid gap-5">
        <label className="grid gap-2 text-sm text-wine">الاسم
          <input required minLength={1} maxLength={80} value={nameVal} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" autoComplete="name"
            className="rounded-2xl border border-line bg-snow px-5 py-3.5 text-ink outline-none focus:border-rose" />
        </label>
        <label className="grid gap-2 text-sm text-wine">البريد الإلكتروني
          <input readOnly value={me.email} dir="ltr" className="rounded-2xl border border-line bg-pearl px-5 py-3.5 text-left text-taupe outline-none" />
        </label>
        <PhoneField value={phoneVal} onChange={setPhone} label="رقم الجوال" />
        {me.country && <p className="text-sm text-taupe">الدولة عند التسجيل: {countryNameAr(me.country)}</p>}
        {me.gender && <p className="text-sm text-taupe">النوع: {me.gender === 'female' ? 'أنثى' : 'ذكر'}</p>}
        <button disabled={update.isPending} data-testid="button-save-profile" className="mt-2 w-fit rounded-full bg-berry px-8 py-3.5 text-pearl transition hover:bg-wine disabled:opacity-60">
          {update.isPending ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
        </button>
        <p className="text-xs text-taupe">عضوة منذ {dateAr(me.createdAt)}</p>
      </form>
    </div>
  );
}

function SecurityTab() {
  const { user } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const sync = useSyncMe();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState<Awaited<ReturnType<NonNullable<typeof user>['createEmailAddress']>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [unlinkId, setUnlinkId] = useState<string | null>(null);

  if (!user) return <p className="text-taupe">جارٍ التحميل…</p>;
  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '';
  const googleAccounts = user.externalAccounts.filter((account) => account.providerSlug() === 'google');

  const verifyCurrentPassword = async (value: string) => {
    if (!sessionLoaded || !session || !user.passwordEnabled || !primaryEmail) throw new Error('no_password');
    await session.startVerification({ level: 'first_factor' });
    const attempt = await session.attemptFirstFactorVerification({ strategy: 'password', password: value });
    if (attempt.status !== 'complete') throw new Error('extra_verification');
  };

  const beginEmailChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      await verifyCurrentPassword(password);
      setPassword('');
      const added = await user.createEmailAddress({ email: email.trim() });
      await added.prepareVerification({ strategy: 'email_code' });
      setPendingEmail(added);
      setCode('');
      setNotice('أرسلنا رمز التحقق إلى البريد الجديد.');
    } catch (err) {
      setError((err as Error).message === 'no_password'
        ? 'أضيفي كلمة مرور للحساب أولًا، ثم أعيدي المحاولة.'
        : (err as Error).message === 'extra_verification'
          ? 'يتطلب الحساب خطوة تحقق إضافية. سجّلي الدخول من جديد ثم حاولي مرة أخرى.'
          : 'تعذّر بدء تغيير البريد. تأكدي من كلمة المرور وصحة البريد الجديد.');
    } finally { setBusy(false); }
  };

  const verifyNewEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingEmail) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await verifyCurrentPassword(password);
      setPassword('');
      const verified = await pendingEmail.attemptVerification({ code: code.trim() });
      await user.update({ primaryEmailAddressId: verified.id });
      await user.reload();
      await sync.mutateAsync();
      setPendingEmail(null); setEmail(''); setCode('');
      setNotice('تم تأكيد البريد الجديد وتعيينه بريدًا أساسيًا. سيبقى البريد السابق مسجلًا كوسيلة احتياطية.');
    } catch {
      setError('تعذّر تأكيد البريد. تحققي من كلمة المرور ورمز البريد وحاولي مجددًا.');
    } finally { setBusy(false); }
  };

  const unlinkGoogle = async (event: React.FormEvent) => {
    event.preventDefault();
    const account = googleAccounts.find((item) => item.id === unlinkId);
    if (!account) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await verifyCurrentPassword(password);
      setPassword('');
      await account.destroy();
      await user.reload();
      await sync.mutateAsync();
      setUnlinkId(null);
      setNotice('تم إلغاء ربط حساب Google.');
    } catch (err) {
      setError((err as Error).message === 'no_password'
        ? 'أضيفي كلمة مرور للحساب قبل إلغاء ربط Google.'
        : 'تعذّر إلغاء الربط. تأكدي من كلمة المرور وحاولي مرة أخرى.');
    } finally { setBusy(false); }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) { setError('كلمتا المرور الجديدتان غير متطابقتين.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      await user.updatePassword({
        newPassword,
        ...(user.passwordEnabled ? { currentPassword: password } : {}),
      });
      await user.reload();
      setPassword(''); setNewPassword(''); setConfirmNewPassword('');
      setNotice(user.passwordEnabled ? 'تم تحديث كلمة المرور.' : 'تمت إضافة كلمة مرور للحساب.');
    } catch {
      setError('تعذّر حفظ كلمة المرور. تأكدي من كلمة المرور الحالية ومتطلبات كلمة المرور.');
    } finally { setBusy(false); }
  };

  const fieldClass = 'w-full rounded-2xl border border-line bg-snow px-4 py-3 text-ink outline-none focus:border-rose';

  return (
    <div className="grid gap-8">
      <section className="rounded-[24px] border border-line bg-snow p-5 md:p-7">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-berry" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-wine">تغيير البريد الإلكتروني</h2>
            <p className="mt-1 text-sm leading-7 text-taupe">نطلب كلمة مروركِ قبل بدء التغيير وقبل اعتماد البريد. سنرسل رمزًا للتحقق من البريد الجديد.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-taupe">البريد الحالي: <b dir="ltr" className="text-wine">{primaryEmail}</b></p>
        {pendingEmail ? (
          <form onSubmit={verifyNewEmail} className="mt-5 grid max-w-lg gap-4">
            <p className="text-sm text-wine">أدخلِي الرمز الذي أرسلناه إلى <b dir="ltr">{pendingEmail.emailAddress}</b>.</p>
            <label className="grid gap-2 text-sm text-wine">رمز التحقق
              <input required inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className={fieldClass} />
            </label>
            <label className="grid gap-2 text-sm text-wine">كلمة المرور الحالية
              <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} />
            </label>
            <div className="flex gap-3">
              <button disabled={busy} className="rounded-full bg-berry px-6 py-3 text-sm text-pearl disabled:opacity-60">{busy ? 'جارٍ التحقق…' : 'تأكيد البريد الجديد'}</button>
              <button type="button" onClick={() => { setPendingEmail(null); setPassword(''); setCode(''); }} className="rounded-full border border-line px-6 py-3 text-sm text-wine">إلغاء</button>
            </div>
          </form>
        ) : (
          <form onSubmit={beginEmailChange} className="mt-5 grid max-w-lg gap-4">
            <label className="grid gap-2 text-sm text-wine">البريد الإلكتروني الجديد
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
            </label>
            <label className="grid gap-2 text-sm text-wine">كلمة المرور الحالية
              <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} />
            </label>
            <button disabled={busy} className="w-fit rounded-full bg-berry px-6 py-3 text-sm text-pearl disabled:opacity-60">{busy ? 'جارٍ إرسال الرمز…' : 'إرسال رمز التحقق'}</button>
          </form>
        )}
      </section>

      <section className="rounded-[24px] border border-line bg-snow p-5 md:p-7">
        <div className="flex items-start gap-3">
          <Link2 className="mt-1 h-5 w-5 shrink-0 text-berry" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-wine">الحسابات المرتبطة</h2>
            <p className="mt-1 text-sm leading-7 text-taupe">إلغاء ربط Google يتطلب كلمة مرور للحساب حتى لا تفقدي إمكانية تسجيل الدخول.</p>
          </div>
        </div>
        {!googleAccounts.length ? <p className="mt-4 text-sm text-taupe">لا يوجد حساب Google مرتبط.</p> : (
          <ul className="mt-4 grid gap-3">
            {googleAccounts.map((account) => (
              <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
                <div><b className="text-wine">Google</b><p dir="ltr" className="text-sm text-taupe">{account.emailAddress}</p></div>
                {unlinkId === account.id ? (
                  <form onSubmit={unlinkGoogle} className="flex flex-wrap items-center gap-2">
                    <input required type="password" autoComplete="current-password" aria-label="كلمة المرور الحالية" placeholder="كلمة المرور الحالية"
                      value={password} onChange={(e) => setPassword(e.target.value)} className="min-w-48 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-rose" />
                    <button disabled={busy} className="rounded-full bg-berry px-4 py-2 text-sm text-pearl disabled:opacity-60">{busy ? 'جارٍ الإلغاء…' : 'تأكيد إلغاء الربط'}</button>
                    <button type="button" onClick={() => { setUnlinkId(null); setPassword(''); }} className="px-3 py-2 text-sm text-taupe">إلغاء</button>
                  </form>
                ) : (
                  <button type="button" onClick={() => { setUnlinkId(account.id); setError(''); setPassword(''); }}
                    className="rounded-full border border-line px-4 py-2 text-sm text-wine hover:bg-blush/40">إلغاء ربط Google</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[24px] border border-line bg-snow p-5 md:p-7">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-berry" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-wine">{user.passwordEnabled ? 'تغيير كلمة المرور' : 'إضافة كلمة مرور'}</h2>
            <p className="mt-1 text-sm leading-7 text-taupe">تُرسل كلمة المرور إلى Clerk للتحقق والحفظ، ولا يخزنها المتجر.</p>
          </div>
        </div>
        <form onSubmit={savePassword} className="mt-5 grid max-w-lg gap-4">
          {user.passwordEnabled && <label className="grid gap-2 text-sm text-wine">كلمة المرور الحالية
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} />
          </label>}
          <label className="grid gap-2 text-sm text-wine">كلمة المرور الجديدة
            <input required type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm text-wine">تأكيد كلمة المرور الجديدة
            <input required type="password" autoComplete="new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={fieldClass} />
          </label>
          <button disabled={busy} className="w-fit rounded-full border border-line px-6 py-3 text-sm text-wine disabled:opacity-60">{busy ? 'جارٍ الحفظ…' : user.passwordEnabled ? 'تحديث كلمة المرور' : 'إضافة كلمة مرور'}</button>
        </form>
      </section>

      {(error || notice) && <p role={error ? 'alert' : 'status'} className={`rounded-2xl p-4 text-sm leading-7 ${error ? 'bg-[#F3D9DE] text-[#7A1F33]' : 'bg-blush/50 text-wine'}`}>{error || notice}</p>}
    </div>
  );
}

function OrdersTab() {
  const { data, isLoading, isError } = useListMyOrders();
  if (isLoading) return <p className="text-taupe">جارٍ التحميل…</p>;
  if (isError) return <p role="alert" className="text-berry">تعذّر تحميل طلباتكِ.</p>;
  if (!data?.length) return <Empty text="لا توجد طلبات بعد" />;
  return (
    <ul className="grid gap-5">
      {data.map((o) => { const st = orderStatusLabel[o.status]!; return (
        <li key={o.id} data-testid={`order-${o.id}`} className="rounded-[24px] border border-line bg-snow p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-display text-lg font-bold text-wine">طلب رقم <span className="num">#{o.id}</span></p>
              <p className="text-xs text-taupe">{dateAr(o.createdAt)} · {providerLabel[o.paymentProvider]}</p></div>
            <span className={`rounded-full px-4 py-1.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
          </div>
          <ul className="mt-4 divide-y divide-line text-sm">
            {o.items.map((i) => (
              <li key={`${i.handle}${i.variantId}`} className="flex justify-between gap-4 py-2.5">
                <span className="text-ink">{i.title} <span className="text-taupe">— {i.variantTitle} × <span className="num">{i.qty}</span></span></span>
                <span className="text-wine">{usd(i.unitPrice * i.qty)}</span>
              </li>))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm text-taupe"><span>الشحن</span><span>{o.shipping ? usd(o.shipping) : 'مجاني'}</span></div>
          <div className="mt-1 flex justify-between font-display text-lg text-wine"><span>الإجمالي</span><span>{usd(o.total)}</span></div>
        </li>); })}
    </ul>
  );
}

function AddressesTab() {
  const { data, isLoading } = useListMyAddresses();
  const qc = useQueryClient();
  const { toast } = useToast();
  const add = useAddMyAddress();
  const del = useDeleteMyAddress();
  const { data: me } = useGetMe();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyAddress());
  const refresh = () => qc.invalidateQueries({ queryKey: getListMyAddressesQueryKey() });
  return (
    <div className="grid gap-5">
      {isLoading ? <p className="text-taupe">جارٍ التحميل…</p> : !data?.length && !open ? <Empty text="لا توجد عناوين محفوظة" /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data?.map((a) => (
            <li key={a.id} className="rounded-[24px] border border-line bg-snow p-5 text-sm leading-7">
              <div className="flex items-start justify-between"><p className="font-display font-bold text-wine">{a.label}{a.isDefault && <span className="mr-2 rounded-full bg-blush px-2 py-0.5 text-[11px] font-normal">الافتراضي</span>}</p>
                <button aria-label="حذف العنوان" data-testid={`button-delete-address-${a.id}`} onClick={() => del.mutate({ id: a.id }, { onSuccess: refresh, onError: () => toast({ variant: 'destructive', title: 'تعذّر حذف العنوان' }) })} className="text-taupe hover:text-berry"><Trash2 className="h-4 w-4" /></button></div>
              <p>{a.fullName} · <span className="num">{a.phone}</span></p>
              <p className="text-taupe">{a.line1}{a.line2 ? `، ${a.line2}` : ''}، {a.city}، {a.country}{a.postalCode ? ` ${a.postalCode}` : ''}</p>
            </li>))}
        </ul>)}
      {open ? (
        <form className="rounded-[24px] border border-line bg-pearl p-6" onSubmit={(e) => { e.preventDefault();
          add.mutate({ data: cleanAddress(draft) }, { onSuccess: () => { refresh(); setOpen(false); setDraft(emptyAddress()); toast({ title: 'تم حفظ العنوان' }); }, onError: () => toast({ variant: 'destructive', title: 'تعذّر حفظ العنوان' }) }); }}>
          <AddressFields value={draft} onChange={setDraft} />
          <div className="mt-5 flex gap-3">
            <button disabled={add.isPending} data-testid="button-save-address" className="rounded-full bg-berry px-7 py-3 text-pearl hover:bg-wine disabled:opacity-60">حفظ العنوان</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-5 py-3 text-taupe hover:text-berry">إلغاء</button>
          </div>
        </form>
      ) : (
        <button onClick={() => { setDraft(emptyAddress(me?.name ?? '', me?.phone ?? '')); setOpen(true); }} data-testid="button-add-address"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-snow px-6 py-3 text-sm text-wine hover:bg-blush/50"><Plus className="h-4 w-4" />إضافة عنوان</button>)}
    </div>
  );
}

function Dashboard() {
  const { data: me } = useGetMe();
  const { signOut } = useClerk();
  const { wishlist } = useStore();
  const search = useSearch();
  const [tab, setTab] = useState<Tab>('profile');
  const welcome = new URLSearchParams(search).get('welcome') === '1';
  if (!me) return <div className="py-24 text-center text-taupe">جارٍ تحميل حسابكِ…</div>;
  const incomplete = !me.name.trim() || !me.imageUrl;
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar src={me.imageUrl} name={me.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-taupe">{welcome ? 'أهلًا بكِ في سدرة' : 'حسابي'}</p>
          <h1 className="truncate font-display text-[30px] font-extrabold text-wine md:text-4xl" data-testid="text-account-name">{me.name || 'عميلتنا العزيزة'}</h1>
          <p className="truncate text-sm text-taupe" dir="ltr" style={{ textAlign: 'right' }}>{me.email}</p>
        </div>
        <button onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out" className="inline-flex items-center gap-2 rounded-full border border-line bg-snow px-5 py-2.5 text-sm text-wine hover:bg-blush/50"><LogOut className="h-4 w-4" />تسجيل الخروج</button>
      </div>

      {incomplete && (
        <div className="reveal mt-8 flex gap-4 rounded-[24px] bg-blush/50 p-5 text-wine">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-berry" />
          <div><p className="font-display font-bold">أكملي ملفكِ الشخصي</p>
            <p className="mt-1 text-sm leading-7">{!me.name.trim() ? 'أضيفي اسمكِ' : ''}{!me.name.trim() && !me.imageUrl ? ' وصورتكِ الشخصية' : !me.imageUrl ? 'أضيفي صورتكِ الشخصية' : ''} من تبويب «ملفي الشخصي» لتصلكِ طلباتكِ باسمكِ ويسهل علينا خدمتكِ.</p></div>
        </div>)}

      <div role="tablist" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto border-b border-line">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} data-testid={`tab-${key}`} onClick={() => setTab(key)}
            className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-5 py-3.5 text-[15px] transition ${tab === key ? 'border-berry text-berry' : 'border-transparent text-taupe hover:text-wine'}`}><Icon className="h-4 w-4" />{label}</button>))}
        <Link href="/pages/wishlist" className="-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-5 py-3.5 text-[15px] text-taupe hover:text-wine"><Heart className="h-4 w-4" />المفضلة <span className="num text-xs">({wishlist.length})</span></Link>
      </div>
      <div className="py-8">
        {tab === 'profile' ? <ProfileTab /> : tab === 'orders' ? <OrdersTab /> : tab === 'addresses' ? <AddressesTab /> : <SecurityTab />}
      </div>
      <p className="text-sm text-taupe">تحتاجين مساعدة؟ <a className="text-berry underline-offset-4 hover:underline" href={supportWhatsappUrl()} target="_blank" rel="noreferrer">راسلي الدعم الفني على واتساب</a> <span className="num">{SUPPORT_WHATSAPP.display}</span></p>
    </div>
  );
}

export default function AccountPage() {
  return (
    <>
      <Show when="signed-in"><Dashboard /></Show>
      <Show when="signed-out">
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <div className="arch mx-auto mb-8 grid h-36 w-28 place-items-center bg-blush/60"><UserRound className="h-9 w-9 text-berry" strokeWidth={1.3} /></div>
          <h1 className="font-display text-3xl font-extrabold text-wine">حسابكِ في سدرة</h1>
          <p className="mt-3 leading-8 text-taupe">سجّلي الدخول أو أنشئي حسابًا لتحفظي سلّتكِ ومفضلتكِ وعناوينكِ وتتابعي طلباتكِ.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-in" data-testid="link-sign-in" className="rounded-full bg-berry px-8 py-3.5 text-pearl hover:bg-wine">تسجيل الدخول</Link>
            <Link href="/sign-up" data-testid="link-sign-up" className="rounded-full border border-line bg-snow px-8 py-3.5 text-wine hover:bg-blush/50">إنشاء حساب</Link>
          </div>
        </div>
      </Show>
    </>
  );
}
