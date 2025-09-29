"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, User, Target, Rocket, ChevronRight, ChevronLeft } from "lucide-react"
import { authService } from "@/lib/auth"

const onboardingSteps = [
    {
        id: 1,
        title: "Welcome to Beyond Record",
        description: "Your comprehensive education management platform",
        icon: GraduationCap,
        content:
            "Beyond Record helps students track their academic progress, build professional portfolios, and connect with faculty and institutions.",
    },
    {
        id: 2,
        title: "Build Your Profile",
        description: "Create a comprehensive academic profile",
        icon: User,
        content:
            "Add your academic achievements, skills, projects, and experiences to create a complete profile that showcases your journey.",
    },
    {
        id: 3,
        title: "Track Your Progress",
        description: "Monitor your academic and professional growth",
        icon: Target,
        content:
            "Set goals, track deadlines, monitor your progress with visual analytics, and celebrate your achievements along the way.",
    },
    {
        id: 4,
        title: "Ready to Start",
        description: "You're all set to begin your journey",
        icon: Rocket,
        content:
            "Your account is configured and ready. Start exploring your personalized dashboard and begin building your academic portfolio.",
    },
]

export default function OnboardingPage()
{
    const [currentStep, setCurrentStep] = useState(0)
    const [user] = useState(authService.getCurrentUser())
    const [isRedirecting, setIsRedirecting] = useState(false)
    const router = useRouter()

    useEffect(() =>
    {
        // Prevent multiple redirections
        if (isRedirecting) return

        // Redirect if not authenticated
        if (!user)
        {
            setIsRedirecting(true)
            router.push("/auth/login")
            return
        }

        // Check onboarding completion only once on mount
        const isCompleted = authService.isOnboardingCompleted()
        if (isCompleted)
        {
            console.log('Onboarding already completed, redirecting to dashboard')
            setIsRedirecting(true)

            const dashboardPath = user.role === "student" ? "/dashboard/student" :
                user.role === "faculty" ? "/dashboard/faculty" :
                    user.role === "admin" ? "/dashboard/admin" : "/dashboard"

            router.push(dashboardPath)
            return
        }
    }, []) // Only run once on mount

    const handleNext = () =>
    {
        if (currentStep < onboardingSteps.length - 1)
        {
            setCurrentStep(currentStep + 1)
        } else
        {
            handleComplete()
        }
    }

    const handlePrevious = () =>
    {
        if (currentStep > 0)
        {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = () =>
    {
        if (isRedirecting) return // Prevent multiple calls

        // Mark onboarding as completed for this specific user
        authService.completeOnboarding()
        setIsRedirecting(true)

        // Redirect based on user role
        if (user)
        {
            const dashboardPath = user.role === "student" ? "/dashboard/student" :
                user.role === "faculty" ? "/dashboard/faculty" :
                    user.role === "admin" ? "/dashboard/admin" : "/dashboard"

            router.push(dashboardPath)
        }
    }

    const handleSkip = () =>
    {
        if (isRedirecting) return // Prevent multiple calls
        handleComplete()
    }

    // Show nothing while redirecting to prevent flash
    if (!user || isRedirecting) return null

    const step = onboardingSteps[currentStep]
    const progress = ((currentStep + 1) / onboardingSteps.length) * 100
    
    if (!step) {
        return null // Return null if step doesn't exist
    }
    
    const Icon = step.icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Icon className="h-16 w-16 text-blue-600" />
                    </div>
                    <CardTitle className="text-3xl">{step.title}</CardTitle>
                    <CardDescription className="text-lg">{step.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                                Step {currentStep + 1} of {onboardingSteps.length}
                            </span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <div className="text-center py-8">
                        <p className="text-lg text-muted-foreground leading-relaxed">{step.content}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={handleSkip}>
                            Skip Tour
                        </Button>

                        <div className="flex space-x-2">
                            <Button onClick={handleNext}>
                                {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
                                {currentStep !== onboardingSteps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2 pt-4">
                        {onboardingSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 rounded-full transition-colors ${index <= currentStep ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
