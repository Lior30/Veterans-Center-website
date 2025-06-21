// src/components/SectionTitle.jsx
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

export default function SectionTitle({ icon, title }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        mb: 4,
        px: 1,
        "& svg": {
          fontSize: 32,
          mr: 1.2,
          color: theme.palette.primary.main,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,.15))",
        },
        /* קו דקורטיבי מתחת לכותרת */
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -6,
          left: 0,
          width: "100%",
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          opacity: 0.85,
        },
      }}
    >
      {icon}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: theme.palette.primary.dark,
          textShadow: "0 1px 2px rgba(0,0,0,.1)",
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
