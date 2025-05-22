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
    is_club_60: isClub
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

  const COLL = [
    { label: "users",  ref: collection(db,"users"),                 fields:[{k:"user_id",   v:user_id}] },
    { label: "acts",   ref: collection(db,"activityRegistrations"), fields:[{k:"phone",v:phone},{k:"user.phone",v:phone}] },
    { label: "surv",   ref: collection(db,"surveyResponses"),       fields:[{k:"phone",v:phone},{k:"user.phone",v:phone}] },
    { label: "repls",  ref: collectionGroup(db,"replies"),          fields:[{k:"phone",v:phone},{k:"user.phone",v:phone}] },
  ];

  for (const { label, ref, fields } of COLL) {
    for (const { k, v } of fields) {
      if (!v) continue;
      const snap = await getDocs(query(ref, where(k, "==", v)));
      // console.log(`[${label}] where(${k}==${v}) ->`, snap.size);   // 🔎
      // for (const d of snap.docs) await deleteDoc(d.ref);

      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    }
  }

  setManualUsers(prev => prev.filter(u => u.phone !== phone));
  markDeleted(phone);

  alert("המשתמש נמחק בהצלחה"); 

  window.location.reload();
};


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
            </tr>
          </thead>
          <tbody>
        {filteredUsers.map((u, i) => (
          <tr key={i}>
            <td style={td}>{u.fullName || u.fullname || "—"}</td>

            <td style={{ ...td, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{u.phone}</span>

            {activeTab === "unregistered" && (
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() => updateUserType(u, "registered")}
              >
                הוסף למשתמשים רשומים
              </button>
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
                onClick={() => deleteUser(u)}
              >
                מחק
              </button>
            </div>
          )}

          {activeTab === "registered" && (
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() => updateUserType(u, "senior")}
              >
             הוסף לחברי מרכז ה60+
              </button>
              <button
                type="button"
                style={deleteButtonStyle}
                onClick={() => deleteUser(u)}
              >
                מחק
              </button>
            </div>
          )}

          {activeTab === "senior" && (
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() => updateUserType(u, "registered")}
              >
                הוסף למשתמשים רשומים
              </button>
              <button
                type="button"
                style={deleteButtonStyle}
                onClick={() => deleteUser(u)}
              >
                מחק
              </button>
            </div>
          )}

              </div>
            </td>
          </tr>
        ))}
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
