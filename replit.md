# سدرة — هوية عربية وقالب Shopify

شعار عربي وهوية «اللؤلؤ والتوت»، ومعاينة متجاوبة وقالب Shopify Online Store 2.0 لمتجر تجميل وعناية بالبشرة.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sidra-store` — React/Vite storefront (Arabic RTL). Support WhatsApp number (placeholder) is in `src/data/support.ts`; legal texts in `src/data/policies.ts`.
- `artifacts/api-server` — Express API: account/cart/wishlist/addresses/orders, checkout and payment webhooks (`src/lib/payments/`).
- `lib/catalog` — shared product catalog + `SHIPPING_POLICY` (single source for prices/shipping on client and server).
- `lib/db` (Drizzle schema), `lib/api-spec/openapi.yaml` (→ codegen `lib/api-zod`, `lib/api-client-react`).
- `shopify-theme/` — native Shopify theme, packaged by `pnpm --filter @workspace/scripts run package:sidra`.
- `artifacts/sidra-presentation/` — the editable Arabic presentation about the Sidra project.
- `docs/presentation.md` and `docs/presentation/` — presentation documentation and PowerPoint/PDF exports.
- `README.md` — project overview, presentation links, and setup guidance.

## Architecture decisions

- Auth: Replit-managed Clerk (email/password + social providers enabled in the Auth pane); every user, cart, wishlist, address and order is mirrored in Postgres and keyed by the Clerk user id.
- Prices and shipping are always recomputed on the server from `@workspace/catalog`; the client total is display only.
- Payments are env-gated: Stripe (Checkout Sessions), PayPal (Orders v2, charged in USD directly), Bitcoin/crypto via BTCPay Server. Missing keys → `503 provider_not_configured` and a disabled option in the UI; there is no mock success path. Order status is always re-read from the provider, never trusted from webhook bodies.
- Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (`PAYPAL_MODE` optional), `BTCPAY_URL`, `BTCPAY_STORE_ID`, `BTCPAY_API_KEY`, `BTCPAY_WEBHOOK_SECRET`.
- Webhook URLs: `/api/webhooks/stripe`, `/api/webhooks/btcpay`.

## Product

Arabic beauty store: browse, wishlist, cart, account (profile photo, name, addresses, orders), checkout with card/PayPal/crypto, policies (terms, shipping ≤ 1 week, returns, privacy), WhatsApp technical support.

## User preferences

- اسم العلامة واللوجو بالعربية «سدرة»، والواجهة عربية فقط مع RTL.
- المستخدم طلب إنشاء اللوجو وليس مجرد طلب نسخة موجودة منه.
- تثبيت ألوان وثيقة المواصفات وعدم استبدال الهوية.
- المطلوب قالب Shopify أصلي متوافق مع الهاتف والويب، لا بديل React فقط.
- بيانات التجارة مصدرها Shopify؛ لا تقييمات أو خصومات أو وعود أو ادعاءات غير حقيقية.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
