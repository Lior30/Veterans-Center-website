// ============  src/components/PublicMessageBoardContainer.js  ============
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import MessageService from "../services/MessageService.js";
import ReplyContainer from "./ReplyContainer.jsx";

/**
 * לוח הודעות ציבורי עם גרירה-ושחרור לשינוי סדר.
 */
export default function PublicMessageBoardContainer() {
  const [messages,    setMessages]    = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const dragIndexRef = useRef(null);            // כדי לזכור מי נגרר

  /* ─── טעינת ההודעות ─── */
  useEffect(() => {
    MessageService.listActive()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);
  }, []);

  /* ─── Handlers לגרירה ─── */
  const handleDragStart = (idx) => () => {
    dragIndexRef.current = idx;
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (targetIdx) => async (e) => {
    e.preventDefault();
    const srcIdx = dragIndexRef.current;
    if (srcIdx === null || srcIdx === targetIdx) return;

    const msgA = messages[srcIdx];
    const msgB = messages[targetIdx];

    try {
      await MessageService.swapOrder(
        { id: msgA.id, order: msgA.order },
        { id: msgB.id, order: msgB.order }
      );

      // עדכון מקומי מהיר
      const updated = [...messages];
      updated[srcIdx]   = msgB;
      updated[targetIdx] = msgA;
      setMessages(updated);
    } catch (err) {
      console.error("swapOrder failed:", err);
    } finally {
      dragIndexRef.current = null;
    }
  };

  /* ─── UI ─── */
  return (
    <>
      <Box>
        {messages.map((m, idx) => (
          <Card
            key={m.id}
            sx={{ mb: 2, cursor: "grab" }}
            draggable
            onDragStart={handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(idx)}
          >
            <CardContent>
              <Typography variant="h6">{m.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {m.body}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => setSelectedMsg(m)}
              >
                השב
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* דיאלוג השבה */}
      <Dialog
        open={Boolean(selectedMsg)}
        onClose={() => setSelectedMsg(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>השב להודעה: {selectedMsg?.title}</DialogTitle>
        <DialogContent dividers>
          <ReplyContainer
            messageId={selectedMsg?.id}
            onClose={() => setSelectedMsg(null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMsg(null)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
