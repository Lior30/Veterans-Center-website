import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db }                    from "../firebase.js";
import ReplyDesign               from "./ReplyDesign.jsx";

export default function ReplyContainer() {
  const { id } = useParams();          // message ID
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone]       = useState("");
  const [replyText, setReplyText] = useState("");

  // Load the message being replied to
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "messages", id));
      if (snap.exists()) setMessage({ id: snap.id, ...snap.data() });
      else console.error("Message not found:", id);
    }
    load();
  }, [id]);

  const handleSubmit = async () => {
    // Validation
    if (!fullname.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!/^[A-Za-z\u05D0-\u05EA\s]+$/.test(fullname.trim())) {
      alert("Name must contain only letters (English or Hebrew) and spaces.");
      return;
    }
    if (!/^05\d{8}$/.test(phone)) {
      alert("Phone Number must be 10 digits starting with 05.");
      return;
    }

    // Save reply
    await addDoc(collection(db, "messages", id, "replies"), {
      fullname: fullname.trim(),
      phone,
      text: replyText,
      sentAt: new Date(),
    });

    navigate("/messages/board");
  };

  const handleCancel = () => navigate("/messages/board");

  if (!message) return <p>Loading…</p>;

  return (
    <ReplyDesign
      message={message}
      fullname={fullname}
      phone={phone}
      replyText={replyText}
      onFullnameChange={(e) => setFullname(e.target.value)}
      onPhoneChange={(e)    => setPhone(e.target.value)}
      onReplyChange={(e)    => setReplyText(e.target.value)}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
