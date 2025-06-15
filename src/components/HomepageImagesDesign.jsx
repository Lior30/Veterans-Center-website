import React, { useState, useRef } from "react";
import BannerService from "../services/BannerService.js"; // העלאה

/* ───────────────── טופס העלאה ───────────────── */
function BannerUploader({ onUpload }) {
  const [title, setTitle] = useState("");
  const [file,  setFile]  = useState(null);
  const [start, setStart] = useState("");
  const [end,   setEnd]   = useState("");
  const [duration, setDuration] = useState(5);
  const dropRef = useRef();

  const onFileChange = (e) => setFile(e.target.files[0]);
  const onDrop       = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); };
  const onDragOver   = (e) => e.preventDefault();

  async function handleSubmit() {
    if (!title.trim() || !file) { alert("שם וקובץ חובה"); return; }
    if (end && start && end < start) { alert("תאריך סיום לפני תאריך התחלה"); return; }

    try {
      await BannerService.uploadBanner({
        title, file, link: "", start, end, durationSec: Number(duration) || 5,
      });
      /* ניקוי */
      setTitle(""); setFile(null); setStart(""); setEnd(""); setDuration(5);
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

      {/* תאריכים */}
      <div style={{ marginTop: 10 }}>
        <label>
          הצג החל מ-
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        &nbsp;ועד&nbsp;
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>

      {/* משך הצגה */}
      <div style={{ marginTop: 10 }}>
        <label>
          משך הצגה (שניות):
          <input type="number" min="1" value={duration}
                 onChange={(e) => setDuration(e.target.value)}
                 style={{ width: 70, marginInlineStart: 8 }} />
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

/* ───────────────── רשימת תמונות ───────────────── */
export default function HomepageImagesDesign({
  banners, onUpload, onDelete,
  onDragStart, onDragEnter,
  onDurationChange, onDurationBlur
}) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <BannerUploader onUpload={onUpload} />

      <h3 style={{ textAlign: "center", marginTop: 40 }}>תמונות קיימות</h3>
      {banners.length === 0 && (
        <p style={{ textAlign: "center" }}>אין עדיין תמונות.</p>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragEnter={(e) => onDragEnter(e, idx)}
            style={{
              width: 220,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              padding: 8,
              textAlign: "center",
              background: "#fff",
              cursor: "grab",
              userSelect: "none",
            }}
          >
            <img
              src={banner.url}
              alt={banner.title}
              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4 }}
            />

            <h4 style={{ margin: "8px 0 0" }}>{banner.title}</h4>
            <small>סדר: {banner.order}</small>

            {/* עריכת משך הצגה */}
            <div style={{ marginTop: 6 }}>
              <label style={{ fontSize: 12 }}>
                משך (שניות):
                <input
                  type="number"
                  min="1"
                  value={banner.durationSec}
                  onChange={(e) => onDurationChange(banner.id, Number(e.target.value))}
                  onBlur={(e)   => onDurationBlur(banner.id, Number(e.target.value))}
                  style={{ width: 60, marginInlineStart: 6 }}
                />
              </label>
            </div>

            <button
              onClick={() => onDelete(banner)}
              style={{
                marginTop: 10,
                padding: "4px 10px",
                background: "#e53935",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
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
