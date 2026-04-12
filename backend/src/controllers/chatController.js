import ChatModel from "../models/ChatModel.js";
import MatchModel from "../models/MatchModel.js";
import mongoose from "mongoose";



export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid matchId"
      });
    }

    // 🔐 Make sure user belongs to this match
    const match = await MatchModel.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    if (
      match.user1Id.toString() !== userId &&
      match.user2Id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const messages = await ChatModel.find({ matchId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name avatar")
      .populate("receiverId", "name avatar");

    res.json({ success: true, messages });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await MatchModel.find({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    })
      .populate("user1Id", "name avatar")
      .populate("user2Id", "name avatar")
      .sort({ updatedAt: -1 });

    res.json({ success: true, matches });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const getChatMeta = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await MatchModel.findById(matchId)
      .populate("user1Id", "name avatar")
      .populate("user2Id", "name avatar");

    if (!match) {
      return res.status(404).json({ success: false });
    }

    if (
      match.user1Id._id.toString() !== userId &&
      match.user2Id._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false });
    }

    res.json({ success: true, match });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};