// ActionFeedbackDialog.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon, Info } from "@mui/icons-material";

export default function ActionFeedbackDialog({ open, type, text, onClose }) {
  const icon =
    type === "success" ? (
      <CheckCircle
        sx={{
          fontSize: 72,
          color: "primary.main",
          mb: 2,
          mx: "auto",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
        }}
      />
    ) : type === "error" ? (
      <ErrorIcon
        sx={{
          fontSize: 72,
          color: "error.main",
          mb: 2,
          mx: "auto",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
        }}
      />
    ) : (
      <Info
        sx={{
          fontSize: 72,
          color: "info.main",
          mb: 2,
          mx: "auto",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
        }}
      />
    );

  const borderColor =
    type === "success"
      ? "primary.main"
      : type === "error"
      ? "error.main"
      : "info.main";

  const titleColor =
    type === "success"
      ? "primary.main"
      : type === "error"
      ? "error.main"
      : "info.main";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      sx={{ zIndex: 10000 }}
      PaperProps={{
        sx: {
          p: 3,
          textAlign: "center",
          borderRadius: 2,
          border: `3px solid`,
          borderColor,
          boxShadow: 4,
          backgroundColor: "#f9f9f9",
        },
      }}
    >
      <DialogContent>
        <Box sx={{ mb: 3 }}>{icon}</Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: titleColor,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {text}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            fontSize: "1.3rem",
            py: 1.5,
            px: 6,
            bgcolor: borderColor,
            color: "common.white",
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              bgcolor: `${borderColor}.dark`,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
            },
            transition: "all 0.3s ease",
          }}
        >
          הבנתי
        </Button>
      </DialogActions>
    </Dialog>
  );
}
