//src/components/ManageMessages.jsx 
import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import MessageListContainer from "./MessageListContainer.jsx";

export default function ManageMessages() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* "new message" */}
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

      {/* the list*/}
      <MessageListContainer />
    </Container>
  );
}
