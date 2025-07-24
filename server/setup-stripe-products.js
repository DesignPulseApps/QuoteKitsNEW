import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  try {
    console.log('Creating Stripe products and prices...');

    // Create Pro Plan Product
    const proProduct = await stripe.products.create({
      name: 'QuoteKit Pro',
      description: 'Professional quote calculators with advanced features',
      metadata: {
        plan: 'pro'
      }
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 500, // €5.00 in cents
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'pro',
        quotes_limit: '20'
      }
    });

    // Create Business Plan Product
    const businessProduct = await stripe.products.create({
      name: 'QuoteKit Business',
      description: 'Business plan for growing teams with advanced analytics',
      metadata: {
        plan: 'business'
      }
    });

    const businessPrice = await stripe.prices.create({
      product: businessProduct.id,
      unit_amount: 3500, // €35.00 in cents
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'business',
        quotes_limit: '100'
      }
    });

    // Create Enterprise Plan Product
    const enterpriseProduct = await stripe.products.create({
      name: 'QuoteKit Enterprise',
      description: 'Enterprise solution with unlimited quotes and custom features',
      metadata: {
        plan: 'enterprise'
      }
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 9500, // €95.00 in cents
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'enterprise',
        quotes_limit: 'unlimited'
      }
    });

    console.log('\n✅ Stripe products and prices created successfully!');
    console.log('\nPrice IDs to use in your application:');
    console.log(`Pro Plan: ${proPrice.id}`);
    console.log(`Business Plan: ${businessPrice.id}`);
    console.log(`Enterprise Plan: ${enterprisePrice.id}`);

    console.log('\nUpdate these price IDs in client/src/components/landing/pricing.tsx');

  } catch (error) {
    console.error('Error creating Stripe products:', error.message);
    process.exit(1);
  }
}

createStripeProducts();