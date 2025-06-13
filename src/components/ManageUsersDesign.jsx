import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";           // ❶
import { saveAs } from "file-saver";
import { db, auth } from "../firebase"; // <-- add auth here
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import UserService from "../services/UserService";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon   from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  // … שאר ה-imports הקיימים
} from "@mui/material";
import { generateEmailPassword } from "./IdentificationPage";
async function fixMissingUserFields() {
  const snap = await getDocs(collection(db, "users"));
  const updates = [];

  for (const d of snap.docs) {
    const data = d.data();
    const missing = {};

    if (!Array.isArray(data.activities)) missing.activities = [];
    if (!Array.isArray(data.activities_date)) missing.activities_date = [];
    if (!Array.isArray(data.survey)) missing.survey = [];
    if (!Array.isArray(data.survey_date)) missing.survey_date = [];

    if (Object.keys(missing).length > 0) {
      console.log("🔧 updating user:", d.id);
      updates.push(updateDoc(doc(db, "users", d.id), missing));
    }
  }

   await Promise.all(updates);
    if (updates.length > 0) {
      alert("השדות החסרים עודכנו בהצלחה.");
    }

}                           // ← סוגר את הפונקציה כאן

// קריאה חד-פעמית (בחוץ)
fixMissingUserFields();


// מחוץ לקומפוננטה:
function formatDate(dateValue) {
  const d = new Date(dateValue);
  // 'he-IL' תיתן פורמט יום/חודש/שנה
  // ושעות בד"כ 24h אם מוסיפים hour12: false
  return d.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
}


// helper: יוצר user_id קבוע מכל מקור אפשרי
// helper: יוצר user_id קבוע מכל מקור אפשרי
function ensureUserId(u) {
  // אם כבר יש user_id – פשוט החזרי
  if (u.user_id) return u.user_id;

  // קחי שם מלא מכל אחד מהשדות האפשריים
  const full = (u.fullname || u.fullName || "").trim();

  // פירוק לשם פרטי + כל השאר (שם משפחה)
  const [first = "", ...rest] = full.split(" ");
  const last = rest.join(" ");

  return `${first}_${last}_${u.phone}`;
}


/* -------------------------------------------------
   קומפוננטה שמציגה פירוט של משתמש בודד
--------------------------------------------------*/
function UserDetails({ user, filter, collapsible = true }) {
  const isActivity = filter === "activity";
  const isSurvey   = filter === "survey";
  const isReplies  = filter === "replies";
  const isBoth     = filter === "both";
  const [openCats, setOpenCats] = React.useState({});
  const toggle = k => setOpenCats(p => ({ ...p, [k]: !p[k] }));

  /* כל הקטגוריות */
  const CATS = [
    { key: "activity", label:"פעילויות", names: user.activities, dates: user.activities_date },
    { key: "survey", label:"סקרים" , names: user.survey,     dates: user.survey_date    },
    { key: "replies", label:"הודעות" ,   names: user.replies,    dates: user.replies_date   },
  ].filter(c => {
    if (isActivity) return c.key === "activity";
    if (isSurvey)   return c.key === "survey";
    if (isReplies)  return c.key === "replies";
    if (isBoth)     return c.key === "activity" || c.key === "survey";
    return true;                     // למסנן "all"
  });

return (
  <div style={{ direction: "rtl" }}>
    {CATS.map(cat => (
      <div key={cat.key} style={{ marginBottom: 4 }}>

        {/* כותרת קטגוריה – רק כש-collapsible=true */}
        {collapsible && (
          <button
            onClick={() => toggle(cat.key)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              textAlign: "right",
              direction: "rtl",
              padding: 0,
            }}
          >
            {openCats[cat.key] ? "▼" : "▶"} {cat.label}
          </button>
        )}

        {/* הרשימה – אם collapsible=false פתוחה תמיד */}
        {(collapsible ? openCats[cat.key] : true) && (
          <ul
            style={{
              margin: "4px 0 0",
              padding: "0 16px 0 0",
              listStyle: "disc",
              direction: "rtl",
              textAlign: "right",
            }}
          >
            {(cat.names || []).map((name, i) => (
              <li key={i}>
                {name}
                {cat.dates?.[i] && " — " + formatDate(cat.dates[i])}
              </li>
            ))}
            {(!cat.names || cat.names.length === 0) && <li>אין נתונים</li>}
          </ul>
        )}
      </div>
    ))}
  </div>
);

}





