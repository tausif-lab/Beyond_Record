"use client"

import { AuthGuard } from "@/components/auth-guard"
import { InstitutionDashboard } from "@/components/institution/institution-dashboard"

export default function InstitutionDashboardPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <InstitutionDashboard />
    </AuthGuard>
  )
}
