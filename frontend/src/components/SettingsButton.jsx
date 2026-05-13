
import { useRef, useState } from "react"
import { Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useProfile } from "@/context/profileData"
import api from "@/lib/axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"




export default function SettingsButton({ light, avatar, setAvatar, avatarArray, setIsLoggedIn, className = "" }) {



  const [isRotated, setIsRotated] = useState(false)
  const [avatarPanelOpen, setAvatarPanelOpen] = useState(false)
  const [visible, setVisible] = useState(false);
  const initialProfileRef = useRef(null);
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate()
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

  const handleLogout = async () => {
    try {
      await api.post("auth/logout", {}, { withCredentials: true });

      console.log('asd');
      localStorage.removeItem("token");

      setIsLoggedIn(false);
      setProfile(null);

      toast.success("Logged out");

      navigate("/", { replace: true });
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (name, value) => {
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    const updatedData = {
      name: profile.name,
      email: profile.email,
      city: profile.city,
      interests: profile.interests,
      avatar: profile.avatar,
      age: profile.age,
      gender: profile.gender
    };
    const hasChanges =
      JSON.stringify(initialProfileRef.current || {}) !== JSON.stringify(updatedData);

    setVisible(false);
    setIsRotated(false);
    if (!hasChanges) return;

    try {
      const res = await api.patch(
        "/api/profiledata",
        updatedData,
        { withCredentials: true }
      );

      console.log("Profile updated successfully");
      toast.success("Profile updated successfully")
      const user = res.data.user || res.data;

      setProfile(prev => ({
        ...prev,
        ...user
      }));

    } catch (error) {
      console.error(
        "Update failed:",
        error.response?.data?.message || error.message
      );
    }
  };
  const handleInterestToggle = (interest) => {
    setProfile((prev) => {
      const maxSelection = 3;

      const alreadySelected =
        prev.interests.includes(interest);

      if (alreadySelected) {
        return {
          ...prev,
          interests: prev.interests.filter(
            (i) => i !== interest
          ),
        };
      }

      if (prev.interests.length >= maxSelection) {
        toast.error("Sorry, maximum 3 domains only");
        return prev;
      }
      return {
        ...prev,
        interests: [...prev.interests, interest],
      };
    });
  };

  const handleClick = async () => {
    if (!visible) {
      const audio = new Audio("/sounds/mixkit-on-or-off-light-switch-tap-2585.wav")
      audio.volume = 0.3
      audio.play()
    }
    setIsRotated(prev => !prev)
    setVisible(prev => {
      const next = !prev;
      if (!prev && profile) {
        initialProfileRef.current = {
          name: profile.name,
          email: profile.email,
          city: profile.city,
          interests: profile.interests,
          avatar: profile.avatar,
          age: profile.age,
          gender: profile.gender,
        };
      }
      return next;
    })
    // try {
    //   const res = await api.get("/api/profiledata");

    //   setProfile(res.data);   // 👈 THIS fixes blank UI
    //   setAvatar(res.data.avatar);
    // } catch (err) {
    //   console.log("Failed to load profile", err);
    // }
  }
  const handleAvatarClick = () => {
    setAvatarPanelOpen(prev => !prev);
  };


  return (
    <>
      {/* SETTINGS BUTTON */}
      <button
        onClick={handleClick}
        className={`
           z-[9999] h-11 w-11 flex items-center justify-center
          rounded-full transition-all duration-300 active:scale-95 p-2
          border cursor-pointer
          ${light ? "border-black bg-[#EDEDED] text-black" : "border-white bg-black text-white"}
          ${className}
        `}
      >
        <Settings
          size={22}
          className="transition-transform duration-300"
          style={{ transform: `rotate(${isRotated ? 45 : 0}deg)` }}
        />
      </button>

      {/* AVATAR PANEL */}
      {avatarPanelOpen && (
        <>
          {/* AVATAR PANEL */}
          {avatarPanelOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed top-0 left-0 w-full h-full bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAvatarPanelOpen(false)}
              />

              {/* Modal */}
              <motion.div
                className={`fixed left-1/2 top-1/2 z-[1001] h-[60vh] w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl p-3 
                 ${light ? "bg-[#EDEDED]" : "bg-black"}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                {/* Diamond/Arrow */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 ${light ? "bg-[#EDEDED]" : "bg-black"} rotate-45 z-50 `}
                ></div>

                {/* Scrollable avatar grid */}
                <div className="w-full h-full overflow-y-auto flex flex-wrap justify-center">
                  {avatarArray.map((src, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 rounded-full overflow-hidden border cursor-pointer m-3 ${avatar === src
                          ? "border-blue-500"
                          : "border-gray-400"
                        }`}
                      onClick={() => {
                        setAvatar(src);

                        setProfile(prev => ({
                          ...prev,
                          avatar: src,
                        }));

                        setAvatarPanelOpen(false);
                      }}
                    >
                      <img
                        src={src}
                        alt={`avatar-${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

        </>
      )}

      {/* SETTINGS PANEL */}
      <AnimatePresence>
        {visible && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm z-[999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setVisible(false)
                setIsRotated(false)
              }}
            />

            {/* Panel */}
            <motion.div
              className={`
    fixed bottom-0 left-1/2 -translate-x-1/2 
    w-[95vw] max-w-3xl h-[85vh] z-[1000]
    shadow-xl rounded-t-2xl rounded-b-none 
    ${light ? "bg-black text-white" : "bg-[#EDEDED] text-black"}
  `}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 22,
                stiffness: 180,
                bounce: 0.15,
              }}
            >

              <div className="relative flex h-full w-full flex-col rounded-t-2xl border-x border-t border-gray-600 p-4 sm:p-6">

                {/* AVATAR */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black shadow-lg bg-gray-300">
                    <img
                      onClick={handleAvatarClick}
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pr-10 text-xl font-extrabold sm:text-2xl">Edit Profile</div>
                {/* CONTENT SCROLL */}
                <div className="mt-10 flex-1 overflow-y-auto pr-1">
                  <div className="flex flex-col md:flex-row gap-8 w-full">

                    {/* LEFT SIDE */}
                    <div className="w-full md:w-1/2 space-y-5">
                      {/* Name */}
                      <div>
                        <label className="mb-2 block text-gray-400 text-sm">Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => handleChange("name", e.target.value)}
                          className="w-full bg-transparent text-lg font-medium border-b border-gray-600 focus:border-blue-400 outline-none py-2"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="mb-2 block text-gray-400 text-sm">Age</label>
                        <input
                          type="text"
                          value={profile.age}
                          onChange={e => handleChange("age", e.target.value)}
                          className="w-full bg-transparent text-lg font-medium border-b border-gray-600 focus:border-blue-400 outline-none py-2"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="mb-2 block text-gray-400 text-sm">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={e => handleChange("email", e.target.value)}
                          className="w-full bg-transparent text-lg font-medium border-b border-gray-600 focus:border-blue-400 outline-none py-2"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="mb-2 block text-gray-400 text-sm">City</label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={e => handleChange("city", e.target.value)}
                          className="w-full bg-transparent text-lg font-medium border-b border-gray-600 focus:border-blue-400 outline-none py-2"
                        />
                      </div>
                      {/* Distance */}
                      {/* <div>
                        <label className="block text-gray-400 mb-1">
                          Max Distance: {profile.distance} km
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={profile.distance}
                          onChange={e => handleChange("distance", Number(e.target.value))}
                          className="w-full h-1.5 cursor-pointer appearance-none rounded-lg
                            [&::-webkit-slider-runnable-track]:h-1.5
                            [&::-webkit-slider-runnable-track]:rounded-lg
                            [&::-webkit-slider-runnable-track]:bg-gradient-to-r
                            [&::-webkit-slider-runnable-track]:from-blue-500
                            [&::-webkit-slider-runnable-track]:to-[#c3c3c3]
                            [&::-webkit-slider-runnable-track]:bg-[length:var(--range-progress)_100%]
                            [&::-webkit-slider-runnable-track]:bg-no-repeat
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:w-2
                            [&::-webkit-slider-thumb]:rounded-2xl
                            [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
                            [&::-webkit-slider-thumb]:mt-[-6px]"
                          style={{
                            "--range-progress": `${profile.distance}%`,
                            "--thumb-color": light ? "white" : "#ADD3E5",
                          }}
                        />
                      </div> */}
                      <div>
                        <label className="mb-2 block text-gray-400 text-sm">Gender</label>
                        <div className="flex gap-3 mt-3">
                          {["Male", "Female"].map(g => (
                            <button
                              key={g}
                              onClick={() => setProfile(prev => ({ ...prev, gender: g }))}
                              className={`px-6 py-2 rounded-full font-medium transition cursor-pointer 
                                ${profile.gender === g
                                  ? "bg-blue-400 text-black"
                                  : "border border-gray-600 text-inherit hover:border-gray-500"
                                }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="w-full md:w-1/2 flex flex-col gap-10">

                      {/* Gender */}


                      <div >
                        <button
                          onClick={() => navigate("/project?mode=edit")}
                          className={`px-6 py-2 rounded-full border w-full font-medium transition cursor-pointer 
                            ${light ? "border-white" : "border-black"} 
                            }`}
                        >
                          Edit Your Project Details                       </button>
                      </div>

                      {/* Interests */}
                      <div>
                        <label className="mb-2 block text-gray-400 text-sm">Interests</label>
                        <div className="flex flex-wrap gap-3 mt-3">
                          {TOP_DOMAINS.map((interest) => {
                            const selected = profile.interests.includes(interest);

                            return (
                              <button
                                key={interest}
                                onClick={() => handleInterestToggle(interest)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer
        ${selected
                                    ? "bg-blue-400 text-black"
                                    : "border border-gray-600 hover:border-gray-500"
                                  }`}
                              >
                                {interest}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* BOTTOM BUTTONS */}
                <div className="flex items-center justify-between gap-3 pt-4 sm:gap-4">
                  <button
                    onClick={handleLogout}
                    className="w-1/2 py-3 border border-red-500 text-red-500
                    rounded-full font-semibold tracking-wide
                    hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                  >
                    Log Out
                  </button>

                  <button
                    onClick={handleSave}
                    className="w-1/2 py-3 bg-blue-400 text-black
  rounded-full font-semibold tracking-wide
  hover:bg-cyan-300 transition-all"
                  >
                    Done
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
