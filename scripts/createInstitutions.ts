import * as dotenv from 'dotenv';
dotenv.config();

import dbConnect from "../lib/mongodb";
import { User, Institution } from "../lib/models";

async function createInstitutionsFromUsers() {
  await dbConnect();
  
  console.log("Creating institutions from existing user data...");
  
  try {
    // Get all unique institution names from users
    const uniqueInstitutions = await User.aggregate([
      { $match: { institution: { $exists: true, $ne: null } } },
      { $group: { _id: "$institution" } },
      { $project: { name: "$_id", _id: 0 } }
    ]);
    
    console.log(`Found ${uniqueInstitutions.length} unique institutions from users:`, uniqueInstitutions);
    
    // Create Institution documents for each unique institution
    for (const inst of uniqueInstitutions) {
      const institutionName = inst.name;
      
      // Check if institution already exists
      const existing = await Institution.findOne({ name: institutionName });
      if (existing) {
        console.log(`Institution "${institutionName}" already exists, skipping...`);
        continue;
      }
      
      // Create new institution
      const newInstitution = new Institution({
        institutionId: `INST_${institutionName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
        name: institutionName,
        type: institutionName.toLowerCase().includes('university') ? 'university' : 
              institutionName.toLowerCase().includes('college') ? 'college' : 'institute',
        address: {
          city: "City", 
          state: "State",
          country: "Country",
          zipCode: "00000"
        },
        contact: {
          email: `info@${institutionName.replace(/\s+/g, '').toLowerCase()}.edu`,
          phone: "+1-555-0123",
          website: `https://${institutionName.replace(/\s+/g, '').toLowerCase()}.edu`
        },
        description: `${institutionName} - Educational Institution`,
        establishedYear: 2000,
        departments: ["Computer Science", "Engineering", "Business", "Arts", "Sciences"],
        isActive: true,
        settings: {
          allowSelfRegistration: true,
          requireEmailVerification: false,
          allowPortfolioSharing: true,
        }
      });
      
      await newInstitution.save();
      console.log(`✅ Created institution: ${institutionName}`);
    }
    
    // Also create default institutions if none exist
    const totalInstitutions = await Institution.countDocuments();
    if (totalInstitutions === 0) {
      console.log("No institutions found, creating default ones...");
      
      const defaultInstitutions = [
        {
          institutionId: "DEMO_UNIV_001",
          name: "Demo University",
          type: "university",
          address: {
            city: "San Francisco",
            state: "California", 
            country: "United States",
            zipCode: "94105"
          },
          contact: {
            email: "admin@demo.edu",
            phone: "+1-555-0123",
            website: "https://demo.edu"
          },
          description: "A premier educational institution focused on innovation and excellence.",
          establishedYear: 1985,
          departments: ["Computer Science", "Engineering", "Business", "Arts", "Sciences", "Medicine"],
          isActive: true,
          settings: {
            allowSelfRegistration: true,
            requireEmailVerification: false,
            allowPortfolioSharing: true,
          }
        },
        {
          institutionId: "TECH_INST_002",
          name: "Technology Institute of Excellence",
          type: "institute",
          address: {
            city: "Austin",
            state: "Texas",
            country: "United States",
            zipCode: "73301"
          },
          contact: {
            email: "contact@techexcellence.edu",
            phone: "+1-555-0124",
            website: "https://techexcellence.edu"
          },
          description: "Specialized institute for technology and engineering education.",
          establishedYear: 1995,
          departments: ["Computer Science", "Software Engineering", "Data Science", "Cybersecurity"],
          isActive: true,
          settings: {
            allowSelfRegistration: true,
            requireEmailVerification: true,
            allowPortfolioSharing: true,
          }
        }
      ];
      
      await Institution.insertMany(defaultInstitutions);
      console.log("✅ Created default institutions");
    }
    
    // Show final count
    const finalCount = await Institution.countDocuments();
    console.log(`\n📊 Total institutions in database: ${finalCount}`);
    
    // List all institutions
    const allInstitutions = await Institution.find({}).select('institutionId name type isActive');
    console.log("\n📋 All institutions:");
    allInstitutions.forEach(inst => {
      console.log(`  - ${inst.name} (${inst.type}) - Active: ${inst.isActive}`);
    });
    
  } catch (error) {
    console.error('Error creating institutions:', error);
  }
}

if (require.main === module) {
  createInstitutionsFromUsers()
    .then(() => {
      console.log('\n✨ Institution creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export default createInstitutionsFromUsers;