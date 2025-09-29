"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  achievements: string[]
}

interface ExperienceSectionProps {
  data: Experience[]
  onChange: (data: Experience[]) => void
}

export function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="mr-2 h-5 w-5" />
          Work Experience
        </CardTitle>
        <CardDescription>
          Add your professional work experience and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Experience section coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}