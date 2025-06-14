// src/components/SurveyListContainer.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import SurveyListDesign from "./SurveyListDesign.jsx";

export default function SurveyListContainer() {
  const [surveys, setSurveys] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  async function load() {
    const snap = await getDocs(collection(db, "surveys"));
    const surveysData = snap.docs.map((doc) => {
      const data = doc.data();
      console.log("📋 Loaded survey:", data.headline, "| expires_at:", data.expires_at);
      return { id: doc.id, ...data };
    });
    setSurveys(surveysData);
  }
  load();
}, []);

  const handleDeleteSurvey = async (surveyId) => {
    const respSnap = await getDocs(collection(db, "surveys", surveyId, "responses"));
    await Promise.all(respSnap.docs.map((r) => deleteDoc(r.ref)));
    await deleteDoc(doc(db, "surveys", surveyId));
    const snap = await getDocs(collection(db, "surveys"));
    setSurveys(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleViewResponses = (id) => {
    navigate(`/surveys/results/${id}`);
  };

  // Navigate with query param to trigger analysis mode
  const handleAnalyze = (id) => {
    navigate(`/surveys/results/${id}?analysis=true`);
  };

  return (
    <SurveyListDesign
      surveys={surveys}
      onDeleteSurvey={handleDeleteSurvey}
      onViewResponses={handleViewResponses}
      onAnalyze={handleAnalyze}
    />
  );
}