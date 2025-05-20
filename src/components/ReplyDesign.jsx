import React from "react";
import {
  Container,
  Stack,
  Typography,
  TextField,
  Button
} from "@mui/material";

export default function ReplyDesign({
  message,
  fullname,
  phone,
  replyText,
  onFullnameChange,
  onPhoneChange,
  onReplyChange,
  onSubmit,
  onCancel,
}) {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        השב להודעה: {message.title}
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="שם מלא"
          variant="outlined"
          fullWidth
          value={fullname}
          onChange={onFullnameChange}
        />
        <TextField
          label="טלפון"
          variant="outlined"
          fullWidth
          value={phone}
          onChange={onPhoneChange}
        />
        <TextField
          label="הודעה"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={replyText}
          onChange={onReplyChange}
          InputProps={{
            sx: {
              fontSize: "1.2rem"
            }
          }}
        />
        <Button variant="contained" onClick={onSubmit}>
          שלח תגובה
        </Button>
        <Button variant="text" onClick={onCancel}>
          ביטול
        </Button>
      </Stack>
    </Container>
); }
