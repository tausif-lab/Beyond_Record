import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { NAACReport, User } from '@/lib/models'
import { verifyTokenFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Try to get user from token
    const payload = verifyTokenFromRequest(request)
    let userId = null
    
    if (payload && payload.role === 'faculty') {
      userId = payload.userId
    } else {
      // For demo, use first faculty member
      const demoFaculty = await (User as any).findOne({ role: 'faculty' })
      if (demoFaculty) {
        userId = demoFaculty._id.toString()
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'No faculty user found' }, { status: 404 })
    }
    
    // Get or create NAAC report for this user
    let report = await (NAACReport as any).findOne({ userId })
    
    if (!report) {
      // Create a new report
      report = new NAACReport({
        userId,
        currentStep: 1,
        completedSteps: [],
        isCompleted: false
      })
      await report.save()
    }
    
    return NextResponse.json({ 
      report,
      success: true 
    })
  } catch (e) {
    console.error('NAAC Report GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
    const { step, data, action } = body || {}
    
    // Try to get user from token
    const payload = verifyTokenFromRequest(request)
    let userId = null
    
    if (payload && payload.role === 'faculty') {
      userId = payload.userId
    } else {
      // For demo, use first faculty member
      const demoFaculty = await (User as any).findOne({ role: 'faculty' })
      if (demoFaculty) {
        userId = demoFaculty._id.toString()
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'No faculty user found' }, { status: 404 })
    }
    
    // Find or create report
    let report = await (NAACReport as any).findOne({ userId })
    
    if (!report) {
      report = new NAACReport({
        userId,
        currentStep: 1,
        completedSteps: [],
        isCompleted: false
      })
    }
    
    if (action === 'save_step') {
      // Save step data
      const updateData = { ...data }
      
      // Update current step
      if (step) {
        updateData.currentStep = step
      }
      
      // Add to completed steps if not already there
      if (step && !report.completedSteps.includes(step)) {
        updateData.completedSteps = [...report.completedSteps, step]
      }
      
      // Update the report
      Object.assign(report, updateData)
      await report.save()
      
      return NextResponse.json({ 
        message: 'Step saved successfully',
        report,
        success: true 
      })
    }
    
    if (action === 'generate_report') {
      // Mark as completed and generate report
      report.isCompleted = true
      report.generatedAt = new Date()
      
      // Calculate metrics
      const calculations = calculateNAACMetrics(report)
      
      // Save calculations to report
      Object.assign(report, calculations)
      await report.save()
      
      return NextResponse.json({ 
        message: 'Report generated successfully',
        report,
        calculations,
        success: true 
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (e) {
    console.error('NAAC Report POST error:', e)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to calculate NAAC metrics
function calculateNAACMetrics(report: any) {
  const calculations = {
    // Student-Teacher Ratio
    studentTeacherRatio: 0,
    totalStudents: 0,
    // Infrastructure metrics
    classroomUtilization: 0,
    // Research metrics
    publicationsPerFaculty: 0,
    researchIntensity: 0,
    // Student progression
    placementPercentage: 0,
    // Overall scores
    criteriaScores: {} as Record<string, string>,
    overallCGPA: '0.00',
    overallGrade: 'N/A',
    gradeDescription: 'Not Available'
  }
  
  // Calculate total students
  const ugStudents = report.totalStudentsUG || 0
  const pgStudents = report.totalStudentsPG || 0
  const phdStudents = report.totalStudentsPhD || 0
  calculations.totalStudents = ugStudents + pgStudents + phdStudents
  
  // Calculate Student-Teacher Ratio
  const teachingStaff = report.totalTeachingStaff || 1
  calculations.studentTeacherRatio = calculations.totalStudents / teachingStaff
  
  // Calculate Publications per Faculty
  const publications = report.publications?.length || 0
  calculations.publicationsPerFaculty = publications / teachingStaff
  
  // Calculate Placement Percentage
  const placedStudents = report.placedStudents || 0
  if (calculations.totalStudents > 0) {
    calculations.placementPercentage = (placedStudents / calculations.totalStudents) * 100
  }
  
  // Calculate Research Intensity (total funding / faculty)
  const totalResearchFunding = report.researchProjects?.reduce((sum: number, project: any) => sum + (project.amount || 0), 0) || 0
  calculations.researchIntensity = totalResearchFunding / teachingStaff
  
  // Calculate Classroom Utilization
  const classrooms = report.classrooms || 1
  calculations.classroomUtilization = calculations.totalStudents / classrooms
  
  // Official NAAC Assessment Framework (7 Criteria)
  let totalCGPA = 0
  let validCriteria = 0
  
  // Criterion 1: Curricular Aspects (Maximum CGPA: 4.0)
  let c1CGPA = 2.0 // Base CGPA
  if (report.programmesRevised && report.programmesRevised > 0) c1CGPA += 0.5
  if (report.collectsFeedback) c1CGPA += 0.3
  if (report.academicFlexibility?.length > 0) c1CGPA += 0.4
  if (report.valueAddedCourses?.length > 0) c1CGPA += 0.5
  if (report.crossCuttingIssues?.length >= 3) c1CGPA += 0.3
  c1CGPA = Math.min(c1CGPA, 4.0)
  calculations.criteriaScores['Criterion 1: Curricular Aspects'] = c1CGPA.toFixed(2)
  totalCGPA += c1CGPA
  validCriteria++
  
  // Criterion 2: Teaching-Learning & Evaluation (Maximum CGPA: 4.0)
  let c2CGPA = 1.5 // Base CGPA
  if (report.admissionProcess) c2CGPA += 0.3
  if (calculations.studentTeacherRatio <= 15) c2CGPA += 0.8
  else if (calculations.studentTeacherRatio <= 20) c2CGPA += 0.6
  else if (calculations.studentTeacherRatio <= 25) c2CGPA += 0.4
  else if (calculations.studentTeacherRatio <= 30) c2CGPA += 0.2
  if (report.ictClassrooms && report.ictClassrooms > 0) {
    const ictRatio = report.ictClassrooms / (report.classrooms || 1)
    if (ictRatio >= 0.8) c2CGPA += 0.6
    else if (ictRatio >= 0.5) c2CGPA += 0.4
    else if (ictRatio >= 0.3) c2CGPA += 0.2
  }
  if (report.assessmentMethods?.length >= 3) c2CGPA += 0.3
  c2CGPA = Math.min(c2CGPA, 4.0)
  calculations.criteriaScores['Criterion 2: Teaching-Learning & Evaluation'] = c2CGPA.toFixed(2)
  totalCGPA += c2CGPA
  validCriteria++
  
  // Criterion 3: Research, Innovations & Extension (Maximum CGPA: 4.0)
  let c3CGPA = 1.0 // Base CGPA
  if (report.researchProjects?.length > 0) {
    c3CGPA += Math.min(report.researchProjects.length * 0.1, 0.5)
  }
  if (report.publications?.length > 0) {
    c3CGPA += Math.min(calculations.publicationsPerFaculty * 0.3, 1.0)
  }
  if (report.patents && report.patents > 0) c3CGPA += Math.min(report.patents * 0.1, 0.3)
  if (report.consultancyRevenue && report.consultancyRevenue > 0) c3CGPA += 0.2
  if (calculations.researchIntensity > 100000) c3CGPA += 0.5
  c3CGPA = Math.min(c3CGPA, 4.0)
  calculations.criteriaScores['Criterion 3: Research, Innovations & Extension'] = c3CGPA.toFixed(2)
  totalCGPA += c3CGPA
  validCriteria++
  
  // Criterion 4: Infrastructure & Learning Resources (Maximum CGPA: 4.0)
  let c4CGPA = 1.5 // Base CGPA
  if (report.classrooms && calculations.totalStudents > 0) {
    const classroomRatio = calculations.totalStudents / report.classrooms
    if (classroomRatio <= 60) c4CGPA += 0.5
    else if (classroomRatio <= 80) c4CGPA += 0.3
  }
  if (report.laboratories && report.laboratories > 0) c4CGPA += 0.3
  if (report.libraryBooks && report.libraryBooks >= 10000) c4CGPA += 0.4
  if (report.internetBandwidth && report.internetBandwidth >= 100) c4CGPA += 0.3
  if (report.computers && calculations.totalStudents > 0) {
    const computerRatio = report.computers / calculations.totalStudents
    if (computerRatio >= 0.3) c4CGPA += 0.5
  }
  c4CGPA = Math.min(c4CGPA, 4.0)
  calculations.criteriaScores['Criterion 4: Infrastructure & Learning Resources'] = c4CGPA.toFixed(2)
  totalCGPA += c4CGPA
  validCriteria++
  
  // Criterion 5: Student Support & Progression (Maximum CGPA: 4.0)
  let c5CGPA = 1.5 // Base CGPA
  if (calculations.placementPercentage >= 80) c5CGPA += 1.0
  else if (calculations.placementPercentage >= 60) c5CGPA += 0.7
  else if (calculations.placementPercentage >= 40) c5CGPA += 0.4
  if (report.scholarshipRecipients && calculations.totalStudents > 0) {
    const scholarshipRatio = report.scholarshipRecipients / calculations.totalStudents
    if (scholarshipRatio >= 0.3) c5CGPA += 0.5
    else if (scholarshipRatio >= 0.2) c5CGPA += 0.3
  }
  if (report.higherStudies && report.higherStudies > 0) c5CGPA += 0.3
  c5CGPA = Math.min(c5CGPA, 4.0)
  calculations.criteriaScores['Criterion 5: Student Support & Progression'] = c5CGPA.toFixed(2)
  totalCGPA += c5CGPA
  validCriteria++
  
  // Criterion 6: Governance, Leadership & Management (Maximum CGPA: 4.0)
  let c6CGPA = 1.5 // Base CGPA
  if (report.visionStatement && report.missionStatement) c6CGPA += 0.3
  if (report.iqacMeetings && report.iqacMeetings >= 4) c6CGPA += 0.5
  if (report.strategicPlan) c6CGPA += 0.3
  c6CGPA = Math.min(c6CGPA, 4.0)
  calculations.criteriaScores['Criterion 6: Governance, Leadership & Management'] = c6CGPA.toFixed(2)
  totalCGPA += c6CGPA
  validCriteria++
  
  // Criterion 7: Institutional Values & Best Practices (Maximum CGPA: 4.0)
  let c7CGPA = 1.5 // Base CGPA
  if (report.environmentalInitiatives?.length >= 3) c7CGPA += 0.5
  if (report.genderEquityPractices) c7CGPA += 0.3
  if (report.inclusivityPractices) c7CGPA += 0.3
  if (report.bestPractices) c7CGPA += 0.4
  if (report.institutionalDistinctiveness) c7CGPA += 0.3
  c7CGPA = Math.min(c7CGPA, 4.0)
  calculations.criteriaScores['Criterion 7: Institutional Values & Best Practices'] = c7CGPA.toFixed(2)
  totalCGPA += c7CGPA
  validCriteria++
  
  // Calculate Overall CGPA and Grade (Official NAAC Scale)
  if (validCriteria > 0) {
    const overallCGPA = totalCGPA / validCriteria
    calculations.overallCGPA = overallCGPA.toFixed(2)
    
    // Official NAAC Grading Scale
    if (overallCGPA >= 3.51) calculations.overallGrade = 'A++'
    else if (overallCGPA >= 3.26) calculations.overallGrade = 'A+'
    else if (overallCGPA >= 3.01) calculations.overallGrade = 'A'
    else if (overallCGPA >= 2.76) calculations.overallGrade = 'B++'
    else if (overallCGPA >= 2.51) calculations.overallGrade = 'B+'
    else if (overallCGPA >= 2.01) calculations.overallGrade = 'B'
    else if (overallCGPA >= 1.51) calculations.overallGrade = 'C'
    else calculations.overallGrade = 'D'
    
    // Add grade descriptions as per NAAC standards
    const gradeDescriptions: Record<string, string> = {
      'A++': 'Outstanding (CGPA 3.51-4.00)',
      'A+': 'Excellent (CGPA 3.26-3.50)',
      'A': 'Very Good (CGPA 3.01-3.25)',
      'B++': 'Good (CGPA 2.76-3.00)',
      'B+': 'Above Average (CGPA 2.51-2.75)',
      'B': 'Average (CGPA 2.01-2.50)',
      'C': 'Below Average (CGPA 1.51-2.00)',
      'D': 'Poor (CGPA ≤1.50)'
    }
    calculations.gradeDescription = gradeDescriptions[calculations.overallGrade] || 'Not Available'
  }
  
  return calculations
}