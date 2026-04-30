import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./layouts/AppLayout";
import Auth from "./components/Auth";
import Home from "./pages/Home";
import Swipes from "./components/Swipes";
import Messages from "./components/Messages";
import ChatRoom from "./components/ChatRoom";
import Request from "./components/Request";
import ProjectForm from "./components/ProjectForm";
import ATSDashboard from "./components/ATSDashboard";
import Session from "./components/Session"
import api from "./lib/axios.js";
import { useProfile } from "./context/ProfileData";
import { verifyAuth } from "./lib/authverify.js";


const avatarImports = import.meta.glob("./assets/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});
const avatarArray = Object.values(avatarImports);



export default function App() {
  const navigate = useNavigate();

   
  // 🔐 AUTH STATE
  const { profile, setProfile } = useProfile();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [needsProjectForm, setNeedsProjectForm] = useState(false);
  const [light, setLight] = useState(false);
  const [avatar, setAvatar] = useState("");

useEffect(() => {
  const checkAuth = async () => {
    try {
      const isValid = await verifyAuth();

      if (!isValid) {
        setIsLoggedIn(false);
        navigate("/", { replace: true });
        return;
      }

      const resp = await api.get("api/profiledata");

      setAvatar(resp.data.avatar || "");
      setProfile(resp.data); 
      console.log(profile)
      setIsLoggedIn(true);
    } catch (err) {
      setIsLoggedIn(false);
      
      setAvatar("");
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
                onLoginSuccess={async () => {
                  setIsLoggedIn(true);

                  const resp = await api.get("api/profiledata");
                  
                  setAvatar(resp.data.avatar);
                }}
                onSignupSuccess={() => setNeedsProjectForm(true)}
              />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* --------------- PROJECT SETUP ---------------- */}
        {/* <Route
          path="/project"
          element={
            needsProjectForm ? (
              <ProjectForm
                mode="create"
                onComplete={() => {
                  setNeedsProjectForm(false);
                  setIsLoggedIn(true);
                }}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        /> */}
        <Route path="/project" element={<ProjectForm />} />
        {/*------session------*/
          <Route path="/session/:sessionId" element={<Session />} />
        }
        {/* ---------------- MAIN APP ---------------- */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <AppLayout
                light={light}
                toggleTheme={toggleTheme}
                avatar={avatar}
                setAvatar={setAvatar}
                avatarArray={avatarArray}
              >
                <Routes>
                  <Route
                    path="home"
                    element={<Home light={light} />}
                  />
                  <Route path="swipes" element={<Swipes light={light} />} />
                  <Route path="messages" element={<Messages light={light} />} />
                  <Route path="chat/:matchId" element={<ChatRoom light={light} />} />
                  <Route path="requests" element={<Request light={light} />} />
                  <Route path="ats-dashboard" element={<ATSDashboard light={light} />} />
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
