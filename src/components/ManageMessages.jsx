// =========  src/components/ManageMessages.jsx  =========
import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Button, Typography } from "@mui/material";

import MessageListContainer from "./MessageListContainer.jsx";

export default function ManageMessages() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* כותרת + כפתור “יצירת הודעה חדשה” */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">ניהול הודעות</Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/messages/create")}
        >
          יצירת הודעה חדשה
        </Button>
      </Box>

      {/* הרשימה עצמה */}
      <MessageListContainer />
    </Container>
  );
}
