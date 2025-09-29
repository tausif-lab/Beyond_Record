import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { PendingAchievement, User } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Try to get faculty info from token, fallback to demo
    const payload = verifyTokenFromRequest(request)
    let institution = 'Demo University'
    
    if (payload && payload.role === 'faculty') {
      const faculty = await (User as any).findById(payload.userId).select('institution')
      institution = faculty?.institution || 'Demo University'
    } else {
      // For demo, use first faculty member's institution
      const demoFaculty = await (User as any).findOne({ role: 'faculty' })
      if (demoFaculty) {
        institution = demoFaculty.institution || 'Demo University'
      }
    }

    // Get ALL achievements for this institution (pending, verified, rejected)
    const achievements = await (PendingAchievement as any).find({ 
      institution: institution 
    }).sort({ createdAt: -1 })
    
    // Successfully fetched achievements for institution

    // Separate by status for easier frontend handling
    const pending = achievements.filter((a: any) => a.status === 'pending')
    const verified = achievements.filter((a: any) => a.status === 'verified') 
    const rejected = achievements.filter((a: any) => a.status === 'rejected')

    return NextResponse.json({
      achievements,
      pending,
      verified,
      rejected,
      institution
    })
  } catch (e) {
    console.error('Faculty achievements GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { achievementId, action, feedback } = await request.json()
    
    if (!achievementId || !action) {
      return NextResponse.json({ error: 'Missing achievement ID or action' }, { status: 400 })
    }

    // Try to get faculty info
    const payload = verifyTokenFromRequest(request)
    let reviewedBy = 'Demo Faculty'
    
    if (payload && payload.role === 'faculty') {
      const faculty = await (User as any).findById(payload.userId).select('name')
      reviewedBy = faculty?.name || 'Demo Faculty'
    } else {
      const demoFaculty = await (User as any).findOne({ role: 'faculty' })
      if (demoFaculty) {
        reviewedBy = demoFaculty.name || 'Demo Faculty'
      }
    }

    const achievement = await (PendingAchievement as any).findById(achievementId)
    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Update achievement status
    achievement.status = action === 'approve' ? 'verified' : 'rejected'
    achievement.reviewedBy = reviewedBy
    achievement.reviewedAt = new Date()
    if (feedback) {
      achievement.feedback = feedback
    }

    await achievement.save()

    // If approved, could also add to StudentProfile.achievements here
    // For now, keeping all data in PendingAchievement for simplicity

    return NextResponse.json({
      message: `Achievement ${action}d successfully`,
      achievement
    })
  } catch (e) {
    console.error('Achievement approval error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}