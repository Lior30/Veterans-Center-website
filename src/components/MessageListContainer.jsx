// =========  src/components/MessageListContainer.jsx  =========
import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowUpwardIcon   from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon        from "@mui/icons-material/Delete";
import EditIcon          from "@mui/icons-material/Edit";
import { db } from "../firebase";
import { Link } from "react-router-dom";

/* ────────────────  Helpers  ──────────────── */
// תאריך קריא בעברית
const formatTimestamp = (ts) => {
  if (!ts) return "";
  if (typeof ts === "string") return new Date(ts).toLocaleDateString("he-IL");
  if (typeof ts === "object" && ts.seconds !== undefined)
    return new Date(ts.seconds * 1_000).toLocaleDateString("he-IL");
  if (ts.toDate) return ts.toDate().toLocaleDateString("he-IL");
  return new Date(ts).toLocaleDateString("he-IL");
};

// תאריך במבנה YYYY-MM-DD לשדות input[type=date]
const toInputDate = (ts) => {
  if (!ts) return "";
  let d;
  if (typeof ts === "string") d = new Date(ts);
  else if (typeof ts === "object" && ts.seconds !== undefined)
    d = new Date(ts.seconds * 1_000);
  else if (ts.toDate) d = ts.toDate();
  else d = new Date(ts);
  return d.toISOString().slice(0, 10);
};
/* ──────────────────────────────────────────── */

