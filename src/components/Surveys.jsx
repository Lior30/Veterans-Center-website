// src/components/Surveys.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SurveyResultsList from "../components/SurveyResultsList";

export default function Surveys() {
   const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto", direction: "rtl" }}>
      {/* Create Survey Button */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/surveys/create")} style={{ float: "left" }}>
          יצירת סקר חדש
        </button>
        <div style={{ clear: "both" }} />
      </div>

      {/* Show All Existing Surveys */}
      <SurveyResultsList />
    </div>
  );
}