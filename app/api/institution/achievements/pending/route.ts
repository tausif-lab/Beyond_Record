import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { StudentProfile, User } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.role !== 'faculty' && payload.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    await dbConnect()

    // viewer's institution (string name)
    const viewer = await (User as any).findById(payload.userId).select('institution')
    if (!viewer) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Find student profiles that have pending achievements for this institution
    const profiles = await (StudentProfile as any).find({ 'achievements.verified': false, 'achievements.institution': viewer.institution })
      .select('userId achievements')
      .lean()

    // Join user basic info
    const userIds = profiles.map((p: any) => p.userId)
    const users = await (User as any).find({ _id: { $in: userIds } }).select('name email institution').lean()
    const userMap = new Map(users.map((u: any) => [String(u._id), u]))

    const pending = [] as any[]
    for (const profile of profiles) {
      for (const ach of (profile as any).achievements) {
        if (!ach.verified && ach.institution === viewer.institution) {
          const u: any = userMap.get(String(profile.userId))
          pending.push({
            achievementId: String(ach._id),
            userId: String(profile.userId),
            studentName: u?.name,
            studentEmail: u?.email,
            institution: u?.institution,
            title: ach.title,
            description: ach.description,
            date: ach.date,
            icon: ach.icon,
            evidenceUrl: ach.evidenceUrl || null,
          })
        }
      }
    }

    return NextResponse.json({ pending })
  } catch (e) {
    console.error('Pending achievements GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
