import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Institution } from "@/lib/models"
import mongoose from "mongoose"

export async function GET(_request: NextRequest) {
  try {
    await dbConnect()

    let institutions = []

    // First try to get from your actual institutes collection
    try {
      // Connect to your institutes collection directly
      const db = mongoose.connection.db
      if (db) {
        const institutesCollection = db.collection('institutes')
        const institutesFromDB = await institutesCollection.find({}).toArray()
        
        // Map your data structure to the expected format
        institutions = institutesFromDB.map((inst: any) => ({
          _id: inst._id,
          institutionId: inst.code || inst._id.toString(),
          name: inst.name,
          type: inst.name?.toLowerCase().includes('university') ? 'university' : 
                inst.name?.toLowerCase().includes('college') ? 'college' : 'institute',
          address: {
            city: 'Not specified',
            country: 'Not specified'
          },
          contact: {
            email: inst.email
          },
          description: `${inst.name} - Educational Institution`,
          isActive: true
        }))
        
        console.log(`Found ${institutions.length} institutions from institutes collection`)
      }
    } catch (dbError) {
      console.log('Direct database query failed, trying Institution model:', dbError)
    }

    // If no institutions from your collection, try the Institution model
    if (institutions.length === 0) {
      institutions = await (Institution as any).find({ isActive: true })
        .select('institutionId name type address.city address.country contact.website logo description')
        .sort({ name: 1 })
      
      if (institutions.length === 0) {
        institutions = await (Institution as any).find({})
          .select('institutionId name type address.city address.country contact.website logo description')
          .sort({ name: 1 })
      }
    }

    // If still no institutions, provide default ones
    if (institutions.length === 0) {
      institutions = [
        {
          institutionId: 'DEMO_UNIV_001',
          name: 'Demo University',
          type: 'university',
          address: { city: 'San Francisco', country: 'United States' },
          description: 'Default demo university'
        },
        {
          institutionId: 'TECH_INST_002',
          name: 'Technology Institute of Excellence',
          type: 'institute', 
          address: { city: 'Austin', country: 'United States' },
          description: 'Technology focused institute'
        },
        {
          institutionId: 'GLOBAL_COLL_003',
          name: 'Global Business College',
          type: 'college',
          address: { city: 'New York', country: 'United States' },
          description: 'Business education college'
        }
      ]
    }

    return NextResponse.json({ institutions })

  } catch (error) {
    console.error('Get institutions error:', error)
    // Return default institutions on error
    const defaultInstitutions = [
      {
        institutionId: 'DEMO_UNIV_001',
        name: 'Demo University',
        type: 'university',
        address: { city: 'San Francisco', country: 'United States' },
        description: 'Default demo university'
      },
      {
        institutionId: 'TECH_INST_002', 
        name: 'Technology Institute of Excellence',
        type: 'institute',
        address: { city: 'Austin', country: 'United States' },
        description: 'Technology focused institute'
      }
    ]
    return NextResponse.json({ institutions: defaultInstitutions })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, city, country, email, description } = await request.json()

    // Basic validation
    if (!name || !type || !city || !country || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Generate institution ID
    const institutionId = `INST${Date.now()}`

    // Create new institution
    const institution = new Institution({
      institutionId,
      name,
      type,
      address: {
        city,
        country,
      },
      contact: {
        email,
      },
      description,
      departments: ["Computer Science", "Engineering", "Business", "Arts", "Sciences"],
      isActive: true,
      settings: {
        allowSelfRegistration: true,
        requireEmailVerification: false,
        allowPortfolioSharing: true,
      }
    })

    await institution.save()

    return NextResponse.json({ 
      message: "Institution created successfully",
      institution: {
        institutionId: institution.institutionId,
        name: institution.name,
        type: institution.type,
      }
    })

  } catch (error) {
    console.error('Create institution error:', error)
    return NextResponse.json({ error: "Failed to create institution" }, { status: 500 })
  }
}