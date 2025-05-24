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
      {/* Scrolling ticker, flush under navbar */}
      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          bgcolor: "primary.main",
          height: 80,
          display: "flex",
          alignItems: "center",
          mt: 0,
        }}
      >
        <Box
          component="div"
          sx={{
            display: "inline-block",
            whiteSpace: "nowrap",
            animation: "marquee 20s linear infinite",
            "&:hover": { animationPlayState: "paused" },
            "@keyframes marquee": {
              "0%": { transform: "translateX(0)" },
              "100%": { transform: "translateX(-50%)" },
            },
          }}
        >
          {tickerMessages.map((m, idx) => (
            <Box
              key={idx}
              sx={{ display: "inline-flex", alignItems: "center", mx: 4 }}
            >
              <Typography
                component="span"
                sx={{
                  color: "#fff",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {m.title}: {m.body}
              </Typography>
              <Button
                component={RouterLink}
                to={`/messages/reply/${m.id}`}
                variant="outlined"
                size="small"
                sx={{ ml: 1, color: "#fff", borderColor: "#fff" }}
              >
                השב
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

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
