"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService, type User } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: ("student" | "faculty" | "admin" | "institution")[]
  requireOnboarding?: boolean
}

export function AuthGuard({ children, allowedRoles, requireOnboarding = true }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()

    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    // Check if onboarding is required and completed
    if (requireOnboarding) {
      const onboardingCompleted = localStorage.getItem("onboarding_completed")
      if (!onboardingCompleted) {
        router.push("/auth/onboarding")
        return
      }
    }

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      router.push("/unauthorized")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router, allowedRoles, requireOnboarding])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
