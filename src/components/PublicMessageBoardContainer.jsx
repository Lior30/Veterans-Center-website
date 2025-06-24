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
 * PublicMessageBoardContainer component displays a list of public messages
 */
export default function PublicMessageBoardContainer() {
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const dragIndexRef = useRef(null); 

  /* load messages*/
  useEffect(() => {
    MessageService.listActive()
      .then((ms) => setMessages(ms.filter((m) => !m.activityId)))
      .catch(console.error);
  }, []);

  /*  Handlers for drag */
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

      // fast update UI
      const updated = [...messages];
      updated[srcIdx] = msgB;
      updated[targetIdx] = msgA;
      setMessages(updated);
    } catch (err) {
      console.error("swapOrder failed:", err);
    } finally {
      dragIndexRef.current = null;
    }
  };

  /*UI*/
  return (
    <>
      <Box>
        {messages.map((m, idx) => (
          <Card
            key={m.id}
            sx={{
              mb: 2,
              cursor: "grab",
              boxShadow: 3,
              borderRadius: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)",
              border: "1px solid #e0e0e0",
            }}
            draggable
            onDragStart={handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(idx)}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  color: "#333",
                  mb: 1,
                }}
              >
                {m.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  fontSize: "0.95rem",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                }}
              >
                {m.body}
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  mt: 2,
                  backgroundColor: "#673ab7",
                  "&:hover": {
                    backgroundColor: "#5e35b1",
                  },
                  borderRadius: 2,
                  fontWeight: "bold",
                }}
                onClick={() => setSelectedMsg(m)}
              >
                השב
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* response dialoge*/}
      <Dialog
        open={Boolean(selectedMsg)}
        onClose={() => setSelectedMsg(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f3e5f5",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          השב להודעה: {selectedMsg?.title}
        </DialogTitle>
        <DialogContent dividers>
          <ReplyContainer
            messageId={selectedMsg?.id}
            onClose={() => setSelectedMsg(null)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedMsg(null)}
            sx={{
              fontWeight: "bold",
              color: "#673ab7",
            }}
          >
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
