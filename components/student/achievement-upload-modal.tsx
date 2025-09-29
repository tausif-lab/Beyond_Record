"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UploadCloud, Info } from "lucide-react"

interface AchievementUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploaded: () => void
}

export function AchievementUploadModal({ isOpen, onClose, onUploaded }: AchievementUploadModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError("")

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('date', date)
      formData.append('category', category || 'other')
      if (file) formData.append('evidence', file)

      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/student/achievements', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData,
        credentials: 'include'
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to upload achievement')
      }

      onUploaded()
      onClose()
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UploadCloud className="mr-2 h-5 w-5" />
            Submit Achievement for Verification
          </DialogTitle>
          <DialogDescription>
            Your achievement will be reviewed by faculty members from your institution before being added to your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Hackathon Winner" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g., Oct 2024" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select achievement category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Achievement</SelectItem>
                <SelectItem value="extracurricular">Extracurricular Activity</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="award">Award/Recognition</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description of the achievement" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence (PDF/JPG/PNG)</Label>
            <Input id="evidence" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">Upload supporting documents like certificates, photos, or screenshots</p>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your submission will be reviewed by faculty members from your institution. You'll receive a notification once it's been reviewed.
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="bg-transparent">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !title || !description || !date || !category}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit for Verification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
