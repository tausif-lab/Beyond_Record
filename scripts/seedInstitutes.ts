import { config } from 'dotenv'
config() // Load environment variables

import mongoose from 'mongoose'
import dbConnect from '../lib/mongodb'
import { Institute, IInstitute } from '../lib/models/institute'

// Sample institutes data
const sampleInstitutes: Partial<IInstitute>[] = [
  {
    code: 'DEMO001',
    name: 'Demo University',
    shortName: 'Demo U',
    type: 'university',
    category: 'public',
    contact: {
      email: 'admin@demo-university.edu',
      phone: '+1-555-0100',
      website: 'https://demo-university.edu'
    },
    address: {
      street: '123 Education Street',
      city: 'Academic City',
      state: 'Knowledge State',
      country: 'Education Land',
      zipCode: '12345'
    },
    academic: {
      establishedYear: 1985,
      departments: [
        'Computer Science',
        'Engineering',
        'Business Administration',
        'Liberal Arts',
        'Sciences'
      ],
      programs: [
        'Bachelor of Computer Science',
        'Bachelor of Engineering',
        'Master of Business Administration',
        'Bachelor of Arts',
        'Bachelor of Science'
      ],
      studentCapacity: 10000,
      currentEnrollment: 7500,
      accreditation: ['ABET', 'AACSB'],
      recognition: ['State Education Board']
    },
    administration: {
      registrarEmail: 'registrar@demo-university.edu',
      admissionsEmail: 'admissions@demo-university.edu',
      chancellorName: 'Dr. Jane Chancellor',
      deanName: 'Dr. John Dean'
    },
    settings: {
      isActive: true,
      allowSelfRegistration: true,
      requireEmailVerification: false,
      allowPortfolioSharing: true,
      logoUrl: '/images/demo-university-logo.png',
      primaryColor: '#003366',
      secondaryColor: '#0066CC'
    },
    stats: {
      totalStudents: 7500,
      totalFaculty: 350,
      totalCourses: 1200,
      totalPrograms: 45,
      graduationRate: 85,
      employmentRate: 92
    },
    socialLinks: {
      website: 'https://demo-university.edu',
      facebook: 'https://facebook.com/demouniversity',
      twitter: 'https://twitter.com/demouniversity',
      linkedin: 'https://linkedin.com/school/demo-university'
    },
    description: 'Demo University is a leading educational institution committed to excellence in teaching, research, and service. We provide comprehensive education across multiple disciplines.',
    mission: 'To provide quality education and foster innovation while preparing students for successful careers.',
    vision: 'To be a globally recognized university known for academic excellence and research innovation.',
    motto: 'Knowledge, Innovation, Excellence',
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy: 'system'
  },
  
  {
    code: 'TECH001',
    name: 'Technology Institute of Excellence',
    shortName: 'TechEx',
    type: 'institute',
    category: 'private',
    contact: {
      email: 'info@techexcellence.edu',
      phone: '+1-555-0200',
      website: 'https://techexcellence.edu'
    },
    address: {
      city: 'Innovation City',
      state: 'Tech State',
      country: 'Technology Land',
      zipCode: '54321'
    },
    academic: {
      establishedYear: 2010,
      departments: [
        'Computer Science',
        'Software Engineering',
        'Data Science',
        'Cybersecurity',
        'AI & Machine Learning'
      ],
      programs: [
        'Bachelor of Technology',
        'Master of Computer Science',
        'PhD in Computer Science',
        'Certificate in Data Science'
      ],
      studentCapacity: 3000,
      currentEnrollment: 2100
    },
    settings: {
      isActive: true,
      allowSelfRegistration: true,
      requireEmailVerification: true,
      allowPortfolioSharing: true,
      primaryColor: '#FF6600',
      secondaryColor: '#CC3300'
    },
    stats: {
      totalStudents: 2100,
      totalFaculty: 120,
      totalCourses: 400,
      totalPrograms: 15,
      graduationRate: 95,
      employmentRate: 98
    },
    description: 'A premier technology-focused institute specializing in cutting-edge computer science and engineering programs.',
    mission: 'To prepare students for leadership roles in the technology industry.',
    isVerified: true
  },
  
  {
    code: 'STATE001',
    name: 'State College of Arts and Sciences',
    shortName: 'State College',
    type: 'college',
    category: 'government',
    contact: {
      email: 'contact@statecollege.edu',
      phone: '+1-555-0300',
      website: 'https://statecollege.edu'
    },
    address: {
      city: 'Capital City',
      state: 'Central State',
      country: 'United States',
      zipCode: '67890'
    },
    academic: {
      establishedYear: 1965,
      departments: [
        'Liberal Arts',
        'Natural Sciences',
        'Social Sciences',
        'Mathematics',
        'English Literature'
      ],
      studentCapacity: 5000,
      currentEnrollment: 3800
    },
    settings: {
      isActive: true,
      allowSelfRegistration: true,
      requireEmailVerification: false,
      allowPortfolioSharing: true
    },
    stats: {
      totalStudents: 3800,
      totalFaculty: 180,
      totalCourses: 600,
      totalPrograms: 25
    },
    description: 'A state-funded college offering comprehensive liberal arts and sciences education.',
    isVerified: true
  },
  
  {
    code: 'BUSINESS001',
    name: 'International Business Academy',
    shortName: 'IBA',
    type: 'academy',
    category: 'private',
    contact: {
      email: 'admissions@iba-global.edu',
      phone: '+1-555-0400',
      website: 'https://iba-global.edu'
    },
    address: {
      city: 'Business District',
      state: 'Commerce State',
      country: 'Global Nation',
      zipCode: '98765'
    },
    academic: {
      establishedYear: 1995,
      departments: [
        'Business Administration',
        'Finance',
        'Marketing',
        'International Trade',
        'Entrepreneurship'
      ],
      programs: [
        'MBA',
        'Bachelor of Business',
        'Executive MBA',
        'Certificate Programs'
      ],
      studentCapacity: 2000,
      currentEnrollment: 1600
    },
    settings: {
      isActive: true,
      allowSelfRegistration: false, // Selective admission
      requireEmailVerification: true,
      allowPortfolioSharing: true
    },
    stats: {
      totalStudents: 1600,
      totalFaculty: 90,
      totalCourses: 300,
      totalPrograms: 12,
      graduationRate: 90,
      employmentRate: 95
    },
    description: 'A prestigious business academy focused on developing global business leaders.',
    mission: 'To cultivate ethical business leaders for the global marketplace.',
    isVerified: true
  },
  
  {
    code: 'MEDICAL001',
    name: 'Regional Medical College',
    shortName: 'RMC',
    type: 'college',
    category: 'public',
    contact: {
      email: 'info@regionalmedical.edu',
      phone: '+1-555-0500',
      website: 'https://regionalmedical.edu'
    },
    address: {
      city: 'Health City',
      state: 'Medical State',
      country: 'Healthcare Nation',
      zipCode: '13579'
    },
    academic: {
      establishedYear: 1978,
      departments: [
        'Medicine',
        'Nursing',
        'Pharmacy',
        'Allied Health',
        'Public Health'
      ],
      programs: [
        'Doctor of Medicine',
        'Bachelor of Nursing',
        'Master of Public Health',
        'Pharmacy Degree'
      ],
      studentCapacity: 1500,
      currentEnrollment: 1200,
      accreditation: ['LCME', 'AACN']
    },
    settings: {
      isActive: true,
      allowSelfRegistration: false, // Highly selective
      requireEmailVerification: true,
      allowPortfolioSharing: true
    },
    stats: {
      totalStudents: 1200,
      totalFaculty: 150,
      totalCourses: 250,
      totalPrograms: 8,
      graduationRate: 98,
      employmentRate: 100
    },
    description: 'A leading medical college training healthcare professionals.',
    mission: 'To train competent and compassionate healthcare professionals.',
    isVerified: true
  }
]

