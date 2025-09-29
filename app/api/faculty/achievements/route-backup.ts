import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { PendingAchievement, User, StudentProfile, Notification } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'

// GET - Get pending achievements for faculty review
export async function GET(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.role !== 'faculty') return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    await dbConnect()

    // Get faculty user to determine institution
    const faculty = await (User as any).findById(payload.userId).select('institution')
    if (!faculty) return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Get achievements for faculty's institution
    const query: any = { institution: faculty.institution || 'Demo University' }
    if (status !== 'all') {
      query.status = status
    }

    const achievements = await (PendingAchievement as any).find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ achievements })
  } catch (e) {
    console.error('Faculty achievements GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Verify or reject achievement
export async function POST(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.role !== 'faculty') return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    await dbConnect()

    const body = await request.json()
    const { achievementId, action, comments } = body

    if (!achievementId || !action || !['verify', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get faculty user details
    const faculty = await (User as any).findById(payload.userId).select('name institution')
    if (!faculty) return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })

    // Get the pending achievement
    const pendingAchievement = await (PendingAchievement as any).findById(achievementId)
    if (!pendingAchievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Check if faculty belongs to same institution
    if (pendingAchievement.institution !== (faculty.institution || 'Demo University')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (action === 'verify') {
      // Move to verified achievements in student profile
      const achievementData = {
        title: pendingAchievement.title,
        description: pendingAchievement.description,
        date: pendingAchievement.date,
        icon: 'Award', // Default icon for verified achievements
        evidenceUrl: pendingAchievement.evidenceFiles[0]?.filename || undefined,
        institution: pendingAchievement.institution,
        verified: true,
        verifiedBy: faculty.name,
        verifiedAt: new Date()
      }

      // Add to student profile
      await (StudentProfile as any).findOneAndUpdate(
        { userId: pendingAchievement.studentId },
        { $push: { achievements: achievementData } },
        { upsert: true }
      )

      // Update pending achievement status
      pendingAchievement.status = 'verified'
      pendingAchievement.reviewedBy = faculty.name
      pendingAchievement.reviewedAt = new Date()
      pendingAchievement.reviewComments = comments
      await pendingAchievement.save()

      // Create notification for student
      await (Notification as any).create({
        userId: pendingAchievement.studentId,
        title: 'Achievement Verified',
        message: `Your achievement "${pendingAchievement.title}" has been verified by ${faculty.name}.`,
        type: 'success',
        actionUrl: '/dashboard/student?tab=achievements',
        isRead: false
      })

      return NextResponse.json({ 
        message: 'Achievement verified successfully',
        achievement: pendingAchievement 
      })

    } else if (action === 'reject') {
      // Update pending achievement status to rejected
      pendingAchievement.status = 'rejected'
      pendingAchievement.reviewedBy = faculty.name
      pendingAchievement.reviewedAt = new Date()
      pendingAchievement.reviewComments = comments
      await pendingAchievement.save()

      // Create notification for student
      await (Notification as any).create({
        userId: pendingAchievement.studentId,
        title: 'Achievement Rejected',
        message: `Your achievement "${pendingAchievement.title}" was not approved. ${comments ? 'Reason: ' + comments : ''}`,
        type: 'warning',
        actionUrl: '/dashboard/student?tab=achievements',
        isRead: false
      })

      return NextResponse.json({ 
        message: 'Achievement rejected',
        achievement: pendingAchievement 
      })
    }

    // Default return for unknown actions
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (e) {
    console.error('Faculty achievement verification error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}