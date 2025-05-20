// src/components/LandingPage.jsx
import React from "react";
import { useNavigate }                from "react-router-dom";
import { Container, Box, Button }     from "@mui/material";

import PublicMessageBoardContainer    from "./PublicMessageBoardContainer.jsx";
import CalendarPreview                from "./CalendarPreview.jsx";

/**
 * First screen ("/") that users see.
 *  • Messages at the top
 *  • Calendar in the middle
 *  • Button at the bottom ➜ /home (admin area)
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{ display: "flex", flexDirection: "column", gap: 4, my: 4 }}
    >
      {/* Messages */}
      <Box>
        <PublicMessageBoardContainer />
      </Box>

      {/* Calendar */}
      <Box>
        <CalendarPreview />
      </Box>

      {/* Go-to-Admin button */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/home")}
        >
          מעבר&nbsp;למערכת&nbsp;הניהול
        </Button>
      </Box>
    </Container>
  );
}
