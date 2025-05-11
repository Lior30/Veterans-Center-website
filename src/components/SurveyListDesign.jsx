import React from "react";
import { Link } from "react-router-dom";

export default function SurveyListDesign({ surveys }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Available Surveys</h2>

      {surveys.length === 0 ? (
        <p>No surveys created yet.</p>
      ) : (
        surveys.map((s) => (
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
            <Link to={`/surveys/take/${s.id}`}>
              <button>Take Survey</button>
            </Link>
          </div>
        ))
      )}

      <div style={{ marginTop: 30 }}>
        <Link to="/surveys">
          <button>← Back to Manage Surveys</button>
        </Link>
      </div>
    </div>
  );
}
