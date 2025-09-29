import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BarChart3, FileText } from "lucide-react"

export default function HomePage()
{
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <GraduationCap className="h-16 w-16 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Beyond Record</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Comprehensive education management system for students, faculty, and institutions
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card>
                        <CardHeader className="text-center">
                            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <CardTitle>Students</CardTitle>
                            <CardDescription>Track progress and build portfolios</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="text-center">
                            <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <CardTitle>Faculty</CardTitle>
                            <CardDescription>Manage approvals and assessments</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="text-center">
                            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>Comprehensive reporting tools</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="text-center">
                            <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                            <CardTitle>Portfolios</CardTitle>
                            <CardDescription>Auto-generated professional portfolios</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <div className="text-center space-x-4">
                    <Button asChild size="lg">
                        <Link href="/auth/login">Get Started</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/auth/register">Create Account</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
