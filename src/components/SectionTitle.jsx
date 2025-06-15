// src/components/SectionTitle.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

export default function SectionTitle({ icon, title }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 4,
        "& svg": { mr: 1, color: "#003366" },
      }}
    >
      {icon}
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#003366" }}>
        {title}
      </Typography>
    </Box>
  );
}
