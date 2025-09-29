import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Notification } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'

// GET - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Build query
    const query: any = { userId: payload.userId }
    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await (Notification as any).find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Get counts
    const unreadCount = await Notification.countDocuments({ 
      userId: payload.userId, 
      isRead: false 
    })

    const totalCount = await Notification.countDocuments({ 
      userId: payload.userId 
    })

    return NextResponse.json({ 
      notifications,
      unreadCount,
      totalCount
    })
  } catch (e) {
    console.error('Notifications GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { userId: payload.userId, isRead: false },
        { $set: { isRead: true } }
      )
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          userId: payload.userId 
        },
        { $set: { isRead: true } }
      )
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get updated counts
    const unreadCount = await Notification.countDocuments({ 
      userId: payload.userId, 
      isRead: false 
    })

    return NextResponse.json({ 
      message: 'Notifications marked as read',
      unreadCount 
    })
  } catch (e) {
    console.error('Notifications PUT error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const payload = verifyTokenFromRequest(request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    await (Notification as any).deleteOne({ 
      _id: notificationId,
      userId: payload.userId 
    })

    return NextResponse.json({ message: 'Notification deleted' })
  } catch (e) {
    console.error('Notifications DELETE error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}