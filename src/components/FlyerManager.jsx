import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import FlyerService from "../services/FlyerService.js";
import ActionFeedbackDialog from "./ActionFeedbackDialog";
import ConfirmDialog from "./ConfirmDialog";
import FlyerUploader from "./FlyerUploaderArea.jsx";

export default function FlyerManager() {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const dragIndexRef = useRef(null);

  // New: edit dialog state
  const [editingFlyer, setEditingFlyer] = useState(null);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const [message, setMessage] = useState({ open: false, text: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flyerToDelete, setFlyerToDelete] = useState(null);

  /* first load */
  useEffect(() => {
    (async () => {
      const list = await FlyerService.getFlyers();
      setFlyers(list);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (editingFlyer) {
      setNewStartDate(
        editingFlyer.startDate?.toDate
          ? editingFlyer.startDate.toDate().toISOString().substr(0, 10)
          : ""
      );
      setNewEndDate(
        editingFlyer.endDate?.toDate
          ? editingFlyer.endDate.toDate().toISOString().substr(0, 10)
          : ""
      );
    }
  }, [editingFlyer]);


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
  const handleDelete = (flyer) => {
    setFlyerToDelete(flyer);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!flyerToDelete) return;
    try {
      await FlyerService.deleteFlyer(flyerToDelete);
      setFlyers(await FlyerService.getFlyers());
      setMessage({ open: true, type: "success", text: "הפלייר נמחק בהצלחה" });
    } catch (err) {
      setMessage({ open: true, type: "error", text: "המחיקה נכשלה" });
    } finally {
      setConfirmOpen(false);
      setFlyerToDelete(null);
    }
  };


  /* Refresh */
  const refreshList = async () => setFlyers(await FlyerService.getFlyers());

  /* Save edited dates */
  const handleSaveDates = async () => {
    if (!editingFlyer) return;

    if (newEndDate && newStartDate && new Date(newEndDate) < new Date(newStartDate)) {
      setMessage({ open: true, type: "error", text: "תאריך סיום חייב להיות אחרי תאריך התחלה" });
      return;
    }

    try {
      await FlyerService.updateFlyerDates(editingFlyer.id, newStartDate, newEndDate);
      setEditingFlyer(null);
      refreshList();
      setMessage({ open: true, type: "success", text: "התאריכים נשמרו בהצלחה" });
    } catch (err) {
      setMessage({ open: true, type: "error", text: "שמירת התאריכים נכשלה: " + (err.code || err.message) });
    }
  };

  /* UI */
  return (
    <div
      dir="rtl"
      style={{ maxWidth: 1150, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>ניהול פליירים</h2>

      <FlyerUploader onUpload={refreshList} />

      <div style={{ marginTop: 40 }}>
        <h3 style={{ marginBottom: 12 }}>פליירים קיימים:</h3>
        {loading ? (
          <p>טוען...</p>
        ) : flyers.length === 0 ? (
          <p>אין פליירים כרגע</p>
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
                    setNewStartDate(flyer.startDate?.toDate ? flyer.startDate.toDate().toISOString().substr(0, 10) : "");
                    setNewEndDate(flyer.endDate?.toDate ? flyer.endDate.toDate().toISOString().substr(0, 10) : "");
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

      <ActionFeedbackDialog
        open={message.open}
        type={message.type}
        text={message.text}
        onClose={() => setMessage((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="אישור מחיקה"
        text={`האם למחוק את הפלייר?`}
      />
    </div>
  );
}
