import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import ReplyDesign from "./ReplyDesign.jsx";
import { Snackbar, Alert } from "@mui/material";

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
    await addDoc(collection(db, "messages", id, "replies"), {
      fullname,
      phone,
      replyText,
      createdAt: new Date(),
    });
    setSuccess(true);
    setTimeout(() => navigate("/"), 2000);
  };

  const handleCancel = () => {
    navigate("/");
  };

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