import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover',
})

export const STRIPE_PLANS = {
  pro: {
    name: 'MotoSafe Pro',
    price_id: process.env.STRIPE_PRICE_ID_PRO ?? '',
    amount: 900, // $9.00 USD en centavos
  },
} as const
