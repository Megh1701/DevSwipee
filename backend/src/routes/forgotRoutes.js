import { Router } from "express";
import { sendOtp, verifyOtp,resetpassword, resendOtp } from "../controllers/forgotPassController.js";

const router = Router();

router.post("/forgotpassword/email",sendOtp );

router.post("/forgotpassword/otp",verifyOtp );


router.post("/forgotpassword/reset",resetpassword );


router.post("/forgotpassword/resendOtp",resendOtp );
export default router;