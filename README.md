# منحة لتعلّم Vibe Coding

<p align="center">
  <img src="docs/replit-logo.png" alt="Replit" width="200">
</p>

# سدرة | تجربة جمال متكاملة

**من إنشاء: Taha Mahmoud Nour El-Dein**

سدرة مشروع لمتجر عربي لمنتجات الجمال والعناية بالبشرة. يقدّم تجربة تسوّق من اليمين إلى اليسار على الهاتف والكمبيوتر، إلى جانب قالب Shopify عربي أصلي وعرض تقديمي يشرح خصائص المشروع.

## العرض التقديمي

- [تحميل العرض بصيغة PowerPoint](docs/presentation/Sidra-Presentation.pptx)
- [تحميل العرض بصيغة PDF](docs/presentation/Sidra-Presentation.pdf)
- [ملفات العرض القابلة للتعديل داخل المشروع](artifacts/sidra-presentation/)
- [توثيق العرض ومحتوى شرائحه](docs/presentation.md)

## أهم خصائص الموقع

- استكشاف مجموعات منتجات العناية والجمال، والبحث والتصفية والترتيب.
- صفحات للمنتجات مع اختيار الخيارات المتاحة وإضافتها إلى السلة أو المفضلة.
- إنشاء حساب وتسجيل الدخول، وإدارة الملف الشخصي والعناوين والطلبات.
- مراجعة الطلب والشحن قبل إتمام الشراء.
- خيارات دفع عبر Stripe وPayPal وBTCPay Server عند تهيئة كل وسيلة.
- مجلة وصفحات للسياسات والدعم عبر واتساب.

بيانات المنتجات في معاينة الموقع توضيحية، ورقم واتساب الحالي تجريبي. تحتاج وسائل الدفع إلى إعدادها قبل استخدامها الفعلي.

## مكوّنات المشروع

| المسار | المحتوى |
| --- | --- |
| [`artifacts/sidra-store`](artifacts/sidra-store/) | واجهة متجر سدرة باستخدام React وVite |
| [`artifacts/api-server`](artifacts/api-server/) | واجهة الخادم للحسابات والسلة والطلبات والدفع |
| [`artifacts/sidra-presentation`](artifacts/sidra-presentation/) | مصدر العرض التقديمي |
| [`shopify-theme`](shopify-theme/) | قالب Shopify عربي أصلي |
| [`lib`](lib/) | المكتبات المشتركة، ومنها قاعدة البيانات وكتالوج المنتجات |

تستخدم نسخة الموقع React وExpress وPostgreSQL وClerk. أما قالب Shopify فيعتمد على بيانات Shopify للحسابات والمنتجات والطلبات والدفع، ويحتاج إلى إعداد متجر Shopify قبل استخدامه للبيع.

## التشغيل والتوثيق

يعتمد المشروع على Node.js وpnpm. لتثبيت الحزم:

```sh
pnpm install --frozen-lockfile
```

تُحفظ ملفات العرض باستخدام Git LFS. عند استنساخ المستودع، شغّل `git lfs install` ثم `git lfs pull` لتنزيلها.

يمكن تشغيل مكوّنات المشروع في بيئة Replit من خلال مسارات التشغيل المهيّأة، أو تشغيلها بالأوامر التالية بعد إعداد متغيرات البيئة والمنافذ المناسبة:

```sh
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/sidra-store run dev
pnpm --filter @workspace/sidra-presentation run dev
```

يتطلب الخادم اتصال PostgreSQL وإعدادات الحسابات المناسبة، وتتطلب الواجهات متغيرَي `PORT` و`BASE_PATH`. لا تضع المفاتيح السرية أو بيانات الاتصال داخل المستودع.

- [توثيق المشروع وإعداداته](replit.md)
- [دليل قالب Shopify العربي](shopify-theme/README.ar.md)
- [توثيق العرض التقديمي](docs/presentation.md)
