import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, authRateLimit } from '@/lib/rate-limit'

// Load environment variables if not already loaded
if (!process.env.JWT_SECRET && typeof window === 'undefined') {
  try {
    require('dotenv').config()
  } catch (error) {
    // Ignore if dotenv is not available
  }
}

// Validate JWT secret on startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please check your .env file.')
}

const jwtSecretLength = process.env.JWT_SECRET.length
console.log(`🔑 JWT_SECRET loaded: ${jwtSecretLength} characters`)

// Warn about short secrets but don't fail
if (jwtSecretLength < 32) {
  console.warn(`⚠️  JWT_SECRET is shorter than recommended (${jwtSecretLength}/32+ characters)`)
}

const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '-refresh'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

export interface TokenPayload {
  userId: string
  email: string
  role: 'student' | 'faculty' | 'admin' | 'institution'
  institution?: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenVersion: number
  iat?: number
  exp?: number
}

// Legacy interface for backward compatibility
export interface JWTPayload extends TokenPayload {}

// Generate access token with enhanced security
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  if (!payload.userId || !payload.email || !payload.role) {
    throw new Error('Missing required payload fields')
  }
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'edu-platform',
    audience: 'edu-platform-users',
    algorithm: 'HS256'
  })
}

// Generate refresh token
export function generateRefreshToken(userId: string, tokenVersion: number = 0): string {
  return jwt.sign(
    { userId, tokenVersion },
    REFRESH_TOKEN_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'edu-platform',
      audience: 'edu-platform-users',
      algorithm: 'HS256'
    }
  )
}

// Verify access token with backward compatibility
export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') {
    return null
  }
  
  try {
    // First try with new validation (issuer/audience)
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'edu-platform',
      audience: 'edu-platform-users',
      algorithms: ['HS256'],
      clockTolerance: 60 // 60 seconds clock tolerance
    }) as TokenPayload
    
    // Additional validation
    if (!decoded.userId || !decoded.email || !decoded.role) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Token missing required fields:', { userId: !!decoded.userId, email: !!decoded.email, role: !!decoded.role })
      }
      return null
    }
    
    return decoded
  } catch (error) {
    // If the new validation fails, try backward compatible validation
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
        clockTolerance: 60 // 60 seconds clock tolerance
      }) as TokenPayload
      
      // Additional validation
      if (!decoded.userId || !decoded.email || !decoded.role) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Token missing required fields (backward compat):', { userId: !!decoded.userId, email: !!decoded.email, role: !!decoded.role })
        }
        return null
      }
      
      return decoded
    } catch (backwardError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
      }
      return null
    }
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'edu-platform',
      audience: 'edu-platform-users',
      algorithms: ['HS256']
    }) as RefreshTokenPayload
  } catch (error) {
    console.error('Refresh token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Hash password with enhanced security
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  
  try {
    return await bcrypt.hash(password, BCRYPT_ROUNDS)
  } catch (error) {
    console.error('Password hashing failed:', error)
    throw new Error('Password hashing failed')
  }
}

// Compare password with error handling
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false
  }
  
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password comparison failed:', error)
    return false
  }
}

// Enhanced password strength validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
    return { valid: false, errors }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[^\w\s]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}

// Enhanced email validation
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email.toLowerCase()) && email.length <= 254
}

// Create secure authentication response
export function createAuthResponse(data: any, token: string, refreshToken?: string) {
  const response = NextResponse.json({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  })
  
  // Set HTTP-only cookie for access token
  response.cookies.set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })
  
  // Set HTTP-only cookie for refresh token if provided
  if (refreshToken) {
    response.cookies.set({
      name: 'refresh-token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
  }
  
  return response
}

// Extract token from request (enhanced)
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookie first (more secure)
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }
  
  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

// Middleware for protecting routes
export async function authenticateRequest(request: NextRequest): Promise<{ user: TokenPayload; error?: never } | { user?: never; error: string }> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return { error: 'Too many requests. Please try again later.' }
    }
    
    const token = extractTokenFromRequest(request)
    if (!token) {
      return { error: 'Authentication token required' }
    }
    
    const user = verifyToken(token)
    if (!user) {
      return { error: 'Invalid or expired token' }
    }
    
    return { user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: 'Authentication failed' }
  }
}

// Create error response
export function createErrorResponse(error: string, status: number = 401) {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString()
  }, { status })
}

// Clear authentication cookies
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('auth-token')
  response.cookies.delete('refresh-token')
  return response
}

// Generate a unique student ID
export function generateStudentId(): string {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 9000) + 1000 // 4-digit random number
  return `STU${year}${randomNum}`
}

// Backward compatibility functions
export function getTokenFromRequest(request: NextRequest): string | null {
  return extractTokenFromRequest(request)
}

export function verifyTokenFromRequest(request: NextRequest): TokenPayload | null {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return null
  }
  return verifyToken(token)
}


// Generate a unique portfolio share URL
export function generatePortfolioShareUrl(userId: string, name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const year = new Date().getFullYear()
  return `${cleanName}-${year}-${userId.slice(-6)}`
}
