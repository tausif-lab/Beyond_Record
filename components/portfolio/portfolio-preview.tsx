"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Share2, ExternalLink } from "lucide-react"
import { PortfolioData } from "./portfolio-editor"

interface PortfolioPreviewProps {
  data: PortfolioData
  onClose: () => void
}

export function PortfolioPreview({ data, onClose }: PortfolioPreviewProps) {
  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Preview Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold">Portfolio Preview</h1>
              <p className="text-sm text-muted-foreground">
                {data.template.name} template
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-[calc(100vh-4rem)] overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-4">Portfolio Preview</h2>
                <p className="text-muted-foreground mb-8">
                  Template: {data.template.name}
                </p>
                <div className="space-y-4 text-left max-w-2xl mx-auto">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Personal Info</h3>
                    <p>{data.personalInfo.name || 'Name not set'}</p>
                    <p>{data.personalInfo.title || 'Title not set'}</p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Education</h3>
                    <p>{data.education.length} education entries</p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Projects</h3>
                    <p>{data.projects.length} project entries</p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center mt-8">
                    Full preview implementation coming soon...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}