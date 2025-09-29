"use client"

import { AuthGuard } from "@/components/auth-guard"
import { FacultyDashboard } from "@/components/faculty/faculty-dashboard"

export default function FacultyDashboardPage() {
  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <FacultyDashboard />
    </AuthGuard>
  )
}
