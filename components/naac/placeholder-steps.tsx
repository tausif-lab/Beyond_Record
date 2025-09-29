"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import
{
    BookOpen,
    Users,
    Building,
    TrendingUp,
    Shield,
    Heart,
    Download,
} from "lucide-react"

// Step 3: Teaching-Learning & Evaluation
export function NAACStep3({ data, onChange, institutionalData }: any)
{
    const [formData, setFormData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field: string, value: any) =>
    {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    // Calculate student-teacher ratio with debugging
    const totalStudentsUG = parseInt(institutionalData?.totalStudentsUG) || 0
    const totalStudentsPG = parseInt(institutionalData?.totalStudentsPG) || 0
    const totalStudentsPhD = parseInt(institutionalData?.totalStudentsPhD) || 0
    const totalStudents = totalStudentsUG + totalStudentsPG + totalStudentsPhD
    const teachingStaff = parseInt(institutionalData?.totalTeachingStaff) || 0
    const teacherStudentRatio = teachingStaff > 0 ? (totalStudents / teachingStaff) : 0

    // Student-Teacher ratio calculations complete

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 2: Teaching-Learning & Evaluation</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Admission Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Describe your admission process</Label>
                        <Textarea
                            value={formData.admissionProcess || ""}
                            onChange={(e) => handleInputChange("admissionProcess", e.target.value)}
                            placeholder="Describe the admission criteria and process..."
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student-Teacher Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`p-4 rounded-lg ${teacherStudentRatio > 0 ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
                        } border`}>
                        <p className="text-lg font-semibold">
                            Current Ratio: {teacherStudentRatio > 0 ? `${teacherStudentRatio.toFixed(1)} : 1` : 'Not Calculated'}
                        </p>
                        <div className="text-sm text-muted-foreground mt-2">
                            <p>Total Students: {totalStudents} (UG: {totalStudentsUG}, PG: {totalStudentsPG}, PhD: {totalStudentsPhD})</p>
                            <p>Teaching Staff: {teachingStaff}</p>
                            <p className="text-xs mt-1">
                                {teacherStudentRatio > 0
                                    ? '(Auto-calculated from Step 1 data)'
                                    : '(Please complete Step 1 with student and staff numbers)'
                                }
                            </p>
                        </div>
                        {teacherStudentRatio === 0 && totalStudents === 0 && teachingStaff === 0 && (
                            <div className="mt-3 p-2 bg-yellow-100 rounded border text-sm text-yellow-800">
                                <strong>⚠️ No data found:</strong> Please go back to Step 1 and fill in:
                                <ul className="list-disc list-inside mt-1">
                                    <li>Total UG Students</li>
                                    <li>Total PG Students</li>
                                    <li>Total PhD Students</li>
                                    <li>Total Teaching Staff</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>ICT Infrastructure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Number of ICT-enabled classrooms</Label>
                        <Input
                            type="number"
                            value={formData.ictClassrooms || ""}
                            onChange={(e) => handleInputChange("ictClassrooms", e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Step 4: Research, Innovations & Extension
export function NAACStep4({ data, onChange }: any)
{
    const [formData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 3: Research, Innovations & Extension</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Research Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Number of ongoing research projects</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Total research funding (₹)</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Publications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Number of publications in peer-reviewed journals</Label>
                        <Input type="number" placeholder="0" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Step 5: Infrastructure & Learning Resources
export function NAACStep5({ data, onChange }: any)
{
    const [formData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Building className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 4: Infrastructure & Learning Resources</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Physical Infrastructure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Number of Classrooms</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Laboratories</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Seminar Halls</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Library Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Number of Books</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Journals</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Step 6: Student Support & Progression
export function NAACStep6({ data, onChange }: any)
{
    const [formData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 5: Student Support & Progression</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scholarships</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Number of scholarship recipients</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Total scholarship amount (₹)</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Placement Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Number of students placed</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Average salary package (₹)</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Step 7: Governance, Leadership & Management
export function NAACStep7({ data, onChange }: any)
{
    const [formData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 6: Governance, Leadership & Management</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vision & Mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vision Statement</Label>
                        <Textarea placeholder="Enter your institution's vision..." rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label>Mission Statement</Label>
                        <Textarea placeholder="Enter your institution's mission..." rows={3} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>IQAC Initiatives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Number of IQAC meetings conducted annually</Label>
                        <Input type="number" placeholder="0" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Step 8: Institutional Values & Best Practices
export function NAACStep8({ data, onChange }: any)
{
    const [formData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Heart className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Criterion 7: Institutional Values & Best Practices</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Environmental Initiatives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {["Green Campus", "Solar Energy", "Waste Management", "Rainwater Harvesting"].map((initiative) => (
                            <div key={initiative} className="flex items-center space-x-2">
                                <input type="checkbox" id={initiative} />
                                <Label htmlFor={initiative}>{initiative}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Describe your institution's best practices (minimum 2)</Label>
                        <Textarea placeholder="Describe your best practices..." rows={5} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Step 9: Student Satisfaction Survey
export function NAACStep9({ data, onChange }: any)
{
    const [formData] = useState(data)

    useEffect(() =>
    {
        onChange(formData)
    }, [formData, onChange])

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Student Satisfaction Survey (SSS)</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Survey Management</CardTitle>
                    <CardDescription>Generate and manage student satisfaction surveys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Student Satisfaction Survey</h3>
                        <p className="text-muted-foreground mb-4">
                            Generate survey links for students to provide feedback on institutional services
                        </p>
                        <Button className="mr-2">
                            Generate Survey Link
                        </Button>
                        <Button variant="outline">
                            View Responses
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper function to calculate total students from data
function getTotalStudents(data: any)
{
    const step1Data = data[1] || data
    const ug = parseInt(step1Data?.totalStudentsUG) || 0
    const pg = parseInt(step1Data?.totalStudentsPG) || 0
    const phd = parseInt(step1Data?.totalStudentsPhD) || 0
    return ug + pg + phd
}

// Step 10: Report Generation
export function NAACStep10({ data }: any)
{
    const [generating, setGenerating] = useState(false)
    const [reportGenerated, setReportGenerated] = useState(false)
    const [calculations, setCalculations] = useState<any>(null)

    const generateReport = async () =>
    {
        setGenerating(true)
        try
        {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/naac-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    action: 'generate_report'
                })
            })

            if (response.ok)
            {
                const result = await response.json()
                setCalculations(result.calculations)
                setReportGenerated(true)
                // Show success message
                alert('NAAC Self Study Report generated successfully!')
            } else
            {
                alert('Failed to generate report. Please try again.')
            }
        } catch (error)
        {
            console.error('Error generating report:', error)
            alert('Error generating report. Please try again.')
        } finally
        {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Download className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Final Report Generation</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Self Study Report (SSR)</CardTitle>
                    <CardDescription>Generate the final NAAC accreditation report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 border rounded-lg bg-green-50">
                        <h4 className="font-semibold text-green-800 mb-2">Report Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Institution:</strong> {data[1]?.institutionName || data.institutionName || 'N/A'}</p>
                                <p><strong>Type:</strong> {data[1]?.institutionType || data.institutionType || 'N/A'}</p>
                                <p><strong>Cycle:</strong> {data[1]?.accreditationCycle || data.accreditationCycle || 'N/A'}</p>
                                <p><strong>Established:</strong> {data[1]?.yearOfEstablishment || data.yearOfEstablishment || 'N/A'}</p>
                            </div>
                            <div>
                                <p><strong>Total Students:</strong> {getTotalStudents(data)}</p>
                                <p><strong>Teaching Staff:</strong> {data[1]?.totalTeachingStaff || data.totalTeachingStaff || 0}</p>
                                <p><strong>Non-Teaching Staff:</strong> {data[1]?.totalNonTeachingStaff || data.totalNonTeachingStaff || 0}</p>
                                <p><strong>Programmes:</strong> {(data[1]?.programmes || data.programmes || []).length}</p>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded text-sm">
                            <p className="font-medium text-blue-800">Data Quality Check:</p>
                            <p>Step 1 Data Available: {Object.keys(data[1] || {}).length > 0 ? '✅ Yes' : '❌ No'}</p>
                            <p>Raw Data Available: {Object.keys(data || {}).length > 0 ? '✅ Yes' : '❌ No'}</p>
                        </div>
                    </div>

                    {calculations && (
                        <div className="p-6 border rounded-lg bg-blue-50">
                            <h4 className="font-semibold text-blue-800 mb-4">Official NAAC Assessment Results</h4>

                            {/* Overall Grade Display */}
                            <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-400">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">Overall NAAC Grade</p>
                                    <div className="text-4xl font-bold text-green-600 mb-2">{calculations.overallGrade}</div>
                                    <div className="text-lg font-semibold text-green-700 mb-1">CGPA: {calculations.overallCGPA}</div>
                                    <p className="text-sm text-gray-600">{calculations.gradeDescription}</p>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                                <div className="bg-white p-3 rounded border">
                                    <p className="font-medium text-gray-700">Student-Teacher Ratio</p>
                                    <p className="text-xl font-bold text-blue-600">{calculations.studentTeacherRatio?.toFixed(1)}:1</p>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <p className="font-medium text-gray-700">Publications/Faculty</p>
                                    <p className="text-xl font-bold text-blue-600">{calculations.publicationsPerFaculty?.toFixed(2)}</p>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <p className="font-medium text-gray-700">Placement Rate</p>
                                    <p className="text-xl font-bold text-blue-600">{calculations.placementPercentage?.toFixed(1)}%</p>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <p className="font-medium text-gray-700">Research Funding</p>
                                    <p className="text-xl font-bold text-blue-600">₹{(calculations.researchIntensity / 1000)?.toFixed(0)}K</p>
                                </div>
                            </div>

                            {/* Criteria-wise CGPA */}
                            {Object.entries(calculations.criteriaScores || {}).map(([criteria, cgpa]) => (
                                <div key={criteria} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="font-medium text-gray-700">{criteria}:</span>
                                    <span className="font-bold text-blue-600">{cgpa as number}</span>
                                </div>
                            ))}


                            <div className="mt-4 text-xs text-gray-500">
                                <p><strong>Note:</strong> This assessment follows the official NAAC framework. Actual accreditation requires peer team evaluation and additional documentation.</p>
                            </div>
                        </div>
                    )}

                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            Your NAAC Self Study Report is ready for generation
                        </p>
                        <div className="space-x-4">
                            <Button
                                onClick={generateReport}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={generating}
                            >
                                <Download className="mr-2 h-5 w-5" />
                                {generating ? 'Generating...' : reportGenerated ? 'Download SSR' : 'Generate & Download SSR'}
                            </Button>
                            {reportGenerated && (
                                <Button variant="outline" size="lg">
                                    Preview Report
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}