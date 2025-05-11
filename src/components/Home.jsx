// src/components/Home.jsx
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

  // Load all messages once, filter for "home", sort newest first
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "messages"));
      const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filtered = all
        .filter((m) => m.location === "home")
        .sort((a, b) => {
          const ta = a.createdAt?.toDate?.() || new Date(0);
          const tb = b.createdAt?.toDate?.() || new Date(0);
          return tb - ta;
        });
      setHomeMessages(filtered);
    }
    load();
  }, []);

  // Helpers to start/stop the fade‐rotate timer
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
      }, 500); // match transition duration
    }, 5000);
  };

  // Whenever we have multiple messages, kick off auto‐rotation
  useEffect(() => {
    if (homeMessages.length > 1) {
      startTimer();
      return clearTimer;
    }
    clearTimer();
  }, [homeMessages]);

  // If none, just show admin menu
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
            position: "relative",
            opacity: fade ? 0 : 1,
            transition: "opacity 0.5s ease-in-out",
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

      {/* Admin menu */}
      <HomeAdminMenu nav={nav} />
    </div>
  );
}

// extracted admin menu
function HomeAdminMenu({ nav }) {
  return (
    <>
      <h1>Veterans Center Admin</h1>
      <div
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 300,
          margin: "auto",
        }}
      >
        <button onClick={() => nav("/activities")}>Manage Activities</button>
        <button onClick={() => nav("/flyers")}>Manage Flyers</button>
        <button onClick={() => nav("/surveys")}>Manage Surveys</button>
        <button onClick={() => nav("/messages")}>Manage Messages</button>
      </div>
    </>
  );
}
