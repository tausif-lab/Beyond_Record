import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { StudentProfile, User } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'

export async function POST(request: NextRequest, { params }: { params: { achievementId: string } }) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.role !== 'faculty' && payload.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    await dbConnect()

    const verifier = await (User as any).findById(payload.userId).select('name institution')
    if (!verifier) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { achievementId } = params

    // Find the student profile containing this achievement first
    const profile = await (StudentProfile as any).findOne({ 'achievements._id': achievementId })
    if (!profile) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })

    // Get the specific achievement
    const achievement: any = (profile as any).achievements.id(achievementId)
    if (!achievement) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })

    // Enforce same institution
    if (achievement.institution !== verifier.institution) {
      return NextResponse.json({ error: 'Institution mismatch' }, { status: 403 })
    }

    // Verify the achievement
    achievement.verified = true
    achievement.verifiedBy = verifier.name
    achievement.verifiedAt = new Date()
    await profile.save()

    return NextResponse.json({ message: 'Achievement verified', achievementId })
  } catch (e) {
    console.error('Verify achievement error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
