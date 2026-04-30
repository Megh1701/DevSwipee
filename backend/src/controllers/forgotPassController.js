
import UserModel from "../models/UserModel.js"
import bcrypt from "bcrypt";
import { transporter } from "../utils/nodemailer.js";
import crypto from "crypto";

export const sendOtp = async (req, res) => {
  let user;
  try {
    const { email } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    user = await UserModel.findOne({ email: cleanEmail })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist in db",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const otphash = crypto.createHash("sha256").update(otp.toString()).digest("hex")
    user.resetOtp = otphash
    user.otpAttempts = 0;

    user.isOtpVerified = false;

    user.markModified("resetOtp");
    user.markModified("resetOtpExpiry");
    await user.save();



    console.log("Saved OTP HASH:", user.resetOtp);
    console.log("Saved OTP Expiry:", user.resetOtpExpiry);
    await transporter.sendMail({

      from: {
        name: "DevSwipe",
        address: process.env.EMAIL_USER,
      },
      to: cleanEmail,
      subject: "Reset your password - DevSwipe",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - DevSwipe</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>

<body style="margin:0; padding:0; background-color:#000000; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">

  <!-- Hidden Preview Text -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    Your DevSwipe password reset OTP is ${otp}. This code expires in 10 minutes.
  </div>

  <!-- Full Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:420px; background-color:#0a0a0a; border-radius:16px; border:1px solid #1a1a1a; box-shadow:0 0 60px rgba(59,130,246,0.05), 0 25px 50px -12px rgba(0,0,0,0.8);">
          <tr>
            <td style="padding:48px 40px;">

              <!-- Brand -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div style="width:36px; height:36px; background-color:#3b82f6; background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%); border-radius:8px;"></div>
                        </td>
                        <td style="vertical-align:middle; padding-left:12px;">
                          <span style="color:#ffffff; font-size:20px; font-weight:600; letter-spacing:-0.5px;">DevSwipe</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding-bottom:32px;">
                    <div style="height:1px; background:linear-gradient(90deg,transparent 0%,#222222 50%,transparent 100%);"></div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600; letter-spacing:-0.5px;">
                      Reset your password
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0; color:#888888; font-size:15px; line-height:1.5;">
                      Use the OTP below to continue
                    </p>
                  </td>
                </tr>
              </table>

              <!-- OTP Box -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="background-color:#111111; border:1px solid #222222; border-radius:12px; padding:24px 28px; display:inline-block; box-shadow:0 0 30px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03);">
                      <span style="color:#ffffff; font-size:36px; font-weight:700; letter-spacing:8px; font-family:'SF Mono','Fira Code','Roboto Mono',monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <div style="display:inline-block; background-color:rgba(59,130,246,0.10); border:1px solid rgba(59,130,246,0.20); border-radius:8px; padding:12px 20px;">
                      <span style="color:#60a5fa; font-size:13px; font-weight:500;">
                        ⏱ This OTP expires in 10 minutes
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="height:1px; background:linear-gradient(90deg,transparent 0%,#222222 50%,transparent 100%);"></div>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin:0; color:#555555; font-size:13px; line-height:1.6;">
                      If you didn’t request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Bottom Footer -->
        <table role="presentation" width="100%" style="max-width:420px;">
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0; color:#444444; font-size:12px;">
                © ${new Date().getFullYear()} DevSwipe. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
    });
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  }
  catch (error) {

    if (user) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
    }

    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });
    console.log(otp)
    console.log(email)

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isOtpVerified) {
      return res.status(200).json({
        success: true,
        message: "OTP already verified",
      });
    }
    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({
        message: "No active OTP found",
      });
    }

    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    if (hashedOtp !== user.resetOtp) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= 5) {
        user.resetOtp = null;
        user.resetOtpExpiry = null;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          user.otpAttempts >= 5
            ? "Too many attempts. Request new OTP."
            : "Invalid OTP",
      });
    }

    console.log("DB OTP HASH:", user.resetOtp);
    console.log("Entered OTP HASH:", hashedOtp);
    console.log("Expiry:", user.resetOtpExpiry);

    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.otpAttempts = 0;
    user.isOtpVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error from otp" });
  }
}

export const resetpassword = async (req, res) => {
  try {

    const { email, confirmPassword, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: cleanEmail });

    if (confirmPassword !== newPassword) {
      return res.status(400).json({
        message: "Your Confirm and New password is different",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.isOtpVerified = false;
    user.otpAttempts = 0;
    await user.save()


    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error from otp" });
  }

}

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.isOtpVerified = false;

    await user.save();

    await transporter.sendMail({

      from: {
        name: "DevSwipe",
        address: process.env.EMAIL_USER,
      },
      to: cleanEmail,
      subject: "Reset your password - DevSwipe",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - DevSwipe</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>

<body style="margin:0; padding:0; background-color:#000000; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">

  <!-- Hidden Preview Text -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    Your DevSwipe password reset OTP is ${otp}. This code expires in 10 minutes.
  </div>

  <!-- Full Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:420px; background-color:#0a0a0a; border-radius:16px; border:1px solid #1a1a1a; box-shadow:0 0 60px rgba(59,130,246,0.05), 0 25px 50px -12px rgba(0,0,0,0.8);">
          <tr>
            <td style="padding:48px 40px;">

              <!-- Brand -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div style="width:36px; height:36px; background-color:#3b82f6; background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%); border-radius:8px;"></div>
                        </td>
                        <td style="vertical-align:middle; padding-left:12px;">
                          <span style="color:#ffffff; font-size:20px; font-weight:600; letter-spacing:-0.5px;">DevSwipe</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding-bottom:32px;">
                    <div style="height:1px; background:linear-gradient(90deg,transparent 0%,#222222 50%,transparent 100%);"></div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600; letter-spacing:-0.5px;">
                      Reset your password
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0; color:#888888; font-size:15px; line-height:1.5;">
                      Use the OTP below to continue
                    </p>
                  </td>
                </tr>
              </table>

              <!-- OTP Box -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="background-color:#111111; border:1px solid #222222; border-radius:12px; padding:24px 28px; display:inline-block; box-shadow:0 0 30px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03);">
                      <span style="color:#ffffff; font-size:36px; font-weight:700; letter-spacing:8px; font-family:'SF Mono','Fira Code','Roboto Mono',monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <div style="display:inline-block; background-color:rgba(59,130,246,0.10); border:1px solid rgba(59,130,246,0.20); border-radius:8px; padding:12px 20px;">
                      <span style="color:#60a5fa; font-size:13px; font-weight:500;">
                        ⏱ This OTP expires in 10 minutes
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="height:1px; background:linear-gradient(90deg,transparent 0%,#222222 50%,transparent 100%);"></div>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin:0; color:#555555; font-size:13px; line-height:1.6;">
                      If you didn’t request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Bottom Footer -->
        <table role="presentation" width="100%" style="max-width:420px;">
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0; color:#444444; font-size:12px;">
                © ${new Date().getFullYear()} DevSwipe. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
    });

    return res.status(200).json({
      success: true,
      message: "new otp has been sent",
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
}