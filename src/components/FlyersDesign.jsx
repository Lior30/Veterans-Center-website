// src/components/FlyersDesign.jsx

import React from "react";

export default function FlyersDesign({
  flyers,
  dialogOpen,
  form,
  onNew,
  onEdit,
  onDelete,
  onFormChange,
  onSave,
  onClose,
}) {
  // Simple drag-and-drop handlers
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // use FlyerService.uploadFile to upload and get URL
      const url = await import("./FlyerService").then((m) =>
        m.default.uploadFile(file)
      );
      onFormChange({ ...form, fileUrl: url });
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div style={{ padding: 40 }}>
      <h2>ניהול פליירים</h2>
      <button onClick={onNew}>הוסף פלייר חדש</button>

      <ul>
        {flyers.map((flyer) => (
          <li key={flyer.id} style={{ margin: "10px 0" }}>
            <strong>{flyer.name}</strong>{" "}
            <a href={flyer.fileUrl} target="_blank" rel="noopener noreferrer">
              הצג
            </a>{" "}
            <button onClick={() => onEdit(flyer)}>ערוך</button>
            <button onClick={() => onDelete(flyer)}>מחק</button>
          </li>
        ))}
      </ul>

      {dialogOpen && (
        <div
          style={{
            border: "1px solid gray",
            padding: 20,
            marginTop: 20,
            maxWidth: 400,
          }}
        >
          <h3>{form.id ? "עריכת פלייר" : "פלייר חדש"}</h3>

          <input
            type="text"
            placeholder="שם הפלייר"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />

          {/* Drag-and-drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              border: "2px dashed #aaa",
              padding: 20,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {form.fileUrl
              ? <a href={form.fileUrl} target="_blank" rel="noopener noreferrer">קובץ מוכן לצפייה</a>
              : "גרור לכאן קובץ PDF/PNG או לחצן \"בחר קובץ\"\n"}
          </div>

          {/* Fallback file picker */}
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const url = await import("./FlyerService").then((m) =>
                  m.default.uploadFile(file)
                );
                onFormChange({ ...form, fileUrl: url });
              }
            }}
            style={{ display: "block", marginBottom: 10 }}
          />

          <div>
            <button onClick={onSave}>שמור</button>
            <button onClick={onClose}>בטל</button>
          </div>
        </div>
      )}
    </div>
  );
}
