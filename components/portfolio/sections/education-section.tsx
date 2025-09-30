"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  Building,
  Award
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
  achievements?: string[]
}

interface EducationSectionProps {
  data: Education[]
  onChange: (data: Education[]) => void
}

interface EducationFormData {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
  achievements: string
}

export function EducationSection({ data, onChange }: EducationSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<EducationFormData>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    gpa: '',
    achievements: ''
  })

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: ''
    })
    setEditingId(null)
  }

  const openDialog = (education?: Education) => {
    if (education) {
      setEditingId(education.id)
      setFormData({
        institution: education.institution,
        degree: education.degree,
        field: education.field,
        startDate: education.startDate,
        endDate: education.endDate,
        gpa: education.gpa || '',
        achievements: education.achievements?.join('\n') || ''
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSave = () => {
    if (!formData.institution || !formData.degree || !formData.field) {
      return
    }

    const educationEntry: Education = {
      id: editingId || Date.now().toString(),
      institution: formData.institution,
      degree: formData.degree,
      field: formData.field,
      startDate: formData.startDate,
      endDate: formData.endDate,
      ...(formData.gpa && { gpa: formData.gpa }),
      ...(formData.achievements && { achievements: formData.achievements.split('\n').filter(a => a.trim()) })
    }

    if (editingId) {
      // Update existing
      const updatedData = data.map(item => 
        item.id === editingId ? educationEntry : item
      )
      onChange(updatedData)
    } else {
      // Add new
      onChange([...data, educationEntry])
    }

    closeDialog()
  }

  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id))
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Education
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </CardTitle>
        <CardDescription>
          Add your educational background and academic achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No education entries yet
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Education
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((education, index) => (
              <div key={education.id}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{education.degree}</h3>
                      {education.gpa && (
                        <Badge variant="secondary">
                          GPA: {education.gpa}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground font-medium">{education.field}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Building className="mr-1 h-4 w-4" />
                      {education.institution}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(education.startDate)} - {formatDate(education.endDate)}
                    </div>
                    
                    {education.achievements && education.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Achievements:
                        </p>
                        <ul className="text-sm space-y-1">
                          {education.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start">
                              <Award className="mr-2 h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openDialog(education)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(education.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {index < data.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Education' : 'Add Education'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Update your educational information' : 'Add a new education entry to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  placeholder="University of California, Berkeley"
                  value={formData.institution}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Input
                  id="degree"
                  placeholder="Bachelor of Science"
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study *</Label>
              <Input
                id="field"
                placeholder="Computer Science"
                value={formData.field}
                onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA (Optional)</Label>
              <Input
                id="gpa"
                placeholder="3.8 / 4.0"
                value={formData.gpa}
                onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="achievements">Achievements (Optional)</Label>
              <Textarea
                id="achievements"
                placeholder="Magna Cum Laude&#10;Dean's List&#10;Phi Beta Kappa"
                rows={4}
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Enter each achievement on a new line
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.institution || !formData.degree || !formData.field}
            >
              {editingId ? 'Update' : 'Add'} Education
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}