/**
 * Beat For Trip sells in EUR only. This is the single place that constant is
 * defined — every price, order and payment in the app reads it from here
 * rather than accepting a currency from the client or an admin free-text field.
 */
export const CURRENCY = "EUR" as const;
