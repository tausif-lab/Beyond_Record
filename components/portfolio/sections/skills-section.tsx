"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface Skills {
  technical: string[]
  soft: string[]
  languages: string[]
  certifications: string[]
}

interface SkillsSectionProps {
  data: Skills
  onChange: (data: Skills) => void
}

export function SkillsSection({ data: _data, onChange: _onChange }: SkillsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          Skills & Certifications
        </CardTitle>
        <CardDescription>
          Add your technical skills, soft skills, and certifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Skills section coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}