import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Debug environment variables
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not found');

import dbConnect from "../lib/mongodb";
import { User, StudentProfile, PendingAchievement, Institution } from "../lib/models";
import { hashPassword, generateToken } from "../lib/jwt";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    await dbConnect();
    console.log("✅ Database connected successfully");

    // Test user creation
    console.log("\nTesting user operations...");
    
    // Check if test user exists
    let testUser = await User.findOne({ email: "test@demo.com" });
    
    if (!testUser) {
      const hashedPassword = await hashPassword("password123");
      testUser = new User({
        email: "test@demo.com",
        password: hashedPassword,
        name: "Test Student",
        role: "student",
        institution: "Demo University",
        isVerified: true
      });
      await testUser.save();
      console.log("✅ Test user created");
    } else {
      console.log("✅ Test user found");
    }

    // Create student profile if doesn't exist
    let profile = await StudentProfile.findOne({ userId: testUser._id });
    if (!profile) {
      profile = new StudentProfile({
        userId: testUser._id,
        studentId: `STU${new Date().getFullYear()}${Math.floor(Math.random() * 9000) + 1000}`,
        major: "Computer Science",
        year: "Junior",
        gpa: 3.5,
        totalCredits: 90,
        completedCourses: 15,
        skills: ["JavaScript", "Python", "React"],
        achievements: [],
        socialLinks: {}
      });
      await profile.save();
      console.log("✅ Student profile created");
    } else {
      console.log("✅ Student profile found");
    }

    // Test pending achievement creation
    console.log("\nTesting achievement submission...");
    
    const achievementData = {
      studentId: testUser._id,
      studentName: testUser.name,
      studentEmail: testUser.email,
      institution: testUser.institution || "Demo University",
      title: "Test Achievement",
      description: "This is a test achievement submission",
      date: "December 2024",
      category: "academic",
      evidenceFiles: [],
      status: "pending"
    };

    const pendingAchievement = new PendingAchievement(achievementData);
    await pendingAchievement.save();
    console.log("✅ Pending achievement created:", pendingAchievement._id);

    // Test faculty user
    let facultyUser = await User.findOne({ email: "faculty@demo.com" });
    if (!facultyUser) {
      const hashedPassword = await hashPassword("password123");
      facultyUser = new User({
        email: "faculty@demo.com",
        password: hashedPassword,
        name: "Test Faculty",
        role: "faculty",
        institution: "Demo University",
        isVerified: true
      });
      await facultyUser.save();
      console.log("✅ Test faculty user created");
    } else {
      console.log("✅ Test faculty user found");
    }

    // Test token generation
    const studentToken = generateToken({
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role
    });
    console.log("✅ Student token generated");

    const facultyToken = generateToken({
      userId: facultyUser._id.toString(),
      email: facultyUser.email,
      role: facultyUser.role
    });
    console.log("✅ Faculty token generated");

    console.log("\n📋 Test Results:");
    console.log("Student User ID:", testUser._id.toString());
    console.log("Faculty User ID:", facultyUser._id.toString());
    console.log("Achievement ID:", pendingAchievement._id.toString());
    console.log("Student Token (first 50 chars):", studentToken.substring(0, 50) + "...");
    console.log("Faculty Token (first 50 chars):", facultyToken.substring(0, 50) + "...");

    // Query pending achievements for this institution
    const institutionAchievements = await PendingAchievement.find({ 
      institution: "Demo University",
      status: "pending"
    });
    console.log(`\n✅ Found ${institutionAchievements.length} pending achievements for Demo University`);

    console.log("\n🎉 All tests passed!");

  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    process.exit(0);
  }
}

testDatabase();