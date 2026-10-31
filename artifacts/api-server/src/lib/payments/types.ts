import type { Order } from "@workspace/db";

export type ProviderName = "stripe" | "paypal" | "crypto";

/** يُرمى عندما لا تكون أسرار المزوّد مضبوطة. تُترجم إلى 503 برمز provider_not_configured. */
export class ProviderNotConfiguredError extends Error {
  constructor(public readonly provider: ProviderName, public readonly missing: string[]) {
    super(`Payment provider "${provider}" is not configured (missing: ${missing.join(", ")})`);
  }
}

/** يُرمى عندما يرفض المزوّد الطلب أو يفشل. تُترجم إلى 502. */
export class ProviderRequestError extends Error {
  constructor(public readonly provider: ProviderName, message: string) {
    super(message);
  }
}

export type RemoteStatus = "paid" | "pending" | "failed" | "expired";

export type StartResult = { providerRef: string; redirectUrl: string };

export type OrderForPayment = Pick<Order, "id" | "total" | "currency" | "items" | "shipping"> & { buyerEmail: string };

export function requireEnv(provider: ProviderName, names: string[]): Record<string, string> {
  const missing = names.filter((n) => !process.env[n]?.trim());
  if (missing.length) throw new ProviderNotConfiguredError(provider, missing);
  return Object.fromEntries(names.map((n) => [n, process.env[n]!.trim()]));
}

export function envPresent(names: string[]): boolean {
  return names.every((n) => !!process.env[n]?.trim());
}
