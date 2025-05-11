import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import SurveyListDesign from "./SurveyListDesign.jsx";

export default function SurveyListContainer() {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "surveys"));
      setSurveys(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    load();
  }, []);

  return <SurveyListDesign surveys={surveys} />;
}
