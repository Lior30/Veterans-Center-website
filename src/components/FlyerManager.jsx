// =========  FlyerManager.jsx  =========
import React, { useState, useEffect, useRef } from "react";
import FlyerUploader from "./FlyerUploaderArea.jsx";
import FlyerService from "../services/FlyerService.js";

export default function FlyerManager() {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* זוכר מאיזה אינדקס גוררים */
  const dragIndexRef = useRef(null);

  /* ───── טעינה ראשונית ───── */
  useEffect(() => {
    (async () => {
      const list = await FlyerService.getFlyers();
      setFlyers(list);
      setLoading(false);
    })();
  }, []);

  /* ───── Drag & Drop ───── */
  const handleDragStart = (_, idx) => (dragIndexRef.current = idx);

  const handleDragOver = (e) => e.preventDefault();

  const handleDragEnter = async (_, hoverIdx) => {
    const dragIdx = dragIndexRef.current;
    if (dragIdx === null || dragIdx === hoverIdx) return;

    const updated = [...flyers];
    // החלפה במערך
    [updated[dragIdx], updated[hoverIdx]] = [
      updated[hoverIdx],
      updated[dragIdx],
    ];
    // עדכון order בשניהם
    updated[dragIdx].order = dragIdx;
    updated[hoverIdx].order = hoverIdx;

    // UI מיידי
    setFlyers(updated);
    dragIndexRef.current = hoverIdx;

    // ושמירה ב-DB
    try {
      await FlyerService.swapOrder(
        { id: updated[dragIdx].id, order: dragIdx },
        { id: updated[hoverIdx].id, order: hoverIdx }
      );
    } catch (err) {
      alert("שמירת הסדר נכשלה: " + err.code);
      // משחזר כדי לא להישאר לא-מסונכרן
      const fresh = await FlyerService.getFlyers();
      setFlyers(fresh);
      dragIndexRef.current = null;
    }
  };

  /* ───── מחיקה ───── */
  const handleDelete = async (flyer) => {
    if (!window.confirm(`למחוק את "${flyer.name}"?`)) return;

    try {
      await FlyerService.deleteFlyer(flyer);
      // רענון הרשימה אחרי מחיקה
      setFlyers(await FlyerService.getFlyers());
    } catch (err) {
      alert("המחיקה נכשלה: " + err.code);
    }
  };

  /* ───── רענון אחרי העלאה ───── */
  const refreshList = async () => setFlyers(await FlyerService.getFlyers());

  /* ───── UI ───── */
  return (
    <div
      dir="rtl"
      style={{ maxWidth: 1150, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>ניהול פלייארים</h2>

      {/* אזור העלאה */}
      <FlyerUploader onUpload={refreshList} />

      {/* רשימה */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ marginBottom: 12 }}>פלייארים קיימים:</h3>
        {loading ? (
          <p>טוען...</p>
        ) : flyers.length === 0 ? (
          <p>אין פלייארים כרגע</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "center",
            }}
          >
            {flyers.map((flyer, idx) => (
              <div
                key={flyer.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                style={{
                  width: 200,
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
                  src={flyer.fileUrl}
                  alt={flyer.name}
                  style={{
                    width: "100%",
                    height: 250,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
                <p style={{ margin: "8px 0 4px", fontWeight: 600 }}>
                  {flyer.name}
                </p>

                {/* כפתור מחיקה */}
                <button
                  onClick={() => handleDelete(flyer)}
                  style={{
                    background: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  מחק
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
