"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2 } from "lucide-react"
import { authService } from "@/lib/auth"

interface Institution
{
    _id: string;
    institutionId: string;
    name: string;
    type: string;
    address: {
        city: string;
        country: string;
    };
    description?: string;
}

export default function RegisterPage()
{
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "" as "student" | "faculty" | "",
        institutionId: "",
    })
    const [institutions, setInstitutions] = useState<Institution[]>([])
    const [loading, setLoading] = useState(false)
    const [institutionsLoading, setInstitutionsLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    // Fetch institutions on component mount
    useEffect(() =>
    {
        const fetchInstitutions = async () =>
        {
            try
            {
                const response = await fetch('/api/institutions')
                if (response.ok)
                {
                    const data = await response.json()
                    setInstitutions(data.institutions)
                }
            } catch (error)
            {
                console.error('Failed to fetch institutions:', error)
            } finally
            {
                setInstitutionsLoading(false)
            }
        }

        fetchInstitutions()
    }, [])

    const handleSubmit = async (e: React.FormEvent) =>
    {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (formData.password !== formData.confirmPassword)
        {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        if (!formData.role)
        {
            setError("Please select a role")
            setLoading(false)
            return
        }

        if (!formData.institutionId)
        {
            setError("Please select an institution")
            setLoading(false)
            return
        }

        try
        {
            // Include institution in the registration data
            const result = await authService.register(formData.email, formData.password, formData.name, formData.role, formData.institutionId)

            if (result)
            {
                router.push("/auth/onboarding")
            }
        } catch (err: any)
        {
            setError(err.message || "Registration failed. Please try again.")
        } finally
        {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <GraduationCap className="h-12 w-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Join the Beyond Record </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@university.edu"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Select
                                value={formData.institutionId}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, institutionId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={institutionsLoading ? "Loading institutions..." : "Select your institution"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((institution) => (
                                        <SelectItem key={institution.institutionId} value={institution.institutionId}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{institution.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {institution.address.city}, {institution.address.country}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: "student" | "faculty") => setFormData((prev) => ({ ...prev, role: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="faculty">Faculty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-blue-600 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
