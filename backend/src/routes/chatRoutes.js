import express from "express";
import { getMessages } from "../controllers/chatController.js";
import { getMyChats } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getChatMeta } from "../controllers/chatController.js";
const router = express.Router();

router.get("/my-chats", authMiddleware, getMyChats);
router.get("/:matchId/messages", authMiddleware, getMessages);
router.get("/:matchId/meta", authMiddleware, getChatMeta);
export default router;