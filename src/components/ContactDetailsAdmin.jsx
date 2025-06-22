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
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle, Error, Close } from "@mui/icons-material";
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
  const [message, setMessage] = useState({ open: false, text: '', type: 'success', title: '' });

  // Fetch existing settings
  useEffect(() => {
    ContactService.get().then(data => {
      setValues(data);
      setOriginalValues(data);
    });
  }, []);

  // Auto-hide message after 4 seconds
  useEffect(() => {
    if (message.open) {
      const timer = setTimeout(() => {
        setMessage(prev => ({ ...prev, open: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.open]);

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
      setMessage({ 
        open: true, 
        text: 'השינויים נשמרו בהצלחה במערכת', 
        type: 'success',
        title: 'פעולה הושלמה בהצלחה'
      });
    } catch (err) {
      console.error(err);
      setMessage({ 
        open: true, 
        text: 'אירעה שגיאה בשמירת השינויים. אנא נסה שוב', 
        type: 'error',
        title: 'שגיאה בשמירה'
      });
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

      {/* Large Modal Message for Seniors */}
      <Dialog
              open={message.open}
              // Only close when user clicks the button
              onClose={(e, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                  setMessage(prev => ({ ...prev, open: false }));
                }
              }}
              maxWidth="xs"
              PaperProps={{
                sx: {
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 1,
                  // Vibrant border using main palette colors
                  border: theme => `3px solid ${theme.palette[message.type === 'success' ? 'success' : 'error'].main}`,
                  boxShadow: 2
                }
              }}
            >
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  {message.type === 'success' ? (
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                  ) : (
                    <Error sx={{ fontSize: 64, color: 'error.main', mb: 1 }} />
                  )}
                </Box>
                <Typography
                  variant="h5"                // increased heading size
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: message.type === 'success' ? 'success.main' : 'error.main'
                  }}
                >
                  {message.title}
                </Typography>
                <Typography
                  variant="body1"             // increased body size
                  sx={{
                    fontSize: '1.8rem',         // explicitly larger font
                    lineHeight: 1.6,
                    color: 'text.primary'
                  }}
                >
                  {message.text}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 1 }}>
                <Button
                  onClick={() => setMessage(prev => ({ ...prev, open: false }))}
                  variant="contained"
                  size="medium"
                  sx={{
                    fontSize: '1.2rem',          // larger button font
                    py: 1,
                    px: 4,                       // slightly more horizontal padding
                    // Use main colors for strong effect
                    bgcolor: message.type === 'success' ? 'success.main' : 'error.main',
                    color: 'common.white',
                    '&:hover': {
                      bgcolor: message.type === 'success' ? 'success.dark' : 'error.dark'
                    }
                  }}
                >
                  הבנתי
                </Button>
              </DialogActions>
            </Dialog>
    </Container>
  );
}