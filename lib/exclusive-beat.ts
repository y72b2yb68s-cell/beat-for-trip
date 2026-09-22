import { CURRENCY } from "./currency";

/**
 * Server-side price authority for Exclusive Beat orders. The client only
 * ever sends a `tierId` (or nothing, which resolves to the default tier) —
 * it can never influence price or currency. To add another tier later
 * (e.g. a premium exclusive package), add an entry here; nothing else in
 * the checkout/payment/order flow needs to change.
 */
export type ExclusiveBeatTier = {
  id: string;
  price: number; // major currency units
  currency: string;
};

export const EXCLUSIVE_BEAT_TIERS: Record<string, ExclusiveBeatTier> = {
  standard: { id: "standard", price: 30, currency: CURRENCY },
};

export const DEFAULT_EXCLUSIVE_BEAT_TIER = "standard";

export function getExclusiveBeatTier(tierId?: string): ExclusiveBeatTier | null {
  return EXCLUSIVE_BEAT_TIERS[tierId ?? DEFAULT_EXCLUSIVE_BEAT_TIER] ?? null;
}
