import { type NextRequest } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User } from "@/lib/models"
import { 
  comparePassword, 
  generateToken, 
  generateRefreshToken,
  validateEmail, 
  createAuthResponse, 
  createErrorResponse 
} from "@/lib/jwt"
import { authRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for authentication
    const rateLimitResult = await authRateLimit(request)
    if (!rateLimitResult.success) {
      return createErrorResponse('Too many login attempts. Please try again later.', 429)
    }

    // Parse and validate request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400)
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return createErrorResponse('Email and password must be strings', 400)
    }

    // Validate email format
    if (!validateEmail(email)) {
      return createErrorResponse('Invalid email format', 400)
    }

    // Validate password length (basic check)
    if (password.length < 1) {
      return createErrorResponse('Password cannot be empty', 400)
    }

    // Connect to database with error handling
    try {
      await dbConnect()
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return createErrorResponse('Service temporarily unavailable', 503)
    }

    // Find user by email (case-insensitive)
    let user
    try {
      user = await (User as any).findOne({ 
        email: email.toLowerCase().trim() 
      }).select('+password') // Explicitly include password field
    } catch (dbError) {
      console.error('User lookup failed:', dbError)
      return createErrorResponse('Service temporarily unavailable', 503)
    }

    if (!user) {
      // Use same delay as successful login to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      return createErrorResponse('Invalid credentials', 401)
    }

    // Compare password with error handling
    let isPasswordValid = false
    try {
      isPasswordValid = await comparePassword(password, user.password)
    } catch (passwordError) {
      console.error('Password comparison failed:', passwordError)
      return createErrorResponse('Authentication failed', 500)
    }

    if (!isPasswordValid) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Check if user account is active/verified (if needed)
    // if (!user.isVerified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
    //   return createErrorResponse('Please verify your email before logging in', 403)
    // }

    // Generate tokens
    let token: string
    let refreshToken: string
    
    try {
      token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        institution: user.institution
      })
      
      refreshToken = generateRefreshToken(user._id.toString())
    } catch (tokenError) {
      console.error('Token generation failed:', tokenError)
      return createErrorResponse('Authentication failed', 500)
    }

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      institution: user.institution,
      avatar: user.avatar,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    // Log successful login (without sensitive data)
    console.log(`✅ User login successful: ${user.email} (${user.role})`)

    // Create secure response with tokens
    return createAuthResponse(
      { 
        user: userData, 
        message: 'Login successful' 
      }, 
      token, 
      refreshToken
    )

  } catch (error) {
    console.error('Login error:', error)
    
    // Don't leak internal error details
    return createErrorResponse(
      process.env.NODE_ENV === 'development' 
        ? `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Internal server error',
      500
    )
  }
}
