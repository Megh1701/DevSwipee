import express from "express";
import { getMessages } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:matchId", authMiddleware, getMessages);

export default router;