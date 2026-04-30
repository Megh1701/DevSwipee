import MatchModel from "../models/MatchModel.js";
import SwipeModel from "../models/SwipeModel.js";

function normalizeUsers(a, b) {
  return a.toString() < b.toString() ? [a, b] : [b, a];
}

export const acceptSwipe = async (req, res) => {
  try {
    const { swipeId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Accept swipe
    const swipe = await SwipeModel.findOneAndUpdate(
      { _id: swipeId, ownerId: userId, status: "interested" },
      { status: "accepted" },
      { new: true }
    );

    if (!swipe) {
      return res.status(404).json({
        success: false,
        message: "Swipe not found or already handled",
      });
    }

    console.log("👉 ACCEPTED:", swipe);

    // 2️⃣ Find opposite swipe (SWAP projects!)
    const oppositeSwipe = await SwipeModel.findOne({
      swiperId: swipe.ownerId,
      ownerId: swipe.swiperId,
      projectId: swipe.swiperProjectId,      // swapped
      swiperProjectId: swipe.projectId,      // swapped
      status: "accepted",
    });

    console.log("👀 OPPOSITE:", oppositeSwipe);

    let match = null;

    if (oppositeSwipe) {
      console.log(" BOTH ACCEPTED — CREATING MATCH");

      const [user1Id, user2Id] = normalizeUsers(
        swipe.swiperId,
        swipe.ownerId
      );

      match = await MatchModel.findOneAndUpdate(
        {
          user1Id,
          user2Id,
          projectId: swipe.projectId, // owner's project
        },
        {
          user1Id,
          user2Id,
          projectId: swipe.projectId,
          createdBy: userId,
        },
        { upsert: true, new: true }
      );

      console.log("🎉 MATCH CREATED:", match);
    }

    return res.json({
      success: true,
      swipe,
      matchCreated: !!match,
      match,
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    return res.status(500).json({ success: false });
  }
};