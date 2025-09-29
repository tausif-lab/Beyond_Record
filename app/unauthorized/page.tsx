import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page is restricted to certain user roles. Please contact your administrator if you believe this is an
            error.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
