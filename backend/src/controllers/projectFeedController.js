import Project from "../models/ProjectModel.js";
import SwipeModel from "../models/SwipeModel.js";
import InterestModel from "../models/InterestModel.js";
import UserModel from "../models/UserModel.js";
import UserInterestModel from "../models/UserInterestModel.js";
export const getProjectsFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 0;
    const limit = 5;

    const swipes = await SwipeModel.find(
      { swiperId: userId },
      { projectId: 1, _id: 0 }
    );

    const swipedIds = swipes.map(s => s.projectId)

    const projects = await Project.find({
      userId: { $ne: userId },
      _id: { $nin: swipedIds },
    })
      .populate("userId", "avatar name city")
      .skip(page * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (err) {
    console.error("Failed to fetch projects feed:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getFilteredProjectsFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      gender,
      domain,
      city,
      page = 0,
    } = req.query;

    const limit = 5;

    // 1️⃣ Get already swiped projects
    const swipes = await SwipeModel.find(
      { swiperId: userId },
      { projectId: 1, _id: 0 }
    );

    const swipedIds = swipes.map((s) => s.projectId);

    // 2️⃣ BASE USER FILTER (ONLY gender for now)
    const userQuery = {
      _id: { $ne: userId },
    };
    if (gender) {
      userQuery.gender =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    }

    // 3️⃣ Get users matching gender
    const filteredUsers = await UserModel.find(userQuery).select("_id");

    let userIds = filteredUsers.map((u) => u._id);

    // 🚨 No matching users
    if (!userIds.length) {
      return res.status(200).json([]);
    }

    // 4️⃣ DOMAIN / INTEREST FILTER
    if (domain) {
      const interest = await InterestModel.findOne({ name: domain });

      // If selected interest doesn't exist
      if (!interest) {
        return res.status(200).json([]);
      }

      // Find users with that interest
      const interestUsers = await UserInterestModel.find({
        interestId: interest._id,
      }).select("userId");

      const interestSet = new Set(
        interestUsers.map((u) => u.userId.toString())
      );

      // Keep only users matching BOTH gender + interest
      userIds = userIds.filter((id) =>
        interestSet.has(id.toString())
      );
    }

    // 🚨 No matching users after interest filtering
    if (!userIds.length) {
      return res.status(200).json([]);
    }

    // 5️⃣ PROJECT QUERY
    const projectQuery = {
      userId: { $in: userIds },
      _id: { $nin: swipedIds },
    };

    // Optional city filter
    if (city) {
      projectQuery.city = city;
    }

    // 6️⃣ Fetch projects
    const projects = await Project.find(projectQuery)
      .populate("userId", "avatar name gender city")
      .skip(Number(page) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json(projects);

  } catch (err) {
    console.error("Filtered feed error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};