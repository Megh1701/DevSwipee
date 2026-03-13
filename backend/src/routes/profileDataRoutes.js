import { Router } from "express";
import { fetchprofiledata } from "../controllers/profileDataController.js";
import { updateprofiledata } from "../controllers/profileDataController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();


router.get("/profiledata", authMiddleware,fetchprofiledata);
router.patch("/profiledata", authMiddleware, updateprofiledata);


export default router;