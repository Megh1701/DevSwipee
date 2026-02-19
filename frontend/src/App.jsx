import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./layouts/AppLayout";
import Auth from "./components/Auth";
import Home from "./pages/Home";
import Swipes from "./components/Swipes";
import Messages from "./components/Messages";
import Request from "./components/Request";
import ProjectForm from "./components/ProjectForm";
import api from "./lib/axios";


const avatarImports = import.meta.glob("/src/assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});
const avatarArray = Object.values(avatarImports);

export default function App() {
  const navigate = useNavigate();

  // 🔐 AUTH STATE
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [needsProjectForm, setNeedsProjectForm] = useState(false);
  const [light, setLight] = useState(false);
  const [avatar, setAvatar] = useState(3);

  // check auth on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("api/profiledata"); // requires auth
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
        setNeedsProjectForm(false);
        navigate("/", { replace: true });
      }
    };
    checkAuth();
  }, []);

  const toggleTheme = () => {
    const audio = new Audio("/sounds/mixkit-on-or-off-light-switch-tap-2585.wav");
    audio.volume = 0.8;
    audio.play();
    document.body.classList.toggle("light");
    setLight((prev) => !prev);
  };
if (isLoggedIn === null) return null; 
  return (
    <>
        <Toaster theme="dark" richColors position="top-center" />
    <Routes>
      {/* ---------------- AUTH ---------------- */}
      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <Auth
              onLoginSuccess={() => setIsLoggedIn(true)}
              onSignupSuccess={() => setNeedsProjectForm(true)}
            />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* ---------------- PROJECT SETUP ---------------- */}
      <Route
        path="/project"
        element={
          needsProjectForm ? (
            <ProjectForm
              onComplete={() => {
                setNeedsProjectForm(false);
                setIsLoggedIn(true);
              }}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ---------------- MAIN APP ---------------- */}
      <Route
        path="/*"
        element={
          isLoggedIn ? (
            <AppLayout
              light={light}
              toggleTheme={toggleTheme}
            avatar={avatarArray[avatar]}
              setAvatar={setAvatar}
              avatarArray={avatarArray}
            >
              <Routes>
                <Route
                  path="home"
                  element={<Home light={light}  />}
                />
                <Route path="swipes" element={<Swipes light={light} />} />
                <Route path="messages" element={<Messages light={light}/>} />
                <Route path="requests" element={<Request light={light} />} />
              </Routes>
            </AppLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
    </>
  );
}
