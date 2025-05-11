import React, { useState } from "react";
import { useNavigate }    from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db }                from "../firebase.js";
import CreateMessageDesign   from "./CreateMessageDesign.jsx";

export default function CreateMessageContainer() {
  const navigate = useNavigate();
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async () => {
    const t = title.trim();
    if (!t) {
      alert("Please enter a title before publishing.");
      return;
    }
    if (!location) {
      alert("Please choose where the message will be displayed.");
      return;
    }

    await addDoc(collection(db, "messages"), {
      title: t,
      body,
      location,           // one of 'home' | 'fullActivity' | 'surveysView'
      createdAt: new Date(),
    });
    navigate("/messages/list");
  };

  const handleCancel = () => {
    if (window.confirm("Abort message creation and lose all changes?")) {
      navigate("/messages");
    }
  };

  return (
    <CreateMessageDesign
      title={title}
      body={body}
      location={location}
      onTitleChange={(e) => setTitle(e.target.value)}
      onBodyChange={(e) => setBody(e.target.value)}
      onLocationChange={(e) => setLocation(e.target.value)}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
