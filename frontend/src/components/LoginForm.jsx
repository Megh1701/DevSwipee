import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/Input.jsx";
import { Label } from "./ui/Label.jsx";
import { Button } from "./ui/Button.jsx";
import api from "@/lib/axios.js";

export default function LoginForm({ onSwitchToSignup,onForgotPassword,onLoginSuccess }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await api.post(
                "auth/login", {
                email,
                password
            }
            )
            localStorage.setItem("token", response.data.token);
            toast.success("Welcome back 👋");
            if (onLoginSuccess)
                 onLoginSuccess();

        }
        catch (error) {
            toast.error(
                error.response?.data?.message || "Login failed"
            );
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-black-500 border-neutral-700 border-2 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
            {/* Background Glow */}
            <motion.div
                className="absolute inset-0 opacity-0"
                animate={{ opacity: emailFocused || passwordFocused ? 0.5 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: "radial-gradient(600px circle at 50% 50%, rgba(96, 165, 250, 0.1), transparent 40%)",
                }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-8 text-center relative z-10"
            >
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-gray-400 text-sm font-medium">Sign in to continue</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Email */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="space-y-2"
                >
                    <Label htmlFor="email" className="text-white text-sm font-semibold">
                        Email
                    </Label>
                    <motion.div animate={{ scale: emailFocused ? 1.01 : 1 }} transition={{ duration: 0.2 }}>
                        <Input
                            id="email"
                            type="email"
                            name="email"
  autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            placeholder="you@example.com"
                            className="bg-neutral-900 border-neutral-700 text-white placeholder:text-black-500 h-12"
                            required
                        />
                    </motion.div>
                </motion.div>

                {/* Password */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-2 mb-0"
                >
                    <Label htmlFor="password" className="text-white text-sm font-semibold">
                        Password
                    </Label>
                    <motion.div animate={{ scale: passwordFocused ? 1.01 : 1 }} transition={{ duration: 0.2 }} className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            placeholder="••••••••"
                            className="bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500 h-12 pr-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </motion.div>
                </motion.div>
<motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-right relative z-10 m-3"
            >
                    <button
                        onClick={onForgotPassword}
                        className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 font-light transition-colors duration-200 underline-offset-4 hover:underline"
                    >
                        Forgot Password ?
                    </button>
            
            </motion.div>
                {/* Submit Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                >
                    <Button
                        type="submit"
                        className="w-full bg-neutral-200 text-black cursor-pointer hover:bg-neutral-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 font-semibold h-12 text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <motion.div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                <span>Signing in...</span>
                            </motion.div>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </motion.div>
            </form>

            {/* Switch to Signup */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-6 text-center relative z-10"
            >
                <p className="text-gray-400 text-sm">
                    New user?{" "}
                    <button
                        onClick={onSwitchToSignup}
                        className="text-blue-400 cursor-pointer hover:text-blue-300 font-semibold transition-colors duration-200 underline-offset-4 hover:underline"
                    >
                        Create an account
                    </button>
                </p>
            </motion.div>
             
        </motion.div>
    );

}