// Function to seed institutes
export async function seedInstitutes() {
  try {
    console.log('🌱 Starting institute seeding...')
    
    // Connect to database
    await dbConnect()
    
    // Check if institutes already exist
    const existingCount = await Institute.countDocuments()
    
    if (existingCount > 0) {
      console.log(`📊 Found ${existingCount} existing institutes`)
      
      // Optionally update existing demo institute
      const demoInstitute = await Institute.findOne({ code: 'DEMO001' })
      if (demoInstitute) {
        console.log('✅ Demo University already exists')
        return { success: true, message: 'Institutes already exist' }
      }
    }
    
    console.log('📝 Creating sample institutes...')
    
    // Insert sample institutes
    const createdInstitutes = await Institute.insertMany(sampleInstitutes)
    
    console.log(`✅ Successfully created ${createdInstitutes.length} institutes:`)
    createdInstitutes.forEach(institute => {
      console.log(`   - ${institute.code}: ${institute.name}`)
    })
    
    return { 
      success: true, 
      message: `Created ${createdInstitutes.length} institutes`,
      institutes: createdInstitutes.map(i => ({ code: i.code, name: i.name }))
    }
    
  } catch (error) {
    console.error('❌ Institute seeding failed:', error)
    throw error
  }
}

// Function to get institutes for dropdown/selection
export async function getInstitutesList() {
  try {
    await dbConnect()
    
    const institutes = await Institute.find(
      { 'settings.isActive': true },
      { code: 1, name: 1, shortName: 1, type: 1, category: 1 }
    ).sort({ name: 1 })
    
    return institutes.map(institute => ({
      code: institute.code,
      name: institute.name,
      shortName: institute.shortName,
      type: institute.type,
      category: institute.category,
      displayName: institute.shortName || institute.name
    }))
    
  } catch (error) {
    console.error('Failed to get institutes list:', error)
    throw error
  }
}

// Function to find institute by code or name
export async function findInstitute(identifier: string) {
  try {
    await dbConnect()
    
    // Try to find by code first (exact match)
    let institute = await Institute.findOne({ 
      code: identifier.toUpperCase() 
    })
    
    // If not found, try by name (case-insensitive)
    if (!institute) {
      institute = await Institute.findOne({ 
        name: { $regex: new RegExp(identifier, 'i') } 
      })
    }
    
    // If still not found, try by ObjectId
    if (!institute && mongoose.Types.ObjectId.isValid(identifier)) {
      institute = await Institute.findById(identifier)
    }
    
    return institute
    
  } catch (error) {
    console.error('Failed to find institute:', error)
    return null
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedInstitutes()
    .then((result) => {
      console.log('🎉 Seeding completed:', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error)
      process.exit(1)
    })
}

export default seedInstitutes