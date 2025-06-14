// src/components/SurveyDetailDesign.jsx
import React from "react";
import { Box, TextField, Typography, Button } from "@mui/material";

export default function SurveyDetailDesign({
  survey,
  activityTitle,
  answers,
  errors,
  blocked,
  onChange,
  onSubmit,
  onCancel,
  submitted,
  submitError,
}) {
  const placeholderAlign = {
    inputProps: { style: { textAlign: "right" } },
    sx: {
      "& input::placeholder": { textAlign: "right" },
      "& textarea::placeholder": { textAlign: "right" },
    },
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 600, margin: "0 auto", direction: "rtl" }}>
      <Typography variant="h5" gutterBottom>
  {survey.headline}{" "}
  <small style={{ color: "red" }}>* שאלות חובה</small>
</Typography>

{activityTitle && activityTitle !== "כללי" && (
  <Typography variant="subtitle1" sx={{ fontStyle: "italic" }}>
    קשור לפעילות: {activityTitle}
  </Typography>
)}

{survey.expires_at && (
  <Typography variant="subtitle2" sx={{ mb: 2, color: "gray" }}>
     הסקר פתוח עד:{" "}
    {new Date(survey.expires_at).toLocaleString("he-IL", {
      dateStyle: "full",
      timeStyle: "short",
    })}
  </Typography>
)}


      <TextField
        placeholder="שם פרטי"
        value={answers.firstName || ""}
        onChange={(e) => onChange("firstName", e.target.value)}
        fullWidth
        error={!!errors.firstName}
        helperText={errors.firstName}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
        style={{ marginBottom: 16 }}
      />

      <TextField
        placeholder="שם משפחה"
        value={answers.lastName || ""}
        onChange={(e) => onChange("lastName", e.target.value)}
        fullWidth
        error={!!errors.lastName}
        helperText={errors.lastName}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
        style={{ marginBottom: 16 }}
      />

      <TextField
        placeholder="טלפון"
        value={answers.phone || ""}
        onChange={(e) => onChange("phone", e.target.value)}
        fullWidth
        error={!!errors.phone}
        helperText={errors.phone}
        inputProps={placeholderAlign.inputProps}
        sx={placeholderAlign.sx}
        style={{ marginBottom: 24 }}
      />

      {survey.questions
        .filter((q) => q.id !== "fullname" && q.id !== "phone")
        .map((q, idx) => (
          <Box key={q.id} sx={{ mb: 3 }}>
            <Typography>
              {idx + 1}. {q.text} {q.mandatory && <span style={{ color: "red" }}>*</span>}
            </Typography>
            {q.type === "open" ? (
              <TextField
                placeholder="ענה כאן…"
                multiline
                rows={3}
                fullWidth
                value={answers[q.id] || ""}
                onChange={(e) => onChange(q.id, e.target.value)}
                error={!!errors[q.id]}
                helperText={errors[q.id]}
                inputProps={placeholderAlign.inputProps}
                sx={placeholderAlign.sx}
              />
            ) : (
              q.options.map((opt, i) => (
                <Box key={i}>
                  <label>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={(e) => onChange(q.id, e.target.value)}
                    />{" "}
                    {opt}
                  </label>
                </Box>
              ))
            )}
          </Box>
        ))}

      {submitError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {submitError}
        </Typography>
      )}
      {blocked && (
        <Typography color="error" sx={{ mt: 2 }}>
          כבר מילאת סקר זה
        </Typography>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={onCancel}>
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          type="button"
          disabled={blocked}
        >
          שלח
        </Button>
      </Box>
    </Box>
  );
}