import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Input } from "./ui/Input.jsx";
import { Label } from "./ui/Label.jsx";
import { Button } from "./ui/Button.jsx";
import { Checkbox } from "@radix-ui/react-checkbox";
import { useNavigate } from "react-router-dom";
import { CITIES } from "@/data/cities.js";
import { signupSchema } from "../../../Schemas/validation/authSchema.js"
import { Eye, EyeOff, ChevronLeft, Github, Sparkles, Plus, Minus } from "lucide-react";
import api from "@/lib/axios.js";
// Import all avatars dynamically from src/assets
// Assuming SignupForm.jsx is in src/components/
const avatarImports = import.meta.glob("../assets/*.png", { eager: true });
const AVATARS = Object.values(avatarImports).map(mod => mod.default ?? mod);

function AnimatedDigit({ value, themeColor }) {
    return (
        <div style={{ position: "relative", overflow: "hidden", height: "60px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                        fontSize: "48px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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

export default function SignupForm({ onSwitchToLogin, onSignupSuccess }) {
    const [step, setStep] = useState("initial");
    const MAX_SELECTION = 3;
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        age: 25,
        gender: "",
        city: "",
        location: {
            type: "Point",
            coordinates: [],
        },
        interests: [],
        avatar: "",
        verified: false,
    });


    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [numericAge, setNumericAge] = useState(formData.age || 25);
    const [direction, setDirection] = useState(1);
    const [isVisible, setIsVisible] = useState(true)


    //for suggestion (city autocomplete)
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleSearch = (value) => {
        setQuery(value);

        if (!value) {
            setSuggestions([]);
            return;
        }

        const filtered = CITIES
            .filter((c) =>
                `${c.name} ${c.state}`
                    .toLowerCase()
                    .includes(value.toLowerCase())
            )
            .slice(0, 5); // limit results

        setSuggestions(filtered);
    };


    useEffect(() => {
        console.log("Updating formData.age from numericAge:", numericAge);
        setFormData(prev => ({ ...prev, age: numericAge }));
    }, [numericAge]);
    const TOP_DOMAINS = [
        "Web Development",
        "Mobile App Development",
        "UI / UX Design",
        "AI / Machine Learning",
        "Data Science",
        "Cyber Security",
        "Cloud & DevOps",
        "Blockchain / Web3",
        "Game Development",
    ];

    const navigate = useNavigate();



    const themeColor = formData.gender === "Female" ? "rgb(236, 72, 153)" : "rgb(96, 165, 250)";

    const handleInitialSubmit = (e) => {
        e.preventDefault();

        const isValid = validateStep({
            name: true,
            email: true,
            password: true,
        });

        if (!isValid) return;

        toast.success("Let's get to know you better!")
        setDirection(1);
        setStep("gender");
    };

    const handleGenderSubmit = (e) => {
        e.preventDefault();

        const isValid = validateStep({
            gender: true,
        });

        if (!isValid) return;

        toast.success("Thanks for that! Age time—don’t worry, we won’t judge!");
        setDirection(1);
        setStep("age");
    };

    const handleAgeSubmit = (e) => {
        e.preventDefault();

        const isValid = validateStep({
            age: true,
        });

        if (!isValid) return;

        const ageValue = Number(numericAge);
        if (!ageValue || ageValue < 16) {
            toast.error("Please select a valid age (16+)");
            return;
        }

        setFormData(prev => ({ ...prev, age: ageValue }));

        toast.success("All done with age! Now, your location 😊");
        setDirection(1);
        setStep("city");
    };

    const handleCitySubmit = (e) => {
        e.preventDefault();

        if (!selectedLocation) {
            toast.error("Please select a city from suggestions");
            return;
        }

        const cityPayload = {
            ...formData,
            city: selectedLocation.city,
            location: selectedLocation.location,
        };

        const isValid = validateStep({
            city: true,
            location: true,
        }, cityPayload);

        if (!isValid) return;

        console.log("Selected Location:", selectedLocation); 

        setFormData(cityPayload);

        toast.success("Just one more and you’re all set!");
        setDirection(1);
        setStep("interests");
    };

    const toggleDomain = (domain) => {
        setFormData((prev) => {
            const selected = prev.interests.includes(domain);

            if (!selected && prev.interests.length >= MAX_SELECTION) {
                toast.error(`Select up to ${MAX_SELECTION} domains only`);
                return prev;
            }

            return {
                ...prev,
                interests: selected
                    ? prev.interests.filter((i) => i !== domain)
                    : [...prev.interests, domain],
            };
        });
    };
    const handleContinue = async () => {
        if (formData.interests.length === 0) {
            toast.error("Select at least one domain");
            return;
        }
        try {
            setIsLoading(true);
            // const res = await api.post("/auth/signup", formData);
            // const data = res.data;
            // console.log(data)
            // localStorage.setItem("token", data.token);
            // localStorage.setItem("userId", data.userId);

            const isValid = validateStep({
                interests: true,
            });

            if (!isValid) return;

            toast.success("Select avatar");
            setDirection(1);
            setStep("avatar");
            // onSignupSuccess();
            // setTimeout(() => {
            //     navigate("/project");
            // }, 5000);

        } catch (error) {

            console.log("FULL ERROR:", error.response?.data);
            console.log("STATUS:", error.response?.status);
            console.log("ERROR:", error);
            toast.error(error.response?.data?.message || "Signup failed. Please retry.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleFinalSignup = async () => {
        try {
            const result = signupSchema.safeParse(formData);

            if (!result.success) {
                toast.error(result.error.issues[0]?.message);
                return;
            }

            setIsLoading(true);

            const res = await api.post("/auth/signup", result.data);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);

            toast.success("Account created 🎉");

            setStep("verified");

            setTimeout(() => {
                onSignupSuccess()
                navigate("/project");
            }, 3000);

        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };
    const steps = ["initial", "gender", "age", "city", "interests", "avatar", "verified"];
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

    const validateStep = (fields, values = formData) => {
    const partialSchema = signupSchema.pick(fields);

    const result = partialSchema.safeParse(values);

    if (!result.success) {
        const firstError = result.error.issues[0]?.message;
        toast.error(firstError);
        return false;
    }

    return true;
}

    return (
        <div className="relative mx-auto w-full max-w-md select-none overflow-x-hidden px-3 sm:px-0">
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
                        className="relative overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 p-3 shadow-2xl backdrop-blur-xl sm:p-6"
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

                        <div className="mb-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="inline-block mb-3"
                            >
                                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
                            </motion.div>
                            <h1 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">Create Account</h1>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Start your journey with us</p>
                        </div>

                        <form onSubmit={handleInitialSubmit} className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-1.5"
                            >
                                <Label htmlFor="name" className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500 h-10 sm:h-12 text-sm"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-1.5"
                            >
                                <Label htmlFor="signup-email" className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                                    Email
                                </Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="bg-neutral-900  border-neutral-700 text-white placeholder:text-gray-500 h-10 sm:h-12 text-sm"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-1.5"
                            >
                                <Label htmlFor="signup-password" className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500 h-10 sm:h-12 pr-10 text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Button
                                    type="submit"
                                    className="w-full  bg-neutral-200 text-black cursor-pointer hover:bg-neutral-200
  hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]
  transition-all duration-300 font-semibold h-10 sm:h-12 text-sm sm:text-base"
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-gray-400 text-xs sm:text-sm">
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
                        className="pt-4 sm:pt-8 px-3 sm:px-0"
                    >
                        <div className="mb-6 sm:mb-12 text-center">
                            <h2 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">Select your gender</h2>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Step 2 of 5</p>
                        </div>

                        <form onSubmit={handleGenderSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.0 }}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData({ ...formData, gender: "Male" })}
                                    className={`cursor-pointer relative overflow-hidden rounded-2xl p-4 sm:p-8 duration-100 ${formData.gender === "Male"
                                        ? "bg-blue-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                                        : "bg-gray-800 border-2 border-gray-700 hover:border-blue-500/50 "
                                        }`}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                                        <motion.div
                                            animate={{
                                                scale: formData.gender === "Male" ? [1, 1.2, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`w-12 h-12 sm:w-16 sm:h-16  rounded-full flex items-center justify-center ${formData.gender === "Male" ? "bg-blue-500" : "bg-gray-700"
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mars sm:w-6 sm:h-6"><path d="M16 3h5v5" /><path d="m21 3-6.75 6.75" /><circle cx="10" cy="14" r="6" /></svg>
                                        </motion.div>
                                        <span
                                            className={`font-bold text-lg sm:text-xl ${formData.gender === "Male" ? "text-blue-500" : "text-white"}`}
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
                                    className={` cursor-pointer relative overflow-hidden rounded-2xl p-4 sm:p-8  duration-100 ${formData.gender === "Female"
                                        ? "bg-pink-500/20 border-2 border-pink-500 shadow-lg shadow-pink-500/20"
                                        : "bg-gray-800 border-2 border-gray-700 hover:border-pink-500/50"
                                        }`}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                                        <motion.div
                                            animate={{
                                                scale: formData.gender === "Female" ? [1, 1.2, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${formData.gender === "Female" ? "bg-pink-500" : "bg-gray-700"
                                                }`}
                                        >
                                            <svg
                                                className={`w-5 h-5 sm:w-6 sm:h-6 ${formData.gender === "Female" ? "text-white" : "text-gray-400"}`}
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
                                            className={`font-bold text-lg sm:text-xl ${formData.gender === "Female" ? "text-pink-500" : "text-white"}`}
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
                                className="cursor-pointer w-full font-semibold h-10 sm:h-12 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed text-white  hover:bg-neutral-200
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
                        className="pt-4 sm:pt-8 px-3 sm:px-0"
                    >
                        <div className="mb-6 sm:mb-8 text-center">
                            <h2 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">How old are you?</h2>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Step 3 of 5</p>
                        </div>

                        <form onSubmit={handleAgeSubmit} className="space-y-6 sm:space-y-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center py-6 sm:py-8 no-copy"
                            >
                                <div className="flex items-center justify-center gap-2 sm:gap-3 text-5xl sm:text-6xl md:text-7xl font-bold leading-none tracking-tight">
                                    <div>
                                        <motion.div
                                            whileTap={{ scale: 0.90 }}
                                            onClick={() => {
                                                setNumericAge(prev => prev > 16 ? prev - 1 : prev);
                                            }}
                                            className=" cursor-pointer border border-neutral-500 rounded-full p-1 sm:p-2 h-auto"><Minus
                                                style={{
                                                    color:
                                                        formData.gender === "Female"
                                                            ? "rgb(236, 72, 153)"
                                                            : "rgb(96, 165, 250)",
                                                }}
                                                className="w-4 h-4 sm:w-5 sm:h-5"
                                            />
                                        </motion.div>
                                    </div>
                                    <SmoothNumber value={numericAge} themeColor={themeColor} />
                                    <div>
                                        <motion.div
                                            whileTap={{ scale: 0.90 }}
                                            onClick={() => {
                                                setNumericAge(prev => prev < 60 ? prev + 1 : prev);
                                            }}
                                            className=" cursor-pointer border border-neutral-500 rounded-full p-1 sm:p-2 h-auto "><Plus
                                                style={{
                                                    color:
                                                        formData.gender === "Female"
                                                            ? "rgb(236, 72, 153)"
                                                            : "rgb(96, 165, 250)",
                                                }}
                                                className="w-4 h-4 sm:w-5 sm:h-5"
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm font-medium"
                                >
                                    years old
                                </motion.p>
                            </motion.div>

                            <div className="space-y-3 sm:space-y-4">
                                <Label htmlFor="age" className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
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
                                        const val = Number(e.target.value);
                                        setNumericAge(val);
                                        setFormData(prev => ({ ...prev, age: val }));
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
                                className="w-full font-semibold h-10 sm:h-12 text-sm sm:text-base text-white cursor-pointer"
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
                            className="absolute -top-2 left-3 sm:left-0 text-gray-400 hover:text-white cursor-pointer text-sm"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
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
                        className="pt-4 sm:pt-8 px-3 sm:px-0 pb-64 sm:pb-12"
                    >
                        <div className="mb-6 sm:mb-8 text-center">
                            <h2 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">Where are you from?</h2>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Step 4 of 5</p>
                        </div>

                        <form onSubmit={handleCitySubmit} className="space-y-4 sm:space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="city" className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                    City
                                </Label>
                                <div className="relative z-40">
                                    <Input
                                        id="city"
                                        type="text"
                                        placeholder="Ex. Delhi"
                                        value={query}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-10 sm:h-14 text-center text-base sm:text-xl font-medium"
                                        required
                                    />
                               
                                    {suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl 
    bg-black/95 backdrop-blur-xl 
    border border-white/10 
    shadow-[0_10px_40px_rgba(0,0,0,0.8)]
    max-h-56 sm:max-h-64 overflow-y-auto">

                                            {suggestions.map((city, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        const locationObj = {
                                                            city: `${city.name}, ${city.state}`,
                                                            location: {
                                                                type: "Point",
                                                                coordinates: [city.lng, city.lat],
                                                            },
                                                        };

                                                        setSelectedLocation(locationObj);
                                                        setQuery(locationObj.city);
                                                        setSuggestions([]);
                                                    }}
                                                    className="
          px-3 sm:px-4 py-2 sm:py-3 
          text-xs sm:text-sm text-white/90 
          cursor-pointer 
          transition-all duration-150
          hover:bg-white/5 
          hover:text-white
          border-b border-white/5 last:border-none
        "
                                                >
                                                    <span className="font-medium">{city.name}</span>
                                                    <span className="text-white/40">, {city.state}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                 </div>
                            </motion.div>

                            <Button
                                type="submit"
                                style={{ backgroundColor: themeColor }}
                                className="w-full font-semibold h-10 sm:h-12 text-sm sm:text-base text-white cursor-pointer"
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
                            className="absolute -top-4 left-3 sm:left-0 text-gray-400 hover:text-white cursor-pointer text-sm"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                            Back
                        </Button>
                    </motion.div>
                )}
                {step === "interests" && (
                    <motion.div
                        key="interests"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35 }}
                        className="pt-4 sm:pt-8 relative px-3 sm:px-0"
                    >
                        {/* Header */}
                        <div className="mb-6 sm:mb-8 text-center">
                            <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-white">
                                Choose your domain
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm">
                                Select up to {MAX_SELECTION}
                            </p>
                        </div>

                        {/* Domain Chips */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 ">
                            {TOP_DOMAINS.map((domain) => {
                                const selected = formData.interests.includes(domain);

                                return (
                                    <button
                                        key={domain}
                                        type="button"
                                        onClick={() => toggleDomain(domain)}
                                        className={`px-3 sm:px-5 py-1.5 sm:py-2.5 cursor-pointer rounded-full text-xs sm:text-sm font-medium transition border
                    ${selected
                                                ? "bg-white text-black"
                                                : "border-gray-700 text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {domain}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Continue */}
                        <button
                            onClick={handleContinue}
                            disabled={formData.interests.length === 0}
                            style={{ backgroundColor: themeColor }}
                            className="w-full h-10 sm:h-12 cursor-pointer rounded-lg font-semibold text-white disabled:opacity-40 text-sm sm:text-base"
                        >
                            Continue
                        </button>

                        {/* Back */}
                        <button
                            type="button"
                            onClick={() => {
                                setDirection(-1);
                                setStep("city");
                            }}
                            className="absolute cursor-pointer -top-4 left-3 sm:left-0 flex items-center text-gray-400 hover:text-white text-sm"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                            Back
                        </button>
                    </motion.div>
                )}
                {step === "avatar" && (
                    <motion.div
                        key="avatar"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35 }}
                        className="pt-4 sm:pt-8 px-3 sm:px-0"
                    >
                        <div className="mb-6 sm:mb-8 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                Choose Your Avatar
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm">
                                Pick one that matches your vibe ✨
                            </p>
                        </div>

                        <div className="mb-6 sm:mb-8 grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                            {AVATARS.map((avatarUrl, idx) => {
                                const selected = formData.avatar === avatarUrl;
                                return (
                                    <motion.div
                                        key={idx}
                                        className={`flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border-2 cursor-pointer transition-transform
          ${selected ? "scale-110 shadow-lg border-white border-4" : "border-gray-700 hover:border-white/50"}`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFormData({ ...formData, avatar: avatarUrl })}
                                    >
                                        <img
                                            src={avatarUrl}
                                            alt={`Avatar ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                        <button
                            onClick={handleFinalSignup}
                            disabled={!formData.avatar}
                            style={{ backgroundColor: themeColor }}
                            className="w-full h-10 sm:h-12 rounded-lg font-semibold text-white cursor-pointer disabled:opacity-40 text-sm sm:text-base"
                        >
                            Finish Signup
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setDirection(-1);
                                setStep("interests");
                            }}
                            className="absolute -top-4 left-3 sm:left-0 flex items-center text-gray-400 hover:text-white text-sm"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                            Back
                        </button>
                    </motion.div>
                )}
                {step === "verified" && isVisible && (
                    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-black w-full">
                        {/* Radial background */}
                        <div className="absolute inset-0 bg-gradient-radial from-zinc-900/50 via-black to-black" />


                        {/* Badge */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-8 flex justify-center">
                                <div
                                    className={`animate-badge-in transition-all duration-1000 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                        }`}
                                ></div>

                                <div className="relative">
                                    {/* Glow layers */}
                                    <div className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-500/30 blur-3xl" />
                                    <div className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-400/20 blur-2xl [animation-delay:200ms]" />

                                    {/* Badge container */}
                                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/50">
                                        {/* Inner glow */}
                                        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-500/30 blur-3xl" />
                                        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-emerald-400/20 blur-2xl [animation-delay:200ms]" />
                                        {/* Checkmark */}
                                        <svg
                                            className="relative z-10 h-16 w-16 animate-check-draw text-white drop-shadow-lg"
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

                )}


            </AnimatePresence>
        </div>
    );
}
