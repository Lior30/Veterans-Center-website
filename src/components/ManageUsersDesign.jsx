import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";           
import { saveAs } from "file-saver";
import { db, auth, firebaseConfig  } from "../firebase"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
 deleteUser  } from "firebase/auth";
import { initializeApp, deleteApp, getApp } from "firebase/app";
import { generateEmailPassword } from "./IdentificationPage";
import ActionFeedbackDialog from "./ActionFeedbackDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { collection, collectionGroup, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import UserService from "../services/UserService";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon   from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import { CheckCircle, Error } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Tabs, Tab,
  MenuItem
  
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";



  const palette = {
    primary:  "#6c5c94",      
    primaryHL:"#6c5c94",      
    bgHeader:"#f7f5fb",
    border:  "#e3dfff",
  }

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
      updates.push(updateDoc(doc(db, "users", d.id), missing));
    }
  }

   await Promise.all(updates);
    if (updates.length > 0) {
      setMessage({
        open: true,
        type: 'success',
        text: 'השדות החסרים עודכנו בהצלחה'
      });
    }

}                           


fixMissingUserFields();



function formatDate(dateValue) {
  const d = new Date(dateValue);
  
  return d.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
}


// helper

function ensureUserId(u) {
  if (!u) return "";
  // return user_id 
  if (u.user_id) return u.user_id;

  const phone = (u.phone || "").replace(/\D/g, "");

  // fullname
  const full = (u.fullname || u.fullName || "").trim();

  // sub to first and last name
  const [first = "", ...rest] = full.split(" ");
  const last = rest.join(" ");

  return `${first}_${last}_${u.phone}`;
}



