
interface StripeInstance {
  redirectToCheckout(options: { sessionId: string }): Promise<{ error?: { message: string } }>;
}

declare interface Window {
  Stripe(publicKey: string): StripeInstance;
}
