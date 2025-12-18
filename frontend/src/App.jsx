import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Auth from "./components/Auth";
import Match from "./components/Match"
import Messages from "./components/Messages";
import Requests from "./components/Requests";
import Home from "./pages/Home";
// later: Matches, Chat, Requests

const avatarImports = import.meta.glob(
  "/src/assets/*.{png,jpg,jpeg}",
  { eager: true, import: "default" }
);
const avatarArray = Object.values(avatarImports);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [light, setLight] = useState(false);
  const [avatar, setAvatar] = useState(3);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    email: "",
    gender: "Male",
    location: "",
    interests: {
      "AI/ML": false,
      MERN: true,
      "App Dev": false,
      "Cyber security": false,
      "Data science": false,
    },
    distance: 25,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const toggleTheme = () => {
    const audio = new Audio(
      "/sounds/mixkit-on-or-off-light-switch-tap-2585.wav"
    );
    audio.volume = 0.8;
    audio.play();

    document.body.classList.toggle("light");
    setLight(prev => !prev);
  };

 
  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppLayout
      light={light}
      toggleTheme={toggleTheme}
      avatar={avatar}
      setAvatar={setAvatar}
      avatarArray={avatarArray}
      profile={profile}
      setProfile={setProfile}
      setIsLoggedIn={setIsLoggedIn}
    >
      <Routes>
        <Route
          path="/home"
          element={
            <Home
              light={light}
              profile={profile}
              avatar={avatarArray[avatar]}
            />
          }
        />
        <Route
          path="/matches"
          element={
            <Match
            
            />
          }
        />
         <Route
          path="/messages"
          element={
            <Messages
            
            />
          }
        />
         <Route
          path="/requests"
          element={
            <Requests
            
            />
          }
        />
      </Routes>
    </AppLayout>
  );
}

export default App;
