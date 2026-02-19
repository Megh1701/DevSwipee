import Project from "../models/ProjectModel.js";
import SwipeModel from "../models/SwipeModel.js";

export const getProjectsFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 0;
    const limit = 5;

    const swipes = await SwipeModel.find(
      { swiperId: userId },
      { projectId: 1, _id: 0 }
    );

    const swipedIds=swipes.map(s=>s.projectId)

    const projects = await Project.find({
      userId: { $ne: userId },
          _id: { $nin: swipedIds },
    })
      .skip(page * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (err) {
    console.error("Failed to fetch projects feed:", err);
    res.status(500).json({ message: err.message });
  }
};
