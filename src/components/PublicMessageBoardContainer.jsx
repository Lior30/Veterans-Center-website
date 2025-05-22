import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import MessageService from "../services/MessageService.js";
import ReplyContainer from "./ReplyContainer.jsx";

export default function PublicMessageBoardContainer() {
  const [messages, setMessages]       = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    MessageService.list()
      .then(ms => setMessages(ms.filter(m => !m.activityId)))
      .catch(console.error);
  }, []);

  return (
    <>
      <Box>
        {messages.map(m => (
          <Card key={m.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{m.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {m.body}
              </Typography>
              {/* וודאי שאין כאן שום RouterLink או navigate */}
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

      {/* דיאלוג השב בתוך אותו עמוד */}
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
