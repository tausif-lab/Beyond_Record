"use client"

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
  Eye,
  Download,
  Shield,
  Database,
  Activity,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for admin dashboard
const mockAdminData = {
  systemStats: {
    totalUsers: 1247,
    activeStudents: 892,
    facultyMembers: 45,
    pendingApprovals: 23,
    systemUptime: "99.9%",
  },
  userManagement: [
    {
      id: "1",
      name: "John Student",
      email: "john@demo.com",
      role: "student",
      status: "active",
      lastLogin: "2024-03-10",
    },
    {
      id: "2",
      name: "Dr. Jane Faculty",
      email: "jane@demo.com",
      role: "faculty",
      status: "active",
      lastLogin: "2024-03-10",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@demo.com",
      role: "student",
      status: "inactive",
      lastLogin: "2024-03-05",
    },
    { id: "4", name: "Sarah Wilson", email: "sarah@demo.com", role: "student", status: "pending", lastLogin: "Never" },
  ],
  systemReports: {
    userGrowth: [
      { month: "Jan", students: 650, faculty: 38 },
      { month: "Feb", students: 720, faculty: 41 },
      { month: "Mar", students: 892, faculty: 45 },
    ],
    activityMetrics: [
      { metric: "Daily Active Users", value: 456, change: "+12%" },
      { metric: "Portfolio Submissions", value: 89, change: "+8%" },
      { metric: "Course Completions", value: 234, change: "+15%" },
      { metric: "System Errors", value: 3, change: "-67%" },
    ],
    departmentDistribution: [
      { department: "Computer Science", students: 312, percentage: 35 },
      { department: "Engineering", students: 267, percentage: 30 },
      { department: "Business", students: 178, percentage: 20 },
      { department: "Arts", students: 89, percentage: 10 },
      { department: "Sciences", students: 46, percentage: 5 },
    ],
  },
  pendingApprovals: [
    {
      id: "1",
      type: "Faculty Registration",
      requester: "Dr. Robert Smith",
      department: "Mathematics",
      submittedDate: "2024-03-09",
      priority: "high",
    },
    {
      id: "2",
      type: "Course Creation",
      requester: "Dr. Lisa Chen",
      department: "Computer Science",
      submittedDate: "2024-03-08",
      priority: "medium",
    },
    {
      id: "3",
      type: "System Access",
      requester: "Admin Assistant",
      department: "Administration",
      submittedDate: "2024-03-07",
      priority: "low",
    },
  ],
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function AdminDashboard() {
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const handleApproval = (id: string, action: "approve" | "reject") => {
    // In production: send API request to update approval status
    console.log(`${action} approval ${id}`)
  }

  const handleUserAction = (userId: string, action: "activate" | "deactivate" | "delete") => {
    // In production: send API request to manage user
    console.log(`${action} user ${userId}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-red-50 text-red-700">
                System Administrator
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
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{mockAdminData.systemStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold">{mockAdminData.systemStats.activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                  <p className="text-2xl font-bold">{mockAdminData.systemStats.facultyMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{mockAdminData.systemStats.pendingApprovals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">{mockAdminData.systemStats.systemUptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="reports">System Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    User Growth
                  </CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockAdminData.systemReports.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="students" stroke="#3b82f6" name="Students" />
                        <Line type="monotone" dataKey="faculty" stroke="#10b981" name="Faculty" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Department Distribution
                  </CardTitle>
                  <CardDescription>Student enrollment by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockAdminData.systemReports.departmentDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ department, percentage }) => `${department} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="students"
                        >
                          {mockAdminData.systemReports.departmentDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    System Activity Metrics
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockAdminData.systemReports.activityMetrics.map((metric, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
                        <p className="text-sm font-medium">{metric.metric}</p>
                        <p className={`text-xs ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {metric.change}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage system users and permissions</CardDescription>
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
                    <Button>Add User</Button>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAdminData.userManagement.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUserAction(user.id, user.status === "active" ? "deactivate" : "activate")
                              }
                            >
                              {user.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  System Approvals ({mockAdminData.pendingApprovals.length})
                </CardTitle>
                <CardDescription>Review and approve system-level requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAdminData.pendingApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{approval.type}</h4>
                            <Badge variant={getPriorityColor(approval.priority)}>{approval.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested by: {approval.requester} • {approval.department}
                          </p>
                          <p className="text-xs text-muted-foreground">Submitted: {approval.submittedDate}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 bg-transparent"
                            onClick={() => handleApproval(approval.id, "approve")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => handleApproval(approval.id, "reject")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      System Reports
                    </CardTitle>
                    <CardDescription>Comprehensive system analytics and reporting</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Reports
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">User Activity Report</TableCell>
                      <TableCell>Detailed user engagement and activity metrics</TableCell>
                      <TableCell>2024-03-10</TableCell>
                      <TableCell>
                        <Badge variant="default">Ready</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">System Performance</TableCell>
                      <TableCell>Server performance and uptime statistics</TableCell>
                      <TableCell>2024-03-10</TableCell>
                      <TableCell>
                        <Badge variant="default">Ready</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Security Audit</TableCell>
                      <TableCell>Security events and access logs</TableCell>
                      <TableCell>2024-03-09</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Processing</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Processing
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
