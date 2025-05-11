import React, { useState } from "react";
import { useNavigate }    from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db }                from "../firebase.js";
import CreateSurveyDesign    from "./CreateSurveyDesign.jsx";

let nextId = 1;

export default function CreateSurveyContainer() {
  const navigate = useNavigate();

  // Start with the two fixed mandatory questions
  const [questions, setQuestions] = useState([
    {
      id: nextId++,
      text: "Full Name",
      type: "open",
      options: [],
      mandatory: true,
      fixed: true,
    },
    {
      id: nextId++,
      text: "Phone Number",
      type: "open",
      options: [],
      mandatory: true,
      fixed: true,
    },
  ]);
  const [headline, setHeadline] = useState("");

  /* —— Handlers for headline & question edits —— */
  const handleHeadlineChange = (e) => setHeadline(e.target.value);

  const handleAddQuestion = () =>
    setQuestions((qs) => [
      ...qs,
      {
        id: nextId++,
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

  /* —— Submit & Cancel —— */
  const handleSubmit = async () => {
    const title = headline.trim();
    if (!title) {
      alert("Please enter a survey title before submitting.");
      return;
    }

    await addDoc(collection(db, "surveys"), {
      headline: title,
      questions,
      createdAt: new Date(),
    });

    navigate("/surveys/list");
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Abort survey creation and lose all changes?"
      )
    ) {
      navigate("/surveys");
    }
  };

  return (
    <CreateSurveyDesign
      headline={headline}
      questions={questions}
      onHeadlineChange={handleHeadlineChange}
      onAddQuestion={handleAddQuestion}
      onQuestionChange={handleQuestionChange}
      onQuestionTypeChange={handleQuestionTypeChange}
      onAddOption={handleAddOption}
      onOptionChange={handleOptionChange}
      onMandatoryChange={handleMandatoryChange}
      onRemoveQuestion={handleRemoveQuestion}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
