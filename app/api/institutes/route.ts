import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Institute } from "@/lib/models/institute"
import { rateLimit } from "@/lib/rate-limit"

// GET /api/institutes - Get list of active institutes
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 60000, 30) // 30 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          timestamp: new Date().toISOString()
        }, 
        { status: 429 }
      )
    }

    // Connect to database
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    const query: any = {
      'settings.isActive': true
    }

    // Add search filter
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { shortName: { $regex: search.trim(), $options: 'i' } },
        { code: { $regex: search.trim(), $options: 'i' } },
        { 'address.city': { $regex: search.trim(), $options: 'i' } },
        { 'address.country': { $regex: search.trim(), $options: 'i' } }
      ]
    }

    // Add type filter
    if (type && ['university', 'college', 'school', 'institute', 'academy', 'center'].includes(type)) {
      query.type = type
    }

    // Add category filter
    if (category && ['public', 'private', 'government', 'autonomous'].includes(category)) {
      query.category = category
    }

    // Execute query with proper pagination
    const institutes = await (Institute as any).find(query)
      .select('code name shortName type category contact.email address.city address.country stats.totalStudents settings.logoUrl')
      .sort({ name: 1 })
      .limit(Math.min(limit, 100)) // Cap at 100
      .skip(offset)
      .lean()

    // Get total count for pagination
    const totalCount = await (Institute as any).countDocuments(query)

    // Transform data for frontend
    const formattedInstitutes = institutes.map((institute: any) => ({
      code: institute.code,
      name: institute.name,
      shortName: institute.shortName,
      displayName: institute.shortName || institute.name,
      type: institute.type,
      category: institute.category,
      email: institute.contact?.email,
      location: [institute.address?.city, institute.address?.country].filter(Boolean).join(', '),
      totalStudents: institute.stats?.totalStudents || 0,
      logoUrl: institute.settings?.logoUrl
    }))

    return NextResponse.json({
      success: true,
      data: {
        institutes: formattedInstitutes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get institutes error:', error)
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? `Failed to get institutes: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Failed to get institutes',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST /api/institutes - Create a new institute (admin only)
export async function POST(request: NextRequest) {
  try {
    // Apply stricter rate limiting for creation
    const rateLimitResult = await rateLimit(request, 300000, 5) // 5 requests per 5 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          timestamp: new Date().toISOString()
        }, 
        { status: 429 }
      )
    }

    // TODO: Add authentication check for admin role
    // const authResult = await authenticateRequest(request)
    // if (authResult.error || authResult.user.role !== 'admin') {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const { 
      code, 
      name, 
      shortName,
      type = 'college',
      category = 'public',
      contact,
      address,
      academic = {},
      settings = {}
    } = body

    // Validate required fields
    if (!code || !name || !contact?.email || !address?.city || !address?.country) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code, name, contact.email, address.city, address.country',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Check if institute with same code already exists
    const existingInstitute = await (Institute as any).findOne({ code: code.toUpperCase() })
    if (existingInstitute) {
      return NextResponse.json({
        success: false,
        error: 'An institute with this code already exists',
        timestamp: new Date().toISOString()
      }, { status: 409 })
    }

    // Create new institute
    const newInstitute = new Institute({
      code: code.toUpperCase(),
      name: name.trim(),
      shortName: shortName?.trim(),
      type,
      category,
      contact: {
        email: contact.email.toLowerCase().trim(),
        phone: contact.phone?.trim(),
        website: contact.website?.trim()
      },
      address: {
        street: address.street?.trim(),
        city: address.city.trim(),
        state: address.state?.trim(),
        country: address.country.trim(),
        zipCode: address.zipCode?.trim()
      },
      academic: {
        departments: academic.departments || [],
        programs: academic.programs || [],
        establishedYear: academic.establishedYear,
        studentCapacity: academic.studentCapacity,
        currentEnrollment: academic.currentEnrollment || 0
      },
      settings: {
        isActive: true,
        allowSelfRegistration: settings.allowSelfRegistration !== false,
        requireEmailVerification: settings.requireEmailVerification === true,
        allowPortfolioSharing: settings.allowPortfolioSharing !== false,
        ...settings
      },
      stats: {
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        totalPrograms: 0
      },
      isVerified: false
    })

    await newInstitute.save()

    console.log(`✅ New institute created: ${newInstitute.code} - ${newInstitute.name}`)

    return NextResponse.json({
      success: true,
      data: {
        institute: {
          id: newInstitute._id.toString(),
          code: newInstitute.code,
          name: newInstitute.name,
          shortName: newInstitute.shortName,
          type: newInstitute.type,
          category: newInstitute.category,
          isActive: newInstitute.settings.isActive
        }
      },
      message: 'Institute created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('Create institute error:', error)
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? `Failed to create institute: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Failed to create institute',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}