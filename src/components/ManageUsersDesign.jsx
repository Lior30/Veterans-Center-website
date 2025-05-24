import React, { useState, useEffect } from "react";
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



    const [allUsers, setAllUsers] = useState([]);

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
    if (activeTab === "unregistered") return !u.is_registered;
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
   if (activeTab === "unregistered") return !u.is_registered;
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
    <div style={{ padding: 40, direction: "rtl", textAlign: "right" }}>
      <h1>ניהול משתמשים</h1>

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
            onClick={() => setActiveTab("unregistered")}
            style={{ ...tabStyle, ...(activeTab === "unregistered" ? activeTabStyle : {}) }}
          >
            לא רשומים
          </button>
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
      <tr key={idx}>
        <td>{u.fullname}</td>
        <td>{u.phone}</td>

        {filter === "activity" && <>
          <td>{row.activityName}</td>
          <td>{formatDate(row.activityDate)}</td>
        </>}

        {filter === "survey" && <>
          <td>{row.surveyName}</td>
          <td>{formatDate(row.surveyDate)}</td>
        </>}

        {filter === "both" && <>
          <td>{row.activityName || row.surveyName}</td>
          <td>{formatDate(row.activityDate || row.surveyDate)}</td>
        </>}

        {filter === "replies" && <>
          <td>{row.title}</td>
          <td>{formatDate(row.date)}</td>
        </>}

          <td style={{ ...td, position: "relative" }}>
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

              {activeTab === "unregistered" && (
                <>
                  <button
                     onClick={() => updateUserType(u, "registered")}
                     style={actionButtonStyle}
                  >
                    הוסף לרשומים
                  </button>
                  <button
                     onClick={() => updateUserType(u, "senior")}
                     style={actionButtonStyle}
                  >
                    הוסף לחברי מרכז ה-60+
                  </button>
                  <button
                     onClick={() => deleteUser(u)}
                     style={deleteButtonStyle}
                  >
                    מחק
                  </button>
                </>
              )}

              {activeTab === "registered" && (
                <>
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
                    onClick={() => deleteUser(user)}
                  >
                    מחק
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
</div>
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
