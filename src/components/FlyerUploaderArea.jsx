// =========  src/components/FlyerUploaderArea.jsx  =========
import React, { useState, useRef } from "react";
import FlyerService from "../services/FlyerService.js";

export default function FlyerUploaderArea({ onUpload }) {
  const [name, setName]       = useState("");
  const [file, setFile]       = useState(null);
  const [startDate, setStart] = useState("");   // yyyy-mm-dd
  const [endDate,   setEnd]   = useState("");
  const dropRef               = useRef();

  /* -------- Drag & Drop -------- */
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
    dropRef.current.style.border = "2px dashed #bbb";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    dropRef.current.style.border = "2px dashed #673ab7";
  };

  /* -------- Submit -------- */
  const handleSubmit = async () => {
    if (!name.trim() || !file)      return alert("שם וקובץ חובה");
    if (endDate && startDate && endDate < startDate)
      return alert("תאריך סיום חייב להיות אחרי תאריך התחלה");

    try {
      await FlyerService.uploadFlyer({ name, file, startDate, endDate });
      // ניקוי טופס
      setName(""); setFile(null); setStart(""); setEnd("");
      onUpload?.();  // ריענון רשימה מה-parent
    } catch (err) {
      console.error(err);
      alert("העלאה נכשלה: " + (err.code || err.message));
    }
  };

  return (
    <div style={{ direction: "rtl", maxWidth: 400 }}>
      <label>
        שם:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </label>

      <div style={{ marginTop: 10 }}>
        <label>
          הצג החל מ-
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label style={{ marginInlineStart: 15 }}>
          ועד (כולל)
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={(e) => {
          e.preventDefault();
          dropRef.current.style.border = "2px dashed #bbb";
        }}
        style={{
          marginTop: 15,
          padding: 20,
          textAlign: "center",
          border: "2px dashed #bbb",
          borderRadius: 6,
          background: "#fafafa",
        }}
      >
        {file ? <p>קובץ: {file.name}</p> : <p>גרור קובץ לכאן או בחר ידנית</p>}
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
      </div>

      <button onClick={handleSubmit} style={{ marginTop: 20 }}>
        שמור
      </button>
    </div>
  );
}
