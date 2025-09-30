"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  startDate: string
  endDate: string
  status: 'completed' | 'in-progress' | 'planned'
  githubUrl?: string
  liveUrl?: string
  images?: string[]
}

interface ProjectsSectionProps {
  data: Project[]
  onChange: (data: Project[]) => void
}

export function ProjectsSection({ data: _data, onChange: _onChange }: ProjectsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="mr-2 h-5 w-5" />
          Projects
        </CardTitle>
        <CardDescription>
          Showcase your personal and professional projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Projects section coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}