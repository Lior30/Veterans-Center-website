// src/components/SurveyResultsList.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase.js";
import { Link } from "react-router-dom";

export default function SurveyResultsList() {
  const [surveys, setSurveys] = useState([]);

  // Load all surveys
  const loadSurveys = async () => {
    const snap = await getDocs(collection(db, "surveys"));
    setSurveys(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  // Delete survey + all its responses
  const handleDeleteSurvey = async (surveyId) => {
    // 1) delete each response doc
    const responsesSnap = await getDocs(
      collection(db, "surveys", surveyId, "responses")
    );
    await Promise.all(
      responsesSnap.docs.map(r => deleteDoc(r.ref))
    );
    // 2) delete the survey itself
    await deleteDoc(doc(db, "surveys", surveyId));
    // 3) reload
    loadSurveys();
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Surveys &amp; Results</h2>

      {surveys.length === 0 ? (
        <p>No surveys found.</p>
      ) : (
        surveys.map(s => (
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
              <button style={{ marginRight: 8 }}>View Responses</button>
            </Link>
            <button onClick={() => handleDeleteSurvey(s.id)}>
              Delete Survey
            </button>
          </div>
        ))
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/surveys">
          <button>← Back to Manage Surveys</button>
        </Link>
      </div>
    </div>
  );
}
