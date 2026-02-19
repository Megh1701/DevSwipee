import { Router } from "express";
import { getProjectsFeed } from "../controllers/projectFeedController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();


router.get("/feed",authMiddleware, getProjectsFeed);

export default router;
