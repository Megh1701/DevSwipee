import MatchModel from "../models/MatchModel.js";
import SwipeModel from "../models/SwipeModel.js";

// deterministic ordering (prevents duplicates)
function normalizeUsers(a, b) {
    return a.toString() < b.toString() ? [a, b] : [b, a];
}
export const acceptSwipe = async (req, res) => {
  try {
    const { swipeId } = req.params;
    const userId = req.user.id;

    const swipe = await SwipeModel.findOneAndUpdate(
      { _id: swipeId, ownerId: userId, status: "interested" },
      { status: "accepted" },
      { new: true }
    );

    console.log("👉 ACCEPTED SWIPE:", swipe);

    if (!swipe) {
      return res.status(404).json({ message: "Swipe not found or handled" });
    }

    console.log("🔍 SEARCH OPPOSITE WITH:", {
      swiperId: swipe.ownerId,
      ownerId: swipe.swiperId,
      projectId: swipe.swiperProjectId,
      swiperProjectId: swipe.projectId,
      status: "accepted",
    });

    const oppositeSwipe = await SwipeModel.findOne({
      swiperId: swipe.ownerId,
      ownerId: swipe.swiperId,
      projectId: swipe.swiperProjectId,
      swiperProjectId: swipe.projectId,
      status: "accepted",
    });

    console.log("👀 OPPOSITE SWIPE:", oppositeSwipe);

    let match = null;

    if (oppositeSwipe) {
      console.log("🔥 BOTH ACCEPTED — CREATING MATCH");

      const [user1Id, user2Id] = normalizeUsers(
        swipe.swiperId,
        swipe.ownerId
      );

      match = await MatchModel.findOneAndUpdate(
        { user1Id, user2Id, projectId: swipe.projectId },
        { user1Id, user2Id, projectId: swipe.projectId, createdBy: userId },
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
    console.error("❌ ACCEPT SWIPE ERROR:", err);
    return res.status(500).json({ success: false });
  }
};