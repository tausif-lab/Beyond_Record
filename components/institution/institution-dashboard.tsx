"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  Upload,
  Download,
  Settings,
  Bell,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileSpreadsheet,
  Calendar,
  Activity,
  Target,
  Award,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

// Mock data for institution dashboard
const mockInstitutionData = {
  overview: {
    totalStudents: 12847,
    totalFaculty: 456,
    totalCourses: 1234,
    completionRate: 87.5,
    averageGPA: 3.42,
    activePrograms: 45,
  },
  heatmapData: [
    // Activity heatmap data (simulating calendar-style heatmap)
    { date: "2024-01-01", activity: 45, day: "Mon" },
    { date: "2024-01-02", activity: 67, day: "Tue" },
    { date: "2024-01-03", activity: 89, day: "Wed" },
    { date: "2024-01-04", activity: 123, day: "Thu" },
    { date: "2024-01-05", activity: 156, day: "Fri" },
    { date: "2024-01-08", activity: 78, day: "Mon" },
    { date: "2024-01-09", activity: 134, day: "Tue" },
    { date: "2024-01-10", activity: 167, day: "Wed" },
    { date: "2024-01-11", activity: 189, day: "Thu" },
    { date: "2024-01-12", activity: 201, day: "Fri" },
  ],
  departmentMetrics: [
    { department: "Computer Science", students: 2847, faculty: 89, courses: 234, avgGPA: 3.65 },
    { department: "Engineering", students: 2156, faculty: 76, courses: 189, avgGPA: 3.58 },
    { department: "Business", students: 1934, faculty: 65, courses: 156, avgGPA: 3.42 },
    { department: "Arts & Sciences", students: 1678, faculty: 54, courses: 145, avgGPA: 3.38 },
    { department: "Medicine", students: 1456, faculty: 98, courses: 234, avgGPA: 3.72 },
    { department: "Law", students: 876, faculty: 34, courses: 89, avgGPA: 3.45 },
    { department: "Education", students: 734, faculty: 28, courses: 67, avgGPA: 3.51 },
    { department: "Psychology", students: 656, faculty: 23, courses: 56, avgGPA: 3.48 },
  ],
  enrollmentTrends: [
    { semester: "Fall 2022", students: 11234, faculty: 398, retention: 89 },
    { semester: "Spring 2023", students: 11567, faculty: 412, retention: 91 },
    { semester: "Fall 2023", students: 12134, faculty: 434, retention: 88 },
    { semester: "Spring 2024", students: 12847, faculty: 456, retention: 92 },
  ],
  performanceMetrics: [
    { metric: "Student Satisfaction", value: 4.2, target: 4.5, change: "+0.3" },
    { metric: "Course Completion Rate", value: 87.5, target: 90, change: "+2.1%" },
    { metric: "Faculty Retention", value: 94.2, target: 95, change: "+1.8%" },
    { metric: "Graduate Employment", value: 89.7, target: 92, change: "+3.2%" },
  ],
  bulkUploadHistory: [
    {
      id: "1",
      fileName: "spring_2024_enrollments.csv",
      uploadDate: "2024-03-10",
      recordsProcessed: 1247,
      status: "completed",
      uploadedBy: "Admin User",
    },
    {
      id: "2",
      fileName: "faculty_assignments.xlsx",
      uploadDate: "2024-03-08",
      recordsProcessed: 456,
      status: "completed",
      uploadedBy: "HR Manager",
    },
    {
      id: "3",
      fileName: "course_catalog_update.csv",
      uploadDate: "2024-03-05",
      recordsProcessed: 234,
      status: "failed",
      uploadedBy: "Academic Admin",
    },
  ],
  userManagement: [
    {
      id: "1",
      name: "Dr. John Smith",
      email: "john.smith@demo.edu",
      role: "faculty",
      department: "Computer Science",
      status: "active",
      lastLogin: "2024-03-10",
      courses: 3,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@demo.edu",
      role: "student",
      department: "Engineering",
      status: "active",
      lastLogin: "2024-03-10",
      courses: 5,
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.w@demo.edu",
      role: "admin",
      department: "Administration",
      status: "active",
      lastLogin: "2024-03-09",
      courses: 0,
    },
  ],
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export function InstitutionDashboard() {
  const [user, setUser] = useState(authService.getCurrentUser())
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const handleBulkUpload = () => {
    if (uploadFile) {
      // In production: process the file upload
      console.log("Processing bulk upload:", uploadFile.name)
      alert(`Processing ${uploadFile.name}...`)
      setUploadFile(null)
    }
  }

  const handleUserAction = (userId: string, action: string) => {
    // In production: perform user management action
    console.log(`${action} user ${userId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      case "processing":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getActivityIntensity = (activity: number) => {
    if (activity < 50) return "bg-blue-100 dark:bg-blue-900"
    if (activity < 100) return "bg-blue-200 dark:bg-blue-800"
    if (activity < 150) return "bg-blue-400 dark:bg-blue-600"
    return "bg-blue-600 dark:bg-blue-500"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Institution Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Demo University
              </Badge>
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
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{mockInstitutionData.overview.totalStudents.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                  <p className="text-2xl font-bold">{mockInstitutionData.overview.totalFaculty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold">{mockInstitutionData.overview.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{mockInstitutionData.overview.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Average GPA</p>
                  <p className="text-2xl font-bold">{mockInstitutionData.overview.averageGPA}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-cyan-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Programs</p>
                  <p className="text-2xl font-bold">{mockInstitutionData.overview.activePrograms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics & Heatmaps</TabsTrigger>
            <TabsTrigger value="departments">Department Overview</TabsTrigger>
            <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Heatmap */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    System Activity Heatmap
                  </CardTitle>
                  <CardDescription>Daily platform usage and engagement patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">Less</span>
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded-sm"></div>
                          <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded-sm"></div>
                          <div className="w-3 h-3 bg-blue-400 dark:bg-blue-600 rounded-sm"></div>
                          <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-sm"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">More</span>
                      </div>
                      <Select defaultValue="2024">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <div key={day} className="text-xs text-center text-muted-foreground p-1">
                          {day}
                        </div>
                      ))}
                      {mockInstitutionData.heatmapData.map((item, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-sm ${getActivityIntensity(item.activity)} cursor-pointer`}
                          title={`${item.date}: ${item.activity} activities`}
                        ></div>
                      ))}
                      {/* Fill remaining cells for complete grid */}
                      {Array.from({ length: 35 - mockInstitutionData.heatmapData.length }).map((_, index) => (
                        <div key={`empty-${index}`} className="w-8 h-8 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enrollment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Enrollment Trends
                  </CardTitle>
                  <CardDescription>Student and faculty growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockInstitutionData.enrollmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="students" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                        <Area type="monotone" dataKey="faculty" stackId="2" stroke="#10b981" fill="#10b981" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Key Performance Indicators
                  </CardTitle>
                  <CardDescription>Institution performance against targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockInstitutionData.performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{metric.value}</span>
                          <span
                            className={`text-xs ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                          >
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {metric.value}</span>
                        <span>Target: {metric.target}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <div className="space-y-6">
              {/* Department Filter */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Building2 className="mr-2 h-5 w-5" />
                        Department Overview
                      </CardTitle>
                      <CardDescription>Comprehensive metrics across all departments</CardDescription>
                    </div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {mockInstitutionData.departmentMetrics.map((dept) => (
                          <SelectItem key={dept.department} value={dept.department}>
                            {dept.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Avg GPA</TableHead>
                        <TableHead>Student/Faculty Ratio</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockInstitutionData.departmentMetrics
                        .filter((dept) => selectedDepartment === "all" || dept.department === selectedDepartment)
                        .map((dept) => (
                          <TableRow key={dept.department}>
                            <TableCell className="font-medium">{dept.department}</TableCell>
                            <TableCell>{dept.students.toLocaleString()}</TableCell>
                            <TableCell>{dept.faculty}</TableCell>
                            <TableCell>{dept.courses}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {dept.avgGPA}
                              </Badge>
                            </TableCell>
                            <TableCell>{Math.round(dept.students / dept.faculty)}:1</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Department Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Distribution by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockInstitutionData.departmentMetrics}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ department, students }) => `${department}: ${students}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="students"
                          >
                            {mockInstitutionData.departmentMetrics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Faculty Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockInstitutionData.departmentMetrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="faculty" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk-upload">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Bulk Data Upload
                  </CardTitle>
                  <CardDescription>Upload CSV or Excel files to import data in bulk</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground mb-4">Supports CSV, XLSX files up to 10MB</p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer bg-transparent">
                        Select File
                      </Button>
                    </Label>
                  </div>

                  {uploadFile && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-medium">{uploadFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button onClick={handleBulkUpload}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Upload Types:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Student enrollment data</li>
                      <li>• Faculty assignments</li>
                      <li>• Course catalog updates</li>
                      <li>• Grade imports</li>
                      <li>• User account creation</li>
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Eye className="mr-2 h-4 w-4" />
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Upload History
                  </CardTitle>
                  <CardDescription>Recent bulk upload activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockInstitutionData.bulkUploadHistory.map((upload) => (
                      <div key={upload.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{upload.fileName}</span>
                              <Badge variant={getStatusColor(upload.status)}>{upload.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {upload.recordsProcessed.toLocaleString()} records processed
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded by {upload.uploadedBy} on {upload.uploadDate}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="user-management">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage all system users and their permissions</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Search users..." className="w-64" />
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInstitutionData.userManagement.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>{user.courses}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "view")}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "edit")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, "delete")}
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {mockInstitutionData.userManagement.length} of{" "}
                    {mockInstitutionData.overview.totalStudents + mockInstitutionData.overview.totalFaculty} users
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
