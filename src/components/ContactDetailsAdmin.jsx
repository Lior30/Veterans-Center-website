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
        onClose={(e, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setMessage(prev => ({ ...prev, open: false }));
          }
        }}
        maxWidth="sm"
        PaperProps={{
          sx: {
            p: 3,
            textAlign: 'center',
            borderRadius: 2,
            border: theme => `3px solid ${theme.palette.primary.main}`,
            boxShadow: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <CheckCircle 
              sx={{ 
                fontSize: 72, 
                color: 'primary.main', 
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }} 
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'primary.main',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
          התוכן עודכן בהצלחה!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setMessage(prev => ({ ...prev, open: false }))}
            variant="contained"
            size="large"
            sx={{
              fontSize: '1.3rem',
              py: 1.5,
              px: 6,
              bgcolor: 'primary.main',
              color: 'common.white',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            הבנתי
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}