export default function ManageUsersDesign({ users, filter, onFilterChange, manualUsers, setManualUsers, markDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [activeTab, setActiveTab] = useState("registered");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = UserService.getPhoneError(newPhone);
  const isPhoneValid = phoneError === null;
  const [firstTouched,    setFirstTouched]    = useState(false);
  const [lastTouched,     setLastTouched]     = useState(false);
  const isRepliesTab = filter === "replies";

  const showActions = ["all", "activity", "survey", "replies", "both"]
  .includes(filter); 
  console.log("filter:", filter, "activeTab:", activeTab, "showActions:", showActions);
 

  const isActivity  = filter === "activity";
  const isSurvey    = filter === "survey";
  const isBoth      = filter === "both";
  const [openRows, setOpenRows] = useState(new Set());
  const [editUser,  setEditUser]  = useState(null);
  const [openCats, setOpenCats] = useState({});
  const toggle = k => setOpenCats(p => ({ ...p, [k]: !p[k] }));
  const isReplies    = filter === "replies";
  const [showExport, setShowExport]   = useState(false);
  const [exportType, setExportType]   = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false); 
  const [userType, setUserType] = useState("");       // ← כבר יש בתצוגה אבל חסר בהגדרה
  const [address, setAddress] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const showPlus = ["replies", "survey", "activity"].includes(filter);

  const isFirstValid = newFirstName.trim().length > 0;
  const isLastValid  = newLastName.trim().length > 0;
  const isTypeValid  = userType !== "";

  const [allUsers, setAllUsers] = useState([]);

  

  async function handleAddUser() {
    if (!isFirstValid || !isLastValid || !isPhoneValid || !isTypeValid) return;

    const full = `${newFirstName.trim()} ${newLastName.trim()}`.trim();
    const phone   = newPhone.replace(/\D/g, "");      // רק ספרות
    const userRef = doc(db, "users", phone); 

    try{
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        alert("מספר הטלפון הזה כבר קיים במערכת ❗");
        return; // או throw Error כדי לטפל במקום אחר
      }

      const newUser = {
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        fullname: full,
        phone: newPhone.trim(),
        user_id: phone,
        is_registered: userType === "registered",
        is_club_60:    userType === "senior",
        address: address.trim() || null,
        id_number: idNumber.trim() || null,
        notes: notes.trim() || null,

        activities: [],
        activities_date: [],
        survey: [],
        survey_date: [],
        replies: [],
        replies_date: []
      };
      await setDoc(userRef, newUser);

      const snapAll = await getDocs(collection(db, "users"));
      setAllUsers(snapAll.docs.map(d => ({ id: d.id, ...d.data() })));
      // // const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // setAllUsers(all);
      setShowModal(false); // סגירת חלון
      setNewFirstName(""); setNewLastName(""); setNewPhone("");
      setUserType(""); setAddress(""); setIdNumber(""); setNotes("");

      // add the user to the authentication list
      const { email, password } = generateEmailPassword (newPhone.trim()); // Generating the email and password of the auth of the user.

      await createUserWithEmailAndPassword(auth, email, password);  //Creating the auth user with the generated email and password.

      alert("המשתמש נוסף בהצלחה!"); // הודעת הצלחה
      console.log("משתמש נוסף:", newUser);
    } catch (e) {
        console.error("שגיאה בהוספה:", e);
        alert("אירעה שגיאה בהוספת המשתמש");
    }
  }



  function toggleSelect(user) {                 // ← מקבל את כל האובייקט
    const id = ensureUserId(user);              // ← מזהה קבוע ואחיד
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function selectAllRows(checked) {
    setSelected(
      checked
        ? new Set(rowsToShow.map(r => ensureUserId(r.user)))
        : new Set()
    );
  }

  function toggleSelectMode() {
    setSelectMode(p => {
      if (p) setSelected(new Set());   // ניקוי בחזרה למצב רגיל
      return !p;
    });
  }

  /* מחיקה מרוכזת  */
  async function deleteSelected() {
    if (selected.size === 0) return;

    const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק את *כל* המשתמשים שנבחרו?");
    if (!confirmed) return;

    const promises = [];

    for (const id of selected) {
      const u = allUsers.find(x => ensureUserId(x) === id);
      if (u) {
        promises.push(deleteUserCore(u)); // רק מחיקה, בלי חלונות
      }
    }

  await Promise.all(promises);     // מחכה שכולם יימחקו
  setSelected(new Set());          // מנקה את הבחירה

  // ריענון הרשימה מה־DB
  const fresh = await getDocs(collection(db, "users"));
  setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));

  // רק אחרי שהכול הסתיים → הודעה
  alert("המשתמשים נמחקו בהצלחה");
  }


    /* ----------------------------------------------------------
    פונקציה שמקבלת "registered" | "senior" | "all" ומייצרת Excel
  -----------------------------------------------------------*/
  function exportToExcel(type = "all") {
    // ➊ מסננים
    const data = allUsers.filter(u => {
      if (type === "registered") return u.is_registered && !u.is_club_60;
      if (type === "senior")     return u.is_club_60;
      return true;               // all
    });

    if (data.length === 0) {
      alert("אין נתונים לייצוא");
      return;
    }

    // ➋ בונים מערך אובייקטים "שטוח" – רק העמודות שרוצים בגליון
    const rows = data.map(u => ({
      "שם פרטי"  : u.first_name  || "",
      "שם משפחה" : u.last_name   || "",
      "שם מלא"   : u.fullname    || `${u.first_name||""} ${u.last_name||""}`.trim(),
      "טלפון"     : u.phone       || "",
      "רשום?"     : u.is_registered ? "כן" : "לא",
      "חבר 60+"   : u.is_club_60    ? "כן" : "לא",
      "פעילויות"  : Array.isArray(u.activities) ? u.activities.length : 0,
      "סקרים"     : Array.isArray(u.survey)     ? u.survey.length     : 0,
      "תגובות"    : Array.isArray(u.replies)    ? u.replies.length    : 0,
    }));

    // ➌ SheetJS: ממירים ל-worksheet ול-workbook
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // ➍ כותבים כ-Blob ושומרים
    const wbBlob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileName =
      type === "registered" ? "משתמשים_רשומים.xlsx" :
      type === "senior"     ? "חברי_60+.xlsx"       :
                              "כל_המשתמשים.xlsx";

    saveAs(
      new Blob([wbBlob], { type: "application/octet-stream" }),
      fileName
    );
  }


  const requests = useMemo(
  () => allUsers.filter(u => !u.is_registered && !u.is_club_60),
  [allUsers]
  );

  useEffect(() => {
    // טען את כל המשתמשים מאוסף users
    async function fetchUsers() {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllUsers(users);
    }
    fetchUsers();
  }, []);

  /* אחרי ה-useState של search וה-useEffect שמביא users … */
  useEffect(() => {
    const t = search.trim().toLowerCase();
    if (!t) return;                     // אם החיפוש ריק – לא עושים כלום

    /* האם נמצאה התאמה אצל רשומים? אצל 60+? */
    let foundRegistered = false;
    let foundSenior     = false;

    for (const u of allUsers) {
      const match =
        (u.fullname  || "").toLowerCase().includes(t) ||
        (u.last_name || "").toLowerCase().includes(t) ||
        (u.phone     || "").includes(t);

      if (!match) continue;

      if (u.is_registered && !u.is_club_60) foundRegistered = true;
      if (u.is_club_60)                     foundSenior     = true;
    }

    

    /* אם יש התאמה רק ב-60+ → מעבר לטאב senior
      אם יש התאמה רק ברשומים → מעבר ל-registered
      (אם יש בשניהם – נשארים בטאב הנוכחי) */
    if (foundSenior && !foundRegistered && activeTab !== "senior") {
      setActiveTab("senior");
    } else if (foundRegistered && !foundSenior && activeTab !== "registered") {
      setActiveTab("registered");
    }
  }, [search, allUsers, activeTab]);



  // פונקציה שבודקת אם משתמש מתאים ל־activeTab
  const matchesTab = u => {
      /* אם יש חיפוש – לא להגביל לפי הטאב */
    if (activeTab === "registered") return u.is_registered && !u.is_club_60;
    if (activeTab === "senior")     return u.is_club_60;
    return true; // all
  }

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) return;          // אין חיפוש → לא משנים טאב

    // האם יש התאמה בטאב הרשומים?
    const foundRegistered = allUsers.some(u =>
      u.is_registered && !u.is_club_60 &&
      (
        (u.fullname  || "").toLowerCase().includes(term) ||
        (u.last_name || "").toLowerCase().includes(term) ||
        (u.phone     || "").includes(term)
      )
    );

    // האם יש התאמה בטאב 60+?
    const foundSenior = allUsers.some(u =>
      u.is_club_60 &&
      (
        (u.fullname  || "").toLowerCase().includes(term) ||
        (u.last_name || "").toLowerCase().includes(term) ||
        (u.phone     || "").includes(term)
      )
    );

    /* אם אני בטאב רשומים ואין בו תוצאות אבל יש ב-60+ → עבור לטאב senior */
    if (activeTab === "registered" && !foundRegistered && foundSenior) {
      setActiveTab("senior");
    }

    /* להפך – אם אני ב-senior ואין בו תוצאות אך יש ברשומים */
    if (activeTab === "senior" && !foundSenior && foundRegistered) {
      setActiveTab("registered");
    }
  }, [search, allUsers, activeTab]);



  // מפותחים מערכי שורות של פעילויות וסקרים
  /* ♦ פעילויות – משתמש + כמות */
  const rowsActivities = allUsers
    .filter(u => Array.isArray(u.activities) && u.activities.length > 0)
    .filter(matchesTab)
    .map(u => ({
      user:  u,
      count: u.activities.length,
    }));

  /* ♦ סקרים – משתמש + כמות */
  const rowsSurveys = allUsers
    .filter(u => Array.isArray(u.survey) && u.survey.length > 0)
    .filter(matchesTab)
    .map(u => ({
      user:  u,
      count: u.survey.length,
    }));

  const rowsAll = allUsers.filter(u => {
    if (activeTab === "registered") return u.is_registered && !u.is_club_60;
    if (activeTab === "senior")     return u.is_club_60;
    return true;
  });

  /* ♦ תגובות – משתמש + כמות */
  const rowsReplies = allUsers
    .filter(u => Array.isArray(u.replies) && u.replies.length > 0)
    .filter(matchesTab)
    .map(u => ({
      user:  u,
      count: u.replies.length,
    }));

  // 2) מאחד לכל entry את ה־shape { user }
  const rowsAllWithShape = rowsAll.map(u => ({ user: u }));


  // const isRepliesTab = filter === "replies";
  // const rowsToShow = isRepliesTab ? rowsReplies : rowsAll;

  // על־פי ה־filter נקבע מה להציג
  let rowsToShow = [];
  if (filter === "activity") rowsToShow = rowsActivities;
  else if (filter === "replies") rowsToShow = rowsReplies;
  else if (filter === "survey")   rowsToShow = rowsSurveys;
  else if (filter === "both")     rowsToShow = [...rowsActivities, ...rowsSurveys]
    .sort((a, b) => {
      const dateA = a.activityDate || a.surveyDate;
      const dateB = b.activityDate || b.surveyDate;
      return new Date(dateB) - new Date(dateA);
    });
  else if (filter === "replies")  rowsToShow = rowsReplies;
  else                             rowsToShow = rowsAllWithShape;

  const term = search.trim().toLowerCase();
  if (term) {
    rowsToShow = rowsToShow.filter(r => {
      const u = r.user;
      return (
        (u.fullname  || "").toLowerCase().includes(term) ||
        (u.last_name || "").toLowerCase().includes(term) ||
        (u.phone     || "").includes(term)
      );
    });
  }

  /* ------------------------------------------------------------------
    ✂️  מחיקת משתמש אחד – מסירים אותו מכל האוספים הרלוונטיים
  -------------------------------------------------------------------*/

  /* ✦✦ 1.  מחיקה "שקטה" של משתמש יחיד  ✦✦
  - בלי window.confirm ו-alert, אבל עם כל לוגיקת המחיקה וה-state  */
  async function deleteUserSilent(user) {
    const phone   = user.phone || "";
    const user_id = ensureUserId(user);

    /* users (המסמך הראשי) */
    try {
      await deleteDoc(doc(db, "users", user_id));
    } catch (err) {
      console.error("⚠️  users delete failed:", err);
    }

    /* activityRegistrations / surveyResponses */
    const COLL = [
      { path: "activityRegistrations", field: ["phone", phone] },
      { path: "surveyResponses",       field: ["phone", phone] }
    ];
    for (const { path, field } of COLL) {
      const [f, val] = field;
      const snap = await getDocs(query(collection(db, path), where(f, "==", val)));
      for (const d of snap.docs) await deleteDoc(d.ref).catch(e => console.error(`⚠️  ${path}`, e));
    }

    /* replies */
    const msgs = await getDocs(collection(db, "messages"));
    for (const m of msgs.docs) {
      const q = query(collection(db, "messages", m.id, "replies"), where("phone", "==", phone));
      const reps = await getDocs(q);
      for (const r of reps.docs) await deleteDoc(r.ref).catch(e => console.error("⚠️  reply", e));
    }

    /* עדכון סטייטים מקומיים */
    setManualUsers(prev => prev.filter(u => u.phone !== phone));
    markDeleted(phone);
  }

  /* ✦✦ 2.  מחיקת-קבוצה חדשה  ✦✦ */
  async function deleteSelected() {
    if (selected.size === 0) return;

    const confirmed = window.confirm("האם אתה בטוח שאתה רוצה למחוק את כל המשתמשים?");
    if (!confirmed) return;

    const promises = [];
    const phones   = [];

    for (const id of selected) {
      const u = allUsers.find(x => ensureUserId(x) === id);
      if (u) {
        phones.push(u.phone);
        promises.push(deleteUserSilent(u));   // ← בלי חלונות דיאלוג
      }
    }

    await Promise.all(promises);              // מחכים שכל המחיקות יסתיימו
    setSelected(new Set());                   // איפוס הבחירה

    // ריענון הרשימה פעם אחת בלבד
    const fresh = await getDocs(collection(db, "users"));
    setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));

    alert("המשתמשים נמחקו בהצלחה");
  }


  async function deleteUserCore(user) {

      const phone   = user.phone || "";
      const user_id = ensureUserId(user);

      /* 1. users (המסמך הראשי) */
      try {
        await deleteDoc(doc(db, "users", user_id));
      } catch (err) {
        console.error("⚠️  users delete failed:", err);
      }

      /* 2. activityRegistrations / surveyResponses */
      const COLL = [
        { path: "activityRegistrations", field: ["phone", phone] },
        { path: "surveyResponses",       field: ["phone", phone] }
      ];

      for (const { path, field } of COLL) {
        const [f, val] = field;
        const snap = await getDocs(query(collection(db, path), where(f, "==", val)));
        for (const d of snap.docs) {
          try { await deleteDoc(d.ref); }
          catch (e) { console.error(`⚠️  ${path} delete`, e); }
        }
      }

      /* 3. replies – תת-אוסף messages/<msg>/replies */
      const msgs = await getDocs(collection(db, "messages"));
      for (const m of msgs.docs) {
        const q = query(
          collection(db, "messages", m.id, "replies"),
          where("phone", "==", phone)
        );
        const reps = await getDocs(q);
        for (const r of reps.docs) {
          try { await deleteDoc(r.ref); }
          catch (e) { console.error("⚠️  reply delete", e); }
        }
      }

      /* 4. 🟢   עדכון ה-state המקומי + ריענון מהרשימה המלאה  */
      setManualUsers(prev => prev.filter(u => u.phone !== phone));
      markDeleted(phone);

      const fresh = await getDocs(collection(db, "users"));
      setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));

      alert("המשתמש נמחק בהצלחה");
  }

  async function deleteUser(user) {
      const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה?");
      if (!confirmed) return;

      await deleteUserCore(user);
  }





  /** מעדכן שם משתמש בכל האוספים הרלוונטיים */
  async function saveEditedUser(u) {
    const firstName = u.first_name?.trim() || "";
    const lastName  = u.last_name?.trim()  || "";
    const phone     = u.phone?.trim()      || "";
    const fullName  = `${firstName} ${lastName}`.trim();

    // ✅ בדיקת שדות חובה
    if (!firstName || !lastName || !phone) {
      alert("שם פרטי, שם משפחה ומספר טלפון הם שדות חובה. נא למלא את כולם.");
      return;
    }

    const oldUserId = u.id || u.user_id;
    const docId = phone.trim(); 

    const updatedUser = {
      first_name: firstName,
      last_name : lastName,
      fullname  : fullName,
      phone,
      address   : u.address?.trim()    || null,
      id_number : u.id_number?.trim()  || null,
      notes     : u.notes?.trim()      || null,
      user_id   : newUserId,
      is_registered: u.is_registered || false,
      is_club_60   : u.is_club_60    || false
    };

    // 🟡 אם Document ID השתנה → העתק ומחק
    if (oldUserId !== newUserId) {
      const oldRef = doc(db, "users", oldUserId);
      const newRef = doc(db, "users", newUserId);
      await setDoc(newRef, updatedUser);
      await deleteDoc(oldRef);
    } else {
      const ref = doc(db, "users", oldUserId);
      await updateDoc(ref, updatedUser);
    }

    // 🟢 עדכון activityRegistrations + surveyResponses לפי טלפון
    const coll = ["activityRegistrations", "surveyResponses"];
    for (const name of coll) {
      const q = query(collection(db, name), where("phone", "==", phone));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(d.ref, {
          first_name: firstName,
          last_name: lastName,
          fullname: fullName,
        });
      }
    }

    // 🔵 עדכון בתשובות להודעות
    const msgs = await getDocs(collection(db, "messages"));
    for (const m of msgs.docs) {
      const q = query(
        collection(db, "messages", m.id, "replies"),
        where("phone", "==", phone)
      );
      const reps = await getDocs(q);
      for (const r of reps.docs) {
        await updateDoc(r.ref, { fullName });
      }
    }

    // 🔄 עדכון ה־state
    setAllUsers(prev =>
      prev.map(p =>
        (p.id === oldUserId || p.user_id === oldUserId)
          ? { ...updatedUser, id: newUserId }
          : p
      )
    );

    setEditUser(null);
    alert("הפרטים עודכנו בהצלחה");
  }

  async function updateUserType(user, newType) {
    const is_registered = newType === "registered";
    const is_club_60    = newType === "senior";

    const userId = user.id || user.user_id;
    const docRef = doc(db, "users", userId);

    try {
      await updateDoc(docRef, {
        is_registered,
        is_club_60,
      });

      setAllUsers(prev =>
        prev.map(u =>
          (u.id === userId || u.user_id === userId)
            ? { ...u, is_registered, is_club_60 }
            : u
        )
      );
    } catch (error) {
      console.error("שגיאה בעדכון סוג המשתמש:", error);
      alert("אירעה שגיאה בעדכון סוג המשתמש");
    }
  }




  async function acknowledgeRow(row, type) {
    const u        = row.user;
    const userId   = ensureUserId(u);
    const docRef   = doc(db, "users", userId);
    // בואי נקרא קודם את המסמך
    const snap     = await getDocs(query(collection(db, "users"), where("user_id", "==", userId)));
    if (snap.empty) return;
    const data     = snap.docs[0].data();

    // בונים מערכים חדשים בלי הפריט הזה
    let newActivities     = data.activities     || [];
    let newActivitiesDate = data.activities_date|| [];
    let newSurvey         = data.survey         || [];
    let newSurveyDate     = data.survey_date    || [];
    let newReplies        = data.replies        || [];
    let newRepliesDate    = data.replies_date   || [];

    if (type === "activity") {
      const idx = newActivities.findIndex((a,i) => a === row.activityName && newActivitiesDate[i] === row.activityDate);
      if (idx >= 0) {
        newActivities.splice(idx, 1);
        newActivitiesDate.splice(idx, 1);
      }
    }
    else if (type === "survey") {
      const idx = newSurvey.findIndex((s,i) => s === row.surveyName && newSurveyDate[i] === row.surveyDate);
      if (idx >= 0) {
        newSurvey.splice(idx,1);
        newSurveyDate.splice(idx,1);
      }
    }
    else if (type === "replies") {
      const idx = newReplies.findIndex((t,i) => t === row.title && newRepliesDate[i] === row.date);
      if (idx >= 0) {
        newReplies.splice(idx,1);
        newRepliesDate.splice(idx,1);
      }
    }

    // תריץ עדכון ב־Firestore
    await updateDoc(docRef, {
      activities:      newActivities,
      activities_date: newActivitiesDate,
      survey:          newSurvey,
      survey_date:     newSurveyDate,
      replies:         newReplies,
      replies_date:    newRepliesDate
    });

    // ועדכון state כדי להעלי המסך
    setAllUsers(prev =>
      prev.map(u0 =>
        ensureUserId(u0) === userId
          ? { ...u0,
              activities:      newActivities,
              activities_date: newActivitiesDate,
              survey:          newSurvey,
              survey_date:     newSurveyDate,
              replies:         newReplies,
              replies_date:    newRepliesDate }
          : u0
      )
    );
  }


  <button
      style={{ border:"none", background:"transparent", cursor:"pointer" }}
      onClick={() => toggleRow(u.user_id)}
    >
      ⋯ 
    </button>

      function toggleRow(id, cat = "all") {
        const key = `${id}|${cat}`;
        setOpenRows(prev => {
          const s = new Set(prev);
          s.has(key) ? s.delete(key) : s.add(key);
          return s;
        });
        }



  return (
    <>
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: 4 }}>
    {/* ◄◄ שורת הכותרת + ייצוא ►► */}
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      width:"100%",
      marginBottom:30    // רווח לפני שאר הבקרות
    }}>
      {/* כותרת מימין (RTL) */}
      {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 2 }}> */}

      <Typography variant="h4" component="h1">
        ניהול משתמשים
      </Typography>
            

      {/* כפתור ייצוא בצד שמאל */}
      <Button
        variant="outlined"
        onClick={() => setShowExport(true)}
        sx={{ fontWeight:"bold" }}
      >
        ייצוא ל- Excel
      </Button>
      {/* </Box> */}

    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16        // ← הרווח שאת מבקשת
      }}
    ></div>


      <label style={{ display:"flex", alignItems:"center", gap:8, marginTop: 16 }}>
        חיפוש:
        <input
          type="text"
          placeholder="שם / משפחה / טלפון"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding:"4px 8px",
            borderRadius:4,
            border:"1px solid #ccc",
            width:180
          }}
        />
      </label>
      
    


      {/* ----------------------------------------
          השורה הזו תופיע *מעל* הטבלה, במרכז
      ------------------------------------------*/}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 16,
          height: "40px",
          marginTop: 16,
        }}
        >

          {/* 1. Add User בצד שמאל */}
           {/* ❶ “בחר” + “הוסף משתמש” צמודים – הכי שמאלי = הוסף */}
        <div style={{ display: "flex", gap: 4 }}>
        </div>

        
        {/* SHOW בצד ימין */}
        <label
          style={{
            position: "absolute",
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,

          }}
        >
          הצג:
          <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
            <option value="all">כל המשתמשים</option>
            <option value="activity">נרשמים</option>
            <option value="survey">סקרים</option>
            <option value="replies">תגובות</option>
            <option value="both">פעילות + סקר</option>
          </select>
        </label>

        {/* טאבים במרכז */}

        
        <div
          style={{
            display: "inline-flex",
            borderRadius: 9999,
            backgroundColor: "#eee",
            padding: 4,
          }}
        >

          <button
            onClick={() => setActiveTab("registered")}
            style={{ ...tabStyle, ...(activeTab === "registered" ? activeTabStyle : {}) }}
          >
            משתמשים רשומים
          </button>
          <button
            onClick={() => setActiveTab("senior")}
            style={{ ...tabStyle, ...(activeTab === "senior" ? activeTabStyle : {}) }}
          >
            חברי מרכז ה-60+ 
          </button>

        </div>


          {/* Add User Button */}
        {/* Add User Button */}


  {/* כפתור הוספה + בחר + מחק נבחרים */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={toggleSelectMode}
        style={{ ...actionButtonStyle }}
      >
        {selectMode ? "בטל בחירה" : "בחר"}
      </button>

      {selectMode && (
        <button
          onClick={deleteSelected}
          disabled={selected.size === 0}
          style={{
            ...deleteButtonStyle,
            opacity: selected.size ? 1 : 0.4,
            cursor: selected.size ? "pointer" : "not-allowed",
          }}
        >
          מחק נבחרים
        </button>
      )}

      <button onClick={() => setShowModal(true)}>הוסף משתמש</button>
    </div>
    </div>




      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          border: "1px solid #ccc",
          padding: 20,
          zIndex: 9999,
          boxShadow: "0 0 20px rgba(0,0,0,0.2)"
        }}>

          <button
            onClick={() => setShowModal(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer"
            }}
            aria-label="סגור"
          >
            ×
          </button>

          <h2>הוספת משתמש</h2>


          <div style={{ marginBottom: 12 }}>
            <label>
              שם פרטי:
              <input
                type="text"
                value={newFirstName}
                onChange={e => {
                setNewFirstName(e.target.value);
                setFirstTouched(true);
              }}
     onBlur={() => setFirstTouched(true)}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />
            </label>
            {firstTouched && !isFirstValid && (
              <div style={{ color: "red", marginTop: 4 }}>יש להזין שם פרטי</div>
            )}

          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              שם משפחה:
              <input
                type="text"
                value={newLastName}
                 onChange={e => {
                setNewLastName(e.target.value);
                setLastTouched(true);
              }}
              onBlur={() => setLastTouched(true)}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />
            </label>
            {lastTouched && !isLastValid && (
              <div style={{ color: "red", marginTop: 4 }}>יש להזין שם משפחה</div>
            )}

          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              מספר טלפון:
              <input
                type="text"
                value={newPhone}
                onChange={e => {
                setNewPhone(e.target.value);
                setPhoneTouched(true);
              }}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />


              {phoneTouched && phoneError && (
              <div style={{ color: "red", marginTop: 4 }}>
                 {phoneError}
              </div>
             )}
            </label>
          </div>

          
          <div style={{ marginBottom: 12 }}>
            <label>
              תעודת זהות:
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
          <label>
            כתובת:
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
        </div>


          <div style={{ marginBottom: 12 }}>
            <label>
              הערות:
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />
            </label>
          </div>


          <div style={{ marginBottom: 12 }}>
          <label>
            סוג משתמש:
            <select
              value={userType}
              onChange={e => setUserType(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4 }}
            >
              <option value="" disabled>בחר סוג משתמש</option>
              <option value="registered">משתמש רשום</option>
              <option value="senior">חברי מרכז ה־60 פלוס</option>
            </select>
          </label>
        </div>


           <button
            onClick={handleAddUser}
            disabled={!isPhoneValid || !isFirstValid || !isLastValid || !isTypeValid}
            style={{
              ...actionButtonStyle,
              opacity:  isPhoneValid ? 1 : 0.5,
              cursor:  isPhoneValid ? "pointer" : "not-allowed",
            }}
          >
            הוספה
          </button>
          

        </div>
                 
      )}




