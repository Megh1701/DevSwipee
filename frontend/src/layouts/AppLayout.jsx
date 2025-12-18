import Sidebar from "../components/Sidebar";
import SettingsButton from "../components/SettingsButton";
import Lightbulb  from "../components/LightBulb";

export default function AppLayout({
  children,
  light,
  toggleTheme,
  avatar,
  setAvatar,
  avatarArray,
  profile,
  setProfile,
  setIsLoggedIn,
}) {
  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      {/* ✅ COMMON SIDEBAR */}
      <Sidebar avatar={avatarArray[avatar]} avatarArray={avatarArray} />

      {/* ✅ MAIN CONTENT */}
      <div className="relative flex-1">
        {children}

        {/* ✅ COMMON SETTINGS */}
        <SettingsButton
          light={light}
          avatar={avatar}
          setAvatar={setAvatar}
        //   setVisible={setShowpanel}
          avatarArray={avatarArray}
          profile={profile}
          setProfile={setProfile}
          setIsLoggedIn={setIsLoggedIn}
          className="fixed right-8 bottom-8"
        />

        {/* ✅ COMMON LIGHT BULB */}
        <Lightbulb
          light={light}
          toggleTheme={toggleTheme}
          className="fixed right-8 top-8"
        />
      </div>
    </div>
  );
}
