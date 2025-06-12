import { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MessageService from "../services/MessageService";

export default function Home() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Only general messages (no activityId)
    MessageService.list().then((ms) =>
      setMessages(ms.filter((m) => !m.activityId))
    );
  }, []);

  // Duplicate for seamless scroll
  const tickerMessages = [...messages, ...messages];

  return (
    <>

      {/* Admin button grid */}
      <Container sx={{ pt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          דף ניהול מרכז ותיקים
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
          <Button
            component={RouterLink}
            to="/activities"
            variant="outlined"
            fullWidth
          >
            ניהול פעילויות
          </Button>
          <Button
            component={RouterLink}
            to="/flyers"
            variant="outlined"
            fullWidth
          >
            ניהול פלאיירים
          </Button>
          <Button
            component={RouterLink}
            to="/surveys"
            variant="outlined"
            fullWidth
          >
            ניהול סקרים
          </Button>
          <Button
            component={RouterLink}
            to="/messages"
            variant="outlined"
            fullWidth
          >
            ניהול הודעות
          </Button>
          <Button
            component={RouterLink}
            to="/manage-users"
            variant="outlined"
            fullWidth
          >
            ניהול משתמשים
          </Button>
        </Stack>
      </Container>
    </>
  );
}
