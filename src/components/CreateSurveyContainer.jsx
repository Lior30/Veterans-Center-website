// src/components/CreateSurveyContainer.jsx
import { db } from "../firebase";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateSurveyDesign from "./CreateSurveyDesign.jsx";
import SurveyService from "../services/SurveyService.js";
import { getDoc, doc } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function CreateSurveyContainer() {
  const { id } = useParams(); // check if editing

  const isEditing = !!id;
  const pageTitle = isEditing ? "עריכת סקר קיים" : "יצירת סקר חדש";
  const submitLabel = isEditing ? "עדכן שינויים" : "פרסם סקר";

  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  
  const [headline, setHeadline] = useState("");

  const [hasExpiration, setHasExpiration] = useState(true);

  const [expiresAt, setExpiresAt] = useState(() => {
  const now = new Date();
  now.setSeconds(0, 0); 

  const pad = (n) => n.toString().padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
});


  // track which activity this survey is linked to
  // "general" = no specific activity; otherwise, an activity ID
  const [activityId, setActivityId] = useState("general");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
  async function loadForEdit() {
    if (!id) return;
    const snap = await getDoc(doc(db, "surveys", id));
    if (!snap.exists()) return;
    const data = snap.data();

    setHeadline(data.headline || "");
    setActivityId(data.of_activity || "general");
    setQuestions(data.questions || []);
    if (data.expires_at) {
      setHasExpiration(true);
      setExpiresAt(new Date(data.expires_at).toISOString().slice(0, 16)); // adjust for input format
    } else {
      setHasExpiration(false);
    }
  }

  loadForEdit();
}, [id]);


  // Load all activities once (for the dropdown)
  useEffect(() => {
    async function loadActivities() {
      const acts = await SurveyService.listActivities();
      setActivities([{ id: "general", title: "כללי" }, ...acts]);
    }
    loadActivities();
  }, []);

  // Handlers
  const handleHeadlineChange = (e) => setHeadline(e.target.value);
  const handleActivityChange = (e) => setActivityId(e.target.value);

  const handleAddQuestion = () =>
  setQuestions((qs) => [
    ...qs,
    {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      text: "",
      type: "open",
      options: [],
      mandatory: false,
      fixed: false,
    },
  ]);

  const handleRemoveQuestion = (id) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  const handleQuestionChange = (id, text) =>
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, text } : q))
    );

  const handleQuestionTypeChange = (id, type) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, type, options: type === "multiple" ? q.options : [] }
          : q
      )
    );

  const handleMandatoryChange = (id) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, mandatory: !q.mandatory } : q
      )
    );

  const handleAddOption = (id) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, options: [...q.options, ""] } : q
      )
    );

  const handleOptionChange = (qid, idx, value) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === idx ? value : opt
              ),
            }
          : q
      )
    );

  // Submit / Cancel
  const handleSubmit = async () => {
    const title = headline.trim();
    if (!title) {
      alert("אנא הזן כותרת לסקר לפני פרסום.");
      return;
    }


    const payload = {
  headline: title,
  questions,
  of_activity: activityId === "general" ? "כללי" : activityId,
};

if (hasExpiration && expiresAt) {
    payload.expires_at = new Date(expiresAt).toISOString();
  }


    if (id) {
  await SurveyService.update(id, payload);
} else {
  await SurveyService.create(payload);
}

    navigate("/surveys");
  };

  const handleCancel = () => {
  const message = isEditing
    ? "ביטול עריכת הסקר?"
    : "בטל יצירת סקר ותאבדו את כל השינויים?";
  if (window.confirm(message)) {
    navigate("/surveys");
  }
};


  return (
    <CreateSurveyDesign
      pageTitle={pageTitle}
      submitLabel={submitLabel}
      headline={headline}
      onHeadlineChange={handleHeadlineChange}
      questions={questions}
      onAddQuestion={handleAddQuestion}
      onQuestionChange={handleQuestionChange}
      onQuestionTypeChange={handleQuestionTypeChange}
      onAddOption={handleAddOption}
      onOptionChange={handleOptionChange}
      onMandatoryChange={handleMandatoryChange}
      onRemoveQuestion={handleRemoveQuestion}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      activities={activities}
      activityId={activityId}
      onActivityChange={handleActivityChange}
      expiresAt={expiresAt}                   
      onExpiresAtChange={(e) => setExpiresAt(e.target.value)}
      hasExpiration={hasExpiration}                    
      onHasExpirationChange={(e) => setHasExpiration(e.target.checked)}
    />
  );
}