// src/components/FlyerUploader.jsx
import React, { useState, useRef } from "react";

export default function FlyerUploader({ onSubmit }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const dropRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
    dropRef.current.classList.remove("drag-over");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("drag-over");
  };

  const handleSubmit = () => {
    if (!name.trim() || !file) {
      alert("אנא מלא שם ובחר קובץ.");
      return;
    }
    onSubmit(name.trim(), file);
    setName("");
    setFile(null);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 6 }}>
      <label>
        שם הפלאייר:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </label>

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          marginTop: 20,
          border: "2px dashed #aaa",
          padding: 20,
          borderRadius: 6,
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        {file ? (
          <p>קובץ שנבחר: {file.name}</p>
        ) : (
          <p>גרור קובץ לכאן או בחר ידנית</p>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginTop: 10 }}
        />
      </div>

      <button onClick={handleSubmit} style={{ marginTop: 20 }}>
        שמור
      </button>
    </div>
  );
}
