"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Award, FileText, Eye, User, Calendar, Building } from "lucide-react"
import { toast } from "react-hot-toast"

interface PendingAchievement
{
    _id: string
    studentId: string
    studentName: string
    studentEmail: string
    institution: string
    title: string
    description: string
    date: string
    category: string
    evidenceFiles: Array<{
        filename: string
        originalName: string
        mimeType: string
        size: number
        uploadedAt: string
    }>
    status: 'pending' | 'verified' | 'rejected'
    reviewedBy?: string
    reviewedAt?: string
    reviewComments?: string
    submittedAt: string
    createdAt: string
    updatedAt: string
}

export function AchievementVerification()
{
    const [achievements, setAchievements] = useState<PendingAchievement[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab] = useState("pending")
    const [selectedAchievement, setSelectedAchievement] = useState<PendingAchievement | null>(null)
    const [reviewComments, setReviewComments] = useState("")
    const [reviewing, setReviewing] = useState(false)

    const fetchAchievements = async (status: string = "pending", showToast = true) =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            if (!token)
            {
                if (showToast) toast.error('Authentication required')
                return
            }

            const response = await fetch(`/api/faculty/achievements?status=${status}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok)
            {
                const data = await response.json()
                setAchievements(data.achievements)
            } else if (response.status === 401)
            {
                // Token expired, redirect to login
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user')
                window.location.href = '/auth/login'
            } else
            {
                if (showToast) toast.error('Failed to fetch achievements')
            }
        } catch (error)
        {
            console.error('Fetch achievements error:', error)
            if (showToast) toast.error('Error loading achievements')
        } finally
        {
            setLoading(false)
        }
    }

    const handleReview = async (achievementId: string, action: 'verify' | 'reject') =>
    {
        if (!achievementId) return

        setReviewing(true)
        try
        {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/faculty/achievements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    achievementId,
                    action,
                    comments: reviewComments
                })
            })

            if (response.ok)
            {
                toast.success(action === 'verify' ? 'Achievement verified successfully!' : 'Achievement rejected')
                setSelectedAchievement(null)
                setReviewComments("")
                fetchAchievements(activeTab)
            } else
            {
                const data = await response.json()
                toast.error(data.error || 'Review failed')
            }
        } catch (error)
        {
            console.error('Review error:', error)
            toast.error('Error processing review')
        } finally
        {
            setReviewing(false)
        }
    }

    const handleQuickReview = async (achievementId: string, action: 'verify' | 'reject') =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/faculty/achievements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    achievementId,
                    action,
                    comments: ''
                })
            })

            if (response.ok)
            {
                toast.success(action === 'verify' ? 'Achievement verified!' : 'Achievement rejected')

                // Immediately update local state for instant UI feedback
                setAchievements(prev => prev.filter(a => a._id !== achievementId))

                // Also trigger a background refresh to sync with server
                setTimeout(() => fetchAchievements('pending', false), 1000)
            } else
            {
                const data = await response.json()
                toast.error(data.error || 'Review failed')
            }
        } catch (error)
        {
            console.error('Review error:', error)
            toast.error('Error processing review')
        }
    }

    useEffect(() =>
    {
        fetchAchievements(activeTab, true) // Show toast for initial load

        // Set up polling for real-time updates every 3 seconds
        const interval = setInterval(() =>
        {
            fetchAchievements(activeTab, false) // Don't show toast for background updates
        }, 3000)

        return () => clearInterval(interval)
    }, [activeTab])

    const getStatusIcon = (status: string) =>
    {
        switch (status)
        {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'verified':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusBadge = (status: string) =>
    {
        const variants = {
            pending: "secondary",
            verified: "default",
            rejected: "destructive"
        } as const

        return (
            <Badge variant={variants[status as keyof typeof variants] || "secondary"} className="capitalize">
                {getStatusIcon(status)}
                <span className="ml-1">{status}</span>
            </Badge>
        )
    }

    const getCategoryIcon = (category: string) =>
    {
        switch (category)
        {
            case 'academic':
                return <Award className="h-4 w-4" />
            case 'certification':
                return <FileText className="h-4 w-4" />
            default:
                return <Award className="h-4 w-4" />
        }
    }

    if (loading)
    {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center">
                                <Award className="mr-2 h-5 w-5" />
                                Achievement Verification ({achievements.filter(a => a.status === 'pending').length})
                            </CardTitle>
                            <CardDescription>Review and verify student achievement submissions</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                            {
                                fetchAchievements('pending', true)
                            }}
                            disabled={loading}
                            className="text-xs"
                        >
                            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <AchievementList
                        achievements={achievements.filter(a => a.status === 'pending')}
                        onReview={setSelectedAchievement}
                        onQuickReview={handleQuickReview}
                        showActions={true}
                    />
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Review Achievement
                        </DialogTitle>
                        <DialogDescription>
                            Review the achievement submission and decide whether to verify or reject it.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAchievement && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Student</Label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{selectedAchievement.studentName}</p>
                                            <p className="text-sm text-muted-foreground">{selectedAchievement.studentEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Institution</Label>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedAchievement.institution}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Achievement Title</Label>
                                <p className="font-medium">{selectedAchievement.title}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm">{selectedAchievement.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Date</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedAchievement.date}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Category</Label>
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(selectedAchievement.category)}
                                        <span className="capitalize">{selectedAchievement.category}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedAchievement.evidenceFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Evidence Files</Label>
                                    <div className="space-y-2">
                                        {selectedAchievement.evidenceFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-sm">{file.originalName}</span>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={file.filename} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="comments">Review Comments (Optional)</Label>
                                <Textarea
                                    id="comments"
                                    placeholder="Add any comments or feedback..."
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {selectedAchievement.status !== 'pending' && (
                                <div className="space-y-2 p-3 bg-muted rounded">
                                    <Label className="text-sm font-medium">Review Details</Label>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedAchievement.status)}</p>
                                    {selectedAchievement.reviewedBy && (
                                        <p><strong>Reviewed by:</strong> {selectedAchievement.reviewedBy}</p>
                                    )}
                                    {selectedAchievement.reviewedAt && (
                                        <p><strong>Reviewed on:</strong> {new Date(selectedAchievement.reviewedAt).toLocaleDateString()}</p>
                                    )}
                                    {selectedAchievement.reviewComments && (
                                        <p><strong>Comments:</strong> {selectedAchievement.reviewComments}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedAchievement?.status === 'pending' && (
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => handleReview(selectedAchievement._id, 'reject')}
                                disabled={reviewing}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleReview(selectedAchievement._id, 'verify')}
                                disabled={reviewing}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface AchievementListProps
{
    achievements: PendingAchievement[]
    onReview: (achievement: PendingAchievement) => void
    onQuickReview?: (achievementId: string, action: 'verify' | 'reject') => void
    showActions: boolean
}

function AchievementList({ achievements, onReview, onQuickReview, showActions }: AchievementListProps)
{
    const getPriorityColor = (status: string) =>
    {
        switch (status)
        {
            case "pending":
                return "secondary"
            case "verified":
                return "default"
            case "rejected":
                return "destructive"
            default:
                return "secondary"
        }
    }


    if (achievements.length === 0)
    {
        return (
            <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No achievements found</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {achievements.map((achievement) => (
                <div key={achievement._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{achievement.studentName}</h4>
                                <Badge variant="outline">{achievement.studentEmail.split('@')[0]}</Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {achievement.institution}
                                </Badge>
                                <Badge variant={getPriorityColor(achievement.status)}>
                                    {achievement.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Achievement Submission • {achievement.category}
                            </p>
                            <p className="text-sm font-medium">{achievement.title}</p>
                            <p className="text-sm">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground">Submitted: {achievement.date}</p>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => onReview(achievement)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </Button>
                            {showActions && achievement.status === 'pending' && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 hover:text-green-700 bg-transparent"
                                        onClick={() => onQuickReview?.(achievement._id, 'verify')}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 bg-transparent"
                                        onClick={() => onQuickReview?.(achievement._id, 'reject')}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}