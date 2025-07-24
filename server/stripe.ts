import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

export const stripeService = {
  // Create a new customer
  async createCustomer(params: {
    email: string;
    metadata?: Record<string, string>;
  }) {
    return await stripe.customers.create({
      email: params.email,
      metadata: params.metadata || {},
    });
  },

  // Create a subscription
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    paymentBehavior?: 'default_incomplete' | 'allow_incomplete';
  }) {
    return await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: params.paymentBehavior || 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  },

  // Create a payment intent
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }) {
    return await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'eur',
      customer: params.customerId,
      metadata: params.metadata || {},
      automatic_payment_methods: { enabled: true },
    });
  },

  // Get subscription
  async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },

  // Update subscription
  async updateSubscription(subscriptionId: string, params: Partial<Stripe.SubscriptionUpdateParams>) {
    return await stripe.subscriptions.update(subscriptionId, params);
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  },

  // Construct webhook event
  constructEvent(payload: string | Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing webhook secret');
    }
    
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  },

  // Create subscription checkout session
  async createSubscriptionCheckout(params: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    return await stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata || {},
    });
  },

  // Retrieve checkout session
  async retrieveSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },

  // Create one-time payment checkout session
  async createCheckoutSession(params: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    return await stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata || {},
    });
  },

  // Create customer portal session
  async createCustomerPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }) {
    return await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
  },

  // Handle successful subscription (placeholder for business logic)
  async handleSuccessfulSubscription(sessionId: string) {
    const session = await this.retrieveSession(sessionId);
    // Add business logic here to update user subscription status
    return session;
  },

  // Handle webhook events
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
        // Handle new subscription
        break;
      case 'customer.subscription.updated':
        // Handle subscription changes
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break;
      case 'invoice.payment_succeeded':
        // Handle successful payment
        break;
      case 'invoice.payment_failed':
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  },
};