interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RequestRecord {
  count: number
  resetTime: number
}

const store = new Map<string, RequestRecord>()

const configs: Record<string, RateLimitConfig> = {
  default: { windowMs: 60000, maxRequests: 30 },
  'api/chat': { windowMs: 60000, maxRequests: 10 },
  'api/diagnostico': { windowMs: 60000, maxRequests: 10 },
  'api/ocr-titulo': { windowMs: 60000, maxRequests: 5 },
  'api/stripe': { windowMs: 60000, maxRequests: 20 },
}

function cleanup() {
  const now = Date.now()
  for (const [key, record] of store) {
    if (record.resetTime < now) {
      store.delete(key)
    }
  }
}

setInterval(cleanup, 60000)

export function checkRateLimit(key: string, path?: string): { allowed: boolean; remaining: number; resetIn: number } {
  const config = configs[path ?? 'default']
  const now = Date.now()
  
  let record = store.get(key)
  
  if (!record || record.resetTime < now) {
    record = { count: 0, resetTime: now + config.windowMs }
    store.set(key, record)
  }
  
  const remaining = Math.max(0, config.maxRequests - record.count)
  const resetIn = Math.max(0, record.resetTime - now)
  
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn }
  }
  
  record.count++
  store.set(key, record)
  
  return { allowed: true, remaining, resetIn }
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

export function rateLimitMiddleware(request: Request, path?: string) {
  const key = getClientKey(request)
  const result = checkRateLimit(key, path)
  
  if (!result.allowed) {
    return {
      allowed: false,
      retryAfter: Math.ceil(result.resetIn / 1000),
    }
  }
  
  return {
    allowed: true,
    remaining: result.remaining,
  }
}