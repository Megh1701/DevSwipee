import { Router } from "express";
import multer from "multer";
import { projectDetailsControllers } from "../controllers/projectDetailsControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();

const upload = multer();

router.post(
  "/project",
  authMiddleware, 
  upload.none(),          
  projectDetailsControllers
);

export default router;
