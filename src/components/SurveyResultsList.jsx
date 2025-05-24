
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase.js";
import { Link } from "react-router-dom";
import { TextField } from "@mui/material";

export default function SurveyResultsList() {
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState("");

  const loadSurveys = async () => {
    const snap = await getDocs(collection(db, "surveys"));
    setSurveys(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDeleteSurvey = async (surveyId) => {
    const responsesSnap = await getDocs(
      collection(db, "surveys", surveyId, "responses")
    );
    await Promise.all(responsesSnap.docs.map(r => deleteDoc(r.ref)));
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
        <p>לא נמצאו סקרים.</p>
      ) : (
        filteredSurveys.map(s => (
          <div
            key={s.id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              margin: "10px auto",
              maxWidth: 500,
              borderRadius: 4
            }}
          >
            <h3>{s.headline}</h3>
            <Link to={`/surveys/results/${s.id}`}>
              <button style={{ marginRight: 8 }}>הצג תשובות</button>
            </Link>
            <button onClick={() => handleDeleteSurvey(s.id)}>
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
