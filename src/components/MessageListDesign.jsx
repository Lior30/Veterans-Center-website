import React from "react";
import { Container, Typography, Card, CardContent, CardActions, Button } from "@mui/material";

export default function MessageListDesign({ messages, onDelete, onViewReplies }) {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        כל ההודעות
      </Typography>
      {messages.length === 0 ? (
        <Typography align="center">אין הודעות לפרסום.</Typography>
      ) : (
        messages.map((m) => (
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