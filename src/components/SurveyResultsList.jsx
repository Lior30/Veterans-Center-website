// src/components/SurveyResultsList.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { Link, useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

export default function SurveyResultsList() {
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadSurveys = async () => {
    const snap = await getDocs(collection(db, "surveys"));
    const rawSurveys = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Map activity IDs to names
    const activities = {};
    for (const s of rawSurveys) {
      if (
        s.of_activity &&
        s.of_activity !== "כללי" &&
        !activities[s.of_activity]
      ) {
        try {
          const actSnap = await getDoc(doc(db, "activities", s.of_activity));
          if (actSnap.exists()) {
            activities[s.of_activity] = actSnap.data().name;
          } else {
            activities[s.of_activity] = "פעילות לא נמצאה";
          }
        } catch (err) {
          console.error("שגיאה בטעינת פעילות:", err);
          activities[s.of_activity] = "שגיאה";
        }
      }
    }

    // Replace activity ID with name
    const surveysWithNames = rawSurveys.map((s) => ({
      ...s,
      activity_name:
        !s.of_activity || s.of_activity === "כללי"
          ? "סקר כללי"
          : `סקר עבור פעילות: ${activities[s.of_activity] || s.of_activity}`,
    }));

    setSurveys(surveysWithNames);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDeleteSurvey = async (surveyId) => {
    const respSnap = await getDocs(
      collection(db, "surveys", surveyId, "responses")
    );
    await Promise.all(respSnap.docs.map((r) => deleteDoc(r.ref)));
    await deleteDoc(doc(db, "surveys", surveyId));
    loadSurveys();
  };

  const filteredSurveys = surveys.filter((s) =>
    s.headline?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>סקרים ותשובות</h2>

      <TextField
        label="חיפוש לפי כותרת"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        style={{ maxWidth: 500, margin: "20px auto" }}
        inputProps={{ style: { textAlign: "right" } }}
      />

      {filteredSurveys.length === 0 ? (
        <p>לא נמצאו סקרים להצגה.</p>
      ) : (
        filteredSurveys.map((s) => {
          const isExpired =
            s.expires_at && new Date() > new Date(s.expires_at);

          return (
            <div
              key={s.id}
              style={{
                position: "relative",
                border: "1px solid #ccc",
                padding: 16,
                margin: "10px auto",
                maxWidth: 500,
                borderRadius: 4,
                textAlign: "right",
              }}
            >
              {/* Top-left expired label */}
              {isExpired && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "#d32f2f",
                    color: "white",
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    borderRadius: 4,
                    zIndex: 10,
                    fontWeight: "bold",
                    boxShadow: "0 0 6px rgba(0,0,0,0.3)",
                  }}
                >
                  סקר זה הסתיים
                </div>
              )}

              {/* Top-right activity name */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  fontSize: "0.8rem",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                {s.activity_name}
              </div>

              <h3>{s.headline}</h3>
              <button
                onClick={() => navigate(`/surveys/results/${s.id}`)}
                style={{ marginRight: 8 }}
              >
                הצג תשובות
              </button>
              <button
                onClick={() => navigate(`/surveys/analysis/${s.id}`)}
                style={{ marginRight: 8 }}
              >
                ניתוח סקר
              </button>
              <button onClick={() => handleDeleteSurvey(s.id)}>
                מחק סקר
              </button>
            </div>
          );
        })
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/surveys">← חזרה לניהול סקרים</Link>
      </div>
    </div>
  );
}
