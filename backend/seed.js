// ================== ENV SETUP ==================
import dotenv from "dotenv";
dotenv.config();

// ================== MONGOOSE ==================
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

// ================== MODELS ==================
import User from "./src/models/UserModel.js";
import Project from "./src/models/ProjectModel.js";
import Interest from "./src/models/InterestModel.js";
import UserInterest from "./src/models/UserInterestModel.js";

// ================== CONFIG ==================
const MONGO_URI = process.env.DATABASE_URI;

// ================== HELPER FUNCTIONS ==================
// Generate ~150-word description
const generateProjectDescription = () => {
  return faker.lorem.paragraphs(10); // faker paragraphs ~150 words
};

// ================== SEED LOGIC ==================
const seedDB = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 2️⃣ Clear existing data
    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Interest.deleteMany(),
      UserInterest.deleteMany(),
    ]);
    console.log("🧹 Old data cleared");

    // ================= USERS =================
    const users = await User.insertMany(
      Array.from({ length: 50 }).map(() => ({
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 35 }),
        email: faker.internet.email(),
        password: "hashed_password",
        gender: faker.person.sex(),
        avatar: faker.image.avatar(),
        city: faker.location.city(),
        verified: true,
      }))
    );
    console.log(`👤 ${users.length} Users created`);

    // ================= INTERESTS =================
    const interestNames = [
      "Web Development",
      "AI / ML",
      "UI/UX",
      "Mobile Apps",
      "DevOps",
      "Blockchain",
      "Game Dev",
      "Cyber Security",
    ];

    const interests = await Interest.insertMany(
      interestNames.map((name) => ({ name }))
    );
    console.log(`🎯 ${interests.length} Interests created`);

    // ================= PROJECTS =================
    const projects = [];
    for (const user of users) {
      const projectCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < projectCount; i++) {
        projects.push({
          userId: user._id,
          title: faker.company.name(),
          description: generateProjectDescription(),
          domain: "Computer Engineering",
          stack: faker.helpers.arrayElement(["MERN", "Next.js", "Flutter", "Node.js"]),
          ProjectStatus: faker.helpers.arrayElement(["idea", "inProgress", "completed"]),
          thumbnailUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/300`,
          githubUrl: faker.internet.url(),
          liveDemoUrl: faker.internet.url(),
        });
      }
    }

    const createdProjects = await Project.insertMany(projects);
    console.log(`📦 ${createdProjects.length} Projects created`);

    // ================= USER INTEREST MAP =================
    const userInterestDocs = [];
    for (const user of users) {
      const selected = faker.helpers.arrayElements(interests, 3);
      for (const interest of selected) {
        userInterestDocs.push({
          userId: user._id,
          interestId: interest._id,
        });
      }
    }
    await UserInterest.insertMany(userInterestDocs);
    console.log("🔗 User interests linked");

    // ================= VERIFY SAMPLE DATA =================
    console.log("🎉 SAMPLE USER WITH PROJECTS:");
    const sampleUser = users[0];
    const sampleProjects = createdProjects.filter(
      (p) => p.userId.toString() === sampleUser._id.toString()
    );
    console.log({
      user: sampleUser.name,
      projects: sampleProjects.map((p) => ({ title: p.title, domain: p.domain })),
    });

    console.log("🎉 DATABASE SEEDED SUCCESSFULLY");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();