{/* Users table */}
<table style={{ width: "100%", borderCollapse: "collapse" }}>
  <thead>
    <tr>
      {/* עמודת “בחר-הכול” מוצגת רק במצב selectMode */}
      {selectMode && (
        <th style={th}>
          <input
            type="checkbox"
            checked={selected.size === rowsToShow.length && rowsToShow.length > 0}
            ref={el => {
              if (el)
                el.indeterminate =
                  selected.size > 0 && selected.size < rowsToShow.length;
            }}
            onChange={e => selectAllRows(e.target.checked)}
          />
        </th>
      )}
      <th style={th}>שם מלא</th>
      <th style={th}>מספר טלפון</th>
      <th style={th}>תעודת זהות</th>
      <th style={th}>כתובת</th>
      <th style={th}>הערות</th>



      {filter === "activity" && <th style={th}>כמות פעילויות</th>}
      {filter === "survey"   && <th style={th}>כמות סקרים</th>}
      {filter === "replies"  && <th style={th}>כמות תגובות</th>}
      {filter === "both"     && <th style={th}>פעילויות / סקרים</th>}

      
      <th style={th}>פעולות</th>
    </tr>
  </thead>
<tbody>
  {rowsToShow.map((row /* , idx */) => {
    const u = row.user;
    const checked = selected.has(ensureUserId(u));

  return (
    <React.Fragment key={ensureUserId(u)}>
      {/* ───── ① שורה ראשית ───── */}
      <tr>
        {/* Check-box – רק במצב selectMode */}
        {selectMode && (
          <td style={td}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleSelect(u)}
            />

          </td>
        )}

        {/* שם מלא + ⋯ (⋯ מוצג רק במסנן all) */}
        <td>
          {filter === "all" && (
            <button
              style={{ border: "none", background: "transparent", cursor: "pointer" }}
              onClick={() => toggleRow(u.user_id)}
            >
              ⋯
            </button>
          )}
          {u.fullname}
        </td>

        {/* טלפון */}
        <td style={td}>{u.phone}</td>
        <td style={td}>{u.id_number || ""}</td>
        <td style={td}>{u.address || ""}</td>
        <td style={td}>{u.notes || ""}</td>

        {isActivity && (
          <td
            onClick={() => toggleRow(u.user_id, "activity")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {row.count}
            {showPlus && <span style={plusStyle}>➕</span>}
          </td>
        )}

        {isSurvey && (
          <td
            onClick={() => toggleRow(u.user_id, "survey")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {row.count}
            {showPlus && <span style={plusStyle}>➕</span>}
          </td>
        )}

        {isReplies && (
          <td
            onClick={() => toggleRow(u.user_id, "replies")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {row.count}
            {showPlus && <span style={plusStyle}>➕</span>}
          </td>
        )}


        {isBoth && (
          <>
            <td style={{ cursor: "pointer" }}
                onClick={() => toggleRow(u.user_id, "activity")}>
              ➕ {u.activities?.length || 0}
            </td>
            <td style={{ cursor: "pointer" }}
                onClick={() => toggleRow(u.user_id, "survey")}>
              ➕ {u.survey?.length || 0}
            </td>
          </>
        )}

        {filter === "both"    && (
          <td>{(u.activities?.length || 0) + 1} / {(u.survey?.length || 0) + 1}</td>
        )}
      
          <td style={{ ...td, position: "relative" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <IconButton
                size="small"
                title="עריכת שם"
                onClick={() => setEditUser(u)}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              {activeTab === "registered" && (
                <button
                  type="button"
                  style={actionButtonStyle}
                  onClick={() => updateUserType(u, "senior")}
                >
                  הוסף לחברי מרכז ה-60+
                </button>
              )}

              {activeTab === "senior" && (
                <button
                  type="button"
                  style={actionButtonStyle}
                  onClick={() => updateUserType(u, "registered")}
                >
                  הוסף לרשומים
                </button>
              )}

              <button
                type="button"
                style={deleteButtonStyle}
                onClick={() => deleteUser(u)}
              >
                מחק
              </button>
            </div>
          </td>

      </tr>

      {/* ───── ② שורת-פירוט מתקפלת ───── */}
      {Array.from(openRows).some(k => k.startsWith(u.user_id)) && (
        <tr style={{ background: "#fafafa" }}>
          {/* תא ריק לשמירת יישור אם selectMode פעיל */}
          {selectMode && <td></td>}
          {/* תא ריק מתחת לעמודת השם */}
          <td></td>

          <td
            colSpan={1}
            style={{ padding: "4px 8px" }}
          >
            <UserDetails
              user={u}
              filter={
                isBoth
                  ? (openRows.has(`${u.user_id}|activity`) ? "activity"
                    : openRows.has(`${u.user_id}|survey`) ? "survey"
                    : filter)
                  : filter
              }
              collapsible={["both","all"].includes(filter)} // ◄◄ רק כשהמסנן מציג 2-קטגוריות
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
})}
</tbody>
        </table>

        {/* ✦✦ דיאלוג ייצוא ✦✦ */}
        <Dialog open={showExport} onClose={() => setShowExport(false)} maxWidth="xs" fullWidth>
          <DialogTitle>ייצוא משתמשים</DialogTitle>
          <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2 }}>
            <label>
              בחר קבוצה:
              <select
                value={exportType}
                onChange={e => setExportType(e.target.value)}
                style={{ display:"block", width:"100%", marginTop:8 }}
              >
                <option value="all">כל המשתמשים</option>
                <option value="registered">משתמשים רשומים</option>
                <option value="senior">חברי מרכז 60+</option>
              </select>
            </label>

            <Button
              variant="contained" 
              onClick={() => {
                exportToExcel(exportType);
                setShowExport(false);
              }}
            >
             
              ייצוא  
            </Button>
          </DialogContent>
        </Dialog>


        {/* ✎ Modal עריכת שם */}
{editUser && (
  <Dialog open onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
    <DialogTitle>עריכת משתמש</DialogTitle>
    <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2, mt:1 }}>
      <TextField
        label="שם פרטי"
        defaultValue={editUser.first_name}
        onChange={e => editUser.first_name = e.target.value}
        fullWidth
      />
      <TextField
        label="שם משפחה"
        defaultValue={editUser.last_name}
        onChange={e => editUser.last_name = e.target.value}
        fullWidth
      />
      <TextField
        label="מספר טלפון"
        defaultValue={editUser.phone}
        onChange={e => editUser.phone = e.target.value}
        fullWidth
      />
      <TextField
        label="תעודת זהות"
        defaultValue={editUser.id_number}
        onChange={e => editUser.id_number = e.target.value}
        fullWidth
      />
      <TextField
        label="כתובת"
        defaultValue={editUser.address}
        onChange={e => editUser.address = e.target.value}
        fullWidth
      />
        <TextField
        label="הערות"
        defaultValue={editUser.notes}
        onChange={e => editUser.notes = e.target.value}
        fullWidth
      />
      <Button
        variant="contained"
        onClick={() => saveEditedUser(editUser)}
      >
        שמירה
      </Button>
    </DialogContent>
  </Dialog>
)}

     </Box>
        </>
  ); 
}

const th = {
  border: "1px solid #ccc",
  padding: "8px",
  backgroundColor: "#f5f5f5",
  textAlign: "right",    // יישור לימין
};

const td = {
  border: "1px solid #eee",
  padding: "8px",
  textAlign: "right",    // יישור לימין
};

const tabContainerStyle = {
  display: "inline-flex",
  borderRadius: "9999px",
  backgroundColor: "#eee",
  padding: "4px"
};

const tabStyle = {
  border: "none",
  backgroundColor: "transparent",
  padding: "8px 16px",
  borderRadius: "9999px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "#555"
};

const activeTabStyle = {
  backgroundColor: "#007bff",
  color: "white"
};

const actionButtonStyle = {
  fontSize: "12px",
  padding: "4px 8px",
  borderRadius: "4px",
  border: "1px solid #007bff",
  backgroundColor: "white",
  color: "#007bff",
  cursor: "pointer",
};
const deleteButtonStyle = {
  ...actionButtonStyle,
  border: "1px solid #dc3545",
  color: "#dc3545",
};

const plusBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#7b35ff",
  fontSize: "18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 4,
};

  // מחוץ ל-render
const plusStyle = {
  marginInlineStart: 4,
  color: "#7b35ff",
  fontWeight: "bold",
};