import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { StudentProfile, User, PendingAchievement, Notification } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.role !== 'student') return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    await dbConnect()
    
    // Get verified achievements from student profile
    const profile = await (StudentProfile as any).findOne({ userId: payload.userId }).select('achievements')
    const verifiedAchievements = profile?.achievements || []
    
    // Get pending/rejected achievements from verification queue
    const pendingAchievements = await (PendingAchievement as any).find({ 
      studentId: payload.userId 
    }).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      achievements: verifiedAchievements,
      pendingAchievements: pendingAchievements
    })
  } catch (e) {
    console.error('Achievements GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.role !== 'student') return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    await dbConnect()

    const form = await request.formData()
    const title = String(form.get('title') || '')
    const description = String(form.get('description') || '')
    const date = String(form.get('date') || '')
    const category = String(form.get('category') || 'other')
    const file = form.get('evidence') as File | null

    if (!title || !description || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user details
    const user = await (User as any).findById(payload.userId).select('name email institution')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let evidenceFiles: any[] = []

    if (file && typeof file.arrayBuffer === 'function') {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'achievements')
      await fs.mkdir(uploadsDir, { recursive: true })
      const ext = path.extname(file.name) || '.bin'
      const fileName = `evidence_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`
      const filePath = path.join(uploadsDir, fileName)
      await fs.writeFile(filePath, buffer)
      
      evidenceFiles.push({
        filename: `/uploads/achievements/${fileName}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date()
      })
    }

    // Create pending achievement for verification
    const pendingAchievement = new PendingAchievement({
      studentId: user._id,
      studentName: user.name,
      studentEmail: user.email,
      institution: user.institution || 'Demo University',
      title,
      description,
      date,
      category,
      evidenceFiles,
      status: 'pending'
    })

    await pendingAchievement.save()

    // Create notifications for faculty members of the same institution
    const facultyMembers = await (User as any).find({
      role: 'faculty',
      institution: user.institution || 'Demo University'
    })

    const notifications = facultyMembers.map((faculty: any) => ({
      userId: faculty._id,
      title: 'New Achievement Submission',
      message: `${user.name} has submitted an achievement "${title}" for verification.`,
      type: 'info',
      actionUrl: '/dashboard/faculty?tab=achievements',
      isRead: false
    }))

    if (notifications.length > 0) {
      await (Notification as any).insertMany(notifications)
    }

    return NextResponse.json({ 
      message: 'Achievement submitted for verification',
      pendingAchievement
    })
  } catch (e) {
    console.error('Achievement POST error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
