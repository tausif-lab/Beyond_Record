import { NextRequest } from 'next/server'

// In-memory store for rate limiting (use Redis in production)
const attempts = new Map<string, { count: number; resetTime: number }>()

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export async function rateLimit(
  request: NextRequest,
  windowMs: number = parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  maxAttempts: number = parseInt(process.env.RATE_LIMIT_MAX || '100')
): Promise<RateLimitResult> {
  const now = Date.now()
  
  // Get identifier (IP address or user ID)
  const identifier = getIdentifier(request)
  
  // Clean up expired entries
  cleanupExpiredEntries(now)
  
  // Get current attempt count
  const current = attempts.get(identifier)
  
  if (!current || now > current.resetTime) {
    // Reset window
    attempts.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }
  
  if (current.count >= maxAttempts) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetTime: current.resetTime }
  }
  
  // Increment count
  current.count++
  attempts.set(identifier, current)
  
  return { success: true, remaining: maxAttempts - current.count, resetTime: current.resetTime }
}

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from existing auth (for authenticated requests)
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }
  
  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || request.ip || 'unknown'
  return `ip:${ip}`
}

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of attempts.entries()) {
    if (now > value.resetTime) {
      attempts.delete(key)
    }
  }
}

// Specific rate limiting for authentication endpoints
export async function authRateLimit(request: NextRequest): Promise<RateLimitResult> {
  return rateLimit(request, 15 * 60 * 1000, 5) // 5 attempts per 15 minutes for auth
}

// Rate limiting for file uploads
export async function uploadRateLimit(request: NextRequest): Promise<RateLimitResult> {
  return rateLimit(request, 60 * 60 * 1000, 10) // 10 uploads per hour
}