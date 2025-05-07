
interface StripeInstance {
  redirectToCheckout(options: { sessionId: string }): Promise<{ error?: { message: string } }>;
}

declare global {
  interface Window {
    Stripe(publicKey: string): StripeInstance;
  }
}

export {};
