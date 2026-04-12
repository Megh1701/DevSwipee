
import express from 'express';
import { getPendingInvites, sessionInvite } from '../controllers/sessionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { inviteResponse } from '../controllers/sessionController.js';

const router = express.Router();


router.post("/invite", authMiddleware,sessionInvite)

router.post("/respond", authMiddleware,inviteResponse)

router.get("/pending",authMiddleware,getPendingInvites)
export default router;