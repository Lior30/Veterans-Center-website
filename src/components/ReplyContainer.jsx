
import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
    const phoneClean = phone.trim();
    const replyTime = new Date().toISOString();

    await addDoc(collection(db, "messages", messageId, "replies"), {
      fullname,
      phone: phoneClean,
      replyText,
      createdAt: serverTimestamp(),
    });

    const messageRef = doc(db, "messages", messageId);
    const messageSnap = await getDoc(messageRef);
    const messageTitle = messageSnap.exists() ? messageSnap.data().title || "" : "";

    const userId = `${firstName.trim()}_${lastName.trim()}_${phoneClean}`;
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(
        userRef,
        {
          user_id: userId,
          fullname,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phoneClean,
          is_registered: false,
          is_club_60: false,
          activities: [],
          activities_date: [],
          survey: [],
          survey_date: [],
          replies: [messageTitle],
          replies_date: [replyTime],
        },
        { merge: true }
      );
    } else {
      const data = userSnap.data();
      const newReplies = [messageTitle, ...(data.replies || [])];
      const newDates = [replyTime, ...(data.replies_date || [])];

      await updateDoc(userRef, {
        replies: newReplies,
        replies_date: newDates,
      });
    }

    onClose?.();
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
