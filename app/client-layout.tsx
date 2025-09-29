"use client"

import type React from "react"

import { Analytics } from "@vercel/analytics/next"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { Toaster } from "react-hot-toast"
// <CHANGE> Added role-based navigation component
import { RoleBasedNav } from "@/components/system/role-based-nav"

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            {/* <CHANGE> Added conditional navigation based on current path */}
            <Suspense fallback={null}>
                <ConditionalNav />
            </Suspense>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            <Analytics />
        </>
    )
}

// <CHANGE> Component to conditionally show navigation
function ConditionalNav() {
    const pathname = usePathname()
    const hideNavPaths = ["/", "/auth/login", "/auth/register", "/auth/onboarding", "/unauthorized"]

    if (!hideNavPaths.includes(pathname) && !pathname.startsWith("/portfolio/")) {
        return <RoleBasedNav />
    }

    return null
}
