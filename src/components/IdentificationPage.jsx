// src/components/IdentifyPage.jsx
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography
} from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import ContactService from '../services/ContactService';
import UserService from '../services/UserService';

const auth = getAuth();

export const generateEmailPassword = (phoneNumber) => {
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

  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    ContactService.get().then(data => {
      if (data?.contactMessage) {
        setContactMessage(data.contactMessage);
      }
    });
  }, []);

  const handleLogin = async () => {
    const trimmed = phoneNumber.trim();
    if (!isValidPhone(trimmed)) {
      setMessage('מספר טלפון אינו תקין. יש להזין מספר המתחיל ב־05 ואורכו 10 ספרות');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { email, password } = generateEmailPassword(trimmed);
      await signInWithEmailAndPassword(auth, email, password);

      // login succeeded but we need to check if the user exists
      const user = await UserService.get(trimmed);
      if (!user) {
        console.error('[IdentifyPage] user not found in database');
        setMessage(contactMessage);
        // remove  the user from firebase authentication
        await auth.currentUser.delete().catch((err) => {
          console.error('[IdentifyPage] failed to delete user from auth', err);
        });
        throw new Error('User not found in database and removed from auth');
      }
      else {
        sessionStorage.setItem("userPhone", trimmed);
        sessionStorage.setItem("justIdentified", "true");
      }

      setLoading(false);
      // only call onSuccess here
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (e) {
      setLoading(false);
      setMessage(contactMessage);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        הזדהות
      </Typography>

      <TextField
        placeholder="טלפון"
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
