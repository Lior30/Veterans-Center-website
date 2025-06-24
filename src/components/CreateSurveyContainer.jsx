// src/components/CreateSurveyContainer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateSurveyDesign from "./CreateSurveyDesign.jsx";
import SurveyService from "../services/SurveyService.js";

let nextId = 1;

export default function CreateSurveyContainer() {
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
        id: `auto_${nextId++}`,
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


    await SurveyService.create(payload);
    navigate("/surveys");
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "בטל יצירת סקר ותאבדו את כל השינויים?"
      )
    ) {
      navigate("/surveys");
    }
  };

  return (
    <CreateSurveyDesign
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