//src/components/MessageListContainer.jsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { db } from "../firebase";
import ActionFeedbackDialog from "./ActionFeedbackDialog";

/* ────────────────  Helpers  ──────────────── */
// hebrew date formatting
const formatTimestamp = (ts) => {
  if (!ts) return "";
  if (typeof ts === "string") return new Date(ts).toLocaleDateString("he-IL");
  if (typeof ts === "object" && ts.seconds !== undefined)
    return new Date(ts.seconds * 1_000).toLocaleDateString("he-IL");
  if (ts.toDate) return ts.toDate().toLocaleDateString("he-IL");
  return new Date(ts).toLocaleDateString("he-IL");
};

// type=date conversion for input fields
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


export default function MessageListContainer() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editActivity, setEditActivity] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const dragIndexRef = useRef(null);
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);


  // options for activity selection
  const activityOptions = ["פעילות א'", "פעילות ב'", "פעילות ג'"];

  /* Load messages & normalize order */
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
          // date normalization
          startDate: data.startDate,
          endDate: data.endDate,
        };
      });

      // orer normalization
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

  const [message, setMessage] = useState({
    open: false,
    type: 'success',
    text: '',
  });


  /*Swap helpers */
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

  /*Drag handlers*/
  const handleDragStart = (idx) => () => (dragIndexRef.current = idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetIdx) => async (e) => {
    e.preventDefault();
    const src = dragIndexRef.current;
    dragIndexRef.current = null;
    if (src == null || src === targetIdx) return;
    await swapByIndex(src, targetIdx);
  };

  /*Delete */
  const handleDelete = (id) => {
    setMessageToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteDoc(doc(db, "messages", messageToDelete));
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
      setMessage({
        open: true,
        type: 'success',
        text: 'ההודעה נמחקה בהצלחה',
      });
    } catch (err) {
      setMessage({
        open: true,
        type: 'error',
        text: 'שגיאה במחיקה',
      });
    } finally {
      setConfirmOpen(false);
      setMessageToDelete(null);
    }
  };


  /*Begin editing*/
  const startEditing = (m) => {
    setEditingId(m.id);
    setEditTitle(m.title || "");
    setEditBody(m.body || "");
    setEditActivity(m.activity || "");
    setEditStartDate(toInputDate(m.startDate));
    setEditEndDate("");
  };
  const cancelEditing = () => setEditingId(null);

  /*Save edits*/
  const saveEditing = async () => {
    try {
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
      setMessage({
        open: true,
        type: 'success',
        text: 'ההודעה נשמרה בהצלחה',
      });
    } catch (err) {
      console.error(err);
      setMessage({
        open: true,
        type: 'error',
        text: 'שגיאה בעת שמירת ההודעה',
      });
    }
  };

  /*Render*/
  if (loading) return <Typography align="center">טוען...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        כל ההודעות
      </Typography>

      <TextField
        placeholder="חיפוש לפי כותרת"
        fullWidth
        sx={{
          mb: 3,
          '& .MuiInputBase-input': {
            direction: 'rtl',
            textAlign: 'right'
          }
        }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {messages.filter((m) => m.title?.toLowerCase().includes(search.toLowerCase())).map((m, idx) => (
        <Paper
          key={m.id}
          sx={{
            p: 3,
            mb: 2,
            border: '1px solid',
            borderColor: 'custom.outline'  // Uses the outline color from your theme
          }}
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
            /* DISPLAY MODE*/
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
        text="האם למחוק את ההודעה הזו?"
      />


    </Container>
  );
}
