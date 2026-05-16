

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyOtpSchema } from "../../../Schemas/validation/authSchema"
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"

export default function ForgotPasswordFlow({ onBackToLogin }) {
    const [step, setStep] = useState("email")
    const [direction, setDirection] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const steps = ["email", "otp", "password"]
    const currentStepIndex = steps.indexOf(step)
    const progress = ((currentStepIndex + 1) / steps.length) * 100

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 400 : -400,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction) => ({
            x: direction > 0 ? -400 : 400,
            opacity: 0,
            scale: 0.9,
        }),
    }



    /* ---------------- EMAIL ---------------- */
    const handleEmailSubmit = async (e) => {
        e.preventDefault()

        const result = verifyOtpSchema
            .pick({ email: true })
            .safeParse({ email })

        if (!result.success) {
            toast.error(result.error.issues[0].message)
            return
        }

        setIsLoading(true)

        try {
            const emailPromise = api.post("auth/forgotpassword/email", {
                email,
            })


            const response = await toast.promise(emailPromise, {
                loading: "Sending OTP...",
                success: (res) => {
                    // This function runs after success
                    setDirection(1);
                    setStep("otp");

                    return res?.data?.message || "OTP sent to your email 📩";
                },

                error: (err) =>
                    err?.response?.data?.message || "Failed to send OTP",
            });



        } catch (err) {
            // handled by toast.promise
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const resendPromise = api.post("/auth/forgotpassword/resendOtp", {
                email,
            });

            await toast.promise(resendPromise, {
                loading: "Sending new OTP...",
                success: (res) =>
                    res?.data?.message || "New OTP sent successfully",
                error: (err) =>
                    err?.response?.data?.message || "Failed to resend OTP",
            });


        } catch (err) {
            // handled by toast.promise
        } finally {
            setIsLoading(false);
        }
    };
    const handleOtpChange = async (index, value) => {
        if (value.length > 1) return
        const copy = [...otp]
        copy[index] = value
        setOtp(copy)

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus()
        }

    }


    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus()
        }
    }

    const handleOtpSubmit = async (e) => {
        e.preventDefault()

        if (isLoading) return;

        setIsLoading(true)

        const otpcode = otp.join("")
        if (otpcode.length != 6) {
            toast.error("Please enter a valid 6-digit OTP")
            setIsLoading(false)
            return
        }

        const otpPromise = api.post("auth/forgotpassword/otp", {
            otp: otpcode,
            email,
        })

        try {


            const response = await toast.promise(otpPromise, {
                loading: "Verifying OTP...",
                success: (res) => {
                    if (res.data.success) {
                        setDirection(1);
                        setStep("password");
                    }
                    return res.data.message;
                },
                error: (err) => err?.response?.data?.message || "Invalid OTP",
            });

            if (response.data.success) {
                setDirection(1)
                setStep("password")
            }

        } catch (err) {
            // handled by toast.promise
        } finally {
            setIsLoading(false)
        }
    }

    /* ---------------- PASSWORD ---------------- */
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const resetPromise = api.post("auth/forgotpassword/reset", {
                email,
                newPassword,
                confirmPassword,
            });

            const response = await toast.promise(resetPromise, {
                loading: "Resetting password...",
                success: (res) => {

                    setTimeout(() => {
                        onBackToLogin()
                    }, 500);

                    return res?.data?.message || "Password reset successfully";
                },
                error: (err) =>
                    err?.response?.data?.message || "Failed to reset password",
            });



        } catch (error) {
            // handled by toast.promise
        } finally {
            setIsLoading(false);
        }
    };
    const handleBack = () => {
        const prev = currentStepIndex - 1
        if (prev >= 0) {
            setDirection(-1)
            setStep(steps[prev])
        } else {
            onBack()
        }
    }

    return (
        <div className="relative mx-auto w-full max-w-md overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-2xl border border-border bg-card-foreground p-4 shadow-2xl backdrop-blur-xl sm:p-8"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 overflow-hidden">
                        <motion.div
                            className="h-full relative"
                            style={{ backgroundColor: "#60a5fa" }}
                            initial={{ width: "33%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ["-100%", "400%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </motion.div>
                    </div>

                    {/* Back */}
                    <button
                        onClick={onBackToLogin}
                        className="absolute top-6 left-6 text-muted-foreground hover:text-background cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* ---- EMAIL ---- */}
                    {step === "email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6 pt-8">
                            <div className="mb-8 text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-300/20 flex items-center justify-center"
                                >
                                    <Mail className="w-8 h-8 text-blue-300" />
                                </motion.div>
                                <h2 className="mb-3 text-3xl font-display font-bold tracking-tight text-background sm:text-4xl">
                                    Forgot Password?
                                </h2>
                                <p className="text-muted-foreground text-sm font-medium">Enter your email to receive OTP</p>
                            </div>
                            <Label htmlFor="email" className="text-background text-sm font-semibold mb-2">
                                Email Address
                            </Label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />

                            <Button className="w-full bg-neutral-200 text-bg-dark cursor-pointer  hover:bg-neutral-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300" disabled={isLoading}>
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {/* ---- OTP ---- */}
                    {step === "otp" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pt-8"
                        >
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-300/20 flex items-center justify-center"
                                >
                                    <Shield className="w-8 h-8 text-blue-300" />
                                </motion.div>
                                <h2 className="mb-3 text-3xl font-display font-bold tracking-tight text-background sm:text-4xl">
                                    Verify OTP
                                </h2>
                                <p className="text-background/40 text-sm font-medium">
                                    Enter the 6-digit code sent to :{" "}
                                    <span className="text-background font-semibold">{email}</span>
                                </p>
                            </div>

                            {/* OTP Form */}
                            <form onSubmit={handleOtpSubmit} className="space-y-6">
                                <div className="flex justify-center gap-1.5 sm:gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            value={digit}
                                            maxLength={1}
                                            onChange={(e) =>
                                                handleOtpChange(index, e.target.value.replace(/\D/g, ""))
                                            }
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="h-12 w-10 rounded-xl border-2 border-neutral-600 bg-neutral-900 text-center text-lg font-bold text-amber-50 caret-white outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-400 sm:h-14 sm:w-12 sm:text-2xl"
                                        />
                                    ))}
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="text-sm text-blue-400 hover:text-blue-400/80 font-semibold transition-colors underline-offset-4 hover:underline cursor-pointer"
                                    >
                                        Resend OTP
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full  bg-neutral-200 text-bg-dark cursor-pointer  hover:bg-neutral-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 font-semibold h-12 text-base"
                                    disabled={isLoading || otp.some((d) => !d)}
                                >
                                    {isLoading ? (
                                        <motion.div className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full"
                                            />
                                            <span>Verifying...</span>
                                        </motion.div>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* ---- PASSWORD ---- */}
                    {step === "password" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8">
                            <div className="mb-8 text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-400/20 flex items-center justify-center"
                                >
                                    <Lock className="w-8 h-8 text-blue-300" />
                                </motion.div>
                                <h2 className="mb-3 text-3xl font-display font-bold tracking-tight text-background sm:text-4xl">New Password</h2>
                                <p className="text-background/60 text-sm font-medium">Create a strong password for your account</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="newPassword" className="text-background text-sm font-semibold">
                                        New Password
                                    </Label>
                                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="glow-input bg-neutral-800 border-neutral-600 text-background placeholder:text-muted-background h-12 pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-background transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5 text-background cursor-pointer" /> : <Eye className="w-5 h-5 text-background cursor-pointer" />}
                                        </button>
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="confirmPassword" className="text-background text-sm font-semibold">
                                        Confirm Password
                                    </Label>
                                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="glow-input g-neutral-800 border-neutral-600 text-background placeholder:text-muted-background h-12 pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-background hover:text-background transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5 text-background cursor-pointer" /> : <Eye className="w-5 h-5 text-background cursor-pointer" />}
                                        </button>
                                    </motion.div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer  bg-neutral-200 text-bg-dark  hover:bg-neutral-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 font-semibold h-12 text-base"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <motion.div className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-accent-background border-t-transparent rounded-full"
                                                />
                                                <span>Resetting...</span>
                                            </motion.div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