function UserDetails({ user, filter, collapsible = true }) {
  const isActivity = filter === "activity";
  const isSurvey   = filter === "survey";
  const isReplies  = filter === "replies";
  const isBoth     = filter === "both";
  const [openCats, setOpenCats] = React.useState({});
  const toggle = k => setOpenCats(p => ({ ...p, [k]: !p[k] }));

  /* all*/
  const CATS = [
    { key: "activity", label:"פעילויות", names: user.activities, dates: user.activities_date },
    { key: "survey", label:"סקרים" , names: user.survey,     dates: user.survey_date    },
    { key: "replies", label:"הודעות" ,   names: user.replies,    dates: user.replies_date   },
  ].filter(c => {
    if (isActivity) return c.key === "activity";
    if (isSurvey)   return c.key === "survey";
    if (isReplies)  return c.key === "replies";
    if (isBoth)     return c.key === "activity" || c.key === "survey";
    return true;                     
  });

return (
  <div style={{ direction: "rtl" }}>
    {CATS.map(cat => (
      <div key={cat.key} style={{ marginBottom: 4 }}>

        {/*category headline */}
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

        {/* open always if there are members */}
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

};

/* helper:for phone number updates */
async function patchPhoneInRefs(oldDigits, newDigits) {
  const changePhone = async (coll) => {
    const q    = query(collection(db, coll), where("phone", "==", oldDigits));
    const snap = await getDocs(q);
    const bat  = writeBatch(db);
    snap.forEach(d => bat.update(d.ref, { phone: newDigits }));
    await bat.commit();
  };

  await changePhone("activityRegistrations");
  await changePhone("surveyResponses");

  /* replies */
  const msgs = await getDocs(collection(db, "messages"));
  for (const m of msgs.docs) {
    const q    = query(collection(db, "messages", m.id, "replies"),
                       where("phone", "==", oldDigits));
    const snap = await getDocs(q);
    const bat  = writeBatch(db);
    snap.forEach(d => bat.update(d.ref, { phone: newDigits }));
    await bat.commit();
  }
}


async function deleteUserByPhoneNumber(phoneNumber) {
  try {
    const userRef = doc(db, "users", phoneNumber);
    await deleteDoc(userRef);
  } catch (err) {
    console.error(`Error deleting document ${phoneNumber}:`, err);
    throw err;
  }
}



export default function ManageUsersDesign({ users, filter, onFilterChange, manualUsers, setManualUsers, markDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [activeTab, setActiveTab] = React.useState("registered");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = UserService.getPhoneError(newPhone);
  const isPhoneValid = phoneError === null;
  const [firstTouched,    setFirstTouched]    = useState(false);
  const [lastTouched,     setLastTouched]     = useState(false);
  const isRepliesTab = filter === "replies";

  const showActions = ["all", "activity", "survey", "replies", "both"]
  .includes(filter); 
 

  const isActivity  = filter === "activity";
  const isSurvey    = filter === "survey";
  const isBoth      = false;  
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
  const [userType, setUserType] = useState("");       
  const [address, setAddress] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const showPlus = ["replies", "survey", "activity"].includes(filter);

  const isFirstValid = newFirstName.trim().length > 0;
  const isLastValid  = newLastName.trim().length > 0;
  const isTypeValid  = userType !== "";

  const [allUsers, setAllUsers] = useState([]);

  const [message, setMessage] = useState({
    open: false,
    type: 'success',
    text: ''
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => {});
  const editPhoneError   = editUser
  ? UserService.getPhoneError(editUser.phone || "")
  : null;   
  const isEditPhoneValid = editPhoneError === null;
  const firstRef = useRef(null);
  const lastRef  = useRef(null);
  const phoneRef = useRef(null);
  const idRef    = useRef(null);
  const addressRef = useRef(null);
  const notesRef   = useRef(null);
  const eFirstRef   = useRef(null);
  const eLastRef    = useRef(null);
  const ePhoneRef   = useRef(null);
  const eIdRef      = useRef(null);
  const eAddressRef = useRef(null);
  const eNotesRef   = useRef(null);
  const eSaveRef    = useRef(null);  



  

  async function handleAddUser() {
    if (!isFirstValid || !isLastValid || !isPhoneValid || !isTypeValid) return;

    const full = `${newFirstName.trim()} ${newLastName.trim()}`;
    const phone = newPhone.replace(/\D/g, "");
    const userRef = doc(db, "users", phone);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setMessage({
          open: true,
          type: 'error',
          text: 'מספר הטלפון הזה כבר קיים במערכת'
        });
        return;
      }

      const newUser = {
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        fullname: full,
        phone: newPhone.trim(),
        user_id: phone,
        is_registered: userType === "registered",
        is_club_60: userType === "senior",
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

      // Try to create auth account
      let secondaryApp;
      try {
        const appName = `secondary-add-${phone}`;
        try {
          secondaryApp = initializeApp(firebaseConfig, appName);
        } catch {
          secondaryApp = getApp(appName);
        }

        const secondaryAuth = getAuth(secondaryApp);
        const { email, password } = generateEmailPassword(phone);
        await createUserWithEmailAndPassword(secondaryAuth, email, password);
      } catch (authErr) {
        if (authErr.code === "auth/email-already-in-use") {
          // It's okay, user already exists.
        } else {
          setMessage({
            open: true,
            type: 'error',
            text: 'אירעה שגיאה ביצירת חשבון האוטנטיקציה'
          });
          return;
        }
      } finally {
        if (secondaryApp) await deleteApp(secondaryApp);
      }

      const snapAll = await getDocs(collection(db, "users"));
      setAllUsers(snapAll.docs.map(d => ({ id: d.id, ...d.data() })));

      // Reset form
      setShowModal(false);
      setNewFirstName("");
      setNewLastName("");
      setNewPhone("");
      setUserType("");
      setAddress("");
      setIdNumber("");
      setNotes("");

      // ✅ Success message
      setMessage({
        open: true,
        type: 'success',
        text: 'המשתמש נוסף בהצלחה'
      });

    } catch (e) {
      setMessage({
        open: true,
        type: 'error',
        text: 'אירעה שגיאה בהוספת המשתמש'
      });
    }
  }

  function toggleSelect(user) {                 
    const id = ensureUserId(user);              
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function selectAllRows(checked) {
    setSelected(
      checked
        ? new Set(rowsToShow.filter(r => r && r.user).map(r => ensureUserId(r.user)))
        : new Set()
    );
  }

  function toggleSelectMode() {
    setSelectMode(p => {
      if (p) setSelected(new Set());   //clear selection
      return !p;
    });
  }

  /* delete selected users */
  async function deleteSelected() {
    if (selected.size === 0) return;

    setOnConfirmAction(() => async () => {
      const promises = [];

      for (const id of selected) {
        const u = allUsers.find(x => ensureUserId(x) === id);
        if (u) {
          promises.push(deleteUserCore(u, { skipMessage: true })); 
        }
      }

      await Promise.all(promises);
      setSelected(new Set());

      const fresh = await getDocs(collection(db, "users"));
      setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));

      // Show one global message
      setMessage({
        open: true,
        type: 'success',
        text: 'כל המשתמשים שנבחרו נמחקו בהצלחה'
      });
    });

    setConfirmOpen(true);
  }


  /* general handler */
  const focusNext = next => e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      next?.current?.focus();
    }
  };



   
  function exportToExcel(type = "all") {
    // ➊ filters
    const data = allUsers.filter(u => {
      if (type === "registered") return u.is_registered && !u.is_club_60;
      if (type === "senior")     return u.is_club_60;
      return true;               // all
    });

    if (data.length === 0) {
      alert("אין נתונים לייצוא");
      return;
    }

    // ➋ create a "flat" array of objects – only the columns we want in the sheet
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

    // ➌ SheetJS: convert to worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // ➍ write as Blob and save
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
    // load all users from Firestore
    async function fetchUsers() {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllUsers(users);
    }
    fetchUsers();
  }, []);

  
  useEffect(() => {
    const t = search.trim().toLowerCase();
    if (!t) return;                     

    /*  60+? */
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

    

    /* if there is a match between registered and senior */
    if (foundSenior && !foundRegistered && activeTab !== "senior") {
      setActiveTab("senior");
    } else if (foundRegistered && !foundSenior && activeTab !== "registered") {
      setActiveTab("registered");
    }
  }, [search, allUsers, activeTab]);



  // activeTab is used to filter users based on their type
  const matchesTab = u => {
      /* search */
    if (activeTab === "registered") return u.is_registered && !u.is_club_60;
    if (activeTab === "senior")     return u.is_club_60;
    return true; 
  }

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) return;          

    
    const foundRegistered = allUsers.some(u =>
      u.is_registered && !u.is_club_60 &&
      (
        (u.fullname  || "").toLowerCase().includes(term) ||
        (u.last_name || "").toLowerCase().includes(term) ||
        (u.phone     || "").includes(term)
      )
    );

    
    const foundSenior = allUsers.some(u =>
      u.is_club_60 &&
      (
        (u.fullname  || "").toLowerCase().includes(term) ||
        (u.last_name || "").toLowerCase().includes(term) ||
        (u.phone     || "").includes(term)
      )
    );

    
    if (activeTab === "registered" && !foundRegistered && foundSenior) {
      setActiveTab("senior");
    }

    
    if (activeTab === "senior" && !foundSenior && foundRegistered) {
      setActiveTab("registered");
    }
  }, [search, allUsers, activeTab]);



 
  const rowsActivities = allUsers
    .filter(u => Array.isArray(u.activities) && u.activities.length > 0)
    .filter(matchesTab)
    .map(u => ({
      user:  u,
      count: u.activities.length,
    }));

  
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

  //1 for every user, count the replies
  const rowsReplies = allUsers
    .filter(u => Array.isArray(u.replies) && u.replies.length > 0)
    .filter(matchesTab)
    .map(u => ({
      user:  u,
      count: u.replies.length,
    }));

  // 2) user shape
  const rowsAllWithShape = rowsAll.map(u => ({ user: u }));


  // const isRepliesTab = filter === "replies";
  // const rowsToShow = isRepliesTab ? rowsReplies : rowsAll;

  // by filter
  let rowsToShow = [];
  if (filter === "activity") rowsToShow = rowsActivities;
  else if (filter === "replies") rowsToShow = rowsReplies;
  else if (filter === "survey")   rowsToShow = rowsSurveys;
  else if (filter === "replies")  rowsToShow = rowsReplies;
  else                             rowsToShow = rowsAllWithShape;

  rowsToShow = (rowsToShow || []).filter(r => r && r.user);

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

  
  async function deleteUserSilent(user) {
    const phone   = user.phone || "";
    const user_id = ensureUserId(user);

    /* users  */
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

    /* update local states */
    setManualUsers(prev => prev.filter(u => u.phone !== phone));
    markDeleted(phone);
  }


  async function deleteUserCore(user, options = {}) {
    const phone   = user.phone || "";
    const user_id = ensureUserId(user);

    try {
      await deleteUserByPhoneNumber(user_id);
    } catch (err) {
      console.error("⚠️  users delete failed:", err);
    }

    const msgs = await getDocs(collection(db, "messages"));
    for (const m of msgs.docs) {
      const reps = await getDocs(
        query(
          collection(db, "messages", m.id, "replies"),
          where("phone", "==", phone)
        )
      );
      for (const r of reps.docs) {
        try { await deleteDoc(r.ref); }
        catch (e) { console.error("⚠️  reply delete", e); }
      }
    }

    const activitiesSnap = await getDocs(collection(db, "activities"));
    for (const act of activitiesSnap.docs) {
      const participants = act.data().participants || [];
      const filtered = participants.filter(p => p.phone !== phone);
      if (filtered.length < participants.length) {
        try {
          await updateDoc(act.ref, { participants: filtered });
        } catch (e) {
          console.error("⚠️  activity participant removal failed:", e);
        }
      }
    }

    setManualUsers(prev => prev.filter(u => u.phone !== phone));
    markDeleted(phone);

    const fresh = await getDocs(collection(db, "users"));
    setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));

    if (!options.skipMessage) {
      setMessage({
        open: true,
        type: 'success',
        text: 'המשתמש נמחק בהצלחה'
      });
    }
  }


  async function deleteUser(user) {
    setOnConfirmAction(() => async () => {
      await deleteUserCore(user);
    });
    setConfirmOpen(true);
  }

  async function saveEditedUser(u) {
    const first = u.first_name?.trim() || "";
    const last = u.last_name?.trim() || "";
    const newPh = u.phone?.trim() || "";
    const full = `${first} ${last}`.trim();

    if (!first || !last || !newPh) {
      setMessage({
        open: true,
        type: 'error',
        text: 'שם פרטי, שם משפחה ומספר טלפון – שדות חובה'
      });
      return;
    }

    const newDigits = newPh.replace(/\D/g, "");
    if (!/^05\d{8}$/.test(newDigits)) {
      setMessage({
        open: true,
        type: 'error',
        text: 'מספר טלפון אינו תקין. יש להזין מספר המתחיל ב־05, ואורכו 10 ספרות'
      });
      return;
    }

    const oldDigits = (editUser.originalPhone || "").replace(/\D/g, "");
    const phoneChanged = oldDigits !== newDigits;

    const newUserDoc = {
      first_name: first,
      last_name: last,
      fullname: full,
      phone: newPh,
      user_id: newDigits,
      address: u.address?.trim() || null,
      id_number: u.id_number?.trim() || null,
      notes: u.notes?.trim() || null,
      is_registered: editUser.is_registered || false,
      is_club_60: editUser.is_club_60 || false,
      activities: Array.isArray(editUser.activities) ? editUser.activities : [],
      activities_date: Array.isArray(editUser.activities_date) ? editUser.activities_date : [],
      survey: Array.isArray(editUser.survey) ? editUser.survey : [],
      survey_date: Array.isArray(editUser.survey_date) ? editUser.survey_date : [],
      replies: Array.isArray(editUser.replies) ? editUser.replies : [],
      replies_date: Array.isArray(editUser.replies_date) ? editUser.replies_date : []
    };

    try {
      if (phoneChanged) {
        const batch = writeBatch(db);
        batch.set(doc(db, "users", newDigits), newUserDoc);
        batch.delete(doc(db, "users", oldDigits));
        await batch.commit();

        await patchPhoneInRefs(oldDigits, newDigits);

        let secondaryApp;
        try {
          const appName = `secondary-edit-${newDigits}`;
          try {
            secondaryApp = initializeApp(firebaseConfig, appName);
          } catch {
            secondaryApp = getApp(appName);
          }

          const secondaryAuth = getAuth(secondaryApp);
          const { email, password } = generateEmailPassword(newDigits);
          await createUserWithEmailAndPassword(secondaryAuth, email, password);
        } catch (err) {
          // Not critical; log and continue
          console.warn("Auth creation failed (new phone):", err);
        }

        if (secondaryApp) await deleteApp(secondaryApp);

        await deleteUserSilent(editUser);

      } else {
        await setDoc(doc(db, "users", oldDigits), newUserDoc);

        try {
          const secondaryApp = initializeApp(firebaseConfig, `secondary-edit-${newDigits}`);
          const secondaryAuth = getAuth(secondaryApp);
          const { email, password } = generateEmailPassword(newDigits);
          await createUserWithEmailAndPassword(secondaryAuth, email, password);
          await deleteApp(secondaryApp);
        } catch (authErr) {
          console.warn("Auth failed, but Firestore already updated:", authErr);
        }
      }

      const fresh = await getDocs(collection(db, "users"));
      setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));

      setMessage({
        open: true,
        type: 'success',
        text: 'הפרטים עודכנו בהצלחה'
      });

    } catch (err) {
      setMessage({
        open: true,
        type: 'error',
        text: err?.message
          ? 'אירעה שגיאה בעדכון המשתמש: ' + err.message
          : 'אירעה שגיאה בעדכון המשתמש'
      });
    } finally {
      if (phoneChanged) {
        const fresh = await getDocs(collection(db, "users"));
        setAllUsers(fresh.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      setEditUser(null);
    }
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

      setMessage({
        open: true,
        type: 'success',
        text: 'סוג המשתמש עודכן בהצלחה'
      });

    } catch (error) {
      console.error("שגיאה בעדכון סוג המשתמש:", error);
      
      setMessage({
        open: true,
        type: 'error',
        text: 'אירעה שגיאה בעדכון סוג המשתמש'
      });
    }
  }




  async function acknowledgeRow(row, type) {
    const u        = row.user;
    const userId   = ensureUserId(u);
    const docRef   = doc(db, "users", userId);
    // first read 
    const snap     = await getDocs(query(collection(db, "users"), where("user_id", "==", userId)));
    if (snap.empty) return;
    const data     = snap.docs[0].data();

    // new arrays to hold updated data
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

    // firebase update
    await updateDoc(docRef, {
      activities:      newActivities,
      activities_date: newActivitiesDate,
      survey:          newSurvey,
      survey_date:     newSurveyDate,
      replies:         newReplies,
      replies_date:    newRepliesDate
    });

    // update state to reflect changes
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


  // <button
  //     style={{ border:"none", background:"transparent", cursor:"pointer" }}
  //     onClick={() => toggleRow(u.user_id)}
  //   >
  //           ⋯ 
  //   </button>


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
    <Box sx={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: 4,
      background:"#fff",
      borderRadius:"12px",
      boxShadow:"0 2px 6px rgba(0,0,0,.05)"
    }}>
    {/* ◄◄ personal details ►► */}
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      width:"100%",
      marginBottom:30    
    }}>
      {/* (RTL) */}
      {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 2 }}> */}

      <Typography variant="h4" component="h1">
        משתמשים
      </Typography>
            


      <IconButton
        onClick={() => setShowExport(true)}
        sx={{ border:`1px solid ${palette.primary}`, color:palette.primary }}
      >
        <DownloadIcon fontSize="small" />
      </IconButton>

      {/* </Box> */}

    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16        
      }}
    ></div>


      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
  <Typography sx={{ fontWeight: 600, minWidth: 48 }}>חיפוש:</Typography>

  <TextField
    size="small"
    placeholder="שם / משפחה / טלפון"
    value={search}
    onChange={e => setSearch(e.target.value)}
    sx={{
      width: 220,
      
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        "& fieldset": { borderColor: palette.primary },
        "&:hover fieldset": { borderColor: palette.primaryHL },
        "&.Mui-focused fieldset": { borderColor: palette.primary }
      },
      
      "& input": { direction: "rtl" }
    }}
  />
