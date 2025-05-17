import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.js";
import ManageUsersDesign from "./ManageUsersDesign";

export default function ManageUsersContainer() {
  const [regs, setRegs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [filter, setFilter] = useState("all"); // all|activity|survey

  function normalizeUser(raw) {
    const u = raw.user ?? raw;
    return {
      fullName: u.fullname || u.fullName || "",
      phone: u.phone || ""
    };
  }

  useEffect(() => {
    const unsubRegs = onSnapshot(
      collection(db, "activityRegistrations"),
      (snap) => setRegs(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Registration listener error:", err)
    );

    const unsubSurveys = onSnapshot(
      collection(db, "surveyResponses"),
      (snap) => setSurveys(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Survey listener error:", err)
    );

    return () => {
      unsubRegs();
      unsubSurveys();
    };
  }, []);

  // Merge & dedupe by phone
  const allMap = [...regs, ...surveys].reduce((acc, u) => {
    if (u.phone) acc[u.phone] = u;
    return acc;
  }, {});
  const allUsers = Object.values(allMap);

  const inAct = new Set(regs.map(u => u.phone));
  const inSur = new Set(surveys.map(u => u.phone));

  const filtered = allUsers.filter(u => {
    const a = inAct.has(u.phone), s = inSur.has(u.phone);
    switch (filter) {
      case "activity": return a && !s;
      case "survey":   return s && !a;
      default:         return true;
    }
  });

  return (
    <ManageUsersDesign
      users={filtered}
      filter={filter}
      onFilterChange={setFilter}
      showRepliesOption={false}
    />
  );
}
