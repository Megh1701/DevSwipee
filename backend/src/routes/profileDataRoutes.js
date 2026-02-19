import { Router } from "express";
import { fetchprofiledata } from "../controllers/profileDataController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();


router.get("/profiledata", authMiddleware,fetchprofiledata);


export default router;