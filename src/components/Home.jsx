import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export default function Home() {
  const nav = useNavigate();
  const [homeMessages, setHomeMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const timerRef = useRef(null);

  // Load and display “home” announcements
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "messages"));
      const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filtered = all
        .filter((m) => m.location === "home")
        .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setHomeMessages(filtered);
    }
    load();
  }, []);

  // auto‐rotate handler
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % homeMessages.length);
        setFade(false);
      }, 500);
    }, 5000);
  };

  // kick off rotation if >1 message
  useEffect(() => {
    if (homeMessages.length > 1) {
      startTimer();
      return clearTimer;
    }
    clearTimer();
  }, [homeMessages]);

  if (!homeMessages.length) {
    return <HomeAdminMenu nav={nav} />;
  }

  const msg = homeMessages[currentIndex];

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {/* Announcements carousel */}
      <section
        onMouseEnter={clearTimer}
        onMouseLeave={() => homeMessages.length > 1 && startTimer()}
        style={{ marginBottom: 40 }}
      >
        <h2>Announcements</h2>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: 16,
            margin: "16px auto",
            maxWidth: 600,
            background: "#fafafa",
            textAlign: "left",
            opacity: fade ? 0 : 1,
            transition: "opacity 0.5s ease-in-out",
            position: "relative",
          }}
        >
          <h3 style={{ margin: "0 0 8px" }}>{msg.title}</h3>
          <p style={{ margin: "0 0 12px" }}>{msg.body}</p>
          <button
            onClick={() => nav(`/messages/reply/${msg.id}`)}
            style={{ position: "absolute", top: 16, right: 16 }}
          >
            Reply
          </button>
        </div>
      </section>

      {/* Admin menu: add Manage Users here */}
      <HomeAdminMenu nav={nav} />
    </div>
  );
}

// extracted menu component
function HomeAdminMenu({ nav }) {
  return (
    <>
      <h1>Veterans Center Admin</h1>
      <div style={{ display: "grid", gap: 12, maxWidth: 300, margin: "auto" }}>
        <button onClick={() => nav("/activities")}>Manage Activities</button>
        <button onClick={() => nav("/flyers")}>Manage Flyers</button>
        <button onClick={() => nav("/surveys")}>Manage Surveys</button>
        <button onClick={() => nav("/messages")}>Manage Messages</button>

        {/* ← NEW Manage Users button */}
        <button onClick={() => nav("/manage-users")}>Manage Users</button>
      </div>
    </>
  );
}
