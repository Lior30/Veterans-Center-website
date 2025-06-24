//FlyerManager.jsx
import React, { useState, useEffect, useRef } from "react";
import FlyerUploader from "./FlyerUploaderArea.jsx";
import FlyerService from "../services/FlyerService.js";

export default function FlyerManager() {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);

  /*remember the index*/
  const dragIndexRef = useRef(null);

  /*first load */
  useEffect(() => {
    (async () => {
      const list = await FlyerService.getFlyers();
      setFlyers(list);
      setLoading(false);
    })();
  }, []);

  /*Drag & Drop*/
  const handleDragStart = (_, idx) => (dragIndexRef.current = idx);

  const handleDragOver = (e) => e.preventDefault();

  const handleDragEnter = async (_, hoverIdx) => {
    const dragIdx = dragIndexRef.current;
    if (dragIdx === null || dragIdx === hoverIdx) return;

    const updated = [...flyers];
    // switצching the two flyers in the array
    [updated[dragIdx], updated[hoverIdx]] = [
      updated[hoverIdx],
      updated[dragIdx],
    ];
    // and updating their order
    updated[dragIdx].order = dragIdx;
    updated[hoverIdx].order = hoverIdx;

    // UI update
    setFlyers(updated);
    dragIndexRef.current = hoverIdx;

    //  saving the new order to the server
    try {
      await FlyerService.swapOrder(
        { id: updated[dragIdx].id, order: dragIdx },
        { id: updated[hoverIdx].id, order: hoverIdx }
      );
    } catch (err) {
      alert("שמירת הסדר נכשלה: " + err.code);
      // if saving fails, revert the UI change
      const fresh = await FlyerService.getFlyers();
      setFlyers(fresh);
      dragIndexRef.current = null;
    }
  };

  /*delete */
  const handleDelete = async (flyer) => {
    if (!window.confirm(`למחוק את "${flyer.name}"?`)) return;

    try {
      await FlyerService.deleteFlyer(flyer);
      //remove from UI
      setFlyers(await FlyerService.getFlyers());
    } catch (err) {
      alert("המחיקה נכשלה: " + err.code);
    }
  };

  /* refresh*/
  const refreshList = async () => setFlyers(await FlyerService.getFlyers());

  /*UI */
  return (
    <div
      dir="rtl"
      style={{ maxWidth: 1150, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>ניהול פלייארים</h2>

      {/* upload area*/}
      <FlyerUploader onUpload={refreshList} />

      {/* list*/}
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

                {/* delete button*/}
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
