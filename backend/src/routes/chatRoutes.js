import express from "express";
import { getMessages } from "../controllers/chatController.js";
import { getMyChats } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my-chats", authMiddleware, getMyChats);
router.get("/:matchId/messages", authMiddleware, getMessages);

export default router;