// src/components/SurveyDetailContainer.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, getDocs,updateDoc,arrayUnion } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import SurveyDetailDesign from "./SurveyDetailDesign.jsx";
import SurveyService from "../services/SurveyService.js";
import ActivityService from "../services/ActivityService.js";
import UserService from "../services/UserService.js";
import { saveSurveyResponse } from "../services/SurveyService";


export default function SurveyDetailContainer({ surveyId, onClose }) {
  const params = useParams();
  const id = surveyId || params?.id;
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [activityTitle, setActivityTitle] = useState("");
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [responses, setResponses] = useState([]);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!id) {
    console.error("⛔ Cannot load survey: id is undefined");
    return;
    }

    async function load() {
      // 1) Load the survey itself
      const s = await SurveyService.getById(id);
      if (!s) {
        setSubmitError("סקר לא נמצא.");
        return;
      }
      if (s.expires_at && new Date() > new Date(s.expires_at)) {
  return;
}
setSurvey(s);

      // 2) If the survey is linked to a specific activity, load its title from Firestore
      if (s.of_activity && typeof s.of_activity === "string" && s.of_activity !== "כללי") {
        try {
          const actSnap = await getDoc(doc(db, "activities", s.of_activity));
          if (actSnap.exists()) {
            setActivityTitle(actSnap.data().name);
          } else {
            setActivityTitle("פעילות לא נמצאה");
          }
        } catch (err) {
          console.error("שגיאה בטעינת פעילות:", err);
          setActivityTitle("שגיאה בטעינה");
        }
      } else {
          setActivityTitle("");
      }

      // 3) Load all existing responses for this survey
      const rSnap = await getDocs(collection(db, "surveys", id, "responses"));
      const responseData = rSnap.docs.map((d) => d.data());
      setResponses(responseData);
      checkIfBlocked(responseData);
    }
    load();
  }, [id]);

  const checkIfBlocked = (allResponses) => {
  const fname = (answers.firstName || "").trim();
  const lname = (answers.lastName || "").trim();
  const phone = (answers.phone || "").trim();
  if (!fname || !lname || !phone) return;

  const userId = `${fname}_${lname}_${phone}`;
  const isBlocked = allResponses.some((r) => {
    const a = r.answers || {};
    return `${a.firstName}_${a.lastName}_${a.phone}` === userId;
  });
  setBlocked(isBlocked);
};

  useEffect(() => {
  const fname = (answers.firstName || "").trim();
  const lname = (answers.lastName || "").trim();
  const phone = (answers.phone || "").trim();
  if (!fname || !lname || !phone) return;

  const userId = `${fname}_${lname}_${phone}`;
  const isBlocked = responses.some((r) => {
    const a = r.answers || {};
    return `${a.firstName}_${a.lastName}_${a.phone}` === userId;
  });
  setBlocked(isBlocked);
}, [answers, responses]);

const handleChange = (qid, value) => {
  setAnswers((prev) => {
    const updated = { ...prev, [qid]: value };
    return updated;
  });
};

  const validate = () => {
    const newErrors = {};
    const fname = (answers.firstName || "").trim();
    const lname = (answers.lastName || "").trim();
    const phone = (answers.phone || "").trim();

    if (!UserService.isValidName(fname)) newErrors.firstName = "שם לא תקין";
    if (!UserService.isValidName(lname)) newErrors.lastName = "שם משפחה לא תקין";
    if (!UserService.isValidPhone(phone)) newErrors.phone = UserService.getPhoneError(phone);

    for (let q of survey.questions || []) {
      if (q.mandatory && !answers[q.id]?.trim()) {
        newErrors[q.id] = "שדה חובה";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  const isValid = validate();
  if (!isValid || blocked) {
    console.warn("⛔ Submission blocked by validation or duplicate detection.");
    return;
  }

  try {
    await saveSurveyResponse(id, {
      answers,
      submittedAt: new Date().toISOString(),
      survey: survey.headline, // name of the survey
      survey_date: arrayUnion(new Date().toISOString()),
    });
    try {
  const userRef = doc(db, "users", answers.phone.trim());
  await updateDoc(userRef, {
    survey: arrayUnion(survey.headline),
    survey_date: arrayUnion(new Date().toISOString()),
  });
  
} catch (err) {
  console.error("⚠️ Failed to update user survey history:", err);
}

    setSubmitError(null);
    setSubmitted(true);
    if (onClose) onClose();
    else navigate("/surveys/list");
  } catch (err) {
    console.error("Error submitting survey response:", err);
    setSubmitError("שגיאה בשליחת התשובה");
  }
};

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate("/surveys/list");
  };

  if (!survey) return <p>טוען סקר…</p>;

  return (
  <>
    <SurveyDetailDesign
      survey={survey}
      activityTitle={activityTitle}
      answers={answers}
      errors={errors}
      blocked={blocked}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitted={submitted}
      submitError={submitError}
    />
  </>
);
}