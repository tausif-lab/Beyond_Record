"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, BookOpen, Upload } from "lucide-react"

interface ValueAddedCourse
{
    courseName: string
    year: number
    beneficiaries: number
}

interface Step2Data
{
    programmesRevised?: number
    collectsFeedback?: boolean
    feedbackSample?: File | null
    academicFlexibility?: string[]
    valueAddedCourses?: ValueAddedCourse[]
    crossCuttingIssues?: string[]
}

interface NAACStep2Props
{
    data: Step2Data
    onChange: (data: Step2Data) => void
    institutionalData?: any
}

export function NAACStep2({ data, onChange }: NAACStep2Props)
{
    const [formData, setFormData] = useState<Step2Data>(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field: keyof Step2Data, value: any) =>
    {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCourseAdd = () =>
    {
        const newCourse: ValueAddedCourse = {
            courseName: "",
            year: new Date().getFullYear(),
            beneficiaries: 0
        }
        setFormData(prev => ({
            ...prev,
            valueAddedCourses: [...(prev.valueAddedCourses || []), newCourse]
        }))
    }

    const handleCourseRemove = (index: number) =>
    {
        setFormData(prev => ({
            ...prev,
            valueAddedCourses: (prev.valueAddedCourses || []).filter((_, i) => i !== index)
        }));
    };

    const handleCourseChange = (index: number, field: keyof ValueAddedCourse, value: any) =>
    {
        setFormData(prev => ({
            ...prev,
            valueAddedCourses: (prev.valueAddedCourses || []).map((course, i) =>
                i === index ? { ...course, [field]: value } : course
            )
        }));
    };

    const handleFlexibilityChange = (option: string, checked: boolean) =>
    {
        setFormData(prev => ({
            ...prev,
            academicFlexibility: checked
                ? [...(prev.academicFlexibility || []), option]
                : (prev.academicFlexibility || []).filter(f => f !== option)
        }));
    };

    const handleCrossCuttingChange = (issue: string, checked: boolean) =>
    {
        setFormData(prev => ({
            ...prev,
            crossCuttingIssues: checked
                ? [...(prev.crossCuttingIssues || []), issue]
                : (prev.crossCuttingIssues || []).filter(i => i !== issue)
        }));
    };


    const flexibilityOptions = ["CBCS", "Electives", "Open Courses", "Add-on Courses", "Interdisciplinary Courses"]
    const crossCuttingOptions = ["Ethics", "Gender", "Environment", "Sustainability", "Human Values", "Professional Ethics"]

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 1: Curricular Aspects</h3>
            </div>

            {/* Programme Revision */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Programme Revision</CardTitle>
                    <CardDescription>Information about curriculum updates and revisions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="programmesRevised">How many programmes were revised in the last 5 years? *</Label>
                        <Input
                            id="programmesRevised"
                            type="number"
                            min="0"
                            value={formData.programmesRevised || ""}
                            onChange={(e) => handleInputChange("programmesRevised", parseInt(e.target.value))}
                            placeholder="0"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stakeholder Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Stakeholder Feedback</CardTitle>
                    <CardDescription>Feedback collection mechanisms from various stakeholders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="collectsFeedback"
                                checked={formData.collectsFeedback || false}
                                onCheckedChange={(checked) => handleInputChange("collectsFeedback", checked)}
                            />
                            <Label htmlFor="collectsFeedback">
                                Does your institution collect feedback from stakeholders (students, teachers, employers, alumni)?
                            </Label>
                        </div>

                        {formData.collectsFeedback && (
                            <div className="space-y-2">
                                <Label htmlFor="feedbackSample">Upload sample feedback form/report</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="feedbackSample"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleInputChange("feedbackSample", e.target.files?.[0])}
                                    />
                                    <Button variant="outline" size="sm">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Academic Flexibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Academic Flexibility</CardTitle>
                    <CardDescription>Types of academic flexibility available to students</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {flexibilityOptions.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={option}
                                    checked={formData.academicFlexibility?.includes(option) || false}
                                    onCheckedChange={(checked) => handleFlexibilityChange(option, checked as boolean)}
                                />
                                <Label htmlFor={option}>{option}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Value-Added Courses */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Value-Added / Certificate Courses</CardTitle>
                    <CardDescription>Courses introduced beyond regular curriculum</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.valueAddedCourses?.map((course, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Course {index + 1}</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCourseRemove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Course Name</Label>
                                    <Input
                                        value={course.courseName}
                                        onChange={(e) => handleCourseChange(index, "courseName", e.target.value)}
                                        placeholder="e.g., Digital Marketing"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Year Introduced</Label>
                                    <Input
                                        type="number"
                                        min="2000"
                                        max={new Date().getFullYear()}
                                        value={course.year}
                                        onChange={(e) => handleCourseChange(index, "year", parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Number of Beneficiaries</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={course.beneficiaries}
                                        onChange={(e) => handleCourseChange(index, "beneficiaries", parseInt(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button onClick={handleCourseAdd} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Value-Added Course
                    </Button>
                </CardContent>
            </Card>

            {/* Cross-Cutting Issues */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Integration of Cross-Cutting Issues</CardTitle>
                    <CardDescription>Cross-cutting issues integrated into the curriculum</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {crossCuttingOptions.map((issue) => (
                            <div key={issue} className="flex items-center space-x-2">
                                <Checkbox
                                    id={issue}
                                    checked={formData.crossCuttingIssues?.includes(issue) || false}
                                    onCheckedChange={(checked) => handleCrossCuttingChange(issue, checked as boolean)}
                                />
                                <Label htmlFor={issue}>{issue}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
                <p>* Required fields must be completed before proceeding to the next step.</p>
            </div>
        </div>
    )
}