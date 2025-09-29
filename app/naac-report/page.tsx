"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download,
  Save
} from "lucide-react"
import { NAACStep1 } from "@/components/naac/step1-institutional-profile"
import { NAACStep2 } from "@/components/naac/step2-curricular-aspects"
import { 
  NAACStep3, 
  NAACStep4, 
  NAACStep5, 
  NAACStep6, 
  NAACStep7, 
  NAACStep8, 
  NAACStep9, 
  NAACStep10 
} from "@/components/naac/placeholder-steps"

const STEPS = [
  { id: 1, title: "Institutional Profile", description: "Basic institutional information" },
  { id: 2, title: "Criterion 1: Curricular Aspects", description: "Academic programs and curriculum" },
  { id: 3, title: "Criterion 2: Teaching-Learning & Evaluation", description: "Pedagogical processes and assessment" },
  { id: 4, title: "Criterion 3: Research, Innovations & Extension", description: "Research activities and community engagement" },
  { id: 5, title: "Criterion 4: Infrastructure & Learning Resources", description: "Physical and learning resources" },
  { id: 6, title: "Criterion 5: Student Support & Progression", description: "Student services and outcomes" },
  { id: 7, title: "Criterion 6: Governance, Leadership & Management", description: "Institutional governance" },
  { id: 8, title: "Criterion 7: Institutional Values & Best Practices", description: "Values and distinctive practices" },
  { id: 9, title: "Student Satisfaction Survey", description: "Stakeholder feedback collection" },
  { id: 10, title: "Report Generation", description: "Final SSR compilation and download" }
]

