import { useState, useEffect } from "react";

export default function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);

  const loadProfile = () => {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return setUserProfile(null);

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.phone) {
        setUserProfile(parsed);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error("שגיאה בפרשנות userProfile:", err);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    loadProfile();

    // מאזין לשינויים ב-localStorage (למשל התחברות / התנתקות)
    window.addEventListener("storage", loadProfile);
    return () => window.removeEventListener("storage", loadProfile);
  }, []);

  return userProfile;
}
