export type OrderConfirmationEmail = {
  to: string;
  itemLabel: string;
  amount: number;
  currency: string;
  /** Omitted for orders with no downloadable file yet (e.g. Exclusive Beat). */
  downloadUrl?: string;
};

export interface EmailProvider {
  sendOrderConfirmation(payload: OrderConfirmationEmail): Promise<void>;
}
