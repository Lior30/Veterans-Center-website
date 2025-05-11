import React, { useState, useEffect } from "react";
import { collection, getDocs }         from "firebase/firestore";
import { db }                          from "../firebase.js";
import PublicMessageBoardDesign        from "./PublicMessageBoardDesign.jsx";

export default function PublicMessageBoardContainer() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "messages"));
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  return <PublicMessageBoardDesign messages={messages} />;
}
