"use client"

import { AuthGuard } from "@/components/auth-guard"
import { PortfolioGenerator } from "@/components/portfolio/portfolio-generator"

export default function PortfolioGeneratorPage() {
  return (
    <AuthGuard allowedRoles={["student", "faculty", "admin"]}>
      <PortfolioGenerator />
    </AuthGuard>
  )
}
