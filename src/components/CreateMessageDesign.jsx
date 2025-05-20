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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" align="center">
          צור הודעה חדשה
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="act-label">קשר לפעילות</InputLabel>
          <Select
            labelId="act-label"
            id="activityId"
            name="activityId"
            value={values.activityId}
            label="קשר לפעילות"
            onChange={onChange}
          >
            <MenuItem value="">כללי</MenuItem>
            {activities.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <Button variant="contained" size="large" onClick={onSubmit}>
          שלח
        </Button>
      </Stack>
    </Container>
  );
}