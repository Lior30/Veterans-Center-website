// src/components/ReplyContainer.jsx
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { Box, TextField, Button } from "@mui/material";

export default function ReplyContainer({ messageId, onClose }) {
  const [fullname, setFullname]   = useState("");
  const [phone, setPhone]         = useState("");
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async () => {
    if (!fullname || !replyText) return;
    await addDoc(collection(db, "messages", messageId, "replies"), {
      fullname,
      phone,
      replyText,
      createdAt: serverTimestamp(),
    });
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
