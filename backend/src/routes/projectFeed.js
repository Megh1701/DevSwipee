import { Router } from "express";
import { getProjectsFeed } from "../controllers/projectFeedController.js";
import { getFilteredProjectsFeed } from "../controllers/projectFeedController.js";
import { getMyProjectStatus } from "../controllers/projectDetailsControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();


router.get("/feed",authMiddleware, getProjectsFeed);
router.get("/filtered",authMiddleware, getFilteredProjectsFeed);
router.get("/project/status", authMiddleware, getMyProjectStatus);

export default router;
