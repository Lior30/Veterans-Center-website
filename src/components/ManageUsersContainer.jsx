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
  const [regs, setRegs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [replies, setReplies] = useState([]);
  const [filter, setFilter] = useState("all");
  const [source, setSource] = useState("unregistered");
  const [manualUsers, setManualUsers] = useState([]);
  const [deletedPhones, setDeletedPhones] = useState(new Set());



  function normalizeUser(raw) {
    const u = raw.user ?? raw;
    return {
      fullName: u.fullname || u.fullName || `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
      phone: u.phone || "",
      is_registered: u.is_registered ?? false,
      is_club_60: u.is_club_60 ?? false,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      user_id: u.user_id || ""
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

    const unsubReplies = onSnapshot(
      collectionGroup(db, "replies"),
      (snap) => setReplies(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Replies listener error:", err)
    );

    const unsubManual = onSnapshot(
      collection(db, "users"),
      (snap) => setManualUsers(snap.docs.map(d => normalizeUser(d.data()))),
      (err) => console.error("Users listener error:", err)
    );

    return () => {
      unsubRegs();
      unsubSurveys();
      unsubReplies();
      unsubManual();
    };
  }, []);

  const allMap = [...regs, ...surveys, ...replies, ...manualUsers].reduce((acc, u) => {
    if (u.phone) acc[u.phone] = u;
    return acc;
  }, {});
  const allUsers = Object.values(allMap);

  const inAct = new Set(regs.map(u => u.phone));
  const inSur = new Set(surveys.map(u => u.phone));
  const inRep = new Set(replies.map(u => u.phone));

  const filtered = allUsers.filter(u => {
    if (deletedPhones.has(u.phone)) return false;
    const a = inAct.has(u.phone),
          s = inSur.has(u.phone),
          r = inRep.has(u.phone);

    switch (filter) {
      case "activity": return a && !s && !r;
      case "survey": return s && !a && !r;
      case "replies": return r && !a && !s;
      case "both": return a && s && !r;
      default: return true;
    }
  });

  return (
    <ManageUsersDesign
      users={filtered}
      filter={filter}
      onFilterChange={setFilter}
      manualUsers={manualUsers}
      setManualUsers={setManualUsers}
      markDeleted={phone => setDeletedPhones(prev => new Set(prev).add(phone))}
    />
  );
}
