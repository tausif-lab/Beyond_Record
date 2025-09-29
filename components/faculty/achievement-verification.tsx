"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Award, FileText, Eye, User, Calendar, Building } from "lucide-react"
import { toast } from "react-hot-toast"

interface PendingAchievement {
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

export function AchievementVerification() {
  const [achievements, setAchievements] = useState<PendingAchievement[]>([])
  const [pendingAchievements, setPendingAchievements] = useState<PendingAchievement[]>([])
  const [verifiedAchievements, setVerifiedAchievements] = useState<PendingAchievement[]>([])
  const [rejectedAchievements, setRejectedAchievements] = useState<PendingAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<PendingAchievement | null>(null)
  const [reviewComments, setReviewComments] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending')

  const fetchAchievements = async (showToast = true) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        if (showToast) toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/faculty/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAchievements(data.achievements || [])
        setPendingAchievements(data.pending || [])
        setVerifiedAchievements(data.verified || [])
        setRejectedAchievements(data.rejected || [])
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
      } else {
        if (showToast) toast.error('Failed to fetch achievements')
      }
    } catch (error) {
      console.error('Fetch achievements error:', error)
      if (showToast) toast.error('Error loading achievements')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReview = async (achievementId: string, action: 'verify' | 'reject') => {
    try {
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

      if (response.ok) {
        toast.success(action === 'verify' ? 'Achievement verified!' : 'Achievement rejected')
        // Remove from pending and add to appropriate list
        setPendingAchievements(prev => prev.filter(a => a._id !== achievementId))
        setTimeout(() => fetchAchievements(false), 1000)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Review failed')
      }
    } catch (error) {
      console.error('Review error:', error)
      toast.error('Error processing review')
    }
  }

  const handleDetailedReview = async (achievementId: string, action: 'verify' | 'reject') => {
    if (!achievementId) return

    setReviewing(true)
    try {
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

      if (response.ok) {
        toast.success(action === 'verify' ? 'Achievement verified successfully!' : 'Achievement rejected')
        setSelectedAchievement(null)
        setReviewComments("")
        // Remove from pending and refresh all data
        setPendingAchievements(prev => prev.filter(a => a._id !== achievementId))
        setTimeout(() => fetchAchievements(false), 1000)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Review failed')
      }
    } catch (error) {
      console.error('Review error:', error)
      toast.error('Error processing review')
    } finally {
      setReviewing(false)
    }
  }

  useEffect(() => {
    fetchAchievements(true)
    
    // Real-time polling every 3 seconds
    const interval = setInterval(() => {
      fetchAchievements(false)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderAchievementCard = (achievement: PendingAchievement, showActions = false) => (
    <div key={achievement._id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{achievement.studentName}</h4>
            <Badge variant="outline">{achievement.studentEmail.split('@')[0]}</Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {achievement.institution}
            </Badge>
            <Badge 
              variant={achievement.status === 'verified' ? 'default' : 
                      achievement.status === 'rejected' ? 'destructive' : 'secondary'}
              className={achievement.status === 'verified' ? 'bg-green-100 text-green-800' :
                        achievement.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
            >
              {achievement.status === 'verified' ? '✅ Verified' : 
               achievement.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Achievement Submission • {achievement.category}
          </p>
          <p className="text-sm font-medium">{achievement.title}</p>
          <p className="text-sm">{achievement.description}</p>
          <p className="text-xs text-muted-foreground">Submitted: {achievement.date}</p>
          {achievement.reviewedBy && (
            <p className="text-xs text-muted-foreground">Reviewed by: {achievement.reviewedBy}</p>
          )}
          {achievement.reviewComments && (
            <p className="text-xs text-muted-foreground">Comments: {achievement.reviewComments}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedAchievement(achievement)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {showActions && achievement.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 bg-transparent"
                onClick={() => handleQuickReview(achievement._id, 'verify')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 bg-transparent"
                onClick={() => handleQuickReview(achievement._id, 'reject')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Achievement Management ({achievements.length})
              </CardTitle>
              <CardDescription>Review and track student achievement submissions</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchAchievements(true)}
              disabled={loading}
              className="text-xs"
            >
              {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'verified' | 'rejected')} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verified ({verifiedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected ({rejectedAchievements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending achievements to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAchievements.map((achievement) => 
                    renderAchievementCard(achievement, true)
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              {verifiedAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No verified achievements yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifiedAchievements.map((achievement) => 
                    renderAchievementCard(achievement, false)
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {rejectedAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No rejected achievements yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedAchievements.map((achievement) => 
                    renderAchievementCard(achievement, false)
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
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
                    <Award className="h-4 w-4" />
                    <span className="capitalize">{selectedAchievement.category}</span>
                  </div>
                </div>
              </div>

              {selectedAchievement.evidenceFiles && selectedAchievement.evidenceFiles.length > 0 && (
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
            </div>
          )}

          {selectedAchievement?.status === 'pending' && (
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleDetailedReview(selectedAchievement._id, 'reject')}
                disabled={reviewing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => handleDetailedReview(selectedAchievement._id, 'verify')}
                disabled={reviewing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}