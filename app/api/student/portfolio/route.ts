import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User, Portfolio, StudentProfile, Enrollment, Course } from "@/lib/models"
import { verifyTokenFromRequest, generatePortfolioShareUrl } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Get existing portfolio or create default one
    let portfolio = await (Portfolio as any).findOne({ userId: payload.userId })
    
    if (!portfolio) {
      // Get user and student profile for default data
      const user = await (User as any).findById(payload.userId).select('-password')
      const studentProfile = await (StudentProfile as any).findOne({ userId: payload.userId })
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Create default portfolio with user data
      portfolio = new Portfolio({
        userId: payload.userId,
        template: 'modern',
        personalInfo: {
          name: user.name,
          email: user.email,
          summary: studentProfile?.bio || `${studentProfile?.major || 'Computer Science'} student with a passion for learning and technology.`,
        },
        education: [{
          institution: user.institution || 'Demo University',
          degree: `Bachelor of Science in ${studentProfile?.major || 'Computer Science'}`,
          gpa: studentProfile?.gpa?.toString() || '0.00',
          startDate: '2021',
          endDate: '2025',
          achievements: studentProfile?.achievements?.map((a: any) => a.title) || []
        }],
        experience: [],
        projects: [],
        skills: {
          technical: studentProfile?.skills || ['JavaScript', 'Python', 'Java'],
          frameworks: ['React', 'Node.js', 'Express'],
          tools: ['Git', 'VS Code', 'Docker'],
          databases: ['MongoDB', 'PostgreSQL']
        },
        isPublic: false,
        completionRate: 25, // Basic info filled
      })

      await portfolio.save()
    }

    // Generate share URL if not exists
    if (!portfolio.shareUrl) {
      portfolio.shareUrl = generatePortfolioShareUrl(payload.userId, portfolio.personalInfo.name)
      await portfolio.save()
    }

    return NextResponse.json({
      portfolio
    })

  } catch (error) {
    console.error('Get portfolio error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // Connect to database
    await dbConnect()

    // Calculate completion rate based on filled fields
    const calculateCompletionRate = (data: any): number => {
      let totalFields = 0
      let filledFields = 0

      // Personal info (30%)
      const personalFields = ['name', 'email', 'phone', 'location', 'summary', 'linkedin', 'github']
      personalFields.forEach(field => {
        totalFields++
        if (data.personalInfo && data.personalInfo[field]) filledFields++
      })

      // Education (20%)
      totalFields += 2
      if (data.education && data.education.length > 0) {
        filledFields += 2
      }

      // Experience (25%)
      totalFields += 2
      if (data.experience && data.experience.length > 0) {
        filledFields += Math.min(2, data.experience.length)
      }

      // Projects (15%)
      totalFields += 1
      if (data.projects && data.projects.length > 0) {
        filledFields += 1
      }

      // Skills (10%)
      totalFields += 1
      if (data.skills && (data.skills.technical?.length > 0 || 
                          data.skills.frameworks?.length > 0 || 
                          data.skills.tools?.length > 0)) {
        filledFields += 1
      }

      return Math.round((filledFields / totalFields) * 100)
    }

    const completionRate = calculateCompletionRate(updateData)

    // Update portfolio
    const updatedPortfolio = await (Portfolio as any).findOneAndUpdate(
      { userId: payload.userId },
      {
        ...updateData,
        completionRate,
        lastUpdated: new Date(),
      },
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    )

    return NextResponse.json({
      message: "Portfolio updated successfully",
      portfolio: updatedPortfolio
    })

  } catch (error) {
    console.error('Update portfolio error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    // Connect to database
    await dbConnect()

    const portfolio = await (Portfolio as any).findOne({ userId: payload.userId })
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    switch (action) {
      case 'generate_share_url':
        if (!portfolio.shareUrl) {
          portfolio.shareUrl = generatePortfolioShareUrl(payload.userId, portfolio.personalInfo.name)
          await portfolio.save()
        }
        return NextResponse.json({ shareUrl: portfolio.shareUrl })

      case 'toggle_public':
        portfolio.isPublic = !portfolio.isPublic
        await portfolio.save()
        return NextResponse.json({ 
          message: `Portfolio is now ${portfolio.isPublic ? 'public' : 'private'}`,
          isPublic: portfolio.isPublic 
        })

      case 'auto_populate':
        // Auto-populate portfolio with student data
        const user = await (User as any).findById(payload.userId).select('-password')
        const studentProfile = await (StudentProfile as any).findOne({ userId: payload.userId })
        const enrollments = await (Enrollment as any).find({ studentId: payload.userId, status: 'completed' })
        const courseIds = enrollments.map((e: any) => e.courseId)
        const courses = await (Course as any).find({ courseId: { $in: courseIds } })

        if (user && studentProfile) {
          // Update education section
          portfolio.education = [{
            institution: user.institution || 'Demo University',
            degree: `Bachelor of Science in ${studentProfile.major}`,
            gpa: studentProfile.gpa?.toString() || '0.00',
            startDate: '2021',
            endDate: '2025',
            achievements: studentProfile.achievements?.map((a: any) => a.title) || []
          }]

          // Update skills from profile
          if (studentProfile.skills && studentProfile.skills.length > 0) {
            portfolio.skills.technical = studentProfile.skills
          }

          // Add coursework as "projects" if no real projects
          if (portfolio.projects.length === 0 && courses.length > 0) {
            portfolio.projects = courses.slice(0, 3).map((course: any) => ({
              name: course.name,
              description: course.description || `Coursework in ${course.name} covering essential concepts and practical applications.`,
              technologies: ['Academic Project'],
              github: '',
              demo: '',
              image: ''
            }))
          }

          await portfolio.save()
        }

        return NextResponse.json({
          message: "Portfolio auto-populated with your academic data",
          portfolio
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error('Portfolio action error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
