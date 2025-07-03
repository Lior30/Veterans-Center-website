// src/components/SurveyListDesign.jsx
import { TextField } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SurveyListDesign({
  surveys,
  onDeleteSurvey,
  onViewResponses,
  onAnalyze,
}) {
  console.log("✅ SurveyListDesign rendering", surveys);
  const [search, setSearch] = useState("");

  const filteredSurveys = surveys.filter((s) =>
    s.headline?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ backgroundColor: 'red', color: 'white', padding: '8px' }}>
        ✅ SurveyListDesign.jsx is active
      </div>

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
          const activityText =
            !s.of_activity || s.of_activity === "כללי"
              ? "סקר כללי"
              : `סקר עבור פעילות: ${s.of_activity}`;

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
              {/* Top-left red expired label */}
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
                  סקר פג תוקף
                </div>
              )}

              {/* Top-right activity label */}
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
                {activityText}
              </div>

              <h3>{s.headline}</h3>
              <button
                onClick={() => onViewResponses(s.id)}
                style={{ marginRight: 8 }}
              >
                הצג תשובות
              </button>
              <button
                onClick={() => onAnalyze(s.id)}
                style={{ marginRight: 8 }}
              >
                ניתוח סקר
              </button>
              <button onClick={() => onDeleteSurvey(s.id)}>מחק סקר</button>
            </div>
          );
        })
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/surveys">
          <button>← חזרה לניהול סקרים</button>
        </Link>
      </div>
    </div>
  );
}
