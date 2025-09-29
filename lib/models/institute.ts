import mongoose, { Document, Schema } from 'mongoose'

// Institute interface for educational institutions
export interface IInstitute extends Document {
  _id: string
  code: string // Unique identifier/code (e.g., "MIT", "UCLA", "DEMO001")
  name: string // Full name of the institution
  shortName?: string // Short/display name
  type: 'university' | 'college' | 'school' | 'institute' | 'academy' | 'center'
  category: 'public' | 'private' | 'government' | 'autonomous'
  
  // Contact Information
  contact: {
    email: string
    phone?: string
    website?: string
    fax?: string
  }
  
  // Address Information
  address: {
    street?: string
    city: string
    state?: string
    country: string
    zipCode?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  
  // Academic Information
  academic: {
    establishedYear?: number
    affiliation?: string[] // University affiliations
    accreditation?: string[] // Accrediting bodies
    recognition?: string[] // Government recognitions
    departments: string[]
    programs?: string[] // Degree programs offered
    studentCapacity?: number
    currentEnrollment?: number
  }
  
  // Administrative Details
  administration: {
    registrarEmail?: string
    admissionsEmail?: string
    principalName?: string
    deanName?: string
    chancellorName?: string
  }
  
  // Platform Settings
  settings: {
    isActive: boolean
    allowSelfRegistration: boolean
    requireEmailVerification: boolean
    allowPortfolioSharing: boolean
    customDomain?: string
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
  }
  
  // Statistics and Metadata
  stats: {
    totalStudents: number
    totalFaculty: number
    totalCourses: number
    totalPrograms: number
    graduationRate?: number
    employmentRate?: number
  }
  
  // Social Links
  socialLinks: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
    youtube?: string
  }
  
  // Additional Information
  description?: string
  mission?: string
  vision?: string
  motto?: string
  ranking?: {
    national?: number
    international?: number
    subject?: Array<{
      subject: string
      rank: number
      year: number
    }>
  }
  
  // System fields
  isVerified: boolean
  verifiedAt?: Date
  verifiedBy?: string
  
  createdAt: Date
  updatedAt: Date
}

// Institute Schema
const InstituteSchema = new Schema<IInstitute>({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  shortName: { 
    type: String,
    trim: true,
    maxlength: 50
  },
  type: { 
    type: String, 
    required: true,
    enum: ['university', 'college', 'school', 'institute', 'academy', 'center'],
    default: 'college'
  },
  category: {
    type: String,
    required: true,
    enum: ['public', 'private', 'government', 'autonomous'],
    default: 'public'
  },
  
  // Contact Information
  contact: {
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    fax: { type: String, trim: true }
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true },
    city: { 
      type: String, 
      required: true,
      trim: true
    },
    state: { type: String, trim: true },
    country: { 
      type: String, 
      required: true,
      trim: true
    },
    zipCode: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Academic Information
  academic: {
    establishedYear: { 
      type: Number,
      min: 1000,
      max: new Date().getFullYear()
    },
    affiliation: [{ type: String, trim: true }],
    accreditation: [{ type: String, trim: true }],
    recognition: [{ type: String, trim: true }],
    departments: {
      type: [{ type: String, trim: true }],
      default: []
    },
    programs: [{ type: String, trim: true }],
    studentCapacity: { 
      type: Number, 
      min: 0,
      max: 1000000
    },
    currentEnrollment: { 
      type: Number, 
      min: 0,
      default: 0
    }
  },
  
  // Administrative Details
  administration: {
    registrarEmail: { 
      type: String,
      lowercase: true,
      trim: true
    },
    admissionsEmail: { 
      type: String,
      lowercase: true,
      trim: true
    },
    principalName: { type: String, trim: true },
    deanName: { type: String, trim: true },
    chancellorName: { type: String, trim: true }
  },
  
  // Platform Settings
  settings: {
    isActive: { type: Boolean, default: true },
    allowSelfRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    allowPortfolioSharing: { type: Boolean, default: true },
    customDomain: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    primaryColor: { 
      type: String, 
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/
    },
    secondaryColor: { 
      type: String, 
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/
    }
  },
  
  // Statistics
  stats: {
    totalStudents: { type: Number, default: 0, min: 0 },
    totalFaculty: { type: Number, default: 0, min: 0 },
    totalCourses: { type: Number, default: 0, min: 0 },
    totalPrograms: { type: Number, default: 0, min: 0 },
    graduationRate: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    employmentRate: { 
      type: Number, 
      min: 0, 
      max: 100 
    }
  },
  
  // Social Links
  socialLinks: {
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true }
  },
  
  // Additional Information
  description: { 
    type: String, 
    trim: true,
    maxlength: 2000
  },
  mission: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  vision: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  motto: { 
    type: String, 
    trim: true,
    maxlength: 200
  },
  
  ranking: {
    national: { type: Number, min: 1 },
    international: { type: Number, min: 1 },
    subject: [{
      subject: { type: String, required: true, trim: true },
      rank: { type: Number, required: true, min: 1 },
      year: { 
        type: Number, 
        required: true,
        min: 2000,
        max: new Date().getFullYear()
      }
    }]
  },
  
  // System fields
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
InstituteSchema.index({ code: 1 }, { unique: true })
InstituteSchema.index({ name: 1 })
InstituteSchema.index({ 'address.city': 1, 'address.country': 1 })
InstituteSchema.index({ type: 1, category: 1 })
InstituteSchema.index({ 'settings.isActive': 1 })
InstituteSchema.index({ 'contact.email': 1 })

// Text index for search functionality
InstituteSchema.index({
  name: 'text',
  shortName: 'text',
  code: 'text',
  description: 'text',
  'address.city': 'text',
  'address.country': 'text'
})

// Virtual for full address
InstituteSchema.virtual('fullAddress').get(function() {
  const parts = []
  if (this.address.street) parts.push(this.address.street)
  if (this.address.city) parts.push(this.address.city)
  if (this.address.state) parts.push(this.address.state)
  if (this.address.country) parts.push(this.address.country)
  if (this.address.zipCode) parts.push(this.address.zipCode)
  return parts.join(', ')
})

// Virtual for occupancy rate
InstituteSchema.virtual('occupancyRate').get(function() {
  if (!this.academic.studentCapacity || this.academic.studentCapacity === 0) {
    return null
  }
  return Math.round((this.academic.currentEnrollment / this.academic.studentCapacity) * 100)
})

// Methods
InstituteSchema.methods.toSafeObject = function() {
  const obj = this.toObject()
  // Remove sensitive information if needed
  return obj
}

// Statics
InstituteSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() })
}

InstituteSchema.statics.findActive = function() {
  return this.find({ 'settings.isActive': true })
}

InstituteSchema.statics.searchInstitutes = function(query: string) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })
}

// Pre-save middleware
InstituteSchema.pre('save', function(next) {
  // Ensure code is uppercase
  if (this.code) {
    this.code = this.code.toUpperCase()
  }
  
  // Validate email domains if needed
  if (this.contact.email && !this.contact.email.includes('@')) {
    return next(new Error('Invalid email format'))
  }
  
  next()
})

// Create and export the model
export const Institute = mongoose.models.Institute || mongoose.model<IInstitute>('Institute', InstituteSchema)

export default Institute