import {
  collection,
  doc,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import ManageUsersDesign from "./ManageUsersDesign";

function ensureUserId(u) {
  if (u.user_id) return u.user_id;
  const full = (u.fullname || u.fullName || "").trim();
  const [first = "", ...rest] = full.split(" ");
  const last = rest.join(" ");
  return `${first}_${last}_${u.phone}`;
}

function normalizeUser(raw) {
  const src = raw.user ?? raw;
  const first = src.first_name ?? "";
  const last = src.last_name ?? "";
  const fn = (src.fullname || src.fullName || `${first} ${last}`.trim())
    .trim() || "—";
  return {
    fullName: fn,
    phone: (src.phone || src.phoneNumber || "").trim(),
    is_registered: src.is_registered ?? false,
    is_club_60: src.is_club_60 ?? false,
    first_name: first,
    last_name: last,
    user_id: src.user_id || "",
  };
}

export default function ManageUsersContainer() {
  const [regs, setRegs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [replies, setReplies] = useState([]);
  const [manual, setManual] = useState([]);
  const [filter, setFilter] = useState("all");
  const [deletedPhones, setDeletedPhones] = useState(new Set());

  useEffect(() => {
    // 1) Registrations
    const unsubRegs = onSnapshot(
      collection(db, "activityRegistrations"),

      snap => setRegs(snap.docs.map(d => normalizeUser(d.data()))),
      console.error
    );

    // 2) Survey Responses
    const unsubMsgs = onSnapshot(
      collection(db, "messages"),
      snap => {
        console.log("📨 messages changes:", snap.docChanges().map(c => c.type));
        console.log("📨 messages snapshot docs:", snap.docs.length);
        console.log("📨 docChanges:", snap.docChanges().map(c => c.type));
        snap.docChanges().forEach(change => {
          if (change.type === "added") {
            const u = normalizeUser(change.doc.data());
            if (!u.phone) return;
            const id = ensureUserId(u);
            setDoc(
              doc(db, "users", docId),
              {
                user_id: docId,
                first_name: u.first_name,
                last_name: u.last_name,
                phone: u.phone,
                fullname: u.fullName,
                is_registered: false,
                is_club_60: false,
              },
              { merge: true }
            )
              .then(() => console.log("   → wrote user from message:", id))
              .catch(console.error);
          }
        });
      },
      console.error
    );


    // 3) Users (Survey Responses)
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      snap => setManual(snap.docs.map(d => normalizeUser(d.data()))),
      console.error
    );


    return () => {
      unsubRegs();
      unsubMsgs();
      unsubUsers();
    };
  }, []);


  // key: "phone" is used to deduplicate users
  const allMap = [...regs, ...surveys, ...replies, ...manual]
    .filter(u => u.phone)
    .reduce((acc, u) => {
      const ex = acc[u.phone];
      if (!ex || (ex.fullName === "—" && u.fullName !== "—")) {
        acc[u.phone] = u;
      }
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
      manualUsers={manual}
      setManualUsers={setManual}
      markDeleted={phone => setDeletedPhones(p => new Set(p).add(phone))}
    />
  );
}