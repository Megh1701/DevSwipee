import Sidebar from "../components/Sidebar";
import SettingsButton from "../components/SettingsButton";
import Lightbulb  from "../components/LightBulb";
import { useState } from "react";

export default function AppLayout({
  children,
  light,
  toggleTheme,
  avatar,
  setAvatar,
       avatarArray,
  setIsLoggedIn,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`relative flex h-screen overflow-hidden bg-bg-dark`}>
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className={`z-[999] ${light ? "bg-[#ededed]" : "bg-blue"} fixed left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-dark text-text-dark md:hidden`}
        aria-label="Open navigation menu"
      >
        <span className="text-lg leading-none">☰</span>
      </button>

      {/* ✅ COMMON SIDEBAR */}
      <Sidebar
     
        avatar={avatar}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
         light={light}
      />
      {/* ✅ MAIN CONTENT */}
      <div className="relative h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0 md:pl-[25%]">
        {children}

        {/* ✅ COMMON SETTINGS */}
        <SettingsButton
          light={light}
          avatar={avatar}
          setAvatar={setAvatar}
        //   setVisible={setShowpanel}
          avatarArray={avatarArray}
     
          setIsLoggedIn={setIsLoggedIn}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8"
        />

        {/* ✅ COMMON LIGHT BULB */}
        <Lightbulb
          light={light}
          toggleTheme={toggleTheme}
          className="fixed right-4 top-4 md:right-8 md:top-8"
        />
      </div>
    </div>
  );
}
