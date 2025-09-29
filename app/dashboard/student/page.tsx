"use client"

import { AuthGuard } from "@/components/auth-guard"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default function StudentDashboardPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <StudentDashboard />
    </AuthGuard>
  )
}
