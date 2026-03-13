import { createContext, useEffect, useState, useContext } from "react";
import api from "@/lib/axios";

export const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    email: "",
    gender: "Male",
    city: "",
    interests: [],
    projects: [],
    distance: 25,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await api.get("/api/profiledata");

        console.log("API DATA:", res.data);

        const user = res.data.user || res.data;

        setProfile({
          name: user.name || "",
          age: user.age || "",
          email: user.email || "",
          gender: user.gender || "Male",
          city: user.city || "",
          interests: user.interests || [],
          projects: user.projects || [],
          distance: user.distance || 25,
        });

      } catch (error) {
        console.error("Profile fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchdata();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};