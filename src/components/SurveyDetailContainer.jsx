// src/components/SurveyDetailContainer.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, setDoc } from "firebase/firestore";
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

    // Go back to the survey list

     // 1) שמירת התשובה
     let respRef;
     try {
         respRef = await addDoc(
         collection(db, "surveys", id, "responses"),
         { answers, submittedAt: new Date() }
       );
       console.log("✅ Response saved:", respRef.id);
     } catch (err) {
       console.error("❌ Failed to save response:", err);
       alert("שגיאה בשמירת התשובה");
       return;
     }
 
     // 2) חילוץ שם מלא וטלפון מהתשובה
     const full = (answers.fullname || "").trim();
     const phone = (answers.phone || "").trim();
     if (phone) {
       // 3) פיצול לשם פרטי/משפחה
       const [first = "", ...rest] = full.split(/\s+/);
       const last = rest.join(" ");
 
       // 4) בניית userId
       const userId = `${first}_${last}_${phone}`;
 
       // 5) בדיקה אם כבר קיים
       const userRef = doc(db, "users", userId);
       const userSnap = await getDoc(userRef);
       if (!userSnap.exists()) {
         // 6) אם לא – יוצרים משתמש חדש כ־unregistered
         await setDoc(userRef, {
           user_id:      userId,
           first_name:   first,
           last_name:    last,
           fullname:     full,
           phone,
           is_registered:false,
           is_club_60:   false,
         });
         console.log("✔ Created new user:", userId);
       } else {
         console.log("ℹ️ User already exists:", userId);
       }
     } else {
       console.warn("⚠️ No phone provided, skipping user creation");
     }
 
     // 7) חזרה לרשימת הסקרים
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
