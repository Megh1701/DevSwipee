
import express from 'express';
import { getPendingInvites, Getsession, sessionInvite } from '../controllers/sessionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { inviteResponse } from '../controllers/sessionController.js';
import { getSessionbyparams } from '../controllers/sessionController.js';
const router = express.Router();


router.post("/invite", authMiddleware,sessionInvite)

router.post("/respond", authMiddleware,inviteResponse)

router.get("/pending",authMiddleware,getPendingInvites)

router.get("/getsession",authMiddleware,Getsession)

router.get("/:sessionId",authMiddleware,getSessionbyparams)

export default router;