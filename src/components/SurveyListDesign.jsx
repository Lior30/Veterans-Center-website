// src/components/SurveyListDesign.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField } from "@mui/material";

export default function SurveyListDesign({
  surveys,
  onDeleteSurvey,
  onViewResponses,
  onAnalyze,
}) {
  const [search, setSearch] = useState("");

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
        filteredSurveys.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              margin: "10px auto",
              maxWidth: 500,
              borderRadius: 4,
            }}
          >
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
            <button onClick={() => onDeleteSurvey(s.id)}>
              מחק סקר
            </button>
          </div>
        ))
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/surveys">
          <button>← חזרה לניהול סקרים</button>
        </Link>
      </div>
    </div>
  );
}