"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  GraduationCap, 
  Link as LinkIcon, 
  Plus, 
  X, 
  Save,
  Loader2,
  Github,
  Linkedin,
  Globe,
  Phone,
  MapPin
} from "lucide-react"
import { authService } from "@/lib/auth"
import toast from "react-hot-toast"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: any
  onProfileUpdate: (updatedProfile: any) => void
}

const majors = [
  "Computer Science",
  "Software Engineering", 
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Marketing",
  "Finance",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Psychology",
  "Other"
]

const years = [
  "Freshman",
  "Sophomore", 
  "Junior",
  "Senior",
  "Graduate",
  "PhD"
]

const commonSkills = [
  "JavaScript", "Python", "Java", "C++", "React", "Node.js", "Angular", "Vue.js",
  "HTML", "CSS", "TypeScript", "PHP", "Ruby", "Go", "Rust", "Swift",
  "SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "AWS", "Docker", "Kubernetes",
  "Git", "Linux", "Windows", "MacOS", "Figma", "Photoshop", "Illustrator"
]

export function EditProfileModal({ isOpen, onClose, currentProfile, onProfileUpdate }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [profileData, setProfileData] = useState({
    // Basic Info
    major: "",
    year: "",
    bio: "",
    location: "",
    phone: "",
    
    // Skills
    skills: [] as string[],
    newSkill: "",
    
    // Social Links
    socialLinks: {
      linkedin: "",
      github: "",
      website: "",
    }
  })

  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (currentProfile) {
      setProfileData({
        major: currentProfile.major || "",
        year: currentProfile.year || "",
        bio: currentProfile.bio || "",
        location: currentProfile.location || "",
        phone: currentProfile.phone || "",
        skills: currentProfile.skills || [],
        newSkill: "",
        socialLinks: {
          linkedin: currentProfile.socialLinks?.linkedin || "",
          github: currentProfile.socialLinks?.github || "",
          website: currentProfile.socialLinks?.website || "",
        }
      })
    }
  }, [currentProfile])

  const handleAddSkill = (skill?: string) => {
    const skillToAdd = skill || profileData.newSkill.trim()
    if (skillToAdd && !profileData.skills.includes(skillToAdd)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillToAdd],
        newSkill: ""
      }))
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError("")

      const updateData = {
        major: profileData.major,
        year: profileData.year,
        bio: profileData.bio,
        skills: profileData.skills,
        socialLinks: profileData.socialLinks
      }

      const response = await authService.updateStudentProfile(updateData)
      
      if (response) {
        toast.success("Profile updated successfully!")
        onProfileUpdate({ ...currentProfile, ...updateData })
        onClose()
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <User className="mr-2 h-6 w-6" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your academic information, skills, and social links
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Update your academic details and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Select
                      value={profileData.major}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, major: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your major" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors.map((major) => (
                          <SelectItem key={major} value={major}>
                            {major}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Academic Year</Label>
                    <Select
                      value={profileData.year}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself, your interests, and goals..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Technologies</CardTitle>
                <CardDescription>
                  Add your technical and professional skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={profileData.newSkill}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newSkill: e.target.value }))}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                  <Button onClick={() => handleAddSkill()} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Common Skills */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Common Skills (click to add):
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonSkills.filter(skill => !profileData.skills.includes(skill)).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleAddSkill(skill)}
                      >
                        + {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Selected Skills */}
                <div>
                  <Label className="text-sm font-medium">Your Skills:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.skills.map((skill) => (
                      <Badge key={skill} variant="default" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  {profileData.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No skills added yet. Add some skills to showcase your expertise!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LinkIcon className="mr-2 h-5 w-5" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Add your professional and social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                        }))}
                        placeholder="https://linkedin.com/in/username"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="github"
                        value={profileData.socialLinks.github}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, github: e.target.value }
                        }))}
                        placeholder="https://github.com/username"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Personal Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        value={profileData.socialLinks.website}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, website: e.target.value }
                        }))}
                        placeholder="https://yourwebsite.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}