"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Bell,
  Settings,
  LogOut,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

// Types for real data
interface Achievement {
  _id: string
  studentName: string
  studentEmail: string
  title: string
  description: string
  category: string
  date: string
  status: 'pending' | 'verified' | 'rejected'
  institution: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewComments?: string
  evidenceFiles?: any[]
}

interface FacultyData {
  achievements: Achievement[]
  pending: Achievement[]
  verified: Achievement[]
  rejected: Achievement[]
  institution: string
}

// Default faculty profile info
const defaultFacultyProfile = {
  name: "Faculty Member",
  email: "faculty@demo.com",
  department: "Computer Science",
  title: "Professor",
  courses: ["Course Management"],
}

export function FacultyDashboard() {
  const [user] = useState(authService.getCurrentUser())
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch achievements data from the API
  const fetchAchievements = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/faculty/achievements', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setFacultyData(data)
      console.log('✅ Faculty data loaded:', data)
    } catch (err) {
      console.error('❌ Error fetching faculty data:', err)
      
      // Handle authentication errors
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase()
        if (errorMessage.includes('unauthorized') || errorMessage.includes('403') || errorMessage.includes('401')) {
          console.log('Authentication error, redirecting to login')
          authService.logout()
          router.push('/auth/login')
          return
        }
      }
      
      setError('Failed to load faculty data. Please try again.')
      toast.error('Failed to load faculty data')
    } finally {
      setLoading(false)
    }
  }

  // Handle achievement approval/rejection
  const handleAchievementAction = async (achievementId: string, action: 'approve' | 'reject', feedback?: string) => {
    try {
      const response = await fetch('/api/faculty/achievements', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievementId,
          action,
          feedback
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      toast.success(result.message || `Achievement ${action}d successfully`)
      
      // Refresh the data
      await fetchAchievements()
      
    } catch (err) {
      console.error(`❌ Error ${action}ing achievement:`, err)
      toast.error(`Failed to ${action} achievement`)
    }
  }

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAchievements()
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "extracurricular":
        return "bg-green-50 text-green-700 border-green-200"
      case "certification":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "project":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "award":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading faculty dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !facultyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAchievements}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Faculty Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {user?.institution || 'Demo University'}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {defaultFacultyProfile.department}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/naac-report')}
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                NAAC Report
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{facultyData?.achievements?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{facultyData?.pending?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Verified Achievements</p>
                  <p className="text-2xl font-bold">{facultyData?.verified?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{facultyData?.rejected?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="achievements">All Achievements</TabsTrigger>
            <TabsTrigger value="pending">Pending ({facultyData?.pending?.length || 0})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({facultyData?.verified?.length || 0})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({facultyData?.rejected?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      All Achievements
                    </CardTitle>
                    <CardDescription>
                      All student achievements for {facultyData?.institution || 'your institution'}
                    </CardDescription>
                  </div>
                  <Button onClick={fetchAchievements} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {facultyData?.achievements && facultyData.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {facultyData.achievements.map((achievement) => (
                      <div key={achievement._id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{achievement.title}</h3>
                              <Badge className={getCategoryColor(achievement.category)}>
                                {achievement.category}
                              </Badge>
                              <Badge 
                                variant={achievement.status === 'verified' ? 'default' : 
                                        achievement.status === 'pending' ? 'secondary' : 'destructive'}
                              >
                                {achievement.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {achievement.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {achievement.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                {achievement.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Student: {achievement.studentName}</span>
                              <span>Submitted: {formatDate(achievement.submittedAt)}</span>
                              {achievement.reviewedAt && (
                                <span>Reviewed: {formatDate(achievement.reviewedAt)}</span>
                              )}
                              {achievement.reviewedBy && (
                                <span>Reviewed by: {achievement.reviewedBy}</span>
                              )}
                            </div>
                          </div>
                          {achievement.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAchievementAction(achievement._id, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleAchievementAction(achievement._id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No achievements found</p>
                    <p className="text-sm text-gray-400">Student achievement submissions will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-orange-600" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>Achievements waiting for your review</CardDescription>
              </CardHeader>
              <CardContent>
                {facultyData?.pending && facultyData.pending.length > 0 ? (
                  <div className="space-y-4">
                    {facultyData.pending.map((achievement) => (
                      <div key={achievement._id} className="border rounded-lg p-4 bg-orange-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{achievement.title}</h3>
                              <Badge className={getCategoryColor(achievement.category)}>
                                {achievement.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Student: {achievement.studentName}</span>
                              <span>Email: {achievement.studentEmail}</span>
                              <span>Submitted: {formatDate(achievement.submittedAt)}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAchievementAction(achievement._id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleAchievementAction(achievement._id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending approvals</p>
                    <p className="text-sm text-gray-400">All achievements have been reviewed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Verified Achievements
                </CardTitle>
                <CardDescription>Approved achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {facultyData?.verified && facultyData.verified.length > 0 ? (
                  <div className="space-y-4">
                    {facultyData.verified.map((achievement) => (
                      <div key={achievement._id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge className={getCategoryColor(achievement.category)}>
                            {achievement.category}
                          </Badge>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Student: {achievement.studentName}</span>
                          <span>Verified: {achievement.reviewedAt ? formatDate(achievement.reviewedAt) : 'N/A'}</span>
                          <span>Reviewed by: {achievement.reviewedBy || 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No verified achievements</p>
                    <p className="text-sm text-gray-400">Approved achievements will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="mr-2 h-5 w-5 text-red-600" />
                  Rejected Achievements
                </CardTitle>
                <CardDescription>Achievements that were not approved</CardDescription>
              </CardHeader>
              <CardContent>
                {facultyData?.rejected && facultyData.rejected.length > 0 ? (
                  <div className="space-y-4">
                    {facultyData.rejected.map((achievement) => (
                      <div key={achievement._id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge className={getCategoryColor(achievement.category)}>
                            {achievement.category}
                          </Badge>
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        {achievement.reviewComments && (
                          <p className="text-sm text-red-600 mb-2">Reason: {achievement.reviewComments}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Student: {achievement.studentName}</span>
                          <span>Rejected: {achievement.reviewedAt ? formatDate(achievement.reviewedAt) : 'N/A'}</span>
                          <span>Reviewed by: {achievement.reviewedBy || 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No rejected achievements</p>
                    <p className="text-sm text-gray-400">Rejected achievements will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboards">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Highest performing students across all courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Student Leaderboards</h3>
                      <p className="text-gray-500">Performance tracking and leaderboards will be available soon.</p>
                      <p className="text-sm text-gray-400 mt-2">Feature under development - coming in future updates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Course Performance
                  </CardTitle>
                  <CardDescription>Overview of your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Avg Grade</TableHead>
                        <TableHead>Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">Course Performance Analytics</h3>
                          <p className="text-gray-500">Detailed course performance metrics will be available soon.</p>
                          <p className="text-sm text-gray-400 mt-2">Feature under development - coming in future updates</p>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Grade Distribution
                  </CardTitle>
                  <CardDescription>Overall grade distribution across all courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Grade Distribution</h3>
                      <p className="text-gray-500">Grade analytics will be available soon.</p>
                      <p className="text-sm text-gray-400 mt-2">Feature under development</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Submission Trends
                  </CardTitle>
                  <CardDescription>Weekly submission patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Submission Trends</h3>
                      <p className="text-gray-500">Submission analytics will be available soon.</p>
                      <p className="text-sm text-gray-400 mt-2">Feature under development</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Reports Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Detailed Reports</CardTitle>
                      <CardDescription>Comprehensive analytics and data export</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Courses</SelectItem>
                          <SelectItem value="cs480">CS 480</SelectItem>
                          <SelectItem value="cs465">CS 465</SelectItem>
                          <SelectItem value="cs340">CS 340</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>CS 480</TableHead>
                        <TableHead>CS 465</TableHead>
                        <TableHead>CS 340</TableHead>
                        <TableHead>Overall</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Enrollment</TableCell>
                        <TableCell>28</TableCell>
                        <TableCell>35</TableCell>
                        <TableCell>42</TableCell>
                        <TableCell>105</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Average Grade</TableCell>
                        <TableCell>3.65</TableCell>
                        <TableCell>3.72</TableCell>
                        <TableCell>3.58</TableCell>
                        <TableCell>3.65</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Completion Rate</TableCell>
                        <TableCell>85%</TableCell>
                        <TableCell>92%</TableCell>
                        <TableCell>78%</TableCell>
                        <TableCell>85%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Late Submissions</TableCell>
                        <TableCell>12%</TableCell>
                        <TableCell>8%</TableCell>
                        <TableCell>18%</TableCell>
                        <TableCell>13%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
