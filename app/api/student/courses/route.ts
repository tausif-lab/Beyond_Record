import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Course, Enrollment, User } from "@/lib/models"
import { verifyTokenFromRequest } from "@/lib/jwt"

// GET - Get available courses for enrollment
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (payload.role !== 'student') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Connect to database
    await dbConnect()

    // Get user's institution
    const user = await (User as any).findById(payload.userId).select('institution')
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all courses (for now, we'll show all courses regardless of institution)
    // In a real system, you'd filter by institution
    const allCourses = await (Course as any).find({}).sort({ name: 1 })

    // Get student's current enrollments
    const enrollments = await (Enrollment as any).find({ studentId: payload.userId })
    const enrolledCourseIds = enrollments.map((e: any) => e.courseId)

    // Separate enrolled and available courses
    const enrolledCourses = allCourses.filter((course: any) => 
      enrolledCourseIds.includes(course.courseId)
    ).map((course: any) => {
      const enrollment = enrollments.find((e: any) => e.courseId === course.courseId)
      return {
        ...course.toObject(),
        enrollment: {
          progress: enrollment?.progress || 0,
          grade: enrollment?.grade || null,
          status: enrollment?.status || 'enrolled',
          enrolledAt: enrollment?.enrolledAt
        }
      }
    })

    const availableCourses = allCourses.filter((course: any) => 
      !enrolledCourseIds.includes(course.courseId)
    ).map((course: any) => course.toObject())

    return NextResponse.json({
      enrolledCourses,
      availableCourses,
      totalEnrolled: enrolledCourses.length,
      totalAvailable: availableCourses.length
    })

  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Enroll in a course
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (payload.role !== 'student') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Check if course exists
    const course = await (Course as any).findOne({ courseId })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await (Enrollment as any).findOne({
      studentId: payload.userId,
      courseId: courseId
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 })
    }

    // Create enrollment
    const enrollment = new Enrollment({
      studentId: payload.userId,
      courseId: courseId,
      progress: 0,
      status: 'enrolled',
      enrolledAt: new Date()
    })

    await enrollment.save()

    // Add student to course
    await (Course as any).findOneAndUpdate(
      { courseId },
      { $addToSet: { students: payload.userId } }
    )

    return NextResponse.json({
      message: "Successfully enrolled in course",
      enrollment: {
        courseId: course.courseId,
        courseName: course.name,
        instructor: course.instructor,
        credits: course.credits,
        progress: 0,
        status: 'enrolled',
        enrolledAt: enrollment.enrolledAt
      }
    })

  } catch (error) {
    console.error('Course enrollment error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}