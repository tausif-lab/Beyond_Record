import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User, StudentProfile, Enrollment, Course, Assignment, PendingAchievement } from "@/lib/models"
import { verifyTokenFromRequest } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyTokenFromRequest(request)
    if (!payload) {
      console.log('❌ Student Profile: No valid token found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (payload.role !== 'student') {
      console.log(`❌ Student Profile: Access denied for role '${payload.role}' (email: ${payload.email})`)
      return NextResponse.json({ error: "Access denied - Faculty users should use faculty endpoints" }, { status: 403 })
    }

    console.log(`✅ Student Profile: Access granted for student ${payload.email}`)

    // Connect to database
    await dbConnect()

    // Get user data
    const user = await (User as any).findById(payload.userId).select('-password')
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get student profile
    let studentProfile = await (StudentProfile as any).findOne({ userId: payload.userId })
    
    // If no profile exists, create one
    if (!studentProfile) {
      studentProfile = new StudentProfile({
        userId: payload.userId,
        studentId: `STU${new Date().getFullYear()}${Math.floor(Math.random() * 9000) + 1000}`,
        major: "Computer Science",
        year: "Freshman",
        gpa: 0,
        totalCredits: 0,
        completedCourses: 0,
        skills: [],
        achievements: [],
        socialLinks: {},
      })
      await studentProfile.save()
    }

    // Get enrollments and courses
    const enrollments = await (Enrollment as any).find({ studentId: payload.userId })
    const courseIds = enrollments.map((e: any) => e.courseId)
    const courses = await (Course as any).find({ courseId: { $in: courseIds } })

    // Get assignments for enrolled courses
    const assignments = await (Assignment as any).find({ 
      courseId: { $in: courseIds },
      status: 'published'
    }).sort({ dueDate: 1 })

    // Get upcoming deadlines (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const upcomingDeadlines = assignments
      .filter((assignment: any) => assignment.dueDate <= thirtyDaysFromNow && assignment.dueDate >= new Date())
      .map((assignment: any) => {
        const course = courses.find((c: any) => c.courseId === assignment.courseId)
        const daysUntilDue = Math.ceil((assignment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        let priority = 'low'
        if (daysUntilDue <= 1) priority = 'high'
        else if (daysUntilDue <= 3) priority = 'medium'
        
        return {
          title: assignment.title,
          course: course?.name || assignment.courseId,
          dueDate: assignment.dueDate.toISOString().split('T')[0],
          priority,
          type: assignment.type
        }
      })

    // Calculate progress for each course
    const coursesProgress = enrollments.map((enrollment: any) => {
      const course = courses.find((c: any) => c.courseId === enrollment.courseId)
      return {
        name: course?.name || enrollment.courseId,
        progress: enrollment.progress,
        grade: enrollment.grade || 'In Progress',
        credits: course?.credits || 3,
        instructor: course?.instructor || 'Unknown'
      }
    })

    // Calculate overall GPA and stats
    const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed' && e.finalGrade)
    const totalGradePoints = completedEnrollments.reduce((sum: any, e: any) => sum + (e.finalGrade || 0), 0)
    const gpa = completedEnrollments.length > 0 ? (totalGradePoints / completedEnrollments.length / 25) : 0 // Assuming 100-point scale converted to 4.0

    const stats = {
      completedCourses: completedEnrollments.length,
      totalCredits: completedEnrollments.reduce((sum: any, e: any) => {
        const course = courses.find((c: any) => c.courseId === e.courseId)
        return sum + (course?.credits || 0)
      }, 0),
      currentGPA: Math.round(gpa * 100) / 100,
      rank: studentProfile.rank || Math.floor(Math.random() * 50) + 1,
      totalStudents: studentProfile.totalStudents || 120,
    }

    // Update student profile with calculated values
    await (StudentProfile as any).findByIdAndUpdate(studentProfile._id, {
      gpa: stats.currentGPA,
      totalCredits: stats.totalCredits,
      completedCourses: stats.completedCourses,
    })

    // Mock recent activity for now
    const recentActivity = [
      { action: "Submitted assignment", course: "Web Development", time: "2 hours ago" },
      { action: "Completed quiz", course: "Data Structures", time: "1 day ago" },
      { action: "Joined study group", course: "Database Systems", time: "2 days ago" },
      { action: "Downloaded lecture notes", course: "Software Engineering", time: "3 days ago" },
    ]

    const profile = {
      name: user.name,
      email: user.email,
      studentId: studentProfile.studentId,
      major: studentProfile.major,
      year: studentProfile.year,
      gpa: stats.currentGPA,
      avatar: user.avatar || null,
      institution: user.institution,
    }

    const progress = {
      overall: Math.round((enrollments.reduce((sum: any, e: any) => sum + e.progress, 0) / (enrollments.length || 1))),
      courses: coursesProgress,
    }

    // Get all achievements (pending, verified, rejected)
    const allAchievements = await (PendingAchievement as any).find({ 
      studentId: payload.userId 
    }).sort({ createdAt: -1 })
    
    // Separate achievements by status for proper UI display
    const verifiedAchievements = allAchievements.filter((a: any) => a.status === 'verified')
    const pendingAndRejected = allAchievements.filter((a: any) => a.status === 'pending' || a.status === 'rejected')
    
    // Successfully fetched student achievements

    return NextResponse.json({
      profile,
      progress,
      stats,
      upcomingDeadlines: upcomingDeadlines.slice(0, 10), // Limit to 10 upcoming deadlines
      recentActivity,
      achievements: verifiedAchievements, // Now contains actual verified achievements
      pendingAchievements: pendingAndRejected, // Contains pending and rejected only
    })

  } catch (error) {
    console.error('Get student profile error:', error)
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

    if (payload.role !== 'student') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { major, year, bio, skills, socialLinks, institutionId, institution } = await request.json()

    // Connect to database
    await dbConnect()

    // Optionally update user's institution
    if (institutionId || institution) {
      const { Institution, User: UserModel } = require('@/lib/models')
      let institutionName = institution
      if (institutionId) {
        const inst = await (Institution as any).findOne({ institutionId: institutionId })
        if (!inst) {
          return NextResponse.json({ error: 'Invalid institution' }, { status: 400 })
        }
        institutionName = inst.name
      }
      await (UserModel as any).findByIdAndUpdate(payload.userId, { institution: institutionName })
    }

    // Update student profile
    const updatedProfile = await (StudentProfile as any).findOneAndUpdate(
      { userId: payload.userId },
      {
        ...(major && { major }),
        ...(year && { year }),
        ...(bio !== undefined && { bio }),
        ...(skills && { skills }),
        ...(socialLinks && { socialLinks }),
      },
      { new: true }
    )

    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Profile updated successfully",
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Update student profile error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
