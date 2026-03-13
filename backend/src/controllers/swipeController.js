
import SwipeModel from "../models/SwipeModel.js";
import ProjectModel from "../models/ProjectModel.js"


export const SwipeHandler = async (req, res) => {
  try {
    const swiperId = req.user.id;
    const { projectId, ownerId, direction } = req.body;

    // ⭐ Prevent duplicate swipe same project
    const alreadySwiped = await SwipeModel.findOne({ swiperId, projectId });

    if (alreadySwiped) {
      return res.status(400).json({
        success: false,
        message: "You already swiped this project",
      });
    }

    // ⭐ Swipe limit logic (unique projects in last 24h)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const uniqueSwipes = await SwipeModel.distinct("projectId", {
      swiperId,
      createdAt: { $gte: last24Hours },
    });

    if (uniqueSwipes.length >= 2) {   // change to 10 later
      return res.status(403).json({
        success: false,
        message: "Daily swipe limit reached",
      });
    }

    // ⭐ Your existing logic
    const isRightSwipe = Number(direction) === 1;
    const swipeStatus = isRightSwipe ? "interested" : "ignore";

    const swiperProject = await ProjectModel.findOne({ userId: swiperId });
    const swiperProjectId = swiperProject?._id;

    const swipe = await SwipeModel.create({
      swiperId,
      ownerId,
      projectId,
      swiperProjectId,
      direction: isRightSwipe,
      status: swipeStatus,
    });

    res.json({
      success: true,
      swipe,
      remainingSwipes: 2 - (uniqueSwipes.length + 1),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const swipes = await SwipeModel.find({
      ownerId: userId,
      status: "interested",
    })
      .populate("ownerId", "name avatar")     // you 
      .populate("swiperId", "name avatar")    // who liked you
      .populate(
        "swiperProjectId",
        "title stack description githubUrl liveDemoUrl thumbnailUrl"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      swipes,
    });
  } catch (error) {
    console.error("getMyRequests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
    });
  }
};

export const listMySwipes = async (req, res) => {
  try {

    console.log("Cookies:", req.cookies);
    console.log("User:", req.user);
    const userId = req.user.id;
    const myswipes = await SwipeModel.find({ swiperId: userId, direction: true, })
      .select("status createdAt")
      .populate("ownerId", "name avatar")
      .populate("projectId", "title stack description domain thumbnailUrl githubUrl liveDemoUrl");


    if (!myswipes.length) {
      return res.json({ success: true, message: "You haven’t swiped any projects yet", swipes: [] });
    }

    res.json({ success: true, swipes: myswipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSwipeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const swipe = await SwipeModel.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { status },
      { new: true } // 🔥 no validation re-run
    );

    if (!swipe) {
      return res.status(404).json({ message: "Swipe not found" });
    }

    res.json({ success: true, swipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};