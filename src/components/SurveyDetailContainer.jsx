// src/components/SurveyDetailContainer.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import SurveyDetailDesign from "./SurveyDetailDesign.jsx";

export default function SurveyDetailContainer({ surveyId, onClose }) {
  const params   = useParams();
  const navigate = useNavigate();
  // אם נקבל surveyId פרופ, נשתמש בו, אחרת ניפול אחורה לפרמטר מה־URL
  const id = surveyId || params.id;

  const [survey, setSurvey]   = useState(null);
  const [answers, setAnswers] = useState({});

  // טען את הגדרת הסקר כשתשתנה ה־id
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const snap = await getDoc(doc(db, "surveys", id));
      if (snap.exists()) {
        setSurvey({ id: snap.id, ...snap.data() });
      } else {
        console.error("Survey not found:", id);
      }
    };
    load();
  }, [id]);

  // עדכון תשובה מקומית
  const handleChange = (qid, value) => {
    setAnswers(a => ({ ...a, [qid]: value }));
  };

  // שליחת התשובות
  const handleSubmit = async () => {
    if (!survey) return;
    // בדיקה על שאלות חובה
    for (let q of survey.questions.filter(q => q.mandatory)) {
      const val = (answers[q.id] || "").trim();
      if (!val) {
        alert(`חובה למלא: ${q.text}`);
        return;
      }
    }

    try {
      await addDoc(collection(db, "surveys", id, "responses"), {
        answers,
        submittedAt: new Date()
      });
    } catch (err) {
      console.error("Error saving response:", err);
      alert("שגיאה בשמירת התשובות");
      return;
    }

    // סגור דיאלוג או נווט חזרה
    if (onClose) onClose();
    else navigate("/surveys/list");
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate("/surveys/list");
  };

  // עד שלא נטען הסקר – נסמן טוען
  if (!survey) {
    return (
      <SurveyDetailDesign
        survey={{ headline: "Loading…" , questions: [] }}
        answers={{}}
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={handleCancel}
      />
    );
  }

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
