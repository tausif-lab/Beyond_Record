import * as dotenv from 'dotenv';
dotenv.config();

import dbConnect from "../lib/mongodb";
import mongoose from "mongoose";

async function testDatabase() {
  console.log("Testing database connection and institutes collection...");
  
  try {
    await dbConnect();
    console.log("✅ Database connected successfully");
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n📋 Available collections:");
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check institutes collection specifically
    const institutesCollection = db.collection('institutes');
    const institutesCount = await institutesCollection.countDocuments();
    console.log(`\n🏫 Institutes collection: ${institutesCount} documents`);
    
    if (institutesCount > 0) {
      const institutes = await institutesCollection.find({}).limit(5).toArray();
      console.log("\n📄 Sample institutes:");
      institutes.forEach(inst => {
        console.log(`  - ${inst.name} (Code: ${inst.code}, Email: ${inst.email})`);
      });
      
      // Test the mapping logic
      console.log("\n🔄 Testing mapping to expected format:");
      const mappedInstitutes = institutes.map((inst: any) => ({
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
      }));
      
      mappedInstitutes.forEach(inst => {
        console.log(`  ✅ ${inst.name} -> ID: ${inst.institutionId}, Type: ${inst.type}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
  
  process.exit(0);
}

testDatabase();