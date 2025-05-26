import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc
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
function UserDetails({ user, filter }) {
  const [openCats, setOpenCats] = useState({});         // {activity:true …}

  /** פתיחה/סגירה של קטגוריה */
  const toggle = (cat) => setOpenCats(p => ({ ...p, [cat]: !p[cat] }));

  /** אילו קטגוריות להציג לפי המסנן הכללי */
  const CATS = [
    { key: "activity", label: "פעילויות", names: user.activities, dates: user.activities_date },
    { key: "survey",   label: "סקרים",     names: user.survey,     dates: user.survey_date    },
    { key: "replies",  label: "הודעות",   names: user.replies,    dates: user.replies_date   },
  ]; 

  return (
    <div style={{ direction: "rtl" }}>
      {CATS.map(cat => (
        <div key={cat.key} style={{ marginBottom: 4 }}>
          {/* כותרת קטגוריה (▶ / ▼) */}
          <button
            onClick={() => toggle(cat.key)}
            style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            {openCats[cat.key] ? "▼" : "▶"} {cat.label}
          </button>

          {/* רשימת פריטים */}
          {openCats[cat.key] && (
            <ul style={{ margin: "4px 0 0 0", padding: "0 0 0 16px", listStyle: "disc" }}>
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
  const [showRequests,  setShowRequests]  = useState(false); 
  const [openRows, setOpenRows] = useState(new Set());
  const [editUser,  setEditUser]  = useState(null);


  const [allUsers, setAllUsers] = useState([]);

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


   // פונקציה שבודקת אם משתמש מתאים ל־activeTab
  const matchesTab = u => {
    if (activeTab === "registered")   return u.is_registered && !u.is_club_60;
    if (activeTab === "senior")       return u.is_club_60;
    return true; // all
  }


    // מפותחים מערכי שורות של פעילויות וסקרים
  const rowsActivities = allUsers
    .flatMap(u => {
      if (!Array.isArray(u.activities)) return [];
      return u.activities.map((activityName, idx) => ({
        user:         u,
        activityName,
        activityDate: u.activities_date?.[idx] ?? ""
      }));
    })

    // סינון לפי הסוג (registered/senior/unregistered)
    .filter(row => matchesTab(row.user))

    // מיון לפי תאריך מהחדש לישן
    .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));

  const rowsSurveys = allUsers
    .flatMap(u => {
      if (!Array.isArray(u.survey)) return [];
      return u.survey.map((surveyName, idx) => ({
        user:       u,
        surveyName,
        surveyDate: u.survey_date?.[idx] ?? ""
      }));
    })

      // סינון לפי הסוג
    .filter(row => matchesTab(row.user))
    .sort((a, b) => new Date(b.surveyDate) - new Date(a.surveyDate));

  const rowsAll = allUsers.filter(u => {
   if (activeTab === "registered")  return u.is_registered && !u.is_club_60;
   if (activeTab === "senior")      return u.is_club_60;
   return true;
 });

 // 2) מאחד לכל entry את ה־shape { user }
 const rowsAllWithShape = rowsAll.map(u => ({ user: u }));

 const rowsReplies = allUsers
    .flatMap(u => {
    if (!u.replies) return [];
  // אם replies הוא כבר מערך – השתמש בו, אחרת פרק מחרוזת
  const titles = Array.isArray(u.replies)
    ? u.replies
    : (typeof u.replies === "string"
        ? u.replies.split(",")
        : []);

    const dates = Array.isArray(u.replies_date)
    ? u.replies_date
    : (typeof u.replies_date === "string"
        ? u.replies_date.split(",")
        : []);

    return titles.map((title, idx) => ({
      user: u,
      title,
      date: dates[idx] || ""
    }));
  })

   // 🟢 הוספת סינון לפי הטאב (registered/senior/unregistered)
    .filter(row => matchesTab(row.user))
    // 🟢 מיון מהחדש לישן
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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

 async function approveRequest(u) {
  // בטיחות – אם אין id ננסה ליפול ל-user_id
  const docId = u.id || u.user_id;
  if (!docId) return alert("לא נמצא מזהה למסמך");

  await updateDoc(doc(db, "users", docId), {
    is_registered: true,
    is_club_60:   false,
  });

  // עדכון ה-state המקומי כדי שה-UI יתחדש בלי רענון
  setAllUsers(prev =>
    prev.map(p => p.id === docId ? { ...p, is_registered: true } : p)
  );
}

async function hide(u) {
  const docId = u.id || u.user_id;
  if (!docId) return alert("לא נמצא מזהה למסמך");

  await deleteDoc(doc(db, "users", docId));

  // מסלק מה-state
  setAllUsers(prev => prev.filter(p => p.id !== docId));
}


   // שגיאות שם
  const firstError = !newFirstName.trim()
    ? "נא למלא את השם הפרטי"
    : !UserService.isValidName(newFirstName)
      ? "שם פרטי לא תקין"
      : null;
  const lastError = !newLastName.trim()
    ? "נא למלא את שם המשפחה"
    : !UserService.isValidName(newLastName)
      ? "שם משפחה לא תקין"
      : null;
  const isFirstValid = firstError === null;
  const isLastValid  = lastError  === null;

  

  const filteredUsers = users.filter(user => {
  if (activeTab === "registered") return user.is_registered && !user.is_club_60;
  if (activeTab === "senior") return user.is_club_60;
  if (activeTab === "unregistered") return !user.is_registered;
  return true;
});

  const [userType, setUserType] = useState("");

  const handleAddUser = async () => {
    if (!newFirstName.trim() || !newLastName.trim() || !newPhone.trim() || !userType) {
      alert("נא למלא את כל השדות");
      return;
    }

 // וידוא שהשם הפרטי ושם המשפחה תקינים
  if (firstError || lastError) {
    // מציג את השגיאה הרלוונטית
    alert(firstError || lastError);
    return;
  }


  const first = newFirstName.trim();
  const last  = newLastName.trim();
  const phone = newPhone.trim();

    // ➤ כאן בודקים תקינות טלפון
   if (!UserService.isValidPhone(phone)) {
    alert("המספר שהוקלד אינו תקין");
    return;
  }

  const isClub  = userType === "senior";
  const isReg   = userType === "registered" || isClub;
  const user_id = `${first}_${last}_${phone}`;

  const userData = {
    user_id,
    first_name: first,
    last_name: last,
    phone,
     fullname:   `${first} ${last}`, 
    is_registered: isReg,
    is_club_60: isClub,
    activities:      [],          // מערך ריק
     activities_date: [],          // מערך ריק
     survey:          [],  // עכשיו מערך
     survey_date:     [],   // מערך תאריכים
     replies:         [],          // מערך ריק
     replies_date:    [],          // מערך ריק
  };
  
  const exists = manualUsers.some(u =>
      u.user_id === user_id ||
      (u.first_name?.toLowerCase() === first.toLowerCase() &&
       u.last_name?.toLowerCase()  === last.toLowerCase()  &&
       u.phone === phone)
  );

if (exists) {
  alert("משתמש עם שם ומספר טלפון זהים כבר קיים");
  return;
}


  try {
    alert("המשתמש נוסף בהצלחה!");

     const docRef = doc(db, "users", user_id);
     await setDoc(docRef, userData, { merge: true });

     setAllUsers(prev => [
       ...prev,
       { id: user_id, ...userData }     // מוסיפים ל־allUsers
     ]);

    setNewFirstName("");
    setNewLastName("");
    setNewPhone("");
    setUserType("");
    setShowModal(false);
  } catch (err) {
    console.error("שגיאה בהוספת המשתמש:", err);
    alert("אירעה שגיאה בהוספת המשתמש");
  }
};

const updateUserType = async (user, newType) => {
  const isClub     = newType === "senior";
  const isReg = newType === "registered" || isClub;

  // ➊ פיצול שם מלא במקרה שאין first / last
  const fullRaw  = user.fullname || user.fullName || "";
  const parts    = fullRaw.trim().split(" ");
  const first    = user.first_name || parts[0] || "";
  const last     = user.last_name  || parts.slice(1).join(" ") || "";

  const user_id  = ensureUserId({ ...user, first_name: first, last_name: last });

  const baseData = {
    user_id,
    first_name: first,
    last_name : last,
    phone     : user.phone || "",
  };

  // --- חיפוש / יצירה ב-Firestore ---
  const q    = query(collection(db, "users"), where("user_id", "==", user_id));
  const snap = await getDocs(q);
  let docRef = snap.docs[0]?.ref;

  if (!docRef) {
    docRef = await addDoc(collection(db, "users"), {
      ...baseData,
      fullname: `${first} ${last}`.trim(),
      is_registered: isReg,
      is_club_60:    isClub,
    });
  } else {
    await updateDoc(docRef, {
      is_registered: isReg,
      is_club_60:    isClub,
    });
  }

    // 🟢 עדכון ה־local state של allUsers
  setAllUsers(prev =>
    prev.map(u =>
      ensureUserId(u) === user_id
        ? { ...u, is_registered: isReg, is_club_60: isClub }
        : u
    )
  );

    if (newType === "registered") {
    alert("המשתמש הועבר למשתמשים רשומים");
  } else if (newType === "senior") {
    alert("המשתמש נכנס לחברי מרכז ה-+60");
  }

  

  // --- עדכון ה-state המקומי ---
  setManualUsers(prev => {
    const idx   = prev.findIndex(p => p.user_id === user_id);
    const entry = {
      ...baseData,
      fullname: `${first} ${last}`.trim(),
      is_registered: isReg,
      is_club_60:   isClub,
    };
    if (idx === -1) return [...prev, entry];
    const clone = [...prev];
    clone[idx]  = entry;
    return clone;
  });
};


const deleteUser = async (user) => {
  const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה?");
  if (!confirmed) return;

  // if (!window.confirm("אתה בטוח שברצונך למחוק משתמש זה?")) return;

  const phone   = user.phone || "";
  const user_id = ensureUserId(user);

// 1. מוחקים משתמש מועודכן מכל האוספים הרגילים
const COLL = [
  { ref: collection(db,"users"),                 whereField: ["user_id", user_id] },
  { ref: collection(db,"activityRegistrations"), whereField: ["phone", phone] },
  { ref: collection(db,"surveyResponses"),       whereField: ["phone", phone] },
];

for (const { ref, whereField } of COLL) {
  const snap = await getDocs(query(ref, where(whereField[0], "==", whereField[1])));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
}

// 2. מוחקים replies בכל הודעה בלי Composite-Index
const messagesSnap = await getDocs(collection(db, "messages"));
for (const msgDoc of messagesSnap.docs) {
  const repliesRef = collection(db, "messages", msgDoc.id, "replies");
  const snap = await getDocs(query(repliesRef, where("phone", "==", phone)));
  for (const replyDoc of snap.docs) {
    await deleteDoc(replyDoc.ref);
  }
}


  // 🟢 עדכון ה־local state
  setManualUsers(prev => prev.filter(u => u.phone !== phone));
  setAllUsers(prev => prev.filter(u => ensureUserId(u) !== user_id));
  markDeleted(phone);
  alert("המשתמש נמחק בהצלחה");
};

/**
 * מוחקת את הפריט הספציפי (פעילות/סקר/תגובה) ממסמכי המשתמש
 * @param {Object} row — האובייקט { user, activityName?, surveyName?, title?, … }
 * @param {"activity"|"survey"|"replies"} type
 */

/** מעדכן שם משתמש בכל האוספים הרלוונטיים */
async function saveEditedUser(u) {
  const full  = `${u.first_name.trim()} ${u.last_name.trim()}`.trim();

  /* 1) users (המסמך הראשי) */
  await updateDoc(doc(db,"users", u.id || u.user_id), {
    first_name: u.first_name,
    last_name : u.last_name,
    fullname  : full,
  });

  /* 2) activityRegistrations / surveyResponses / replies */
  const phone = u.phone;
  const coll = [
    { ref: collection(db,"activityRegistrations") },
    { ref: collection(db,"surveyResponses")       },
  ];

  for (const {ref} of coll) {
    const snap = await getDocs(query(ref, where("phone","==",phone)));
    for (const d of snap.docs) {
      await updateDoc(d.ref, {
        first_name: u.first_name,
        last_name : u.last_name,
        fullname  : full,
      });
    }
  }

  /* 3) replies – תת-אוסף messages/<msg>/replies */
  const msgs = await getDocs(collection(db,"messages"));
  for (const m of msgs.docs) {
    const reps = await getDocs(
      query(collection(db,"messages",m.id,"replies"), where("phone","==",phone))
    );
    for (const r of reps.docs) {
      await updateDoc(r.ref,{ fullName: full });
    }
  }

  /* 4) עדכון state מקומי */
  setAllUsers(prev =>
    prev.map(p =>
      p.phone === phone
        ? { ...p, first_name: u.first_name, last_name: u.last_name, fullname: full }
        : p
    )
  );
  setEditUser(null);
  alert("השם עודכן בהצלחה");
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



  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
      ניהול משתמשים
    </Typography>

    {/* ►► 5-ב – כפתור בקשות בין הכותרת ל-filter ◄◄ */}
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>

           <button
          onClick={() => setShowRequests(true)}
          style={{ position:"relative", fontSize:16, padding:"6px 12px" }}
        >
          בקשות
          {requests.length > 0 && (
            <span
              style={{
                position:"absolute", top:-8, left:-8,
                background:"crimson", color:"#fff",
                borderRadius:"50%", padding:"2px 6px", fontSize:12
              }}
            >
              {requests.length}
            </span>
          )}
        </button>
      </Box>

      <Dialog
  open={showRequests}
  onClose={() => setShowRequests(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle sx={{ m: 0, p: 2, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
   בקשות (משתמשים ללא סטטוס)
   <IconButton onClick={() => setShowRequests(false)} size="small">
     <CancelIcon />
   </IconButton>
 </DialogTitle>

  <DialogContent dividers>
    <table  style={{ width:"100%", borderCollapse:"collapse", direction:"rtl" }}>
      <thead>
        <tr>
          <th>שם מלא</th>
          <th>טלפון</th>
          <th style={{ textAlign: "center" }}>פעולות</th>
        </tr>
      </thead>
      <tbody>
        {requests.map(u => (
          <tr key={u.id}>
            
               {/* עמודה 1 – שם מלא (מימין) */}
      <td style={{ textAlign: "right" }}>
        {u.fullname || `${u.first_name || ""} ${u.last_name || ""}`.trim()}
      </td>

      {/* עמודה 2 – טלפון (אמצע) */}
      <td style={{ textAlign: "center" }}>
        {u.phone}
      </td>

      {/* עמודה 3 – כפתורי ✔︎/✖︎ (משמאל) */}
      <td style={{ textAlign: "center" }}>
        <IconButton
  size="small"
  onClick={async () => {
    await approveRequest(u, "registered");
  }}
>
  <CheckCircleOutlineIcon color="success" fontSize="small" />
  </IconButton>

  <IconButton
    size="small"
    onClick={async () => {
      await hide(u);
    }}
  >
    <CancelIcon color="error" fontSize="small" />
  </IconButton>
      </td>
          </tr>
        ))}
        {requests.length === 0 && (
          <tr>
            <td colSpan={3} style={{ textAlign: "center", padding: 16 }}>
              אין בקשות פתוחות
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </DialogContent>
</Dialog>


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
        }}
        >

          {/* 1. Add User בצד שמאל */}
        <button onClick={() => setShowModal(true)}>
        </button>

        
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
        <button onClick={() => setShowModal(true)}>
          הוסף משתמש
        </button>
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
            {firstTouched && firstError && (
          <div style={{ color: "red", marginTop: 4 }}>{firstError}</div>
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
            {lastTouched && lastError && (
          <div style={{ color: "red", marginTop: 4 }}>{lastError}</div>
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
            disabled={!isPhoneValid || !isFirstValid || !isLastValid}
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
      <th style={th}>שם מלא</th>
      <th style={th}>מספר טלפון</th>
      {isRepliesTab && (
        <>
          <th style={th}>שם ההודעה</th>
          <th style={th}>תאריך</th>
        </>
      )}
      {filter === "activity" && (
        <>
          <th style={th}>שם הפעילות</th>
          <th style={th}>תאריך</th>
        </>
      )}
      {filter === "survey" && (
        <>
          <th style={th}>שם הסקר</th>
          <th style={th}>תאריך</th>
        </>
      )}
      <th style={th}>פעולות</th>
    </tr>
  </thead>
<tbody>
  {rowsToShow.map((row, idx) => {
    const u = row.user;

    return (
      <React.Fragment key={idx}>
        {/* ── שורה רגילה ── */}
        <tr>
          {/* כפתור ⋯ + שם מלא */}
          <td>
            <button
              style={{ border:"none", background:"transparent", cursor:"pointer" }}
              onClick={() => {
                const s = new Set(openRows);
                s.has(u.user_id) ? s.delete(u.user_id) : s.add(u.user_id);
                setOpenRows(s);
              }}
            >
              ⋯
            </button>
            {u.fullname}
          </td>

          {/* מספר טלפון */}
          <td style={td}>{u.phone}</td>

          {/* עמודות מותנות – פעילות / סקר / תגובה */}
          {filter === "activity" && (
            <>
              <td>{row.activityName}</td>
              <td>{formatDate(row.activityDate)}</td>
            </>
          )}
          {filter === "survey" && (
            <>
              <td>{row.surveyName}</td>
              <td>{formatDate(row.surveyDate)}</td>
            </>
          )}
          {filter === "both" && (
            <>
              <td>{row.activityName || row.surveyName}</td>
              <td>{formatDate(row.activityDate || row.surveyDate)}</td>
            </>
          )}
          {filter === "replies" && (
            <>
              <td>{row.title}</td>
              <td>{formatDate(row.date)}</td>
            </>
          )}

          {/* פעולות */}
          <td style={{ ...td, position:"relative" }}>
            <div style={{ display: "flex", gap: 4 }}>

                {filter !== "all" && (
                  <button
                    onClick={() => acknowledgeRow(row, filter)}
                    style={{
                      fontSize: "16px",
                      padding: "4px",
                      color: "white",
                      backgroundColor: "green",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                    title="סימן שבדקתי ולא רוצים להציג יותר"
                  >
                    ✓
                  </button>
                )}


              {activeTab === "registered" && (
                <>
                  {/* ✎ כפתור עריכה */}
                    <IconButton
                      size="small"
                      title="עריכת שם"
                      onClick={() => setEditUser(u)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => updateUserType(u, "senior")}
                  >
                    הוסף לחברי מרכז ה-60+
                  </button>
                  <button
                    type="button"
                    style={deleteButtonStyle}
                    onClick={() => deleteUser(u

                    )}
                  >
                    מחק
                  </button>
                </>
              )}

              {activeTab === "senior" && (
                <>
                 {/* ✎ כפתור עריכה גם בטאב senior */}
                  <IconButton
                    size="small"
                    title="עריכת שם"
                    onClick={() => setEditUser(u)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => updateUserType(u, "registered")}
                  >
                    הוסף לרשומים
                  </button>
                  <button
                    type="button"
                    style={deleteButtonStyle}
                    onClick={() => deleteUser(u)}
                  >
                    מחק
                  </button>
                </>
              )}
            </div> 
          </td>
        </tr>

        {/* ── שורת-הפירוט המתקפלת ── */}
        {openRows.has(u.user_id) && (
          <tr>
            <td colSpan="100%" style={{ background:"#fafafa", padding:8 }}>
              <UserDetails user={u} filter={filter} />
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>
        </table>

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
      <Button
        variant="contained"
        onClick={() => saveEditedUser(editUser)}
      >
        שמירה
      </Button>
    </DialogContent>
  </Dialog>
)}

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
