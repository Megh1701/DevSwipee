import { Router } from "express";
import { listMySwipes, SwipeHandler ,getMyRequests, updateSwipeStatus} from "../controllers/swipeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/swipe",authMiddleware,SwipeHandler)
router.get("/myswipes",authMiddleware,listMySwipes)
router.get("/requests", authMiddleware, getMyRequests);
router.patch("/swipes/:id", authMiddleware, updateSwipeStatus);


export default router;
