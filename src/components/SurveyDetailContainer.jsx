// src/components/SurveyDetailContainer.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import SurveyDetailDesign from "./SurveyDetailDesign.jsx";

export default function SurveyDetailContainer({ surveyId, onClose }) {
  const params   = useParams();
  const navigate = useNavigate();
  // אם נקבל surveyId פרופ, נשתמש בו, אחרת הפרמטר מה־URL
  const id = surveyId || params.id;

  const [survey, setSurvey]   = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // טען את הגדרת הסקר
  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "surveys", id));
      if (snap.exists()) setSurvey({ id: snap.id, ...snap.data() });
      else console.error("Survey not found:", id);
    })();
  }, [id]);

  // עדכון תשובה מקומית
  const handleChange = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  // שליחת התשובות
  const handleSubmit = async () => {
    if (!survey) return;
    // בדיקת שאלות חובה
    for (let q of survey.questions.filter(q => q.mandatory)) {
      if (!(answers[q.id] || "").trim()) {
        alert(`חובה למלא: ${q.text}`);
        return;
      }
    }

    // 1️⃣ שמירת התשובות לתת-קולקשן של הסקר
    try {
      await addDoc(collection(db, "surveys", id, "responses"), {
        answers,
        submittedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error saving response:", err);
      alert("שגיאה בשמירת התשובות");
      return;
    }

    // 2️⃣ נבנה את userId לפי full name + phone
    const fullname = answers.fullname?.trim() || "";
    const phone    = answers.phone?.trim()    || "";
    const [first, ...rest] = fullname.split(" ");
    const last    = rest.join(" ");

    const userId  = `${first}_${last}_${phone}`;
    const userRef = doc(db, "users", userId);

     let userSnap;
   try {
     userSnap = await getDoc(userRef);
   } catch (err) {
     console.error("Error reading user:", err);
     alert("שגיאה בקריאת נתוני המשתמש");
     return;
   }

    // 3️⃣ נרנר את כותרת ותאריך הסקר
    const surveyTitle = survey.title ?? survey.headline ?? survey.name ?? "";
    const surveyDate  = new Date().toISOString();

    // 4️⃣ בדיקה אם המשתמש קיים כבר
    try {
      const userSnap = await getDoc(userRef);

       if (!userSnap.exists()) {
   // 5️⃣ משתמש חדש → צור לו מסמך עם כל השדות
   await setDoc(userRef, {
     user_id:         userId,
     fullname:        fullname,
     first_name:      first,
     last_name:       last,
     phone:           phone,
     is_registered:   false,
     is_club_60:      false,
     activities:      [],          // מערך ריק
     activities_date: [],          // מערך ריק
     survey:          [surveyTitle],  // עכשיו מערך
     survey_date:     [surveyDate],   // מערך תאריכים
     replies:         [],          // מערך ריק
     replies_date:    [],          // מערך ריק
   }, { merge: true });
 } else {
        // 6️⃣ משתמש קיים → הוסף לסוף המערכים (אפשר להפוך בסייד UI)
        await updateDoc(userRef, {
          survey:       arrayUnion(surveyTitle),
          survey_date:  arrayUnion(surveyDate)
        });
      }
    } catch (err) {
      console.error("Error upserting user:", err);
      alert("שגיאה בעדכון המשתמש");
      return;
    }

    setSubmitted(true);
    // 7️⃣ סגר דיאלוג או נווט חזרה
    if (onClose) onClose();
    else navigate("/surveys/list");
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate("/surveys/list");
  };

  if (!survey) {
    return (
      <SurveyDetailDesign
        survey={{ headline: "Loading…", questions: [] }}
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
      submitted={submitted}
    />
  );
}
