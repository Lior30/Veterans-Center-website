// src/components/ManageUsersContainer.jsx

import React, { useState, useEffect } from "react";
import {
  collection,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.js";
import ManageUsersDesign from "./ManageUsersDesign";

export default function ManageUsersContainer() {
  const [regs,    setRegs]    = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [replies, setReplies] = useState([]);
  const [filter,  setFilter]  = useState("all"); // all|activity|survey|replies|both

  // Normalize any incoming record to { fullName, phone }
  function normalizeUser(raw) {
    const u = raw.user ?? raw;
    return {
      fullName: u.fullname || u.fullName || "",
      phone:    u.phone    || ""
    };
  }

  useEffect(() => {
    // 1) Activity registrations
    const unsubRegs = onSnapshot(
      collection(db, "activityRegistrations"),
      (snap) => setRegs(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Registration listener error:", err)
    );

    // 2) Survey responses
    const unsubSurveys = onSnapshot(
      collection(db, "surveyResponses"),
      (snap) => setSurveys(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Survey listener error:", err)
    );

    // 3) Message replies across all sub-collections named "replies"
    const unsubReplies = onSnapshot(
      collectionGroup(db, "replies"),
      (snap) => setReplies(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Replies listener error:", err)
    );

    return () => {
      unsubRegs();
      unsubSurveys();
      unsubReplies();
    };
  }, []);

  // Merge & dedupe by phone
  const allMap = [...regs, ...surveys, ...replies].reduce((acc, u) => {
    if (u.phone) acc[u.phone] = u;
    return acc;
  }, {});
  const allUsers = Object.values(allMap);

  // Build lookup sets for filtering
  const inAct = new Set(regs.map(u => u.phone));
  const inSur = new Set(surveys.map(u => u.phone));
  const inRep = new Set(replies.map(u => u.phone));

  // Apply filter
  const filtered = allUsers.filter(u => {
    const a = inAct.has(u.phone),
          s = inSur.has(u.phone),
          r = inRep.has(u.phone);

    switch (filter) {
      case "activity": return a && !s && !r;
      case "survey":   return s && !a && !r;
      case "replies":  return r && !a && !s;
      case "both":     return a && s && !r;
      default:         return true;  // "all"
    }
  });

  return (
    <ManageUsersDesign
      users={filtered}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
}
