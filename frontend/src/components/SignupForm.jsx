import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Input } from "./ui/Input.jsx";
import { Label } from "./ui/Label.jsx";
import { Button } from "./ui/Button.jsx";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Eye, EyeOff, ChevronLeft, Github, Sparkles, Plus, Minus } from "lucide-react";
import api from "@/lib/axios.js";

function AnimatedDigit({ value, themeColor }) {
    return (
        <div style={{ position: "relative", overflow: "hidden", height: "20vh", width: "5vw" }}>
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    initial={{ y: "-200%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "200%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 30 }}
                    style={{
                        position: "absolute",
                        userSelect: "none",
                        top: 0,
                        left: 0,
                        width: "100%",
                        textAlign: "center",
                        color: themeColor,
                    }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>

    );
}


function SmoothNumber({ value, themeColor }) {
    const digits = value.toString().split("").map(Number)

    return (
        <div className="flex tabular-nums">
            {digits.map((digit, idx) => (
                <AnimatedDigit key={idx} value={digit} themeColor={themeColor} />
            ))}
        </div>
    );
}

export default function SignupForm({ onSwitchToLogin }) {
    const [step, setStep] = useState("initial");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: "",
        city: "",
        verified: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [numericAge, setNumericAge] = useState(25);
    const [direction, setDirection] = useState(1);
    const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (step === "verified") {
      const timer = setTimeout(() => {
        // Redirect to main page
        window.location.href = "/" // or your main page path
      }, 5000) // 5 seconds

      return () => clearTimeout(timer)
    }
  }, [step])


    const themeColor = formData.gender === "Female" ? "rgb(236, 72, 153)" : "rgb(96, 165, 250)";

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        toast.success("Let's get to know you better!")
        setDirection(1);
        setStep("gender");
    };

    const handleGenderSubmit = (e) => {
        e.preventDefault();
        toast.success("Thanks for that! Age time—don’t worry, we won’t judge!");
        setDirection(1);
        setStep("age");
    };

    const handleAgeSubmit = (e) => {
        e.preventDefault();
        toast.success("All done with age! Now, your location, if you please.");
        setDirection(1);
        setStep("city");
    };

    const handleCitySubmit = (e) => {
        e.preventDefault();
        toast.success("Just one more and you’re all set!");
        setDirection(1);
        setStep("verified");
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await api.post(
                "/auth/signup",
                formData
            );

            toast.success("Account created 🎉");

            localStorage.setItem("token", res.data.token);

            console.log("User:", res.data.user);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Signup failed"
            );
        } finally {
            setIsLoading(false);
        }
    };



    const handleSkip = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        console.log("Signup skipped verification:", formData);
    };

    const steps = ["initial", "gender", "age", "city", "verified"];
    const currentStepIndex = steps.indexOf(step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
    };

    return (
        <div className="w-full max-w-md mx-auto relative select-none ">
            <AnimatePresence mode="wait" custom={direction}>
                {step === "initial" && (
                    <motion.div
                        key="initial"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-neutral-950 border  border-neutral-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 overflow-hidden">
                            <motion.div
                                className="h-full relative"
                                style={{ backgroundColor: themeColor }}
                                initial={{ width: "20%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                                    animate={{ x: ["-100%", "500%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        </div>

                        <div className="mb-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="inline-block mb-4"
                            >
                                <Sparkles className="w-12 h-12 text-blue-400" />
                            </motion.div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                            <p className="text-gray-400 text-sm font-medium">Start your journey with us</p>
                        </div>

                        <form onSubmit={handleInitialSubmit} className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="name" className="text-white text-sm font-semibold flex items-center gap-2">

                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500 h-12"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="signup-email" className="text-white text-sm font-semibold flex items-center gap-2">

                                    Email
                                </Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="bg-neutral-900  border-neutral-700 text-white placeholder:text-gray-500 h-12"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="signup-password" className="text-white text-sm font-semibold flex items-center gap-2">

                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500 h-12 pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5 cursor-pointer" /> : <Eye className="w-5 h-5 cursor-pointer" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Button
                                    type="submit"
                                    className="w-full  bg-neutral-200 text-black cursor-pointer hover:bg-neutral-200
  hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]
  transition-all duration-300 font-semibold h-12 text-base"
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-gray-400 text-sm">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 underline-offset-4 hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </motion.div>
                    </motion.div>
                )}

                {step === "gender" && (
                    <motion.div
                        key="gender"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        className="pt-8"
                    >
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Select your gender</h2>
                            <p className="text-gray-400 text-sm font-medium">Step 2 of 5</p>
                        </div>

                        <form onSubmit={handleGenderSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.0 }}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData({ ...formData, gender: "Male" })}
                                    className={`cursor-pointer relative overflow-hidden rounded-2xl p-8 duration-100 ${formData.gender === "Male"
                                        ? "bg-blue-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                                        : "bg-gray-800 border-2 border-gray-700 hover:border-blue-500/50 "
                                        }`}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <motion.div
                                            animate={{
                                                scale: formData.gender === "Male" ? [1, 1.2, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`w-16 h-16  rounded-full flex items-center justify-center ${formData.gender === "Male" ? "bg-blue-500" : "bg-gray-700"
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mars-icon lucide-mars"><path d="M16 3h5v5" /><path d="m21 3-6.75 6.75" /><circle cx="10" cy="14" r="6" /></svg>
                                        </motion.div>
                                        <span
                                            className={`font-bold text-xl ${formData.gender === "Male" ? "text-blue-500" : "text-white"}`}
                                        >
                                            Male
                                        </span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.0 }}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData({ ...formData, gender: "Female" })}
                                    className={` cursor-pointer relative overflow-hidden rounded-2xl p-8  duration-100 ${formData.gender === "Female"
                                        ? "bg-pink-500/20 border-2 border-pink-500 shadow-lg shadow-pink-500/20"
                                        : "bg-gray-800 border-2 border-gray-700 hover:border-pink-500/50"
                                        }`}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <motion.div
                                            animate={{
                                                scale: formData.gender === "Female" ? [1, 1.2, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`w-16 h-16 rounded-full flex items-center justify-center ${formData.gender === "Female" ? "bg-pink-500" : "bg-gray-700"
                                                }`}
                                        >
                                            <svg
                                                className={`w-8 h-8 ${formData.gender === "Female" ? "text-white" : "text-gray-400"}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="white"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 14v7m-3-3h6M12 3a4 4 0 100 8 4 4 0 000-8z"
                                                />
                                            </svg>
                                        </motion.div>
                                        <span
                                            className={`font-bold text-xl ${formData.gender === "Female" ? "text-pink-500" : "text-white"}`}
                                        >
                                            Female
                                        </span>
                                    </div>
                                </motion.button>
                            </div>

                            <Button
                                type="submit"
                                disabled={!formData.gender}
                                style={{ backgroundColor: formData.gender ? themeColor : undefined }}
                                className="cursor-pointer w-full font-semibold h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed text-white  hover:bg-neutral-200
  "
                            >
                                Continue
                            </Button>
                        </form>
                    </motion.div>
                )}

                {step === "age" && (
                    <motion.div
                        key="age"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        className="pt-8"
                    >
                        <div className="mb-8 text-center">
                            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">How old are you?</h2>
                            <p className="text-gray-400 text-sm font-medium">Step 3 of 5</p>
                        </div>

                        <form onSubmit={handleAgeSubmit} className="space-y-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center py-8 no-copy"

                            >
                                <div className="text-[120px] font-bold leading-none tracking-tight flex justify-center items-center gap-5 ">
                                    <div>
                                        <motion.div
                                            whileTap={{ scale: 0.90 }}
                                            onClick={() => {
                                                setNumericAge(prev => prev <60 ? prev+ 1 : prev);
                                            }}

                                            className=" cursor-pointer border border-neutral-500 rounded-[50%] p-2 h-auto "><Plus
                                                style={{
                                                    color:
                                                        formData.gender === "Female"
                                                            ? "rgb(236, 72, 153)"
                                                            : "rgb(96, 165, 250)",
                                                }}
                                                className="rounded-[50%]"
                                            />
                                        </motion.div>
                                    </div>
                                    <SmoothNumber value={numericAge} themeColor={themeColor} />
                                    <div>
                                        <motion.div
                                            whileTap={{ scale: 0.90 }}
                                                     onClick={() => {
                                                setNumericAge(prev => prev >16 ? prev - 1 : prev);
                                            }}

                                            className=" cursor-pointer border border-neutral-500 rounded-[50%] p-2 h-auto"><Minus
                                                style={{
                                                    color:
                                                        formData.gender === "Female"
                                                            ? "rgb(236, 72, 153)"
                                                            : "rgb(96, 165, 250)",
                                                }}
                                                className="rounded-[50%]"
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-gray-400 mt-4 text-sm font-medium "


                                >
                                    years old
                                </motion.p>
                            </motion.div>

                            <div className="space-y-4">
                                <Label htmlFor="age" className="text-white text-sm font-semibold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                    Adjust your age
                                </Label>
                                <input
                                    id="age"
                                    type="range"
                                    min="16"
                                    max="60"
                                    value={numericAge}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setNumericAge(val);
                                        setFormData({ ...formData, age: val });
                                    }}
                                    className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${themeColor} 0%, ${themeColor} ${((numericAge - 16) / (60 - 16)) * 100
                                            }%, rgb(31, 41, 55) ${((numericAge - 16) / (60 - 16)) * 60}%, rgb(31, 41, 55) 60%)`,
                                    }}

                                />
                                <style jsx>{`
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${themeColor};
      cursor: pointer;
      border: none;
    }
    input[type='range']::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${themeColor};
      cursor: pointer;
      border: none;
    }
  `}</style>
                                <div className="flex justify-between text-xs text-gray-400 font-medium">
                                    <span>16</span>
                                    <span>60</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                style={{ backgroundColor: themeColor }}
                                className="w-full font-semibold h-12 text-base text-white cursor-pointer"
                            >
                                Continue
                            </Button>
                        </form>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setDirection(-1);
                                setStep("gender");
                            }}
                            className="absolute -top-2 left-0 text-gray-400 hover:text-black cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </Button>
                    </motion.div>
                )}

                {step === "city" && (
                    <motion.div
                        key="city"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        className="pt-8"
                    >
                        <div className="mb-8 text-center">
                            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Where are you from?</h2>
                            <p className="text-gray-400 text-sm font-medium">Step 4 of 5</p>
                        </div>

                        <form onSubmit={handleCitySubmit} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="city" className="text-white text-sm font-semibold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                    City
                                </Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="New York"

                                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-14 text-center text-xl font-medium"
                                    required

                                />
                            </motion.div>

                            <Button
                                type="submit"
                                style={{ backgroundColor: themeColor }}
                                className="w-full font-semibold h-12 text-base text-white cursor-pointer"
                            >
                                Continue
                            </Button>
                        </form>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setDirection(-1);
                                setStep("age");
                            }}
                            className="absolute -top-4 left-0 text-gray-400 hover:text-black cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </Button>
                    </motion.div>
                )}
  {step === "verified" && isVisible && (
  <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-black w-full">
    {/* Radial background */}
    <div className="absolute inset-0 bg-gradient-radial from-zinc-900/50 via-black to-black" />

    {/* Floating dots */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="animate-float absolute h-2 w-2 rounded-full bg-white/90"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>

    {/* Badge */}
    <div className="relative z-10 flex flex-col items-center">
      <div className="mb-8 flex justify-center">
        <div className="transition-all duration-1000 scale-100 opacity-100">
          <div className="relative">
            {/* Glow layers */}
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-500/30 blur-3xl" />
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-400/20 blur-2xl [animation-delay:200ms]" />

            {/* Badge container */}
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/50">
              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-300/30 to-transparent" />

              {/* Checkmark */}
              <svg
                className="relative z-10 h-16 w-16 text-white drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>

              {/* Rotating ring */}
              <div className="absolute inset-2 animate-spin-slow rounded-full border-2 border-dashed border-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Verified text */}
      <div className="space-y-2 text-center">
        <h1 className="bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-6xl font-bold text-transparent drop-shadow-2xl">
          Verified!
        </h1>
        <p className="bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-400 bg-clip-text text-2xl font-medium text-transparent">
          You're good to go 
        </p>
        <div className="text-5xl">🚀</div>

        {/* Success line */}
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      </div>
    </div>
  </div>
)}


            </AnimatePresence>
        </div>
    );
}