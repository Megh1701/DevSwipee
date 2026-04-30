import { Router } from "express";
import multer from "multer";
import { projectDetailsControllers } from "../controllers/projectDetailsControllers.js";
import { getprojectDetails } from "../controllers/projectDetailsControllers.js";
import { updateprojectDetails } from "../controllers/projectDetailsControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();

const upload = multer();

router.post(
  "/project",
  authMiddleware, 
  upload.none(),          
  projectDetailsControllers
);

router.get(
  "/project",
  authMiddleware,
  getprojectDetails
);

router.put("/project/:id", authMiddleware,upload.none(), updateprojectDetails);

export default router;
