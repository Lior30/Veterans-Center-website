
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import SurveyDetailDesign from "./SurveyDetailDesign.jsx";
import UserService from "../services/UserService.js";

export default function SurveyDetailContainer({ surveyId, onClose }) {
  const params = useParams();
  const navigate = useNavigate();
  const id = surveyId || params.id;

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [responses, setResponses] = useState([]);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "surveys", id));
        if (snap.exists()) setSurvey({ id: snap.id, ...snap.data() });

        const respSnap = await getDocs(collection(db, "surveys", id, "responses"));
        const all = respSnap.docs.map(doc => doc.data());
        setResponses(all);
      } catch (err) {
        console.error("Error loading survey or responses:", err);
        setSubmitError("שגיאה בטעינת הסקר");
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    const fname = (answers.firstName || "").trim();
    const lname = (answers.lastName || "").trim();
    const phone = (answers.phone || "").trim();
    if (!fname || !lname || !phone || responses.length === 0) return;

    const userId = `${fname}_${lname}_${phone}`;
    const isBlocked = responses.some((r) => {
      const a = r.answers || {};
      return `${a.firstName}_${a.lastName}_${a.phone}` === userId;
    });

    setBlocked(isBlocked);
  }, [answers, responses]);

  const handleChange = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const fname = (answers.firstName || "").trim();
    const lname = (answers.lastName || "").trim();
    const phone = (answers.phone || "").trim();

    if (!UserService.isValidName(fname)) newErrors.firstName = "שם לא תקין";
    if (!UserService.isValidName(lname)) newErrors.lastName = "שם משפחה לא תקין";
    if (!UserService.isValidPhone(phone)) newErrors.phone = UserService.getPhoneError(phone);

    for (let q of survey?.questions || []) {
      if (q.
        datory && !answers[q.id]?.trim()) {
        newErrors[q.id] = "שדה חובה";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || blocked) return;

    try {
      console.log("Trying to submit to:", id);
      console.log("Answers:", answers);

      await addDoc(collection(db, "surveys", id, "responses"), {
        answers,
        submittedAt: new Date().toISOString(),
      });

      console.log("✅ Submission successful!");
      setSubmitError(null);
      setSubmitted(true);
      if (onClose) onClose();
      else navigate("/surveys/list");
    } catch (err) {
      console.error("❌ Error submitting response:", err);
      setSubmitError("שגיאה בשליחת התשובה");
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate("/surveys/list");
  };

  if (!survey) return <p>טוען סקר...</p>;

  return (
    <SurveyDetailDesign
      survey={survey}
      answers={answers}
      errors={errors}
      blocked={blocked}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitted={submitted}
      submitError={submitError}
    />
  );
}
