import * as dotenv from 'dotenv';
dotenv.config();

import dbConnect from "../lib/mongodb";
import { User, StudentProfile, Course, Enrollment, Assignment, Institution } from "../lib/models";
import { hashPassword } from "../lib/jwt";

async function seedData() {
  await dbConnect();

  console.log("Starting database seeding...");

  // Create sample institutions first
  const institutions = [
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
    },
    {
      institutionId: "GLOBAL_COLL_003",
      name: "Global Business College",
      type: "college",
      address: {
        city: "New York",
        state: "New York",
        country: "United States",
        zipCode: "10001"
      },
      contact: {
        email: "info@globalbiz.edu",
        phone: "+1-555-0125",
        website: "https://globalbiz.edu"
      },
      description: "Leading business education with global perspective.",
      establishedYear: 1978,
      departments: ["Business Administration", "Marketing", "Finance", "Management", "Economics"],
      isActive: true,
      settings: {
        allowSelfRegistration: true,
        requireEmailVerification: false,
        allowPortfolioSharing: true,
      }
    }
  ];

  // Clear existing institutions and create new ones
  await Institution.deleteMany({});
  await Institution.insertMany(institutions);
  console.log("✅ Created sample institutions");

  // Create demo courses
  const courses = [
    {
      courseId: "CS101",
      name: "Data Structures and Algorithms",
      instructor: "Dr. Sarah Johnson",
      credits: 3,
      semester: "Fall",
      year: "2024",
      description: "Introduction to fundamental data structures and algorithmic thinking.",
    },
    {
      courseId: "CS201",
      name: "Web Development",
      instructor: "Prof. Michael Chen",
      credits: 4,
      semester: "Fall",
      year: "2024",
      description: "Full-stack web development using modern frameworks and technologies.",
    },
    {
      courseId: "CS301",
      name: "Database Systems",
      instructor: "Dr. Emily Rodriguez",
      credits: 3,
      semester: "Fall",
      year: "2024",
      description: "Design and implementation of database systems.",
    },
    {
      courseId: "CS401",
      name: "Software Engineering",
      instructor: "Prof. David Wilson",
      credits: 4,
      semester: "Fall",
      year: "2024",
      description: "Software development methodologies and best practices.",
    },
  ];

  // Clear existing courses
  await Course.deleteMany({});
  
  // Insert courses
  await Course.insertMany(courses);
  console.log("✅ Created sample courses");

  // Create assignments for each course
  const assignments = [
    // Data Structures assignments
    {
      title: "Binary Search Tree Implementation",
      description: "Implement a binary search tree with insertion, deletion, and traversal operations.",
      courseId: "CS101",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxPoints: 100,
      type: "assignment",
      priority: "high",
      status: "published",
      submissions: [],
    },
    {
      title: "Algorithm Complexity Quiz",
      description: "Quiz covering Big O notation and time complexity analysis.",
      courseId: "CS101",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      maxPoints: 50,
      type: "quiz",
      priority: "medium",
      status: "published",
      submissions: [],
    },
    // Web Development assignments
    {
      title: "React Portfolio Website",
      description: "Build a responsive portfolio website using React and CSS.",
      courseId: "CS201",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxPoints: 150,
      type: "project",
      priority: "high",
      status: "published",
      submissions: [],
    },
    {
      title: "JavaScript Fundamentals Test",
      description: "Test covering ES6+ features, DOM manipulation, and async programming.",
      courseId: "CS201",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      maxPoints: 75,
      type: "exam",
      priority: "high",
      status: "published",
      submissions: [],
    },
    // Database Systems assignments
    {
      title: "Database Design Project",
      description: "Design and implement a relational database for a library management system.",
      courseId: "CS301",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      maxPoints: 120,
      type: "project",
      priority: "medium",
      status: "published",
      submissions: [],
    },
    // Software Engineering assignments
    {
      title: "Agile Development Case Study",
      description: "Analyze a software project using agile methodologies and present findings.",
      courseId: "CS401",
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      maxPoints: 100,
      type: "assignment",
      priority: "low",
      status: "published",
      submissions: [],
    },
  ];

  // Clear existing assignments
  await Assignment.deleteMany({});
  
  // Insert assignments
  await Assignment.insertMany(assignments);
  console.log("✅ Created sample assignments");

  console.log("Database seeding completed!");
}

// Function to create enrollments for a student
export async function createStudentEnrollments(studentUserId: string) {
  console.log(`Creating enrollments for student: ${studentUserId}`);

  // Create enrollments for all courses with some progress
  const enrollments = [
    {
      studentId: studentUserId,
      courseId: "CS101",
      progress: 85,
      grade: "A-",
      finalGrade: 87,
      status: "enrolled",
      enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    },
    {
      studentId: studentUserId,
      courseId: "CS201",
      progress: 92,
      grade: "A",
      finalGrade: 94,
      status: "enrolled",
      enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: studentUserId,
      courseId: "CS301",
      progress: 67,
      grade: "B+",
      status: "enrolled",
      enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      studentId: studentUserId,
      courseId: "CS401",
      progress: 73,
      grade: "B",
      status: "enrolled",
      enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ];

  // Remove existing enrollments for this student
  await Enrollment.deleteMany({ studentId: studentUserId });
  
  // Insert new enrollments
  await Enrollment.insertMany(enrollments);
  console.log(`✅ Created enrollments for student: ${studentUserId}`);
}

// Function to add sample achievements to a student profile
export async function addSampleAchievements(studentUserId: string) {
  const achievements = [
    {
      title: "Dean's List",
      description: "Achieved GPA above 3.5 for Fall 2023 semester",
      date: "Fall 2023",
      icon: "Award",
    },
    {
      title: "Perfect Attendance",
      description: "No missed classes this semester",
      date: "Spring 2024",
      icon: "Star",
    },
    {
      title: "Project Excellence",
      description: "Best project in Web Development course",
      date: "February 2024",
      icon: "Trophy",
    },
  ];

  await StudentProfile.findOneAndUpdate(
    { userId: studentUserId },
    { $set: { achievements } },
    { new: true }
  );

  console.log(`✅ Added sample achievements for student: ${studentUserId}`);
}

if (require.main === module) {
  seedData().catch(console.error);
}

export default seedData;