import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
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
      {/* …other Home content above… */}

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
    </>
  );
}
