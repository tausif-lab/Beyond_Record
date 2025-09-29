import mongoose, { Document, Schema } from 'mongoose'

// Interface for Programme
export interface IProgramme {
  name: string
  level: string
  yearStarted: number
  intakeCapacity: number
}

// Interface for Value Added Course
export interface IValueAddedCourse {
  courseName: string
  year: number
  beneficiaries: number
}

// Interface for Research Project
export interface IResearchProject {
  title: string
  principalInvestigator: string
  fundingAgency: string
  amount: number
  status: string
  year: number
}

// Interface for Publication
export interface IPublication {
  year: number
  facultyName: string
  title: string
  journalName: string
  indexing: string
}

// Interface for NAAC Report Document
export interface INAACReport extends Document {
  userId: mongoose.Types.ObjectId
  institutionId?: string
  
  // Step 1: Institutional Profile
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
  programmes?: IProgramme[]
  recognitions?: string[]
  campusArea?: number
  builtUpArea?: number
  website?: string
  contactEmail?: string
  naacCoordinator?: string
  
  // Step 2: Curricular Aspects
  programmesRevised?: number
  collectsFeedback?: boolean
  feedbackSample?: string // file path
  academicFlexibility?: string[]
  valueAddedCourses?: IValueAddedCourse[]
  crossCuttingIssues?: string[]
  
  // Step 3: Teaching-Learning & Evaluation
  admissionProcess?: string
  ictClassrooms?: number
  ictTools?: string[]
  assessmentMethods?: string[]
  learningOutcomesProcess?: string
  
  // Step 4: Research, Innovations & Extension
  researchProjects?: IResearchProject[]
  publications?: IPublication[]
  phdSupervisors?: number
  phdScholars?: number
  patents?: number
  consultancyRevenue?: number
  
  // Step 5: Infrastructure & Learning Resources
  classrooms?: number
  laboratories?: number
  seminarHalls?: number
  smartClassrooms?: number
  libraryBooks?: number
  libraryJournals?: number
  internetBandwidth?: number
  computers?: number
  infrastructureBudget?: number
  budgetUtilization?: number
  
  // Step 6: Student Support & Progression
  scholarshipRecipients?: number
  scholarshipAmount?: number
  placedStudents?: number
  averageSalary?: number
  higherStudies?: number
  competitiveExams?: number
  
  // Step 7: Governance, Leadership & Management
  visionStatement?: string
  missionStatement?: string
  iqacMeetings?: number
  strategicPlan?: string
  
  // Step 8: Institutional Values & Best Practices
  environmentalInitiatives?: string[]
  genderEquityPractices?: string
  inclusivityPractices?: string
  bestPractices?: string
  institutionalDistinctiveness?: string
  
  // Step 9: Student Satisfaction Survey
  surveyResponses?: number
  satisfactionScore?: number
  
  // Meta information
  currentStep: number
  completedSteps: number[]
  isCompleted: boolean
  generatedAt?: Date
  reportPath?: string // path to generated PDF
  
  createdAt: Date
  updatedAt: Date
}

// NAAC Report Schema
const NAACReportSchema = new Schema<INAACReport>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: String },
  
  // Step 1: Institutional Profile
  institutionName: String,
  institutionType: String,
  yearOfEstablishment: Number,
  governingBody: String,
  accreditationCycle: String,
  totalStudentsUG: Number,
  totalStudentsPG: Number,
  totalStudentsPhD: Number,
  totalTeachingStaff: Number,
  totalNonTeachingStaff: Number,
  programmes: [{
    name: String,
    level: String,
    yearStarted: Number,
    intakeCapacity: Number
  }],
  recognitions: [String],
  campusArea: Number,
  builtUpArea: Number,
  website: String,
  contactEmail: String,
  naacCoordinator: String,
  
  // Step 2: Curricular Aspects
  programmesRevised: Number,
  collectsFeedback: Boolean,
  feedbackSample: String,
  academicFlexibility: [String],
  valueAddedCourses: [{
    courseName: String,
    year: Number,
    beneficiaries: Number
  }],
  crossCuttingIssues: [String],
  
  // Step 3: Teaching-Learning & Evaluation
  admissionProcess: String,
  ictClassrooms: Number,
  ictTools: [String],
  assessmentMethods: [String],
  learningOutcomesProcess: String,
  
  // Step 4: Research, Innovations & Extension
  researchProjects: [{
    title: String,
    principalInvestigator: String,
    fundingAgency: String,
    amount: Number,
    status: String,
    year: Number
  }],
  publications: [{
    year: Number,
    facultyName: String,
    title: String,
    journalName: String,
    indexing: String
  }],
  phdSupervisors: Number,
  phdScholars: Number,
  patents: Number,
  consultancyRevenue: Number,
  
  // Step 5: Infrastructure & Learning Resources
  classrooms: Number,
  laboratories: Number,
  seminarHalls: Number,
  smartClassrooms: Number,
  libraryBooks: Number,
  libraryJournals: Number,
  internetBandwidth: Number,
  computers: Number,
  infrastructureBudget: Number,
  budgetUtilization: Number,
  
  // Step 6: Student Support & Progression
  scholarshipRecipients: Number,
  scholarshipAmount: Number,
  placedStudents: Number,
  averageSalary: Number,
  higherStudies: Number,
  competitiveExams: Number,
  
  // Step 7: Governance, Leadership & Management
  visionStatement: String,
  missionStatement: String,
  iqacMeetings: Number,
  strategicPlan: String,
  
  // Step 8: Institutional Values & Best Practices
  environmentalInitiatives: [String],
  genderEquityPractices: String,
  inclusivityPractices: String,
  bestPractices: String,
  institutionalDistinctiveness: String,
  
  // Step 9: Student Satisfaction Survey
  surveyResponses: Number,
  satisfactionScore: Number,
  
  // Meta information
  currentStep: { type: Number, default: 1 },
  completedSteps: { type: [Number], default: [] },
  isCompleted: { type: Boolean, default: false },
  generatedAt: Date,
  reportPath: String,
}, {
  timestamps: true
})

// Create indexes
NAACReportSchema.index({ userId: 1 })
NAACReportSchema.index({ institutionId: 1 })
NAACReportSchema.index({ isCompleted: 1 })

export const NAACReport = mongoose.models.NAACReport || mongoose.model<INAACReport>('NAACReport', NAACReportSchema)