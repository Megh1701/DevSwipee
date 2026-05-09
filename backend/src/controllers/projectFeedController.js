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
      ats,
      page = 0,
    } = req.query;

    console.log(ats)
    const limit = 5;
    const swipes = await SwipeModel.find(
      { swiperId: userId },
      { projectId: 1, _id: 0 }
    );

    const swipedIds = swipes.map((s) => s.projectId);

    const userQuery = {
      _id: { $ne: userId },
    };
    if (gender) {
      userQuery.gender =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    }

    const filteredUsers = await UserModel.find(userQuery).select("_id");

    let userIds = filteredUsers.map((u) => u._id);

    if (!userIds.length) {
      return res.status(200).json([]);
    }

    if (domain) {
      const interest = await InterestModel.findOne({ name: domain });

      if (!interest) {
        return res.status(200).json([]);
      }

      const interestUsers = await UserInterestModel.find({
        interestId: interest._id,
      }).select("userId");

      const interestSet = new Set(
        interestUsers.map((u) => u.userId.toString())
      );

      userIds = userIds.filter((id) =>
        interestSet.has(id.toString())
      );
    }

    if (!userIds.length) {
      return res.status(200).json([]);
    }

    const projectQuery = {
      userId: { $in: userIds },
      _id: { $nin: swipedIds },
    };
    const sortOption =
  ats === "true"
    ? { atsQualityScore: -1 } 
    : { createdAt: -1 };

    const projects = await Project.find(projectQuery)
      .populate("userId", "avatar name gender city")
      .sort(sortOption)
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