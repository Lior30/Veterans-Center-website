import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase.js";
import UserService from "../services/UserService.js";
import { Box, TextField, Button } from "@mui/material";

function ReplyContainer({ messageId, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [replyText, setReplyText] = useState("");

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "נא למלא שם פרטי";
    } else if (!UserService.isValidName(firstName.trim())) {
      newErrors.firstName = "שם לא תקין";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "נא למלא שם משפחה";
    } else if (!UserService.isValidName(lastName.trim())) {
      newErrors.lastName = "שם משפחה לא תקין";
    }

    if (!UserService.isValidPhone(phone.trim())) {
      newErrors.phone = UserService.getPhoneError(phone.trim()) || "טלפון לא תקין";
    }

    if (!replyText.trim()) {
      newErrors.replyText = "נא למלא את ההודעה";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const fullname = `${firstName.trim()} ${lastName.trim()}`;
    // נרמול phone: רק ספרות
    const phoneClean = phone.trim().replace(/\D/g, "");
    if (!phoneClean) {
      // אפשר להודיע למשתמש או לסיים כאן
      return;
    }
    const replyTime = new Date().toISOString();

    // 1. שמירת התשובה בתת-collection של ההודעה
    try {
      await addDoc(collection(db, "messages", messageId, "replies"), {
        fullname,
        phone: phoneClean,
        replyText,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("ReplyContainer: failed to save reply:", e);
      // אם השמירה נכשלת, סיימו כאן:
      return;
    }

    // 2. עדכון המשתמש הקיים בלבד (בהנחה שהוא קיים) – userId רק phoneClean
    const userId = phoneClean;
    const userRef = doc(db, "users", userId);

    try {
      // בדיקת קיום מסמך המשתמש
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.warn(`ReplyContainer: user document not found for ID ${userId}. העדכון לא יתבצע.`);
        // אם בכל זאת רוצים לעצור כאן:
        // return;
      } 

      // 2a. השגת כותרת ההודעה (messageTitle)
      let messageTitle = messageId;
      try {
        const msgSnap = await getDoc(doc(db, "messages", messageId));
        if (msgSnap.exists()) {
          const data = msgSnap.data();
          if (data.title && typeof data.title === "string" && data.title.trim()) {
            messageTitle = data.title.trim();
          }
        }
      } catch (e) {
        console.warn("ReplyContainer: could not fetch message title:", e);
      }

      // 2b. עדכון שדות replies ו-replies_date במשתמש
      const nowIso = new Date().toISOString();
      try {
        await updateDoc(userRef, {
          replies: arrayUnion(messageTitle),
          replies_date: arrayUnion(nowIso),
        });
      } catch (e) {
        console.error("ReplyContainer: updateDoc failed for userId:", userId, e);
      }
    } catch (e) {
      console.error("ReplyContainer: error when accessing user document:", e);
    }

    // 3. סגירת הדיאלוג / המשך הזרימה
    if (onClose) {
      onClose();
    }
  };

  const placeholderAlign = {
    inputProps: { style: { textAlign: "right" } },
    sx: {
      "& input::placeholder": { textAlign: "right" },
      "& textarea::placeholder": { textAlign: "right" },
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, direction: "rtl" }}>
      <TextField
        placeholder="שם פרטי"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        fullWidth
        error={!!errors.firstName}
        helperText={errors.firstName}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
      />
      <TextField
        placeholder="שם משפחה"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        error={!!errors.lastName}
        helperText={errors.lastName}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
      />
      <TextField
        placeholder="טלפון"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        error={!!errors.phone}
        helperText={errors.phone}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
      />
      <TextField
        placeholder="כתוב את תגובתך כאן..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        multiline
        rows={4}
        fullWidth
        error={!!errors.replyText}
        helperText={errors.replyText}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit}>
          שלח תגובה
        </Button>
      </Box>
    </Box>
  );
}

export default ReplyContainer;