const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_PRO',
  'NEXT_PUBLIC_APP_URL',
  'GEMINI_API_KEY',
  'ML_CLIENT_ID',
  'ML_CLIENT_SECRET',
]

export function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v])

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`)
  }

  const envStatus = {
    required: requiredVars.map((v) => ({ name: v, value: '✓' })),
    optional: optionalVars.map((v) => ({
      name: v,
      value: process.env[v] ? '✓ (configurada)' : '✗ (no configurada)',
    })),
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[ENV] Variables de entorno cargadas:', envStatus)
  }

  return envStatus
}

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceIdPro: process.env.STRIPE_PRICE_ID_PRO,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  ml: {
    clientId: process.env.ML_CLIENT_ID,
    clientSecret: process.env.ML_CLIENT_SECRET,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}