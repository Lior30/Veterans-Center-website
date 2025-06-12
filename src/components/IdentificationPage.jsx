// src/components/IdentifyPage.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

const auth = getAuth();

const generateEmailPassword = (phoneNumber) => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return {
    email: `vet${digitsOnly}@veterans.com`,
    password: `Vet!${digitsOnly}#2025`
  };
};

const isValidPhone = (phone) => /^05\d{8}$/.test(phone.replace(/\D/g, ''));

export default function IdentifyPage({ onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const ADMIN_CONTACT = 'לפרטים והרשמה לאתר, אנא צרו קשר במספר: 052-370-5021';

  const handleLogin = async () => {
    const trimmed = phoneNumber.trim();
    if (!isValidPhone(trimmed)) {
      setMessage('טלפון לא תקין. הקלד מספר בפורמט 05XXXXXXXX');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { email, password } = generateEmailPassword(trimmed);
      console.log('[IdentifyPage] attempting login with', email, password);
      await signInWithEmailAndPassword(auth, email, password);

      console.log('[IdentifyPage] login succeeded');
      setLoading(false);
      // only call onSuccess here
      if (typeof onSuccess === 'function') {
        console.log('[IdentifyPage] calling onSuccess()');
        onSuccess();
      }
    } catch (e) {
      console.error('[IdentifyPage] login failed', e);
      setLoading(false);
      setMessage(ADMIN_CONTACT);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        הזדהות
      </Typography>

      <TextField
        label="טלפון"
        placeholder="05XXXXXXXX"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        fullWidth
        margin="normal"
        error={phoneNumber && !isValidPhone(phoneNumber)}
        helperText={phoneNumber && !isValidPhone(phoneNumber) ? 'פורמט לא תקין' : ' '}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handleLogin}
        disabled={loading}
        sx={{ mt: 1 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'התחבר'}
      </Button>

      {message && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Container>
  );
}
