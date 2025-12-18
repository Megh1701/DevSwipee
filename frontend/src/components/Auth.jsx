import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Toaster } from "sonner";

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");

  return (
    <>
      <Toaster theme="dark" richColors position="top-center" />
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <LoginForm
                key="login"
                onLoginSuccess={onLoginSuccess}
               
                onSwitchToSignup={() => setMode("signup")}
                 onForgotPassword={() => setMode("forgot")}
              />
            )}

            {mode === "signup" && (
              <SignupForm
                key="signup"
                onLoginSuccess={onLoginSuccess}
                onSwitchToLogin={() => setMode("login")}
              />
            )}

            {mode === "forgot" && (
              <ForgotPasswordForm
                key="forgot"
                onBackToLogin={() => setMode("login")}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
