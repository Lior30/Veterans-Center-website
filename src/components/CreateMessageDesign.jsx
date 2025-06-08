import React from "react";
import {
  Container,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";

export default function CreateMessageDesign({
  activities,
  values,
  errors,
  onChange,
  onSubmit,
}) {
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }} dir="rtl">
      <Typography variant="h5" gutterBottom textAlign="center">
        יצירת הודעה חדשה
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="כותרת"
          name="title"
          fullWidth
          value={values.title}
          onChange={onChange}
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextField
          label="תוכן"
          name="body"
          multiline
          rows={4}
          fullWidth
          value={values.body}
          onChange={onChange}
          error={!!errors.body}
          helperText={errors.body}
        />

        <FormControl fullWidth>
          <InputLabel>פעילות (לא חובה)</InputLabel>
          <Select
            name="activityId"
            value={values.activityId}
            onChange={onChange}
            label="פעילות (לא חובה)"
          >
            <MenuItem value="">
              <em>— ללא —</em>
            </MenuItem>
            {activities.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* תאריכים */}
        <TextField
          label="הצג החל מ־"
          name="startDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={values.startDate}
          onChange={onChange}
          fullWidth
        />

        <TextField
          label="הצג עד (כולל)"
          name="endDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={values.endDate}
          onChange={onChange}
          fullWidth
          error={!!errors.endDate}
          helperText={errors.endDate}
        />

        <Button variant="contained" size="large" onClick={onSubmit}>
          שמור
        </Button>
      </Stack>
    </Container>
  );
}
