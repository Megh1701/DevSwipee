import { createContext, useEffect, useState, useContext } from "react";
import { da, de } from "zod/v4/locales";
import api from "@/lib/axios";

export const ProfileContext = createContext(null)


export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({
        name: "",
        age: "",
        email: "",
        gender: "Male",
        city: "",
        interests: [],
        distance: 25,
    });

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const res = await api.get("api/profiledata")
                setProfile(res.data)
                console.log(profile.name)
            } catch (error) {
                setProfile({
                    name: "",
                    age: "",
                    email: "",
                    gender: "Male",
                    city: "",
                    interests: [],
                    distance: 25,
                });
            } finally {
                setLoading(false);
            }
        }
        fetchdata()
    }, [])

    return (
        <ProfileContext.Provider value={{ profile, setProfile, loading }}>
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfile = () => {
    return useContext(ProfileContext);
};