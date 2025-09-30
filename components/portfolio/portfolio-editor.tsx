"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Trophy,
  Eye,
  Save,
  Undo2,
  Settings,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

// Import section components
import { PersonalInfoSection } from "./sections/personal-info-section"
import { EducationSection } from "./sections/education-section"
import { ExperienceSection } from "./sections/experience-section"
import { ProjectsSection } from "./sections/projects-section"
import { SkillsSection } from "./sections/skills-section"
import { TemplateSelector } from "./template-selector"
import { PortfolioPreview } from "./portfolio-preview"

export interface PortfolioData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    avatar: string
    linkedin: string
    github: string
    website: string
  }
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa?: string
    achievements?: string[]
  }>
  experience: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    current: boolean
    description: string
    achievements: string[]
  }>
  projects: Array<{
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
  }>
  skills: {
    technical: string[]
    soft: string[]
    languages: string[]
    certifications: string[]
  }
  template: {
    name: string
    theme: string
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }
  settings: {
    isPublic: boolean
    shareUrl?: string
    lastUpdated: string
  }
}

export function PortfolioEditor() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("personal")
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const router = useRouter()

  // Load portfolio data on component mount
  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/student/portfolio', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to load portfolio data')
        }
        
        const data = await response.json()
        const p = data.portfolio
        const mapped: PortfolioData = {
          personalInfo: {
            name: p?.personalInfo?.name || '',
            title: p?.personalInfo?.position || '',
            email: p?.personalInfo?.email || '',
            phone: p?.personalInfo?.phone || '',
            location: p?.personalInfo?.location || '',
            summary: p?.personalInfo?.summary || '',
            avatar: p?.personalInfo?.avatar || '',
            linkedin: p?.personalInfo?.linkedin || '',
            github: p?.personalInfo?.github || '',
            website: p?.personalInfo?.website || ''
          },
          education: (p?.education || []).map((e: any, idx: number) => ({
            id: `${idx}`,
            institution: e.institution || '',
            degree: e.degree || '',
            field: '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            gpa: e.gpa || '',
            achievements: e.achievements || []
          })),
          experience: (p?.experience || []).map((e: any, idx: number) => ({
            id: `${idx}`,
            company: e.company || '',
            position: e.position || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            current: false,
            description: e.description || '',
            achievements: []
          })),
          projects: (p?.projects || []).map((e: any, idx: number) => ({
            id: `${idx}`,
            title: e.name || '',
            description: e.description || '',
            technologies: e.technologies || [],
            startDate: '',
            endDate: '',
            status: 'completed',
            githubUrl: e.github || '',
            liveUrl: e.demo || '',
            images: e.image ? [e.image] : []
          })),
          skills: {
            technical: p?.skills?.technical || [],
            soft: [],
            languages: [],
            certifications: []
          },
          template: {
            name: p?.template || 'modern',
            theme: 'light',
            colors: { primary: '#3b82f6', secondary: '#64748b', accent: '#06b6d4' }
          },
          settings: {
            isPublic: !!p?.isPublic,
            shareUrl: p?.shareUrl || '',
            lastUpdated: p?.lastUpdated ? new Date(p.lastUpdated).toISOString() : new Date().toISOString()
          }
        }
        setPortfolioData(mapped)
      } catch (error) {
        console.error('Error loading portfolio:', error)
        toast.error('Failed to load portfolio data')
        // Initialize with empty portfolio data
        setPortfolioData(getDefaultPortfolioData())
      } finally {
        setLoading(false)
      }
    }

    loadPortfolioData()
  }, [])

  // Default portfolio data structure
  const getDefaultPortfolioData = (): PortfolioData => ({
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      avatar: '',
      linkedin: '',
      github: '',
      website: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      certifications: []
    },
    template: {
      name: 'modern',
      theme: 'light',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#06b6d4'
      }
    },
    settings: {
      isPublic: false,
      lastUpdated: new Date().toISOString()
    }
  })

  // Save portfolio data
  const savePortfolio = async () => {
    if (!portfolioData) return

    try {
      setSaving(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/student/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          ...portfolioData,
          settings: {
            ...portfolioData.settings,
            lastUpdated: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save portfolio')
      }

      const updatedData = await response.json()
      setPortfolioData(updatedData)
      setHasUnsavedChanges(false)
      toast.success('Portfolio saved successfully!')
    } catch (error) {
      console.error('Error saving portfolio:', error)
      toast.error('Failed to save portfolio')
    } finally {
      setSaving(false)
    }
  }

  // Update portfolio data and mark as changed
  const updatePortfolioData = (section: string, data: any) => {
    setPortfolioData(prev => prev ? {
      ...prev,
      [section]: data
    } : null)
    setHasUnsavedChanges(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading portfolio editor...</p>
        </div>
      </div>
    )
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load portfolio data</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <Undo2 className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Portfolio Editor</h1>
                <p className="text-sm text-muted-foreground">
                  {hasUnsavedChanges && "Unsaved changes"}
                  {!hasUnsavedChanges && portfolioData.settings.lastUpdated && 
                    `Last saved: ${new Date(portfolioData.settings.lastUpdated).toLocaleString()}`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplateSelector(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button 
                onClick={savePortfolio} 
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPreview ? (
          <PortfolioPreview 
            data={portfolioData}
            onClose={() => setShowPreview(false)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sections</CardTitle>
                  <CardDescription>
                    Build your professional portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={activeSection === "personal" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("personal")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Personal Info
                  </Button>
                  <Button
                    variant={activeSection === "education" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("education")}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Education
                  </Button>
                  <Button
                    variant={activeSection === "experience" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("experience")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Experience
                  </Button>
                  <Button
                    variant={activeSection === "projects" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("projects")}
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Projects
                  </Button>
                  <Button
                    variant={activeSection === "skills" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("skills")}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Skills
                  </Button>
                </CardContent>
              </Card>

              {/* Portfolio Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">Portfolio Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• {portfolioData.education.length} Education entries</p>
                    <p>• {portfolioData.experience.length} Work experiences</p>
                    <p>• {portfolioData.projects.length} Projects</p>
                    <p>• {portfolioData.skills.technical.length + portfolioData.skills.soft.length} Skills</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Editor Area */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {activeSection === "personal" && (
                  <PersonalInfoSection
                    data={portfolioData.personalInfo}
                    onChange={(data) => updatePortfolioData('personalInfo', data)}
                  />
                )}
                {activeSection === "education" && (
                  <EducationSection
                    data={portfolioData.education}
                    onChange={(data) => updatePortfolioData('education', data)}
                  />
                )}
                {activeSection === "experience" && (
                  <ExperienceSection
                    data={portfolioData.experience}
                    onChange={(data) => updatePortfolioData('experience', data)}
                  />
                )}
                {activeSection === "projects" && (
                  <ProjectsSection
                    data={portfolioData.projects}
                    onChange={(data) => updatePortfolioData('projects', data)}
                  />
                )}
                {activeSection === "skills" && (
                  <SkillsSection
                    data={portfolioData.skills}
                    onChange={(data) => updatePortfolioData('skills', data)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          currentTemplate={portfolioData.template}
          onSelect={(template) => {
            updatePortfolioData('template', template)
            setShowTemplateSelector(false)
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}