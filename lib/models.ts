import mongoose, { Document, Schema } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'faculty' | 'admin' | 'institution';
  institution?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'faculty', 'admin', 'institution'],
    default: 'student'
  },
  institution: { type: String, default: 'Demo University' },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Student profile interface and schema
export interface IStudentProfile extends Document {
  userId: string;
  studentId: string;
  major: string;
  year: string;
  gpa: number;
  totalCredits: number;
  completedCourses: number;
  rank?: number;
  totalStudents?: number;
  bio?: string;
  skills: string[];
  achievements: Array<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
  socialLinks: {
    linkedin?: string;
    github?: string;
    website?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>({
  userId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  major: { type: String, required: true },
  year: { type: String, required: true },
  gpa: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  completedCourses: { type: Number, default: 0 },
  rank: { type: Number },
  totalStudents: { type: Number },
  bio: { type: String },
  skills: [{ type: String }],
  achievements: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    icon: { type: String, required: true },
    evidenceUrl: { type: String },
    institution: { type: String },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
  }],
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
    phone: { type: String },
  },
}, {
  timestamps: true
});

// Course interface and schema
export interface ICourse extends Document {
  courseId: string;
  name: string;
  instructor: string;
  credits: number;
  semester: string;
  year: string;
  description?: string;
  students: string[]; // Array of student user IDs
  assignments: string[]; // Array of assignment IDs
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  courseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  instructor: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: String, required: true },
  year: { type: String, required: true },
  description: { type: String },
  students: [{ type: String }],
  assignments: [{ type: String }],
}, {
  timestamps: true
});

// Enrollment interface and schema (junction table for students and courses)
export interface IEnrollment extends Document {
  studentId: string;
  courseId: string;
  progress: number;
  grade?: string;
  finalGrade?: number;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolledAt: Date;
  completedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  grade: { type: String },
  finalGrade: { type: Number },
  status: { 
    type: String, 
    enum: ['enrolled', 'completed', 'dropped'],
    default: 'enrolled'
  },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

// Compound index for unique enrollment
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Assignment interface and schema
export interface IAssignment extends Document {
  title: string;
  description?: string;
  courseId: string;
  dueDate: Date;
  maxPoints: number;
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'closed';
  submissions: Array<{
    studentId: string;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
    files?: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String },
  courseId: { type: String, required: true },
  dueDate: { type: Date, required: true },
  maxPoints: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['quiz', 'assignment', 'project', 'exam'],
    default: 'assignment'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  submissions: [{
    studentId: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number },
    feedback: { type: String },
    files: [{ type: String }],
  }],
}, {
  timestamps: true
});

// Portfolio interface and schema
export interface IPortfolio extends Document {
  userId: string;
  template: 'modern' | 'creative' | 'academic';
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    gpa?: string;
    startDate: string;
    endDate: string;
    achievements?: string[];
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    github?: string;
    demo?: string;
    image?: string;
  }>;
  skills: {
    technical: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  };
  isPublic: boolean;
  shareUrl?: string;
  completionRate: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>({
  userId: { type: String, required: true, unique: true },
  template: { 
    type: String, 
    enum: ['modern', 'creative', 'academic'],
    default: 'modern'
  },
  personalInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    website: { type: String },
    linkedin: { type: String },
    github: { type: String },
    summary: { type: String },
  },
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    gpa: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    achievements: [{ type: String }],
  }],
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    github: { type: String },
    demo: { type: String },
    image: { type: String },
  }],
  skills: {
    technical: [{ type: String }],
    frameworks: [{ type: String }],
    tools: [{ type: String }],
    databases: [{ type: String }],
  },
  isPublic: { type: Boolean, default: false },
  shareUrl: { type: String },
  completionRate: { type: Number, default: 0, min: 0, max: 100 },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Pending Achievement interface and schema (for verification workflow)
export interface IPendingAchievement extends Document {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  institution: string;
  title: string;
  description: string;
  date: string;
  category: 'academic' | 'extracurricular' | 'certification' | 'project' | 'award' | 'other';
  evidenceFiles: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }>;
  status: 'pending' | 'verified' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PendingAchievementSchema = new Schema<IPendingAchievement>({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  institution: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  category: {
    type: String,
    enum: ['academic', 'extracurricular', 'certification', 'project', 'award', 'other'],
    default: 'other'
  },
  evidenceFiles: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  reviewComments: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
PendingAchievementSchema.index({ institution: 1, status: 1 });
PendingAchievementSchema.index({ studentId: 1 });

// Notification interface and schema
export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String },
}, {
  timestamps: true
});

// Institution interface and schema
export interface IInstitution extends Document {
  institutionId: string;
  name: string;
  type: 'university' | 'college' | 'school' | 'institute';
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  logo?: string;
  description?: string;
  establishedYear?: number;
  accreditation?: string[];
  departments: string[];
  isActive: boolean;
  settings: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    allowPortfolioSharing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>({
  institutionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['university', 'college', 'school', 'institute'],
    default: 'university'
  },
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    zipCode: { type: String },
  },
  contact: {
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
  },
  logo: { type: String },
  description: { type: String },
  establishedYear: { type: Number },
  accreditation: [{ type: String }],
  departments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  settings: {
    allowSelfRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    allowPortfolioSharing: { type: Boolean, default: true },
  },
}, {
  timestamps: true
});

// Activity Log interface and schema
export interface IActivityLog extends Document {
  userId: string;
  action: string;
  description: string;
  metadata?: any;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

// Create and export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const StudentProfile = mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export const Portfolio = mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
export const PendingAchievement = mongoose.models.PendingAchievement || mongoose.model<IPendingAchievement>('PendingAchievement', PendingAchievementSchema);
export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const Institution = mongoose.models.Institution || mongoose.model<IInstitution>('Institution', InstitutionSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

// Export NAAC models
export { NAACReport } from './models/naac-models';
