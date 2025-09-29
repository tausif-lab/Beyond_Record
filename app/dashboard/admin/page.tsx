"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminDashboard />
    </AuthGuard>
  )
}
