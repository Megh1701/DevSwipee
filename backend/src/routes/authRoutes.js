import { Router } from "express";
import { signup, login, logout } from "../controllers/authControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMe } from "../controllers/authControllers.js";
const router = Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);
export default router;
