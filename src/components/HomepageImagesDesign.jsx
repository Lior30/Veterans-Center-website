import React, { useState, useRef } from "react";
import BannerService from "../services/BannerService.js";   // ← שנה נתיב אם צריך

/* ───────────────── בקובץ אחד: טופס העלאה + רשימת תמונות ───────────────── */

/* טופס העלאה */
function BannerUploader({ onUpload }) {
  const [title, setTitle] = useState("");
  const [file,  setFile]  = useState(null);
  const [start, setStart] = useState("");
  const [end,   setEnd]   = useState("");
  const dropRef = useRef();

  /* Drag & Drop */
  const onFileChange = (e) => setFile(e.target.files[0]);
  const onDrop   = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); };
  const onDragOver = (e) => e.preventDefault();

  async function handleSubmit() {
    if (!title.trim() || !file) { alert("שם וקובץ חובה"); return; }
    if (end && start && end < start) { alert("תאריך סיום לפני תאריך התחלה"); return; }

    try {
      await BannerService.uploadBanner({ title, file, link: "", start, end });
      setTitle(""); setFile(null); setStart(""); setEnd("");
      onUpload?.();
    } catch (err) { alert("העלאה נכשלה: " + err.code); }
  }

  return (
    <div style={{ margin: "2rem auto", textAlign: "center", maxWidth: 450 }}>
      <h3>העלאת באנר ראשי חדש</h3>

      {/* שם */}
      <label>
        שם:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
               style={{ marginInlineStart: 10 }} />
      </label>

      {/* תאריכים (לא חובה) */}
      <div style={{ marginTop: 10 }}>
        <label>
          הצג החל מ-
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label style={{ marginInlineStart: 15 }}>
          ועד (כולל)
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      {/* קובץ */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          marginTop: 20, padding: 20,
          border: "2px dashed #ccc", borderRadius: 6, background: "#fafafa"
        }}
      >
        {file ? <p>קובץ: {file.name}</p> : <p>גרור תמונה לכאן או בחר ידנית</p>}
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      <button onClick={handleSubmit} style={{ marginTop: 22 }}>שמור</button>
    </div>
  );
}

/* תצוגת הטבלה + הטופס */
export default function HomepageImagesDesign({ banners, onUpload, onDelete }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* הטופס */}
      <BannerUploader onUpload={onUpload} />

      {/* כותרת + רשימה */}
      <h3 style={{ textAlign: "center", marginTop: 40 }}>תמונות קיימות</h3>
      {banners.length === 0 && (
        <p style={{ textAlign: "center" }}>אין עדיין תמונות.</p>
      )}

      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 20,
          justifyContent: "center"
        }}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #ccc", borderRadius: 8,
              padding: 12, width: 240, textAlign: "center"
            }}
          >
            <img
              src={b.url}
              alt={b.title}
              style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 4 }}
            />
            <p style={{ fontWeight: 600, margin: "8px 0 4px" }}>{b.title}</p>

            <button
              onClick={() => onDelete(b.id)}
              style={{
                marginTop: 10, padding: "4px 10px",
                background: "#e53935", color: "white",
                border: "none", borderRadius: 4, cursor: "pointer"
              }}
            >
              🗑️ מחק
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
