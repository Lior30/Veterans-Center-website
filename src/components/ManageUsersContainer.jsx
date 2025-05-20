// src/components/ManageUsersContainer.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.js";
import ManageUsersDesign from "./ManageUsersDesign";

/** ----------------------------------------------------------
 *  Utility: convert raw Firestore doc ➜ canonical user object
 *  Always returns:
 *      { fullName, phone, is_registered, is_club_60, ... }
 *  fullName is NEVER blank – falls back to "—".
 *  --------------------------------------------------------- */
function normalizeUser(raw) {
  const src = raw.user ?? raw;

  const first = src.first_name  ?? "";
  const last  = src.last_name   ?? "";
  const fn    =
    (src.fullname   || src.fullName || src.name || `${first} ${last}`.trim())
      .trim();

  return {
    /** main columns UI expects */
    fullName: fn.length ? fn : "—",
    phone:    (src.phone || src.phoneNumber || "").trim(),

    /** flags (default ➜ false) */
    is_registered: src.is_registered ?? false,
    is_club_60:    src.is_club_60    ?? false,

    /** anything else you were already using */
    first_name: first,
    last_name:  last,
    user_id:    src.user_id || "",
  };
}

export default function ManageUsersContainer() {
  const [regs,        setRegs]        = useState([]);
  const [surveys,     setSurveys]     = useState([]);
  const [replies,     setReplies]     = useState([]);
  const [manualUsers, setManualUsers] = useState([]);

  const [filter, setFilter] = useState("all");          // UI filter buttons
  const [deletedPhones, setDeletedPhones] = useState(   // soft-delete set
    new Set()
  );

  /* ── real-time listeners ───────────────────────────────────────── */
  useEffect(() => {
    const unsubRegs = onSnapshot(
      collection(db, "activityRegistrations"),
      (snap) => setRegs(snap.docs.map((d) => normalizeUser(d.data()))),
      console.error
    );

    const unsubSurveys = onSnapshot(
      collection(db, "surveyResponses"),
      (snap) => setSurveys(snap.docs.map((d) => normalizeUser(d.data()))),
      console.error
    );

    const unsubReplies = onSnapshot(
      collectionGroup(db, "replies"),
      (snap) => setReplies(snap.docs.map((d) => normalizeUser(d.data()))),
      console.error
    );

    const unsubManual = onSnapshot(
      collection(db, "users"),
      (snap) => setManualUsers(snap.docs.map((d) => normalizeUser(d.data()))),
      console.error
    );

    return () => {
      unsubRegs();
      unsubSurveys();
      unsubReplies();
      unsubManual();
    };
  }, []);
  /* ──────────────────────────────────────────────────────────────── */

  /* ── Merge sources without duplicates (key = phone) ───────────── */
  const allMap = [...regs, ...surveys, ...replies, ...manualUsers].reduce(
    (acc, u) => {
      if (!u.phone) return acc;               // skip if phone missing
      /* prefer entry that holds a *real* name over "—" */
      const existing = acc[u.phone];
      if (!existing || (existing.fullName === "—" && u.fullName !== "—")) {
        acc[u.phone] = u;
      }
      return acc;
    },
    {}
  );
  const allUsers = Object.values(allMap);
  /* ──────────────────────────────────────────────────────────────── */

  /* used for quick membership checks */
  const inAct = new Set(regs.map((u) => u.phone));
  const inSur = new Set(surveys.map((u) => u.phone));
  const inRep = new Set(replies.map((u) => u.phone));

  /* ── UI filter logic (same as your original) ──────────────────── */
  const filtered = allUsers.filter((u) => {
    if (deletedPhones.has(u.phone)) return false;   // soft-deleted row
    const a = inAct.has(u.phone);
    const s = inSur.has(u.phone);
    const r = inRep.has(u.phone);

    switch (filter) {
      case "activity":
        return a && !s && !r;
      case "survey":
        return s && !a && !r;
      case "replies":
        return r && !a && !s;
      case "both":
        return a && s && !r;
      default:
        return true;
    }
  });
  /* ──────────────────────────────────────────────────────────────── */

  return (
    <ManageUsersDesign
      users={filtered}
      filter={filter}
      onFilterChange={setFilter}
      manualUsers={manualUsers}
      setManualUsers={setManualUsers}
      markDeleted={(phone) =>
        setDeletedPhones((prev) => new Set(prev).add(phone))
      }
    />
  );
}
