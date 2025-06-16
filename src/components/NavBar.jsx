import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

/* tiny helper for DRY inline styles */
const pill = {
  padding: "6px 10px",
  margin: "0 4px",
  textDecoration: "none",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: "0.95rem"
};

const active = {
  background: "#8e2c88", // סגול כהה יותר
  color: "black"
};

const inactive = {
  color: "white" // טקסט לבן כשלא פעיל
};

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  // קובע אם אנחנו בדף הניהול הראשי
  const isOnAdminRoot = location.pathname === "/admin";
  const linkStyle = ({ isActive }) =>
    isActive ? { ...pill, ...active } : { ...pill, ...inactive };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        background: "#9c27b0", // אותו סגול כמו הרקע של הפס
        padding: "18px 15px",
        borderRadius: 8,
        marginBottom: 20,
      }}
    >

      {/*דף חזרה*/}
      <button
        onClick={() => navigate("/home")}
        style={{ marginRight: 24, padding: "6px 12px" }}
      >

      ← חזרה
      </button>


      {/* כפתור בית */}
      <button
        onClick={() => !isOnAdminRoot && navigate("/")}
        disabled={isOnAdminRoot}
        style={{
          marginRight: 12,
          padding: "6px 12px",
          cursor: isOnAdminRoot ? "not-allowed" : "pointer",
          opacity: isOnAdminRoot ? 0.5 : 1,
        }}
      >
        🏠 בית
      </button>



      {/* קישורים בניהול */}
      <NavLink to="/activities" style={linkStyle}>
        פעילויות
      </NavLink>
      <NavLink to="/flyers" style={linkStyle}>
        פליירים
      </NavLink>
      <NavLink to="/surveys" style={linkStyle}>
        סקרים
      </NavLink>
      <NavLink to="/messages" style={linkStyle}>
        הודעות
      </NavLink>
      <NavLink to="/HomepageImages" style={linkStyle}>
        תמונות אווירה
      </NavLink>
      <NavLink to="/manage-users" style={linkStyle}>
        משתמשים
      </NavLink>
    </nav>
  );
}
