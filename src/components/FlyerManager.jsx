import React, { useState, useEffect, useRef } from "react";
import FlyerUploader from "./FlyerUploaderArea.jsx";
import FlyerService from "../services/FlyerService.js";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

export default function FlyerManager() {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const dragIndexRef = useRef(null);

  // New: edit dialog state
  const [editingFlyer, setEditingFlyer] = useState(null);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  /* first load */
  useEffect(() => {
    (async () => {
      const list = await FlyerService.getFlyers();
      setFlyers(list);
      setLoading(false);
    })();
  }, []);

  /* Drag & Drop */
  const handleDragStart = (_, idx) => (dragIndexRef.current = idx);

  const handleDragOver = (e) => e.preventDefault();

  const handleDragEnter = async (_, hoverIdx) => {
    const dragIdx = dragIndexRef.current;
    if (dragIdx === null || dragIdx === hoverIdx) return;

    const updated = [...flyers];
    [updated[dragIdx], updated[hoverIdx]] = [updated[hoverIdx], updated[dragIdx]];
    updated[dragIdx].order = dragIdx;
    updated[hoverIdx].order = hoverIdx;

    setFlyers(updated);
    dragIndexRef.current = hoverIdx;

    try {
      await FlyerService.swapOrder(
        { id: updated[dragIdx].id, order: dragIdx },
        { id: updated[hoverIdx].id, order: hoverIdx }
      );
    } catch (err) {
      alert("שמירת הסדר נכשלה: " + err.code);
      const fresh = await FlyerService.getFlyers();
      setFlyers(fresh);
      dragIndexRef.current = null;
    }
  };

  /* Delete */
  const handleDelete = async (flyer) => {
    if (!window.confirm(`למחוק את "${flyer.name}"?`)) return;
    try {
      await FlyerService.deleteFlyer(flyer);
      setFlyers(await FlyerService.getFlyers());
    } catch (err) {
      alert("המחיקה נכשלה: " + err.code);
    }
  };

  /* Refresh */
  const refreshList = async () => setFlyers(await FlyerService.getFlyers());

  /* Save edited dates */
  const handleSaveDates = async () => {
    if (!editingFlyer) return;
    if (newEndDate && newStartDate && newEndDate < newStartDate) {
      alert("תאריך סיום חייב להיות אחרי תאריך התחלה");
      return;
    }
    try {
      await FlyerService.updateFlyerDates(editingFlyer.id, newStartDate, newEndDate);
      setEditingFlyer(null);
      refreshList();
    } catch (err) {
      alert("שמירת התאריכים נכשלה: " + (err.code || err.message));
    }
  };

  /* UI */
  return (
    <div
      dir="rtl"
      style={{ maxWidth: 1150, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>ניהול פלייארים</h2>

      <FlyerUploader onUpload={refreshList} />

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

                <button
                  onClick={() => {
                    setEditingFlyer(flyer);
                    setNewStartDate(flyer.startDate?.toDate ? flyer.startDate.toDate().toISOString().substr(0,10) : "");
                    setNewEndDate(flyer.endDate?.toDate ? flyer.endDate.toDate().toISOString().substr(0,10) : "");
                  }}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                    marginTop: 6,
                  }}
                >
                  ערוך תאריכים
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingFlyer} onClose={() => setEditingFlyer(null)}>
        <DialogTitle>עריכת תאריכים</DialogTitle>
        <DialogContent>
          <TextField
            label="הצג החל מ־"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={newStartDate}
            onChange={(e) => setNewStartDate(e.target.value)}
            margin="dense"
          />
          <TextField
            label="ועד (כולל)"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingFlyer(null)}>ביטול</Button>
          <Button onClick={handleSaveDates} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
