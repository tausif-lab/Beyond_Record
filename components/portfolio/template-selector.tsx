"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Check } from "lucide-react"

interface Template {
  name: string
  theme: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

interface TemplateSelectorProps {
  currentTemplate: Template
  onSelect: (template: Template) => void
  onClose: () => void
}

const templates = [
  {
    name: 'modern',
    displayName: 'Modern',
    description: 'Clean and professional design',
    theme: 'light',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4'
    }
  },
  {
    name: 'creative',
    displayName: 'Creative',
    description: 'Vibrant and artistic layout',
    theme: 'light',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#ec4899'
    }
  },
  {
    name: 'academic',
    displayName: 'Academic',
    description: 'Traditional and scholarly appearance',
    theme: 'light',
    colors: {
      primary: '#059669',
      secondary: '#374151',
      accent: '#f59e0b'
    }
  }
]

export function TemplateSelector({ currentTemplate, onSelect, onClose }: TemplateSelectorProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Choose Template
          </DialogTitle>
          <DialogDescription>
            Select a template design for your portfolio
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const isSelected = currentTemplate.name === template.name
            
            return (
              <Card 
                key={template.name} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onSelect({
                  name: template.name,
                  theme: template.theme,
                  colors: template.colors
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{template.displayName}</h3>
                    {isSelected && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  
                  {/* Color Preview */}
                  <div className="flex space-x-2 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: template.colors.primary }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: template.colors.secondary }}
                      title="Secondary Color"
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: template.colors.accent }}
                      title="Accent Color"
                    />
                  </div>
                  
                  {/* Template Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <Badge className="w-full justify-center mt-3">
                      Current Template
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}