export default function MessageListContainer() {
  const [messages, setMessages]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [editingId, setEditingId]         = useState(null);
  const [editTitle, setEditTitle]         = useState("");
  const [editBody, setEditBody]           = useState("");
  const [editActivity, setEditActivity]   = useState("");
  const [editStartDate, setEditStartDate] = useState(""); // YYYY-MM-DD
  const [editEndDate, setEditEndDate]     = useState(""); // YYYY-MM-DD
  const dragIndexRef = useRef(null);

  // אפשרויות לדוגמה
  const activityOptions = ["פעילות א'", "פעילות ב'", "פעילות ג'"];

  /* ─── Load messages & normalize order ─── */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "messages"));
      const batch = writeBatch(db);
      let maxOrder = -1;

      const msgs = snap.docs.map((d) => {
        const data = d.data();
        if (typeof data.order === "number" && data.order > maxOrder)
          maxOrder = data.order;

        return {
          id: d.id,
          ...data,
          // המרות תאריך כבר עכשיו
          startDate: data.startDate,
          endDate  : data.endDate,
        };
      });

      // השלמת order חסרים
      msgs.forEach((m) => {
        if (typeof m.order !== "number") {
          maxOrder += 1;
          m.order = maxOrder;
          batch.update(doc(db, "messages", m.id), { order: maxOrder });
        }
      });
      if (batch._mutations?.length) await batch.commit();

      msgs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setMessages(msgs);
      setLoading(false);
    }
    load();
  }, []);

  /* ─── Swap helpers ─── */
  async function swapByIndex(i1, i2) {
    if (i1 < 0 || i2 < 0 || i1 >= messages.length || i2 >= messages.length)
      return;

    const a = messages[i1],
      b = messages[i2];
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "messages", a.id), { order: b.order });
      batch.update(doc(db, "messages", b.id), { order: a.order });
      await batch.commit();

      setMessages((prev) => {
        const copy = [...prev];
        [copy[i1], copy[i2]] = [copy[i2], copy[i1]];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert("שגיאה בהחלפת סדר ההודעות");
    }
  }
  const move = (idx, dir) => swapByIndex(idx, idx + dir);

  /* ─── Drag handlers ─── */
  const handleDragStart = (idx) => () => (dragIndexRef.current = idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetIdx) => async (e) => {
    e.preventDefault();
    const src = dragIndexRef.current;
    dragIndexRef.current = null;
    if (src == null || src === targetIdx) return;
    await swapByIndex(src, targetIdx);
  };

  /* ─── Delete ─── */
  const handleDelete = async (id) => {
    if (!window.confirm("מחק את ההודעה הזו?")) return;
    await deleteDoc(doc(db, "messages", id));
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  /* ─── Begin editing ─── */
  const startEditing = (m) => {
    setEditingId(m.id);
    setEditTitle(m.title || "");
    setEditBody(m.body || "");
    setEditActivity(m.activity || "");
    setEditStartDate(toInputDate(m.startDate));
    setEditEndDate(toInputDate(m.endDate));
  };
  const cancelEditing = () => setEditingId(null);

  /* ─── Save edits ─── */
  const saveEditing = async () => {
    const ref = doc(db, "messages", editingId);
    await updateDoc(ref, {
      title: editTitle,
      body: editBody,
      activity: editActivity,
      startDate: editStartDate
        ? Timestamp.fromDate(new Date(editStartDate))
        : null,
      endDate: editEndDate ? Timestamp.fromDate(new Date(editEndDate)) : null,
    });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              title: editTitle,
              body: editBody,
              activity: editActivity,
              startDate: editStartDate
                ? Timestamp.fromDate(new Date(editStartDate))
                : null,
              endDate: editEndDate
                ? Timestamp.fromDate(new Date(editEndDate))
                : null,
            }
          : m
      )
    );
    setEditingId(null);
  };

  /* ─── Render ─── */
  if (loading) return <Typography align="center">טוען...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        כל ההודעות
      </Typography>

      {messages.map((m, idx) => (
        <Paper
          key={m.id}
          sx={{ p: 3, mb: 2 }}
          draggable={editingId === null}
          onDragStart={editingId === null ? handleDragStart(idx) : undefined}
          onDragOver={editingId === null ? handleDragOver : undefined}
          onDrop={editingId === null ? handleDrop(idx) : undefined}
        >
          {editingId === m.id ? (
            /* ─── EDIT FORM ─── */
            <Stack spacing={2}>
              <Typography variant="h6" align="center">
                עריכת הודעה
              </Typography>

              <TextField
                label="כותרת"
                fullWidth
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <TextField
                label="תוכן"
                fullWidth
                multiline
                rows={4}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
              />

              <FormControl fullWidth>
                <InputLabel>פעילות (לא חובה)</InputLabel>
                <Select
                  value={editActivity}
                  label="פעילות (לא חובה)"
                  onChange={(e) => setEditActivity(e.target.value)}
                >
                  <MenuItem value="">ללא פעילות</MenuItem>
                  {activityOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="הצג מ־"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
              />

              <TextField
                label="הצג עד (כולל)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={cancelEditing}>ביטול</Button>
                <Button
                  variant="contained"
                  onClick={saveEditing}
                  disabled={!editTitle.trim()}
                >
                  שמור
                </Button>
              </Stack>
            </Stack>
          ) : (
            /* ─── DISPLAY MODE ─── */
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Stack>
                <Typography variant="h6">{m.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {m.body}
                </Typography>

                {m.activity && (
                  <Typography variant="caption" display="block">
                    פעילות: {m.activity}
                  </Typography>
                )}

                {m.startDate && (
                  <Typography variant="caption" display="block">
                    מ־ {formatTimestamp(m.startDate)}
                    {m.endDate && ` — עד ${formatTimestamp(m.endDate)}`}
                  </Typography>
                )}

                <Link to={`/messages/replies/${m.id}`}>הצג תגובות</Link>
              </Stack>

              <Stack>
                <Tooltip title="העבר למעלה">
                  <span>
                    <IconButton
                      size="small"
                      disabled={idx === 0}
                      onClick={() => move(idx, -1)}
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="העבר למטה">
                  <span>
                    <IconButton
                      size="small"
                      disabled={idx === messages.length - 1}
                      onClick={() => move(idx, +1)}
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="ערוך">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => startEditing(m)}
                    >
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="מחק">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(m.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          )}
        </Paper>
      ))}
    </Container>
  );
}
