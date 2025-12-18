import { Router } from "express";
import { matchesControllers } from "../controllers/matchesControllers";
import authMiddleware from "../middlewares/authMiddleware";
const router = Router();


router.get("/matches/recieved", authMiddleware,matchesControllers);


export default router;
