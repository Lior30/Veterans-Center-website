// =========  src/components/FlyerUploaderArea.jsx  =========
import React, { useState, useRef, useEffect } from "react";
import FlyerService from "../services/FlyerService.js";
import ActivityService from "../services/ActivityService";

export default function FlyerUploaderArea({ onUpload }) {
  const [name, setName]       = useState("");
  const [file, setFile]       = useState(null);
  const [startDate, setStart] = useState("");   // yyyy-mm-dd
  const [endDate,   setEnd]   = useState("");
  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState("");
  const dropRef               = useRef();

  /* -------- Load activities -------- */
  useEffect(() => {
    const unsub = ActivityService.subscribe((acts) => setActivities(acts));
    return () => unsub();
  }, []);

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
    if (!activityId)                return alert("בחרי פעילות לפני שמירה");
    if (endDate && startDate && endDate < startDate)
      return alert("תאריך סיום חייב להיות אחרי תאריך התחלה");

    try {
      await FlyerService.uploadFlyer({ name, file, startDate, endDate, activityId });
      // ניקוי טופס
      setName(""); setFile(null); setStart(""); setEnd(""); setActivityId("");
      onUpload?.();  // ריענון רשימה מה-parent
    } catch (err) {
      console.error(err);
      alert("העלאה נכשלה: " + (err.code || err.message));
    }
  };

  return (
    <div style={{ direction: "rtl", maxWidth: 400 }}>
      {/* שם הפלייר */}
      <label>
        שם:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </label>

      {/* בחירת פעילות */}
      <label style={{ display: 'block', marginTop: 10 }}>
        פעילות:
        <select
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          style={{ width: "100%", marginTop: 5 }}
        >
          <option value="">-- בחרי פעילות --</option>
          {activities.map((act) => (
            <option key={act.id} value={act.id}>
              {act.name} — {act.date}
            </option>
          ))}
        </select>
      </label>

      {/* תאריכי הצגה */}
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

      {/* Drop area */}
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

      {/* שמירה */}
      <button
        onClick={handleSubmit}
        style={{ marginTop: 20 }}
        disabled={!name.trim() || !file || !activityId}
      >
        שמור
      </button>
    </div>
  );
}
