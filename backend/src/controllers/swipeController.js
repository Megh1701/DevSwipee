import UserModel from "../models/UserModel.js";
import SwipeModel from "../models/SwipeModel.js";
import ProjectModel from "../models/ProjectModel.js";

const DAILY_LIMIT = 10;

export const SwipeHandler = async (req, res) => {
  try {
    const swiperId = req.user.id;
    const { projectId, ownerId, direction } = req.body;

    const swiperProject = await ProjectModel.findOne({ userId: swiperId });

 if (!swiperProject) {
      return res.status(400).json({
        success: false,
        message: "Create a project before swiping",
      });
    }

    // ✅ Validate input
    if (!projectId || !ownerId || typeof direction === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Invalid swipe data",
      });
    }

    // ✅ Prevent duplicate swipe
    const alreadySwiped = await SwipeModel.findOne({ swiperId, projectId });
    if (alreadySwiped) {
      return res.status(400).json({
        success: false,
        message: "Already swiped this project",
      });
    }

   
    // ✅ Fetch user
    const user = await UserModel.findById(swiperId);
    if (!user) {
      return res.status(404).json({ success: false });
    }

    const now = new Date();

    if (!user.swipeResetAt || now > user.swipeResetAt) {
      user.dailySwipeCount = 0;
      user.swipeResetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await user.save();
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      swiperId,
      { $inc: { dailySwipeCount: 1 } },
      { new: true }
    );
    const remainingSwipes = Math.max(
      0,
      DAILY_LIMIT - updatedUser.dailySwipeCount
    );


    // ✅ Check limit BEFORE swipe
    if (user.dailySwipeCount >= DAILY_LIMIT) {
      return res.status(403).json({
        success: false,
        message: "Daily swipe limit reached",
        resetAt: updatedUser.swipeResetAt || user.swipeResetAt,
        remainingSwipes: 0,
      });
    }

    const isRightSwipe = Number(direction) === 1;
    const swipeStatus = isRightSwipe ? "interested" : "ignore";



    const swipe = await SwipeModel.create({
      swiperId,
      ownerId,
      projectId,
      swiperProjectId: swiperProject?._id,
      direction: isRightSwipe,
      status: swipeStatus,
    });

    console.log("Swipe saved:", swipe);

    
    return res.json({
      success: true,
      swipe,
      remainingSwipes,
      resetAt: user.swipeResetAt,
    });

  } catch (err) {
    console.error("Swipe error:", err);
    return res.status(500).json({ success: false });
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