</Box>
    


      {/* this line is for the user search */}
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

          {/* 1. Add User */}
           {/* ❶ “choose user” */}
        <div style={{ display: "flex", gap: 4 }}>
        </div>

        
        {/* SHOW */}

        <Box
          sx={{
            position: "absolute",
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <Typography sx={{ fontWeight: 600, minWidth: 36 }}>הצג:</Typography>

          <TextField
            select
            size="small"
            value={filter}
            onChange={e => onFilterChange(e.target.value)}
            sx={{
              minWidth: 130,
              // purple border
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": { borderColor: palette.primary },
                "&:hover fieldset": { borderColor: palette.primaryHL },
                "&.Mui-focused fieldset": { borderColor: palette.primary }
              }
            }}
            SelectProps={{
              native: true,      
              sx: {
                "& option": { direction: "rtl" } 
              }
            }}
          >
            <option value="all">כל המשתמשים</option>
            <option value="activity">נרשמים</option>
            <option value="survey">סקרים</option>
            <option value="replies">תגובות</option>
          </TextField>
        </Box>

        {/* centered tabs*/}

        
        {/*  new tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ minHeight:42, ".MuiTabs-indicator":{ backgroundColor: palette.primary } }}
          textColor="inherit"
          TabIndicatorProps={{ style:{ height:3 } }}
        >
          <Tab
            label="רשומים"
            value="registered"
            sx={{
              minHeight:42,
              fontWeight:600,
              color: activeTab==="registered"?palette.primary:"#666"
            }}
          />
          <Tab
            label="חברי מרכז 60+"
            value="senior"
            sx={{
              minHeight:42,
              fontWeight:600,
              color: activeTab==="senior"?palette.primary:"#666"
            }}
          />
        </Tabs>

        </div>


          {/* Add User Button */}
        {/* Add User Button */}


  {/* add user */}
<Box
  sx={{
    display: "flex",
    gap: 1.5,          
    alignItems: "center",
    mb: 2              
  }}
>
  {/* choose and un choose*/}
  <Button
  variant="outlined"
  size="small"
  onClick={toggleSelectMode}
  sx={{
    minWidth: 86,
    
    color:        palette.primary,
    borderColor:  palette.primary,
   
    "&:hover": {
      borderColor: palette.primary,
      backgroundColor: "transparent"
    }
  }}
>
  {selectMode ? "בטל בחירה" : "בחר"}
</Button>


  {/* delete selected */}
  {selectMode && (
    <Button
      variant="outlined"
      color="error"
      size="small"
      disabled={selected.size === 0}
      onClick={deleteSelected}
      sx={{ minWidth: 100 }}
    >
      מחק נבחרים
    </Button>
  )}

  {/* add user*/}
  <Button
    variant="contained"
    size="small"
    onClick={() => setShowModal(true)}
    sx={{
      minWidth: 110,
      px: 2,                      
      backgroundColor: palette.primary,
      boxShadow: "0 2px 4px rgba(0,0,0,.08)",
      fontWeight: 600,
      "&:hover": { backgroundColor: palette.primaryHL }
    }}
  >
    הוסף משתמש
  </Button>
</Box>






      {showModal && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    zIndex: 1300,
    direction: "rtl"
  }}>
    {/* Close button */}
    <button
      onClick={() => setShowModal(false)}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "transparent",
        border: "none",
        fontSize: 22,
        cursor: "pointer",
        color: "#666"
      }}
      aria-label="סגור"
    >
      ×
    </button>

    <h2 style={{ textAlign: "center", marginBottom: 20 }}>הוספת משתמש</h2>

    {/* Field: First Name */}
    <div style={{ marginBottom: 16 }}>
      <input
        ref={firstRef}
        type="text"
        placeholder="שם פרטי"
        value={newFirstName}
        onChange={e => {
          setNewFirstName(e.target.value);
          setFirstTouched(true);
        }}
        onKeyDown={focusNext(lastRef)}
        onBlur={() => setFirstTouched(true)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      />
      {firstTouched && !isFirstValid && (
        <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>יש להזין שם פרטי</div>
      )}
    </div>

    {/* Field: Last Name */}
    <div style={{ marginBottom: 16 }}>
      <input
        ref={lastRef}
        type="text"
        placeholder="שם משפחה"
        value={newLastName}
        onChange={e => {
          setNewLastName(e.target.value);
          setLastTouched(true);
        }}
        onKeyDown={focusNext(phoneRef)}
        onBlur={() => setLastTouched(true)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      />
      {lastTouched && !isLastValid && (
        <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>יש להזין שם משפחה</div>
      )}
    </div>

    {/* Field: Phone */}
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        inputMode="numeric"      
        pattern="[0-9]*"       
        maxLength={10}     
        ref={phoneRef}     
        placeholder="מספר טלפון"
        value={newPhone}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '');
          setNewPhone(digits);
          setPhoneTouched(true);
        }}
        onKeyDown={focusNext(idRef)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      />
      {phoneTouched && phoneError && (
        <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>{phoneError}</div>
      )}
    </div>

    {/* Field: ID Number */}
    <div style={{ marginBottom: 16 }}>
      <input
        ref={idRef}
        type="text"
        placeholder="תעודת זהות"
        value={idNumber}
        onChange={e => setIdNumber(e.target.value)}
        onKeyDown={focusNext(addressRef)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      />
    </div>

    {/* Field: Address */}
    <div style={{ marginBottom: 16 }}>
      <input
      ref={addressRef}
        type="text"
        placeholder="כתובת"
        value={address}
        onChange={e => setAddress(e.target.value)}
        onKeyDown={focusNext(notesRef)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      />
    </div>

    {/* Field: Notes */}
    <div style={{ marginBottom: 16 }}>
      <textarea
      ref={notesRef}
        placeholder="הערות"
        value={notes}
        onChange={e => setNotes(e.target.value)}
         onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              typeRef.current?.focus();
            }
          }}
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      />
    </div>

    {/* Field: User Type */}
    <div style={{ marginBottom: 24 }}>
      <select
        value={userType}
        onChange={e => setUserType(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
          direction: "rtl",
          textAlign: "right"
        }}
      >
        <option value="" disabled>בחר סוג משתמש</option>
        <option value="registered">משתמש רשום</option>
        <option value="senior">חברי מרכז ה־60 פלוס</option>
      </select>
    </div>

    {/* Add Button */}
    <button
      onClick={handleAddUser}
      disabled={!isPhoneValid || !isFirstValid || !isLastValid || !isTypeValid}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: palette.primary,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 600,
        cursor: isPhoneValid ? "pointer" : "not-allowed",
        opacity: isPhoneValid ? 1 : 0.5,
        transition: "all 0.3s ease"
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
      {/* select all */}
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

      
      <th style={th}>פעולות</th>
    </tr>
  </thead>
