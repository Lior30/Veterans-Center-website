// src/components/SurveyDetailContainer.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import SurveyDetailDesign from "./SurveyDetailDesign.jsx";

export default function SurveyDetailContainer() {
  const { id } = useParams();            // survey ID
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});

  // Load the survey definition
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "surveys", id));
      if (snap.exists()) {
        setSurvey({ id: snap.id, ...snap.data() });
      } else {
        console.error("Survey not found:", id);
      }
    }
    load();
  }, [id]);

  // Track changes to any answer
  const handleChange = (qid, value) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
  };

  // Submit with validation
  const handleSubmit = async () => {
    // Allow English letters, Hebrew letters (א–ת), and spaces
    const nameRegex  = /^[A-Za-z\u05D0-\u05EA\s]+$/;
    const phoneRegex = /^05\d{8}$/;

    // Ensure all mandatory questions answered & validate name/phone
    for (let q of survey.questions.filter((q) => q.mandatory)) {
      const val = (answers[q.id] || "").trim();
      if (!val) {
        alert(`Please answer mandatory question “${q.text}.”`);
        return;
      }
      if (q.text === "Full Name" && !nameRegex.test(val)) {
        alert("Full Name must contain only letters (English or Hebrew) and spaces.");
        return;
      }
      if (q.text === "Phone Number" && !phoneRegex.test(val)) {
        alert("Phone Number must be exactly 10 digits and start with “05.”");
        return;
      }
    }

    // Save the response
    await addDoc(collection(db, "surveys", id, "responses"), {
      answers,
      submittedAt: new Date(),
    });

    // Go back to the survey list
    navigate("/surveys/list");
  };

  const handleCancel = () => navigate("/surveys/list");

  if (!survey) return <p>Loading…</p>;

  return (
    <SurveyDetailDesign
      survey={survey}
      answers={answers}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
