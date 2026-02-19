import ChatModel from "../models/ChatModel.js";

export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;

    const messages = await ChatModel.find({ matchId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name avatar");

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};