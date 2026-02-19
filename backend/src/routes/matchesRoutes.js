
import express from 'express';
import { acceptSwipe } from '../controllers/matchController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// PATCH /api/matches/accept/:swipeId
router.patch("/accept/:swipeId", authMiddleware, acceptSwipe)

export default router;