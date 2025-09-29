// Fake notifications system for the dummy prototype
// In production: implement real push notifications and email system

export interface Notification
{
    id: string
    title: string
    message: string
    type: "info" | "success" | "warning" | "error"
    timestamp: number
    read: boolean
    actionUrl?: string
    userId: string
}

export class NotificationService
{
    private static instance: NotificationService
    private notifications: Notification[] = []
    private listeners: ((notifications: Notification[]) => void)[] = []

    static getInstance(): NotificationService
    {
        if (!NotificationService.instance)
        {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    constructor()
    {
        this.loadNotifications()
        this.startMockNotificationGenerator()
    }

    // Load notifications from localStorage
    private loadNotifications(): void
    {
        if (typeof window === "undefined") return

        const stored = localStorage.getItem("notifications")
        if (stored)
        {
            try
            {
                this.notifications = JSON.parse(stored)
            } catch
            {
                this.notifications = []
            }
        }
    }

    // Save notifications to localStorage
    private saveNotifications(): void
    {
        if (typeof window === "undefined") return
        localStorage.setItem("notifications", JSON.stringify(this.notifications))
    }

    // Add a new notification
    addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): void
    {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            read: false,
        }

        this.notifications.unshift(newNotification)
        this.saveNotifications()
        this.notifyListeners()

        // Show browser notification if permission granted
        this.showBrowserNotification(newNotification)
    }

    // Get notifications for a user
    getNotifications(userId: string): Notification[]
    {
        return this.notifications.filter((n) => n.userId === userId).slice(0, 50) // Limit to 50 recent
    }

    // Get unread count for a user
    getUnreadCount(userId: string): number
    {
        return this.notifications.filter((n) => n.userId === userId && !n.read).length
    }

    // Mark notification as read
    markAsRead(notificationId: string): void
    {
        const notification = this.notifications.find((n) => n.id === notificationId)
        if (notification)
        {
            notification.read = true
            this.saveNotifications()
            this.notifyListeners()
        }
    }

    // Mark all notifications as read for a user
    markAllAsRead(userId: string): void
    {
        this.notifications.forEach((n) =>
        {
            if (n.userId === userId)
            {
                n.read = true
            }
        })
        this.saveNotifications()
        this.notifyListeners()
    }

    // Delete notification
    deleteNotification(notificationId: string): void
    {
        this.notifications = this.notifications.filter((n) => n.id !== notificationId)
        this.saveNotifications()
        this.notifyListeners()
    }

    // Subscribe to notification updates
    subscribe(callback: (notifications: Notification[]) => void): () => void
    {
        this.listeners.push(callback)
        return () =>
        {
            this.listeners = this.listeners.filter((listener) => listener !== callback)
        }
    }

    // Notify all listeners
    private notifyListeners(): void
    {
        this.listeners.forEach((listener) => listener(this.notifications))
    }

    // Show browser notification
    private showBrowserNotification(notification: Notification): void
    {
        if (typeof window === "undefined" || !("Notification" in window)) return

        if (Notification.permission === "granted")
        {
            new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico",
                tag: notification.id,
            })
        }
    }

    // Request notification permission
    async requestPermission(): Promise<NotificationPermission>
    {
        if (typeof window === "undefined" || !("Notification" in window))
        {
            return "denied"
        }

        return await Notification.requestPermission()
    }

    // Start generating mock notifications for demo
    private startMockNotificationGenerator(): void
    {
        if (typeof window === "undefined") return

        // Generate mock notifications every 30 seconds for demo
        setInterval(() =>
        {
            const mockNotifications = [
                {
                    title: "Assignment Due Soon",
                    message: "Your Database Systems project is due in 2 days",
                    type: "warning" as const,
                    userId: "1", // Student user
                    actionUrl: "/dashboard/student",
                },
                {
                    title: "New Grade Posted",
                    message: "Your Web Development assignment has been graded",
                    type: "info" as const,
                    userId: "1",
                    actionUrl: "/dashboard/student",
                },
                {
                    title: "Portfolio Approved",
                    message: "Your portfolio submission has been approved by Dr. Smith",
                    type: "success" as const,
                    userId: "1",
                    actionUrl: "/portfolio/generator",
                },
                {
                    title: "New Student Submission",
                    message: "John Student submitted a portfolio for review",
                    type: "info" as const,
                    userId: "2", // Faculty user
                    actionUrl: "/dashboard/faculty",
                },
                {
                    title: "System Maintenance",
                    message: "Scheduled maintenance tonight from 2-4 AM",
                    type: "warning" as const,
                    userId: "3", // Admin user
                    actionUrl: "/dashboard/admin",
                },
            ]

            // Randomly select and add a notification
            const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]

            // Only add if there are fewer than 10 unread notifications for this user
            if (this.getUnreadCount(randomNotification.userId) < 10)
            {
                this.addNotification(randomNotification)
            }
        }, 30000) // Every 30 seconds
    }
}

export const notificationService = NotificationService.getInstance()

// Utility functions for common notification operations
export function sendWelcomeNotification(userId: string, userName: string): void
{
    notificationService.addNotification({
        title: "Welcome to Beyond Record!",
        message: `Hi ${userName}, welcome to the platform. Start by completing your profile.`,
        type: "success",
        userId,
        actionUrl: "/dashboard/student",
    })
}

export function sendDeadlineReminder(userId: string, assignmentName: string, daysLeft: number): void
{
    notificationService.addNotification({
        title: "Assignment Reminder",
        message: `${assignmentName} is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        type: daysLeft <= 1 ? "error" : "warning",
        userId,
        actionUrl: "/dashboard/student",
    })
}

export function sendGradeNotification(userId: string, courseName: string, grade: string): void
{
    notificationService.addNotification({
        title: "New Grade Posted",
        message: `Your ${courseName} assignment received a grade of ${grade}`,
        type: "info",
        userId,
        actionUrl: "/dashboard/student",
    })
}
