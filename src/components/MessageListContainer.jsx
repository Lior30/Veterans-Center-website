// =========  src/components/MessageListContainer.jsx  =========
import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import {
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";
import ArrowUpwardIcon   from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function MessageListContainer() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* אינדקס הכרטיס שנגרר כרגע (useRef כדי לא לזרז רנדרים) */
  const dragIndexRef = useRef(null);

  /* ─────────────────────  טעינה ראשונית  ───────────────────── */
  useEffect(() => {
    async function load() {
      // 1) מביאים הכול (גם כאלה בלי order)
      const snap = await getDocs(collection(db, "messages"));

      // 2) מערך מקומי + batch לעדכון order חסר
      const batch = writeBatch(db);
      let maxOrder = -1;

      const msgs = snap.docs.map((d) => {
        const data = d.data();
        if (typeof data.order === "number" && data.order > maxOrder) {
          maxOrder = data.order;
        }
        return { id: d.id, ...data };
      });

      // 3) נותנים order חדש לאלה שחסר
      msgs.forEach((m) => {
        if (typeof m.order !== "number") {
          maxOrder += 1;
          m.order = maxOrder;
          batch.update(doc(db, "messages", m.id), { order: maxOrder });
        }
      });

      if (batch._mutations?.length) await batch.commit();

      // 4) מיון לפי order
      msgs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setMessages(msgs);
      setLoading(false);
    }
    load();
  }, []);

  /* ─────────────────────  פונקציית החלפה כללית  ───────────────────── */
  async function swapByIndex(i1, i2) {
    if (i1 < 0 || i2 < 0 || i1 >= messages.length || i2 >= messages.length)
      return;

    const msgA = messages[i1];
    const msgB = messages[i2];

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "messages", msgA.id), { order: msgB.order });
      batch.update(doc(db, "messages", msgB.id), { order: msgA.order });
      await batch.commit();

      setMessages((prev) => {
        const copy = [...prev];
        copy[i1] = msgB;
        copy[i2] = msgA;
        return copy;
      });
    } catch (err) {
      console.error("swap failed", err);
      alert("שגיאה בהחלפת הסדר");
    }
  }

  /* כפתורי ↑ ↓ משתמשים בזה */
  const move = (idx, direction) => swapByIndex(idx, idx + direction);

  /* ─────────────────────  Drag handlers  ───────────────────── */
  const handleDragStart = (idx) => () => {
    dragIndexRef.current = idx;
  };

  const handleDragOver = (e) => e.preventDefault(); // מאפשר drop

  const handleDrop = (targetIdx) => async (e) => {
    e.preventDefault();
    const srcIdx = dragIndexRef.current;
    dragIndexRef.current = null;
    if (srcIdx === null || srcIdx === targetIdx) return;
    await swapByIndex(srcIdx, targetIdx);
  };

  /* ─────────────────────  Render  ───────────────────── */
  if (loading) return <Typography align="center">טוען...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        כל ההודעות
      </Typography>

      {messages.map((m, idx) => (
        <Paper
          key={m.id}
          sx={{ p: 3, mb: 2, cursor: "grab" }}
          draggable
          onDragStart={handleDragStart(idx)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(idx)}
        >
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            {/* תוכן ההודעה */}
            <Stack>
              <Typography variant="h6">{m.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {m.body}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Link to={`/messages/replies/${m.id}`}>הצג תגובות</Link>
              </Stack>
            </Stack>

            {/* כפתורי מיקום */}
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
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Container>
  );
}
