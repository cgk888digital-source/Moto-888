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
  standard: {
    name: 'Bikevzla 888 Standard',
    price_id: process.env.STRIPE_PRICE_ID_STANDARD ?? '',
    amount: 1000,
  },
  premium: {
    name: 'Bikevzla 888 Premium',
    price_id: process.env.STRIPE_PRICE_ID_PREMIUM ?? '',
    amount: 2000,
  },
  elite: {
    name: 'Bikevzla 888 Elite',
    price_id: process.env.STRIPE_PRICE_ID_ELITE ?? '',
    amount: 4000,
  },
} as const
