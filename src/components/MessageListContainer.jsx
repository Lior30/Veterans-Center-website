// src/components/MessageListContainer.jsx
import React, { useState, useEffect } from "react";
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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function MessageListContainer() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ────────────────── טעינה ראשונית ────────────────── */
  useEffect(() => {
    async function load() {
      // 1) מביאים הכול בלי orderBy כדי לקבל גם הודעות שחסר להן 'order'
      const snap = await getDocs(collection(db, "messages"));

      // 2) מכינים מערך + batch לעדכון
      const batch = writeBatch(db);
      let maxOrder = -1;

      const msgs = snap.docs.map((d) => {
        const data = d.data();
        // שמירת order המקסימלי שנמצא
        if (typeof data.order === "number" && data.order > maxOrder) {
          maxOrder = data.order;
        }
        return { id: d.id, ...data };
      });

      // 3) מעניקים order חדש למי שחסר
      msgs.forEach((m) => {
        if (typeof m.order !== "number") {
          maxOrder += 1;
          m.order = maxOrder; // מוסיפים גם לאובייקט המקומי
          batch.update(doc(db, "messages", m.id), { order: maxOrder });
        }
      });

      // אם יש מה לעדכן – מבצעים commit יחיד
      if (maxOrder >= 0 && !batch._mutations?.length === false) {
        await batch.commit();
      }

      // 4) ממיינים לפי order ועוברים ל-UI
      msgs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setMessages(msgs);
      setLoading(false);
    }
    load();
  }, []);

  /* ────────────────── פונקציית הזזה ────────────────── */
  async function move(idx, direction) {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= messages.length) return;

    const msgA = messages[idx];
    const msgB = messages[targetIdx];

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "messages", msgA.id), { order: msgB.order });
      batch.update(doc(db, "messages", msgB.id), { order: msgA.order });
      await batch.commit();

      setMessages((prev) => {
        const copy = [...prev];
        copy[idx] = msgB;
        copy[targetIdx] = msgA;
        return copy;
      });
    } catch (err) {
      console.error("move failed", err);
      alert("שגיאה בהחלפת הסדר");
    }
  }

  /* ────────────────── רנדר ────────────────── */
  if (loading) return <Typography align="center">טוען...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        כל ההודעות
      </Typography>

      {messages.map((m, idx) => (
        <Paper key={m.id} sx={{ p: 3, mb: 2 }}>
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

            {/* כפתורי סדר */}
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
