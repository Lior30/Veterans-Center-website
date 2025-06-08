// =========  FlyerUploaderArea.jsx  =========
import React, { useState, useRef } from "react";
import FlyerService from "../services/FlyerService.js";

export default function FlyerUploader({ onUpload }) {
  const [name, setName]         = useState("");
  const [file, setFile]         = useState(null);
  const [startDate, setStart]   = useState(""); // yyyy-mm-dd
  const [endDate, setEnd]       = useState("");
  const dropRef = useRef();

  /* דרג-אנד-דרופ */
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleDrop  = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };
  const handleDragOver  = (e) => e.preventDefault();
  const handleDragLeave = () => {};

  /* ─── שליחה ─── */
  const handleSubmit = async () => {
    if (!name.trim() || !file) return alert("שם וקובץ חובה");
    if (endDate && startDate && endDate < startDate)
      return alert("תאריך סיום חייב להיות אחרי תאריך התחלה");

    try {
      await FlyerService.uploadFlyer(name, file, startDate, endDate);
      setName("");
      setFile(null);
      setStart("");
      setEnd("");
      onUpload?.();           // רענון הרשימה שמגיעה מהורה
    } catch (err) {
      alert("העלאה נכשלה: " + err.code);
    }
  };

  return (
    <div style={{ margin: "2rem auto", textAlign: "center", maxWidth: 400 }}>
      <h3>העלאת פלייאר חדש</h3>

      <label>
        שם:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </label>

      {/* תאריכים */}
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

      {/* אזור קובץ */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          marginTop: 20,
          padding: 20,
          border: "2px dashed #ccc",
          borderRadius: 6,
          background: "#fafafa",
        }}
      >
        {file ? <p>קובץ: {file.name}</p> : <p>גרור קובץ לכאן או בחר ידנית</p>}
        <input type="file" onChange={handleFileChange} />
      </div>

      <button onClick={handleSubmit} style={{ marginTop: 20 }}>
        שמור
      </button>
    </div>
  );
}
