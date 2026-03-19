import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada')
    _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' })
  }
  return _stripe
}

export const STRIPE_PLANS = {
  pro: {
    name: 'MotoSafe Pro',
    price_id: process.env.STRIPE_PRICE_ID_PRO ?? '',
    amount: 900, // $9.00 USD en centavos
  },
} as const
