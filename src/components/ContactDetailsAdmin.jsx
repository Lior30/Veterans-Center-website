// src/components/ContactDetailsAdmin.jsx
import { useState, useEffect } from "react";
import {
  Container,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import ContactService from "../services/ContactService";

// Editable fields list
const FIELDS = [
  { key: 'contactPhone', label: 'מספר טלפון לקבלת שיחות' },
  { key: 'contactWhatsapp', label: 'מספר וואטסאפ לקבלת הודעות' },
  { key: 'contactEmail', label: 'כתובת אימייל שתוצג בדף הבית' },
  { key: 'contactAddress', label: 'כתובת שתוצג בדף הבית' },
  { key: 'contactMessage', label: 'הודעת יצירת קשר למשתמשים לא רשומים' }
];

export default function ContactDetailsAdmin() {
  const [values, setValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch existing settings
  useEffect(() => {
    ContactService.get().then(data => {
      setValues(data);
      setOriginalValues(data);
    });
  }, []);

  // Validation: must be 10 digits
  const isValidPhone = (val) => {
    const digits = val.replace(/\D/g, '');
    return /^\d{10}$/.test(digits);
  };

  // Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSelect = (key) => setSelectedKey(key);

  const handleChange = (e) =>
    setValues(prev => ({ ...prev, [selectedKey]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await ContactService.update(values);
      setOriginalValues(values);
      setSnackbar({ open: true, message: '✨ השינויים נשמרו בהצלחה ✨', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: '🚫 שגיאה בשמירה, נסה שוב', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const selectedField = FIELDS.find(f => f.key === selectedKey);
  const selectedValue = selectedKey ? values[selectedKey] ?? '' : '';
  const originalValue = selectedKey ? originalValues[selectedKey] ?? '' : '';

  // Determine if Save should be disabled
  const disableSave = saving ||
    selectedValue === originalValue ||
    ((selectedKey === 'contactPhone' || selectedKey === 'contactWhatsapp') && !isValidPhone(selectedValue)) ||
    (selectedKey === 'contactEmail' && !isValidEmail(selectedValue));

  return (
    <Container sx={{ pt: 4, pb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" align="center" gutterBottom>
        ניהול פרטי קשר
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 4,
          mt: 4,
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%'
        }}
      >
        {/* Sidebar */}
        <Paper
          elevation={3}
          sx={{ width: { xs: '100%', md: 290 }, p: 2, bgcolor: 'background.paper' }}
        >
          <Typography
            variant="h6"
            gutterBottom
            textAlign="right"
            sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'primary.main' }}
          >
            פריטים לעריכה
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List dir="rtl">
            {FIELDS.map(field => (
              <ListItemButton
                key={field.key}
                selected={selectedKey === field.key}
                onClick={() => handleSelect(field.key)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  transition: 'background-color 0.2s ease',
                  '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' }
                }}
              >
                <ListItemText
                  primary={field.label}
                  primaryTypographyProps={{ textAlign: 'right' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Detail panel */}
        <Paper
          elevation={3}
          sx={{ p: 3, width: { xs: '100%', md: 400 }, maxWidth: '100%' }}
        >
          {selectedKey ? (
            <>
              <TextField
                placeholder={selectedField.label}
                value={selectedValue}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 3 }}
                inputProps={{ dir: 'rtl' }}
                multiline={selectedKey === 'contactMessage'}
                rows={selectedKey === 'contactMessage' ? 4 : 1}
                error={
                  ((selectedKey === 'contactPhone' || selectedKey === 'contactWhatsapp') && selectedValue !== '' && !isValidPhone(selectedValue)) ||
                  (selectedKey === 'contactEmail' && selectedValue !== '' && !isValidEmail(selectedValue))
                }
                helperText={
                  (selectedKey === 'contactPhone' || selectedKey === 'contactWhatsapp') && selectedValue !== '' && !isValidPhone(selectedValue)
                    ? 'יש להזין 10 ספרות תקניות'
                    : selectedKey === 'contactEmail' && selectedValue !== '' && !isValidEmail(selectedValue)
                      ? 'כתובת אימייל אינה תקינה'
                      : ''
                }
              />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={disableSave}
                >
                  {saving ? 'שומר…' : 'שמור'}
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                בחר פריט מהרשימה מימין כדי לערוך אותו
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Snackbar message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%', fontSize: '1.3rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
