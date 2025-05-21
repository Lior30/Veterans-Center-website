// src/components/ReplyContainer.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, setDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import ReplyDesign from "./ReplyDesign.jsx";
import { Snackbar, Alert } from "@mui/material";

function ensureUserId(u) {
  const full = (u.fullname || u.fullName || "").trim();
  const [first = "", ...rest] = full.split(/\s+/);
  const last = rest.join(" ");
  return `${first}_${last}_${u.phone}`;
}

export default function ReplyContainer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [replyText, setReplyText] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadMessage() {
      const snap = await getDoc(doc(db, "messages", id));
      if (snap.exists()) {
        setMessage({ id: snap.id, ...snap.data() });
      }
    }
    loadMessage();
  }, [id]);

  const handleSubmit = async () => {
    if (!fullname || !phone || !replyText) return;

    // 1) שמירת התשובה
    await addDoc(
      collection(db, "messages", id, "replies"),
      {
        fullname,
        phone,
        replyText,
        createdAt: new Date(),
      }
    );

    // 2) סנכרון ל־users — יוצרים רק אם לא קיים
    if (phone) {
      // א. פיצול fullname לשם פרטי ושם משפחה
      const [first = "", ...rest] = fullname.trim().split(/\s+/);
      const last = rest.join(" ");

      // ב. חישוב userId ויצירת ה־ref
      const userId  = ensureUserId({ fullname, phone });
      const userRef = doc(db, "users", userId);

      // ג. בדיקה ויצירה אם צריך
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          user_id:      userId,
          first_name:   first,
          last_name:    last,
          fullname,
          phone,
          is_registered:false,
          is_club_60:   false,
        });
        console.log("✔ Created new user from reply:", userId);
      } else {
        console.log("ℹ️ User already exists:", userId);
      }
    }

    setSuccess(true);
    setTimeout(() => navigate("/"), 2000);
  };

  const handleCancel = () => navigate("/");

  return (
    <>
      {message && (
        <ReplyDesign
          message={message}
          fullname={fullname}
          phone={phone}
          replyText={replyText}
          onFullnameChange={(e) => setFullname(e.target.value)}
          onPhoneChange={(e) => setPhone(e.target.value)}
          onReplyChange={(e) => setReplyText(e.target.value)}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          תגובתך נוספה בהצלחה
        </Alert>
      </Snackbar>
    </>
  );
}
