/**
 * MercadoLibre App Token Manager
 * Obtiene y cachea un token de aplicación (client_credentials).
 * No requiere login de usuario — solo sirve para búsquedas públicas.
 */

interface MLTokenCache {
  access_token: string
  expires_at: number // timestamp ms
}

// Cache en memoria (sobrevive mientras el proceso esté vivo)
let tokenCache: MLTokenCache | null = null

export async function getMLToken(): Promise<string | null> {
  const clientId = process.env.ML_CLIENT_ID
  const clientSecret = process.env.ML_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  // Si el token sigue válido (con 5 min de margen), reutilizarlo
  if (tokenCache && Date.now() < tokenCache.expires_at - 5 * 60 * 1000) {
    return tokenCache.access_token
  }

  try {
    const res = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[ML Token] Error obteniendo token:', res.status, err.substring(0, 200))
      return null
    }

    const data = await res.json()
    // ML devuelve expires_in en segundos
    tokenCache = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
    }

    console.log('[ML Token] Token obtenido, expira en', data.expires_in, 'segundos')
    return tokenCache.access_token
  } catch (err) {
    console.error('[ML Token] Excepción:', err)
    return null
  }
}
