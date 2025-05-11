import React from "react";
import { Link } from "react-router-dom";

export default function Surveys() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Manage Surveys</h2>

      <div style={{ display: "inline-block", marginTop: 20 }}>
        <Link to="/surveys/create">
          <button style={{ display: "block", width: 200, margin: "10px 0" }}>
            Create New Survey
          </button>
        </Link>

        <Link to="/surveys/results">
          <button style={{ display: "block", width: 200, margin: "10px 0" }}>
            Review Survey Results
          </button>
        </Link>

        <Link to="/surveys/list">
          <button style={{ display: "block", width: 200, margin: "10px 20px 0" }}>
            View &amp; Answer Surveys
          </button>
        </Link>
      </div>
    </div>
  );
}
