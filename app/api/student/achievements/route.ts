import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { StudentProfile, User, PendingAchievement, Notification } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get student ID from URL params or use a default for testing
    const { searchParams } = new URL(request.url)
    let studentId = searchParams.get('studentId')
    
    // Try to get from token first
    const payload = verifyTokenFromRequest(request)
    if (payload && payload.role === 'student') {
      studentId = payload.userId
    } else {
      // For demo purposes, use the first student we can find
      const demoStudent = await (User as any).findOne({ role: 'student' })
      if (demoStudent) {
        studentId = demoStudent._id.toString()
      }
    }
    
    if (!studentId) {
      return NextResponse.json({ error: 'No student found' }, { status: 404 })
    }
    
    // Get verified achievements from student profile
    const profile = await (StudentProfile as any).findOne({ userId: studentId }).select('achievements')
    const verifiedAchievements = profile?.achievements || []
    
    // Get pending/rejected achievements from verification queue
    const pendingAchievements = await (PendingAchievement as any).find({ 
      studentId: studentId 
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

    // Try to get user from token, otherwise use demo user
    const payload = verifyTokenFromRequest(request)
    let user = null
    
    if (payload && payload.role === 'student') {
      user = await (User as any).findById(payload.userId).select('name email institution')
    } else {
      // For demo, use first student
      user = await (User as any).findOne({ role: 'student' }).select('name email institution')
    }
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 })
    }

    let evidenceFiles: any[] = []

    if (file && typeof file.arrayBuffer === 'function') {
      try {
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
      } catch (fileError) {
        console.error('File upload error:', fileError)
        // Continue without file
      }
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
    try {
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
    } catch (notifError) {
      console.error('Notification error:', notifError)
      // Continue without notifications
    }

    return NextResponse.json({ 
      message: 'Achievement submitted for verification',
      pendingAchievement
    })
  } catch (e) {
    console.error('Achievement POST error', e)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 })
  }
}