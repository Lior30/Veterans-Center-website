// src/components/SurveyDetailContainer.jsx
import { arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase.js";
import { saveSurveyResponse } from "../services/SurveyService";
import SurveyService from "../services/SurveyService.js";
import UserService from "../services/UserService.js";
import SurveyDetailDesign from "./SurveyDetailDesign.jsx";


export default function SurveyDetailContainer({ surveyId, onClose }) {
  const params = useParams();
  const idRef = useRef(surveyId || params?.id);
  const id = idRef.current;
  const navigate = useNavigate();
  const [userPhone] = useState(() => sessionStorage.getItem("userPhone"));

  const [survey, setSurvey] = useState(null);
  const [activityTitle, setActivityTitle] = useState("");
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(null);
  const [responses, setResponses] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [blockCheckReady, setBlockCheckReady] = useState(false);

  useEffect(() => {
    if (!id) {
      console.warn("⏭️ Skipping load — no valid survey ID yet");
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

    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadUserInfoAndCheckBlocked() {
      const phone = sessionStorage.getItem("userPhone");
      console.log("👤 Loading user info for phone:", phone);
      if (!phone) return;

      try {
        const userRef = doc(db, "users", phone);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.warn("⚠️ No user found for phone:", phone);
          return;
        }

        const data = userSnap.data();
        setUserData(data);

        console.log("✅ userData loaded:", data);

        const firstName = data.first_name?.trim() || "";
        const lastName = data.last_name?.trim() || "";
        const userPhone = data.phone?.trim() || "";

        setAnswers((prev) => ({
          ...prev,
          firstName,
          lastName,
          phone: userPhone,
        }));

        // Wait until responses are ready
        const userId = `${firstName}_${lastName}_${userPhone}`;
        const isBlocked = responses.some((r) => {
          const a = r.answers || {};
          return `${a.firstName}_${a.lastName}_${a.phone}` === userId;
        });
        setBlocked(isBlocked);
        console.log("🛑 Block check:", isBlocked);
        setBlockCheckReady(true);

      } catch (err) {
        console.error("שגיאה בטעינת פרטי משתמש או בדיקת כפילות:", err);
      }
    }

    loadUserInfoAndCheckBlocked();
  }, [responses]);

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
    setBlockCheckReady(true);
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

    if (!isValid || blocked) {
      console.warn("⛔ Submission blocked by validation or duplicate detection.");
      return;
    }

    try {
      await saveSurveyResponse(id, {
        answers,
        submittedAt: new Date().toISOString(),
        survey: survey.headline,
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

      console.log("✅ Rendering form — blocked is:", blocked, "at", new Date().toISOString());


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

  if (!survey || !userData || blocked === null) {
    console.log("⏳ Waiting on data — survey:", !!survey, "userData:", !!userData, "blocked:", blocked);
    return <p>טוען סקר…</p>;
  }

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
        isUserLoggedIn={!!userData}
      />
    </>
  );
}