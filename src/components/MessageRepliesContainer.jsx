// src/components/MessageRepliesContainer.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function MessageRepliesContainer() {
  const { id } = useParams();                 // ID של ההודעה
  const [message, setMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ——————————— load message plus replies ———————————
  useEffect(() => {
    async function load() {
    
      const msgSnap = await getDoc(doc(db, "messages", id));
      if (msgSnap.exists()) {
        setMessage({ id: msgSnap.id, ...msgSnap.data() });
      }

      // replies from new to old
      const q = query(
        collection(db, "messages", id, "replies"),
        orderBy("createdAt", "desc")          
      );
      const repSnap = await getDocs(q);
      setReplies(repSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setLoading(false);
    }
    load();
  }, [id]);

  // ——————————— delete reply ———————————
  async function handleDelete(replyId) {
    const yes = window.confirm("למחוק את התגובה לצמיתות?");
    if (!yes) return;

    try {
      await deleteDoc(doc(db, "messages", id, "replies", replyId));
      // הסרה מה-state כדי לעדכן מסך מיידית
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch (err) {
      console.error("Failed to delete reply:", err);
      alert("שגיאה במחיקה. נסה שוב.");
    }
  }

  // ——————————— render ———————————
  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography align="center">טוען...</Typography>
      </Container>
    );
  }

  if (!message) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error" align="center">
          ההודעה לא נמצאה
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* message card */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {message.title}
        </Typography>
        <Typography variant="body1">{message.body}</Typography>
      </Paper>

      {/* array for replies */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          תגובות ({replies.length})
        </Typography>

        {replies.length === 0 ? (
          <Typography align="center">אין תגובות להצגה.</Typography>
        ) : (
          <List disablePadding>
            {replies.map((r, idx) => {
              const ts =
                r.createdAt?.toDate?.().toLocaleString("he-IL") ?? "";
              return (
                <React.Fragment key={r.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <Tooltip title="מחק תגובה">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(r.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    }
                    sx={{ alignItems: "flex-start" }}
                  >
                    <ListItemText
                      primary={`${r.fullname || "אנונימי"} • ${ts}`}
                      secondary={r.replyText}
                      sx={{ whiteSpace: "pre-wrap" }}
                    />
                  </ListItem>
                  {idx !== replies.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}
