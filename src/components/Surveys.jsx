import CtaButton from "../LandingPage/CtaButton";
// src/components/Surveys.jsx
import { useNavigate } from "react-router-dom";
import SurveyResultsList from "../components/SurveyResultsList";

export default function Surveys() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto", direction: "rtl" }}>
      {/* Create Survey Button */}
      <div style={{ marginBottom: 20 }}>
        <CtaButton onClick={() => navigate("/surveys/create")} style={{ float: "left" }}>
          יצירת סקר חדש
        </CtaButton>
        <div style={{ clear: "both" }} />
      </div>

      {/* Show All Existing Surveys */}
      <SurveyResultsList />
    </div>
  );
}