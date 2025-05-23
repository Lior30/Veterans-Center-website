// src/components/ReplyContainer.jsx
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp, doc,
  getDoc, setDoc, updateDoc} from "firebase/firestore";
import { db } from "../firebase.js";
import { Box, TextField, Button } from "@mui/material";

export default function ReplyContainer({ messageId, onClose }) {
  const [fullname, setFullname]   = useState("");
  const [phone, setPhone]         = useState("");
  const [replyText, setReplyText] = useState("");


const handleSubmit = async () => {
  if (!fullname || !replyText) return;

  const messageDate = new Date().toISOString();
  console.log("Saving reply at:", messageDate);

    // קודם שומרים את התשובה בתוך המסר
    await addDoc(collection(db, "messages", messageId, "replies"), {
      fullname,
      phone,
      replyText,
      createdAt: serverTimestamp(),
    });
  
    const messageRef = doc(db, "messages", messageId);
    const messageSnap = await getDoc(messageRef);
    const messageTitle = messageSnap.exists() ? messageSnap.data().title || "" : "";


     // 2. מחשב את ה-userId כ"שם מלא_מספר טלפון"
    const userId = `${fullname}_${phone}`;

    // 3. בודק אם כבר יש דוק ב־users
    const userRef  = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // 4. אם לא קיים – יוצר אותו עם כל השדות המבוקשים
    if (!userSnap.exists()) {
      // אפשר לפצל כאן לשם פרטי / אחר אם צריך
      const [first, ...rest] = fullname.trim().split(" ");
      const last            = rest.join(" ");

      await setDoc(
        userRef,
        {
          user_id:      userId,
          fullname:     fullname,
          first_name:   first,
          last_name:    last,
          phone:        phone,
          is_registered:false,
          is_club_60:   false,
          activities:   "",
          activities_date: "",
          survey:       "",
          survey_date: "",
          replies:  messageTitle,
          replies_date: messageDate,
        },
        { merge: true }
      );
    }
    else {
      // משתמש קיים: עדכן על ידי שרשור הערכים החדשים לפני הישנים
      const data = userSnap.data();
      const oldReplies = data.replies || "";
      const oldDates   = data.replies_date ? [].concat(data.replies_date) : [];

      const newReplies = [ messageTitle, ...oldReplies]; 


      const newDates = [ messageDate, ...oldDates];   // ISO strings כלל המערך

      await updateDoc(userRef, {
        replies:      newReplies,
        replies_date: newDates,
      });
    }

    onClose();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField label="שם מלא"    value={fullname} onChange={e => setFullname(e.target.value)} fullWidth />
      <TextField label="טלפון"      value={phone}    onChange={e => setPhone(e.target.value)}    fullWidth />
      <TextField
        label="תגובה"
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        multiline rows={4}
        fullWidth
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit}>שלח תגובה</Button>
      </Box>
    </Box>
  );
}
