"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Building, Users, Award } from "lucide-react"

interface Programme
{
    name: string
    level: string
    yearStarted: number
    intakeCapacity: number
}

interface Step1Data
{
    institutionName?: string
    institutionType?: string
    yearOfEstablishment?: number
    governingBody?: string
    accreditationCycle?: string
    totalStudentsUG?: number
    totalStudentsPG?: number
    totalStudentsPhD?: number
    totalTeachingStaff?: number
    totalNonTeachingStaff?: number
    programmes?: Programme[]
    recognitions?: string[]
    campusArea?: number
    builtUpArea?: number
    website?: string
    contactEmail?: string
    naacCoordinator?: string
}

interface NAACStep1Props
{
    data: Step1Data
    onChange: (data: Step1Data) => void
}

export function NAACStep1({ data, onChange }: NAACStep1Props)
{
    const [formData, setFormData] = useState<Step1Data>(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field: keyof Step1Data, value: any) =>
    {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleProgrammeAdd = () =>
    {
        const newProgramme: Programme = {
            name: "",
            level: "",
            yearStarted: new Date().getFullYear(),
            intakeCapacity: 0
        }
        setFormData(prev => ({
            ...prev,
            programmes: [...(prev.programmes || []), newProgramme]
        }))
    }

    const handleProgrammeRemove = (index: number) =>
    {
        // Remove the programme at the specified index
        if (!formData.programmes) return;
        const updated = formData.programmes.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, programmes: updated }));
    };

    const handleProgrammeChange = (index: number, field: keyof Programme, value: any) =>
    {
        // Update the field of the programme at the specified index
        if (!formData.programmes) return;
        const updated = formData.programmes.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
        );
        setFormData(prev => ({ ...prev, programmes: updated }));
    };

    const handleRecognitionChange = (recognition: string, checked: boolean) =>
    {
        // Add or remove recognition from the array
        let updated: string[] = formData.recognitions || [];
        if (checked)
        {
            updated = updated.includes(recognition) ? updated : [...updated, recognition];
        } else
        {
            updated = updated.filter(r => r !== recognition);
        }
        setFormData(prev => ({ ...prev, recognitions: updated }));
    };


    const recognitionOptions = ["UGC", "AICTE", "MCI", "NCTE", "BCI", "PCI", "Others"]

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Building className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Institutional Profile</h3>
            </div>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                    <CardDescription>Fundamental details about your institution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="institutionName">Institution Name *</Label>
                            <Input
                                id="institutionName"
                                value={formData.institutionName || ""}
                                onChange={(e) => handleInputChange("institutionName", e.target.value)}
                                placeholder="Enter institution name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="institutionType">Institution Type *</Label>
                            <Select
                                value={formData.institutionType || ""}
                                onValueChange={(value) => handleInputChange("institutionType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="University">University</SelectItem>
                                    <SelectItem value="Autonomous">Autonomous</SelectItem>
                                    <SelectItem value="Affiliated">Affiliated</SelectItem>
                                    <SelectItem value="Deemed">Deemed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="yearOfEstablishment">Year of Establishment *</Label>
                            <Input
                                id="yearOfEstablishment"
                                type="number"
                                min="1800"
                                max={new Date().getFullYear()}
                                value={formData.yearOfEstablishment || ""}
                                onChange={(e) => handleInputChange("yearOfEstablishment", parseInt(e.target.value))}
                                placeholder="e.g., 1970"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="governingBody">Governing Body *</Label>
                            <Select
                                value={formData.governingBody || ""}
                                onValueChange={(value) => handleInputChange("governingBody", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select governing body" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Trust">Trust</SelectItem>
                                    <SelectItem value="Society">Society</SelectItem>
                                    <SelectItem value="Govt">Government</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accreditationCycle">Accreditation Cycle *</Label>
                            <Select
                                value={formData.accreditationCycle || ""}
                                onValueChange={(value) => handleInputChange("accreditationCycle", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cycle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1st">1st Cycle</SelectItem>
                                    <SelectItem value="2nd">2nd Cycle</SelectItem>
                                    <SelectItem value="3rd">3rd Cycle</SelectItem>
                                    <SelectItem value="4th">4th Cycle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student & Staff Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Student & Staff Information
                    </CardTitle>
                    <CardDescription>Total numbers for current academic year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalStudentsUG">Total UG Students *</Label>
                            <Input
                                id="totalStudentsUG"
                                type="number"
                                min="0"
                                value={formData.totalStudentsUG || ""}
                                onChange={(e) => handleInputChange("totalStudentsUG", parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalStudentsPG">Total PG Students *</Label>
                            <Input
                                id="totalStudentsPG"
                                type="number"
                                min="0"
                                value={formData.totalStudentsPG || ""}
                                onChange={(e) => handleInputChange("totalStudentsPG", parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalStudentsPhD">Total PhD Students *</Label>
                            <Input
                                id="totalStudentsPhD"
                                type="number"
                                min="0"
                                value={formData.totalStudentsPhD || ""}
                                onChange={(e) => handleInputChange("totalStudentsPhD", parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalTeachingStaff">Total Teaching Staff *</Label>
                            <Input
                                id="totalTeachingStaff"
                                type="number"
                                min="0"
                                value={formData.totalTeachingStaff || ""}
                                onChange={(e) => handleInputChange("totalTeachingStaff", parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalNonTeachingStaff">Total Non-Teaching Staff *</Label>
                            <Input
                                id="totalNonTeachingStaff"
                                type="number"
                                min="0"
                                value={formData.totalNonTeachingStaff || ""}
                                onChange={(e) => handleInputChange("totalNonTeachingStaff", parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Programmes Offered */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Programmes Offered</CardTitle>
                    <CardDescription>List all academic programmes currently offered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.programmes?.map((programme, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Programme {index + 1}</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProgrammeRemove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Programme Name</Label>
                                    <Input
                                        value={programme.name}
                                        onChange={(e) => handleProgrammeChange(index, "name", e.target.value)}
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Level</Label>
                                    <Select
                                        value={programme.level}
                                        onValueChange={(value) => handleProgrammeChange(index, "level", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UG">UG</SelectItem>
                                            <SelectItem value="PG">PG</SelectItem>
                                            <SelectItem value="PhD">PhD</SelectItem>
                                            <SelectItem value="Diploma">Diploma</SelectItem>
                                            <SelectItem value="Certificate">Certificate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Year Started</Label>
                                    <Input
                                        type="number"
                                        min="1950"
                                        max={new Date().getFullYear()}
                                        value={programme.yearStarted}
                                        onChange={(e) => handleProgrammeChange(index, "yearStarted", parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Intake Capacity</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={programme.intakeCapacity}
                                        onChange={(e) => handleProgrammeChange(index, "intakeCapacity", parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button onClick={handleProgrammeAdd} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Programme
                    </Button>
                </CardContent>
            </Card>

            {/* Recognitions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center">
                        <Award className="mr-2 h-5 w-5" />
                        Recognitions
                    </CardTitle>
                    <CardDescription>Select all applicable regulatory body recognitions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {recognitionOptions.map((recognition) => (
                            <div key={recognition} className="flex items-center space-x-2">
                                <Checkbox
                                    id={recognition}
                                    checked={formData.recognitions?.includes(recognition) || false}
                                    onCheckedChange={(checked) => handleRecognitionChange(recognition, checked as boolean)}
                                />
                                <Label htmlFor={recognition}>{recognition}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Infrastructure & Contact */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Infrastructure & Contact Information</CardTitle>
                    <CardDescription>Physical infrastructure and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="campusArea">Campus Area (in acres) *</Label>
                            <Input
                                id="campusArea"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.campusArea || ""}
                                onChange={(e) => handleInputChange("campusArea", parseFloat(e.target.value))}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="builtUpArea">Built-up Area (sq.m) *</Label>
                            <Input
                                id="builtUpArea"
                                type="number"
                                min="0"
                                value={formData.builtUpArea || ""}
                                onChange={(e) => handleInputChange("builtUpArea", parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website || ""}
                                onChange={(e) => handleInputChange("website", e.target.value)}
                                placeholder="https://www.institution.edu"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email *</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail || ""}
                                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                                placeholder="info@institution.edu"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="naacCoordinator">NAAC Coordinator *</Label>
                        <Input
                            id="naacCoordinator"
                            value={formData.naacCoordinator || ""}
                            onChange={(e) => handleInputChange("naacCoordinator", e.target.value)}
                            placeholder="Name of NAAC Coordinator"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
                <p>* Required fields must be completed before proceeding to the next step.</p>
            </div>
        </div>
    )
}