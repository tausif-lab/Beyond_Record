"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, CheckCheck, Trash2, X, Award, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { authService } from "@/lib/auth"
import { toast } from "react-hot-toast"
import Link from "next/link"

interface Notification
{
    _id: string
    userId: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    isRead: boolean
    actionUrl?: string
    createdAt: string
    updatedAt: string
}

interface NotificationCenterProps
{
    isOpen: boolean
    onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps)
{
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [_loading, setLoading] = useState(false)
    const [user] = useState(authService.getCurrentUser())

    const fetchNotifications = async () =>
    {
        if (!user) return

        try
        {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok)
            {
                const data = await response.json()
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error)
        {
            console.error('Failed to fetch notifications:', error)
            toast.error('Failed to load notifications')
        } finally
        {
            setLoading(false)
        }
    }

    useEffect(() =>
    {
        if (isOpen && user)
        {
            fetchNotifications()
        }
    }, [isOpen, user])

    const handleMarkAsRead = async (notificationId: string) =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notificationIds: [notificationId] })
            })

            if (response.ok)
            {
                const data = await response.json()
                setUnreadCount(data.unreadCount)
                // Update local state
                setNotifications(prev =>
                    prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
                )
            }
        } catch (error)
        {
            console.error('Failed to mark notification as read:', error)
            toast.error('Failed to update notification')
        }
    }

    const handleMarkAllAsRead = async () =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ markAllAsRead: true })
            })

            if (response.ok)
            {
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                toast.success('All notifications marked as read')
            }
        } catch (error)
        {
            console.error('Failed to mark all as read:', error)
            toast.error('Failed to update notifications')
        }
    }

    const handleDelete = async (notificationId: string) =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch(`/api/notifications?id=${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok)
            {
                setNotifications(prev => prev.filter(n => n._id !== notificationId))
                toast.success('Notification deleted')
            }
        } catch (error)
        {
            console.error('Failed to delete notification:', error)
            toast.error('Failed to delete notification')
        }
    }

    const getNotificationIcon = (notification: Notification) =>
    {
        // Check if it's an achievement-related notification
        if (notification.title.includes('Achievement'))
        {
            if (notification.title.includes('Verified'))
            {
                return <CheckCircle className="h-4 w-4 text-green-600" />
            } else if (notification.title.includes('Rejected'))
            {
                return <XCircle className="h-4 w-4 text-red-600" />
            } else if (notification.title.includes('Submission'))
            {
                return <Clock className="h-4 w-4 text-yellow-600" />
            }
            return <Award className="h-4 w-4 text-blue-600" />
        }

        // Default icons based on type
        switch (notification.type)
        {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "warning":
                return <AlertCircle className="h-4 w-4 text-orange-600" />
            case "error":
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <Bell className="h-4 w-4 text-blue-600" />
        }
    }

    const formatTime = (dateString: string) =>
    {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (days > 0) return `${days}d ago`
        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return "Just now"
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
            <div className="fixed right-4 top-16 w-96 max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Bell className="mr-2 h-5 w-5" />
                                    Notifications
                                </CardTitle>
                                <CardDescription>
                                    {notifications.length} total, {unreadCount} unread
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                                    <CheckCheck className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={onClose}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-96">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        {getNotificationIcon(notification)}
                                                        <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                                                        {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</span>
                                                        {notification.actionUrl && (
                                                            <Link href={notification.actionUrl}>
                                                                <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() =>
                                                                {
                                                                    if (!notification.isRead)
                                                                    {
                                                                        handleMarkAsRead(notification._id)
                                                                    }
                                                                }}>
                                                                    View
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(notification._id)}
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