<tbody>
  {rowsToShow.map((row /* , idx */) => {
    const u = row.user;
    const checked = selected.has(ensureUserId(u));

  return (
    <React.Fragment key={ensureUserId(u)}>
      {/*main row */}
       <tr
          style={{ transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background="#faf8ff"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        >
        {/* select mode */}
        {selectMode && (
          <td style={td}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleSelect(u)}
            />

          </td>
        )}

        {/* full name */}
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

        {/* phone */}
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
      
          <td style={{ ...td, position: "relative" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <IconButton
                size="small"
                title="עריכת שם"
                onClick={() => setEditUser({ ...u, originalPhone: u.phone })}
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

      {/* details row */}
      {Array.from(openRows).some(k => k.startsWith(u.user_id)) && (
        <tr style={{ background: "#fafafa" }}>
          {/* empty cell */}
          {selectMode && <td></td>}
          {/* empty cell under name column */}
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
              collapsible={["both","all"].includes(filter)} 
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
})}
</tbody>
        </table>

        {/* ✦outtoxl */}
        <Dialog open={showExport} onClose={() => setShowExport(false)} maxWidth="xs" fullWidth
          PaperProps={{
            sx: {
              p: 4,                         
              borderRadius: 3,              
              bgcolor: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,.12)',
              direction: 'rtl',             
            }
          }}
        >
          <DialogTitle
            sx={{
              position: "relative",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: palette.primary,
              pr: 4
            }}
          >
            ייצוא משתמשים

            <IconButton
              aria-label="סגור"
              onClick={() => setShowExport(false)}
              sx={{ position: "absolute", top: 8, left: 8, color: "grey.500" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1, textAlign: 'right' }}>
              בחר קבוצה:
            </Typography>

            <TextField
              select
              size="small"
              fullWidth
              value={exportType}
              onChange={e => setExportType(e.target.value)}
              sx={{
                direction: 'rtl',
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,                     
                  "& fieldset":        { borderColor: palette.border },
                  "&:hover fieldset":  { borderColor: palette.primaryHL },
                  "&.Mui-focused fieldset": { borderColor: palette.primary }
                }
              }}
            >
              <MenuItem value="all">כל המשתמשים</MenuItem>
              <MenuItem value="registered">משתמשים רשומים</MenuItem>
              <MenuItem value="senior">חברי מרכז 60+</MenuItem>
            </TextField>


            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                exportToExcel(exportType);
                setShowExport(false);
              }}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                bgcolor: palette.primary,
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,.15)',
                "&:hover": { bgcolor: palette.primaryHL }
              }}
            >
              יצא
            </Button>

          </DialogContent>
        </Dialog>


        {/* ✎ Modal */}
{editUser && (
  <Dialog open onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
    <DialogTitle
      sx={{
        position: "relative",
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: 600,
        mb: 2, mt: 5,
        pr: 4          
      }}
    >
      עריכת משתמש

      {/* X */}
      <IconButton
        aria-label="סגור"
        onClick={() => setEditUser(null)}
        sx={{ position: "absolute", top: 8, left: 8, color: "grey.500" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      <TextField
        inputRef={eFirstRef}
        placeholder="שם פרטי"
        value={editUser.first_name || ""}
        onChange={e => setEditUser(prev => ({ ...prev, first_name: e.target.value }))}
        onKeyDown={focusNext(eLastRef)}
        sx={{ input: { direction: 'rtl', textAlign: 'right' } }}
        fullWidth
      />
      <TextField
        inputRef={eLastRef}
        placeholder="שם משפחה"
        value={editUser.last_name || ""}
        onChange={e => setEditUser(prev => ({ ...prev, last_name: e.target.value }))}
        onKeyDown={focusNext(ePhoneRef)}
        sx={{ input: { direction: 'rtl', textAlign: 'right' } }}
        fullWidth
      />
      <TextField
        inputRef={ePhoneRef}
        placeholder="מספר טלפון"
        value={editUser.phone || ""}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '');
          setEditUser(prev => ({ ...prev, phone: digits }));
        }}
        onKeyDown={focusNext(eIdRef)}
        sx={{ input: { direction: 'rtl', textAlign: 'right' } }}
        fullWidth
      />

      <TextField
        inputRef={eIdRef}
        placeholder="תעודת זהות"
        value={editUser.id_number || ""}
        onChange={e => setEditUser(prev => ({ ...prev, id_number: e.target.value }))}
        onKeyDown={focusNext(eAddressRef)}
        sx={{ input: { direction: 'rtl', textAlign: 'right' } }}
        fullWidth
      />
      <TextField
        inputRef={eAddressRef}
        placeholder="כתובת"
        value={editUser.address || ""}
        onChange={e => setEditUser(prev => ({ ...prev, address: e.target.value }))}
        onKeyDown={focusNext(eNotesRef)}
        sx={{ input: { direction: 'rtl', textAlign: 'right' } }}
        fullWidth
      />
      <TextField
        inputRef={eNotesRef}
        placeholder="הערות"
        value={editUser.notes || ""}
        onChange={e => setEditUser(prev => ({ ...prev, notes: e.target.value }))}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            eSaveRef.current?.focus();  
          }
        }}
        multiline
        rows={3}
        sx={{ textarea: { direction: 'rtl', textAlign: 'right' } }}
        fullWidth
      />

      <Button
        variant="contained"          
        fullWidth
        disableElevation 
        onClick={() => saveEditedUser(editUser)}
        disabled={!isEditPhoneValid}
        sx={{
          width: "100%",
          padding: "12px",
          backgroundColor: palette.primary,
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: 600,
          color: "#fff", 
          textTransform: "none", 
          "&:hover": {
            backgroundColor: palette.primary 
          }
        }}
      >
        שמירה
      </Button>


    </DialogContent>
  </Dialog>


)}


     </Box>
    <ActionFeedbackDialog
      open={message.open}
      type={message.type}
      text={message.text}
      onClose={() => setMessage(prev => ({ ...prev, open: false }))}
    />
    <ConfirmDialog
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      onConfirm={() => {
        setConfirmOpen(false);
        onConfirmAction();
      }}
      title="אישור מחיקה"
      text="האם אתה בטוח שברצונך למחוק משתמש זה?"
      confirmText="מחק"
      cancelText="ביטול"
      confirmColor="error"
    />
        </>
  ); 
}

const th = {
  padding: "10px 12px",
  backgroundColor: palette.bgHeader,
  borderBottom: `1px solid ${palette.border}`,
  color: palette.primaryHL,
  fontWeight: 600,
  fontSize: "0.85rem",
  textAlign: "right",
};

const td = {
  padding: "10px 12px",
  borderBottom: `1px solid ${palette.border}`,
  textAlign: "right",
  fontSize: "0.9rem",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  direction: "rtl"
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
  padding: "4px 10px",
  borderRadius: "6px",
  border: `1px solid ${palette.primary}`,
  backgroundColor: "#fff",
  color: palette.primary,
  fontWeight: 600,
  transition: "all .2s",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: palette.primary,
    color: "#fff",
  },
};

const deleteButtonStyle = {
  ...actionButtonStyle,
  border: "1px solid #dc3545",
  color: "#dc3545",
  "&:hover": {
    backgroundColor: "#dc3545",
    color: "#fff",
  },
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

  // render
const plusStyle = {
  marginInlineStart: 4,
  color: "#7b35ff",
  fontWeight: "bold",
};
