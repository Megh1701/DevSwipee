import { Router } from "express";
import { getProjectATSScore, getMyProjectsATS } from "../controllers/atsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/my-projects", authMiddleware, getMyProjectsATS);
router.get("/score/:projectId", authMiddleware, getProjectATSScore);

export default router;

