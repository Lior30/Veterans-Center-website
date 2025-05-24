import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

/* tiny helper for DRY inline styles */
const pill     = { padding: "6px 10px", margin: "0 4px", textDecoration: "none", borderRadius: 6,
                   fontWeight: 500, fontSize: "0.95rem" };
const active   = { background: "#1976d2", color: "white" };
const inactive = { color: "#1976d2" };

export default function NavBar() {
  const navigate = useNavigate();
  const linkStyle = ({ isActive }) =>
    isActive ? { ...pill, ...active } : { ...pill, ...inactive };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        background: "#f2f6fc",
        padding: "8px 12px",
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      {/* Back & Home */}
      <button
        onClick={() => navigate(-1)}
        style={{ marginRight: 12, padding: "6px 12px" }}
      >
        ← חזרה
      </button>
      <button
        onClick={() => navigate("/home")}
        style={{ marginRight: 24, padding: "6px 12px" }}
      >
        🏠 בית
      </button>

      {/* nav links */}
      <NavLink to="/home"        style={linkStyle} end>
        דף הבית
      </NavLink>
      <NavLink to="/activities"  style={linkStyle}>
        פעילויות
      </NavLink>
      <NavLink to="/flyers"      style={linkStyle}>
        פליירים
      </NavLink>
      <NavLink to="/surveys"     style={linkStyle}>
        סקרים
      </NavLink>
      <NavLink to="/messages"    style={linkStyle}>
        הודעות
      </NavLink>
      <NavLink to="/manage-users" style={linkStyle}>
        משתמשים
      </NavLink>
    </nav>
  );
}
