
import React, { useState } from "react";
import { Container, Typography, Card, CardContent, CardActions, Button, TextField } from "@mui/material";

export default function MessageListDesign({ messages, onDelete, onViewReplies }) {
  const [search, setSearch] = useState("");

  const filteredMessages = messages.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        כל ההודעות
      </Typography>
      <TextField
        label="חיפוש לפי כותרת"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        inputProps={{ style: { textAlign: "right" } }}
      />
      {filteredMessages.length === 0 ? (
        <Typography align="center">אין הודעות להצגה.</Typography>
      ) : (
        filteredMessages.map((m) => (
          <Card key={m.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{m.title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                ב: {m.activityId || "כללי"}
              </Typography>
              <Typography sx={{ mt: 2 }}>{m.body}</Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => onViewReplies(m.id)}>
                הצג תגובות
              </Button>
              <Button size="small" color="error" onClick={() => onDelete(m.id)}>
                מחיקה
              </Button>
            </CardActions>
          </Card>
        ))
      )}
    </Container>
  );
}
