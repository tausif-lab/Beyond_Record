import { type NextRequest } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User, StudentProfile } from "@/lib/models"
import { 
  hashPassword, 
  generateToken, 
  generateRefreshToken,
  validateEmail, 
  validatePassword, 
  generateStudentId, 
  createAuthResponse,
  createErrorResponse 
} from "@/lib/jwt"
import { authRateLimit } from "@/lib/rate-limit"
import seedData, { createStudentEnrollments, addSampleAchievements } from "@/scripts/seedData"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for registration
    const rateLimitResult = await authRateLimit(request)
    if (!rateLimitResult.success) {
      return createErrorResponse('Too many registration attempts. Please try again later.', 429)
    }

    // Parse and validate request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    const { email, password, name, role, institutionId } = body

    // Validate required fields
    if (!email || !password || !name || !role) {
      return createErrorResponse('Missing required fields: email, password, name, and role are required', 400)
    }

    if (typeof email !== 'string' || typeof password !== 'string' || 
        typeof name !== 'string' || typeof role !== 'string') {
      return createErrorResponse('All fields must be strings', 400)
    }

    // Validate email format
    if (!validateEmail(email)) {
      return createErrorResponse('Invalid email format', 400)
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return createErrorResponse(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400)
    }

    // Validate role
    const allowedRoles = ['student', 'faculty', 'admin', 'institution']
    if (!allowedRoles.includes(role)) {
      return createErrorResponse(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`, 400)
    }

    // Validate name length
    if (name.trim().length < 2) {
      return createErrorResponse('Name must be at least 2 characters long', 400)
    }

    if (name.length > 100) {
      return createErrorResponse('Name must be less than 100 characters', 400)
    }

    // Connect to database with error handling
    try {
      await dbConnect()
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return createErrorResponse('Service temporarily unavailable', 503)
    }

    // Check if user already exists
    try {
      const existingUser = await (User as any).findOne({ email: email.toLowerCase().trim() })
      if (existingUser) {
        return createErrorResponse('An account with this email already exists', 409)
      }
    } catch (dbError) {
      console.error('User existence check failed:', dbError)
      return createErrorResponse('Service temporarily unavailable', 503)
    }

    // Hash password with error handling
    let hashedPassword: string
    try {
      hashedPassword = await hashPassword(password)
    } catch (hashError) {
      console.error('Password hashing failed:', hashError)
      return createErrorResponse('Registration failed', 500)
    }

    // Get institution information if institutionId provided
    let institutionName = "Demo University"
    
    if (institutionId && typeof institutionId === 'string' && institutionId.trim()) {
      try {
        // Import the Institute model
        const { Institute } = await import('@/lib/models/institute')
        
        // Try to find institute by code, name, or ObjectId
        let institute = null
        
        // First try by code (most common case)
        if (institutionId.length <= 20) {
          institute = await (Institute as any).findOne({ 
            code: institutionId.toUpperCase().trim(),
            'settings.isActive': true
          })
        }
        
        // If not found and looks like ObjectId, try by ID
        if (!institute && institutionId.match(/^[0-9a-fA-F]{24}$/)) {
          institute = await (Institute as any).findOne({
            _id: institutionId,
            'settings.isActive': true
          })
        }
        
        // If not found, try by name (partial match)
        if (!institute) {
          institute = await (Institute as any).findOne({ 
            name: { $regex: new RegExp(institutionId.trim(), 'i') },
            'settings.isActive': true
          })
        }
        
        if (institute) {
          institutionName = institute.name
          console.log(`✅ Found institute: ${institute.code} - ${institute.name}`)
          
          // Check if self-registration is allowed for this institute
          if (!institute.settings.allowSelfRegistration && role !== 'admin') {
            return createErrorResponse(
              `Self-registration is not allowed for ${institute.name}. Please contact the institution for registration.`,
              403
            )
          }
        } else {
          console.warn(`⚠️ Institute not found: ${institutionId}`)
          // Don't fail registration, just use default
        }
        
      } catch (error) {
        console.warn('Institute lookup failed:', error)
        // Continue with default institution name
      }
    }

    // Create new user with error handling
    let newUser: any
    try {
      newUser = new User({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        role,
        institution: institutionName,
        isVerified: false,
      })

      await newUser.save()
      console.log(`✅ New user created: ${newUser.email} (${newUser.role})`)
    } catch (saveError) {
      console.error('User creation failed:', saveError)
      // Check if it's a duplicate key error
      if (saveError instanceof Error && saveError.message.includes('E11000')) {
        return createErrorResponse('An account with this email already exists', 409)
      }
      return createErrorResponse('Registration failed', 500)
    }

    // If user is a student, create student profile and sample data
    if (role === 'student') {
      try {
        const studentProfile = new StudentProfile({
          userId: newUser._id.toString(),
          studentId: generateStudentId(),
          major: "Computer Science", // Default major
          year: "Junior", // Default year
          gpa: 3.75,
          totalCredits: 89,
          completedCourses: 24,
          skills: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL'],
          achievements: [],
          socialLinks: {},
        })
        
        await studentProfile.save()
        console.log('✅ Student profile created')
        
        // Create sample data in background (don't wait)
        Promise.resolve().then(async () => {
          try {
            // Check if sample data exists
            const { Course } = await import('@/lib/models')
            const existingCourses = await (Course as any).countDocuments()
            
            if (existingCourses === 0) {
              console.log('🌱 Seeding sample course data...')
              await seedData()
            }
            
            // Create sample enrollments and achievements
            await createStudentEnrollments(newUser._id.toString())
            await addSampleAchievements(newUser._id.toString())
            console.log('✅ Sample data created for new student')
            
          } catch (error) {
            console.warn('⚠️ Sample data creation failed:', error)
            // Don't fail the registration
          }
        })
        
      } catch (profileError) {
        console.error('Student profile creation failed:', profileError)
        // Don't fail registration if profile creation fails
        // The user can complete their profile later
      }
    }

    // Generate tokens with error handling
    let token: string
    let refreshToken: string
    
    try {
      token = generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        institution: newUser.institution
      })
      
      refreshToken = generateRefreshToken(newUser._id.toString())
    } catch (tokenError) {
      console.error('Token generation failed:', tokenError)
      return createErrorResponse('Registration failed', 500)
    }

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      institution: newUser.institution,
      avatar: newUser.avatar,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }

    // Log successful registration (without sensitive data)
    console.log(`✅ User registration successful: ${newUser.email} (${newUser.role}) at ${institutionName}`)

    // Create secure response with tokens
    return createAuthResponse(
      { 
        user: userData, 
        message: 'Registration successful',
        needsEmailVerification: !newUser.isVerified 
      }, 
      token, 
      refreshToken
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Don't leak internal error details
    return createErrorResponse(
      process.env.NODE_ENV === 'development' 
        ? `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Registration failed. Please try again.',
      500
    )
  }
}
