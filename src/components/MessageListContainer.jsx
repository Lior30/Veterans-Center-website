import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.js";
import MessageListDesign from "./MessageListDesign.jsx";

export default function MessageListContainer() {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const snap = await getDocs(collection(db, "messages"));
    setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    // delete any replies first
    const repliesSnap = await getDocs(collection(db, "messages", id, "replies"));
    await Promise.all(repliesSnap.docs.map(r => deleteDoc(r.ref)));
    // delete message
    await deleteDoc(doc(db, "messages", id));
    load();
  };

  const handleViewReplies = (id) => {
    navigate(`/messages/replies/${id}`);
  };

  return (
    <MessageListDesign
      messages={messages}
      onDelete={handleDelete}
      onViewReplies={handleViewReplies}
    />
  );
}