export default function NAACReportPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [savedData, setSavedData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)

  // Load existing NAAC report data
  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/naac-report', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.report) {
          setReportId(data.report._id)
          setSavedData(organizeDataBySteps(data.report))
          setCurrentStep(data.report.currentStep || 1)
        }
      } else {
        console.error('Failed to load report data')
      }
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  const organizeDataBySteps = (report: any) => {
    const stepData: any = {}
    
    // Step 1: Institutional Profile
    stepData[1] = {
      institutionName: report.institutionName,
      institutionType: report.institutionType,
      yearOfEstablishment: report.yearOfEstablishment,
      governingBody: report.governingBody,
      accreditationCycle: report.accreditationCycle,
      totalStudentsUG: report.totalStudentsUG,
      totalStudentsPG: report.totalStudentsPG,
      totalStudentsPhD: report.totalStudentsPhD,
      totalTeachingStaff: report.totalTeachingStaff,
      totalNonTeachingStaff: report.totalNonTeachingStaff,
      programmes: report.programmes,
      recognitions: report.recognitions,
      campusArea: report.campusArea,
      builtUpArea: report.builtUpArea,
      website: report.website,
      contactEmail: report.contactEmail,
      naacCoordinator: report.naacCoordinator
    }
    
    // Step 2: Curricular Aspects
    stepData[2] = {
      programmesRevised: report.programmesRevised,
      collectsFeedback: report.collectsFeedback,
      feedbackSample: report.feedbackSample,
      academicFlexibility: report.academicFlexibility,
      valueAddedCourses: report.valueAddedCourses,
      crossCuttingIssues: report.crossCuttingIssues
    }
    
    // Continue for other steps...
    for (let i = 3; i <= 10; i++) {
      stepData[i] = {}
    }
    
    return stepData
  }

  const saveStepData = async (step: number, data: any) => {
    if (!reportId) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/naac-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          action: 'save_step',
          step,
          data
        })
      })
      
      if (response.ok) {
        await response.json()
        toast.success('Step saved successfully!')
        // Update saved data
        setSavedData(prev => ({ ...prev, [step]: data }))
      } else {
        toast.error('Failed to save step data')
      }
    } catch (error) {
      console.error('Error saving step:', error)
      toast.error('Error saving step data')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      if (hasRequiredData(currentStep)) {
        setCurrentStep(currentStep + 1)
      } else {
        toast.error(`Please complete all required fields in Step ${currentStep} before proceeding`)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    // Allow navigation to current step, previous steps, or next step only if current step has data
    if (stepId <= currentStep || (stepId === currentStep + 1 && hasRequiredData(currentStep))) {
      setCurrentStep(stepId)
    } else {
      toast.error(`Please complete Step ${currentStep} before proceeding to Step ${stepId}`)
    }
  }

  const handleSave = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      toast.error('No data to save. Please fill the form first.')
      return
    }
    await saveStepData(currentStep, formData)
  }

  const handleFormDataChange = (data: any) => {
    setFormData(data)
    // Data is now stored in local state, user must click Save to persist
  }

  const hasRequiredData = (step: number) => {
    // Check both saved data and current form data
    const stepData = { ...(savedData as any)[step], ...formData }
    
    // Validation logic for step progression
    
    switch (step) {
      case 1:
        // More lenient validation - only check essential fields
        const hasBasicInfo = stepData.institutionName && 
                            stepData.institutionType && 
                            stepData.yearOfEstablishment &&
                            stepData.governingBody &&
                            stepData.accreditationCycle
        
        const hasStudentData = (stepData.totalStudentsUG !== undefined && stepData.totalStudentsUG >= 0) && 
                              (stepData.totalStudentsPG !== undefined && stepData.totalStudentsPG >= 0) && 
                              (stepData.totalStudentsPhD !== undefined && stepData.totalStudentsPhD >= 0) && 
                              (stepData.totalTeachingStaff !== undefined && stepData.totalTeachingStaff > 0)
        
        const hasContactInfo = stepData.contactEmail && stepData.naacCoordinator
        
        const isValid = hasBasicInfo && hasStudentData && hasContactInfo
        // Validation complete
        return isValid
        
      case 2:
        return stepData.programmesRevised !== undefined || stepData.collectsFeedback !== undefined
      case 3:
        return stepData.admissionProcess || stepData.ictClassrooms !== undefined
      default:
        return true // Allow navigation to other steps for now
    }
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  const renderCurrentStep = () => {
    const stepProps = {
      data: (savedData as any)[currentStep] || {},
      onChange: handleFormDataChange,
      institutionalData: (savedData as any)[1] || {} // Pass institutional data to auto-fill
    }

    switch (currentStep) {
      case 1: return <NAACStep1 {...stepProps} />
      case 2: return <NAACStep2 {...stepProps} />
      case 3: return <NAACStep3 {...stepProps} />
      case 4: return <NAACStep4 {...stepProps} />
      case 5: return <NAACStep5 {...stepProps} />
      case 6: return <NAACStep6 {...stepProps} />
      case 7: return <NAACStep7 {...stepProps} />
      case 8: return <NAACStep8 {...stepProps} />
      case 9: return <NAACStep9 {...stepProps} />
      case 10: return <NAACStep10 data={savedData} />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NAAC Report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  NAAC Accreditation Report
                </h1>
                <p className="text-sm text-muted-foreground">
                  Self Study Report (SSR) Generation System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Step {currentStep} of {STEPS.length}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Progress'}
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button variant="ghost" size="sm" onClick={() => console.log('Debug:', { formData, savedData, currentStep, valid: hasRequiredData(currentStep) })}>
                  Debug
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Report Progress</h2>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {STEPS.map((step) => {
                    const isCompleted = hasRequiredData(step.id) && currentStep > step.id
                    const isAccessible = step.id <= currentStep || (step.id === currentStep + 1 && hasRequiredData(currentStep))
                    const isCurrent = currentStep === step.id
                    const isLocked = !isAccessible
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(step.id)}
                        disabled={isLocked}
                        className={`w-full text-left p-3 rounded-none border-l-4 transition-colors ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : isCompleted
                            ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : isLocked
                            ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCurrent
                              ? 'bg-blue-500 text-white'
                              : isCompleted
                              ? 'bg-green-500 text-white'
                              : isLocked
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : isLocked ? '🔒' : step.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              isLocked ? 'text-gray-400' : ''
                            }`}>
                              {step.title}
                            </p>
                            <p className={`text-xs ${
                              isLocked ? 'text-gray-400' : 'text-muted-foreground'
                            }`}>
                              {step.description}
                            </p>
                            {isLocked && step.id > currentStep + 1 && (
                              <p className="text-xs text-red-500 mt-1">Complete previous steps first</p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
                    <CardDescription>{STEPS[currentStep - 1]?.description}</CardDescription>
                  </div>
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {renderCurrentStep()}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentStep === STEPS.length ? (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Generate & Download Report
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}