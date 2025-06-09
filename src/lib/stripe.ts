import Stripe from 'stripe';

if (!process.env.PAYLOAD_STRIPE_SECRET_KEY) {
    throw new Error('PAYLOAD_STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

if (!process.env.PAYLOAD_STRIPE_WEBHOOK_SECRET) {
    throw new Error('PAYLOAD_STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

export const stripe = new Stripe(process.env.PAYLOAD_STRIPE_SECRET_KEY, {
}); 
