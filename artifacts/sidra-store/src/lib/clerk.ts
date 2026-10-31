import { shadcn } from '@clerk/themes';
import { arSA } from '@clerk/localizations';

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk يمرّر مسارات كاملة إلى routerPush/routerReplace بينما wouter يضيف المسار الأساسي بنفسه.
export const stripBase = (path: string): string =>
  basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;

export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/brand/logo-header.svg`,
  },
  variables: {
    colorPrimary: '#853F54',
    colorForeground: '#30272B',
    colorMutedForeground: '#786B6D',
    colorDanger: '#A12B45',
    colorBackground: '#FFFFFF',
    colorInput: '#F8F4EF',
    colorInputForeground: '#30272B',
    colorNeutral: '#422333',
    fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif",
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-[28px] w-[440px] max-w-full overflow-hidden shadow-[0_30px_80px_-40px_rgba(66,35,51,.45)] border border-[#E8DEDA]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    logoBox: 'h-16 justify-center',
    logoImage: 'h-16 w-auto',
    headerTitle: 'font-bold text-[#422333]',
    headerSubtitle: 'text-[#786B6D]',
    socialButtonsBlockButton: 'rounded-full border-[#E8DEDA] bg-white hover:bg-[#F8F4EF]',
    socialButtonsBlockButtonText: 'text-[#30272B] font-medium',
    formFieldLabel: 'text-[#422333]',
    formFieldInput: 'rounded-2xl border-[#E8DEDA] bg-[#F8F4EF] text-[#30272B]',
    formButtonPrimary: 'rounded-full bg-[#853F54] hover:bg-[#422333] text-white shadow-none',
    footerActionText: 'text-[#786B6D]',
    footerActionLink: 'text-[#853F54] hover:text-[#422333] font-medium',
    dividerLine: 'bg-[#E8DEDA]',
    dividerText: 'text-[#786B6D]',
    identityPreviewEditButton: 'text-[#853F54]',
    formFieldSuccessText: 'text-[#2F6B4F]',
    alertText: 'text-[#422333]',
    otpCodeFieldInput: 'rounded-xl border-[#E8DEDA] bg-[#F8F4EF]',
  },
};

export const clerkLocalization = {
  ...arSA,
  signIn: { ...arSA.signIn, start: { ...arSA.signIn?.start, title: 'أهلًا بعودتكِ إلى سدرة', subtitle: 'سجّلي الدخول للوصول إلى طلباتكِ ومفضلتكِ' } },
  signUp: { ...arSA.signUp, start: { ...arSA.signUp?.start, title: 'أنشئي حسابكِ في سدرة', subtitle: 'سلّتكِ ومفضلتكِ وطلباتكِ في مكان واحد' } },
};
