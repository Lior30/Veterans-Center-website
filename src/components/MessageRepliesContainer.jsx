// src/components/MessageRepliesContainer.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase.js";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box
} from "@mui/material";

export default function MessageRepliesContainer() {
  const { id } = useParams();
  const [message, setMessage]   = useState(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone]       = useState("");
  const [replyText, setReplyText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadMessage() {
      const snap = await getDoc(doc(db, "messages", id));
      if (snap.exists()) {
        setMessage({ id: snap.id, ...snap.data() });
      }
    }
    loadMessage();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !phone || !replyText) return;
    await addDoc(collection(db, "messages", id, "replies"), {
      fullname,
      phone,
      replyText,
      createdAt: serverTimestamp()
    });
    setSubmitted(true);
  };

  if (!message) return (
    <Container>
      <Typography>טעינה...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {message.title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {message.body}
        </Typography>

        {submitted ? (
          <Typography color="primary">תודה! התשובה נשלחה בהצלחה.</Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="שם מלא"
              fullWidth
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="טלפון"
              fullWidth
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="התגובה שלך"
              fullWidth
              required
              multiline
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
            >
              שלח תשובה
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
