// src/components/IdentifyPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Formula: generate email/password from phone number
const generateEmailPassword = (phoneNumber) => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const email = `vet${digitsOnly}@veterans.com`;            // vet0551234567@veterans.com
  const password = `Vet!${digitsOnly}#2025`;               // e.g. Vet!0551234567#2025
  return { email, password };
};

// Simple 10-digit validation (starts with 05)
const isValidPhone = (phone) => /^05\d{8}$/.test(phone.replace(/\D/g, ''));

const IdentifyPage = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // If sign-in fails, show this “contact admin” message:
  const ADMIN_CONTACT = 'לפרטים והרשמה לאתר, אנא צרו קשר, במספר: 052-370-5021';

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
      await signInWithEmailAndPassword(auth, email, password);

      // Success: redirect to the registered-users landing page:
      setLoading(false);
      navigate('/landingPage');
    } catch (e) {
      setLoading(false);
      setMessage(ADMIN_CONTACT);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        הזדהות:
      </Typography>

      <TextField
        label="טלפון"
        placeholder="05XXXXXXXX"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        fullWidth
        margin="normal"
        error={phoneNumber && !isValidPhone(phoneNumber)}
        helperText={
          phoneNumber && !isValidPhone(phoneNumber) ? 'פורמט לא תקין' : ' '
        }
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
};

export default IdentifyPage;
