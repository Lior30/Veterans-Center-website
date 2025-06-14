import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

// ✅ Define CAPTCHA callback (must be global)
function onCaptchaVerify(token) {
  console.log('✅ CAPTCHA success, token:', token);
  window.dispatchEvent(new CustomEvent('captcha-verified', { detail: token }));
}

// ✅ Generate email/password from admin username and password
export const generateEmailPasswordFromUserName = (userName, password) => {
  const email = `website_admin_${userName}@veterans.com`;
  const generatedPassword = `website_Admin!${password}#2025`;
  return { email, password: generatedPassword };
};

const AdminSignIn = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth(app);

  // ✅ Render CAPTCHA manually once grecaptcha is ready
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        clearInterval(interval);
        console.log('✅ reCAPTCHA loaded. Rendering...');
        window.grecaptcha.render('recaptcha-container', {
          sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
          callback: onCaptchaVerify,
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // ✅ Listen for captcha verification
  useEffect(() => {
    const handleCaptcha = (e) => {
      console.log('✅ CAPTCHA verified via event:', e.detail);
      setCaptchaPassed(true);
    };

    window.addEventListener('captcha-verified', handleCaptcha);
    return () => window.removeEventListener('captcha-verified', handleCaptcha);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaPassed) {
      setErrorMsg('אנא אמת את עצמך עם CAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const { email, password: generatedPassword } = generateEmailPasswordFromUserName(userName, password);
      const userCredential = await signInWithEmailAndPassword(auth, email, generatedPassword);
      console.log('✅ Admin signed in:', userCredential.user.email);
      navigate('/home');
    } catch (err) {
      console.error('❌ Sign-in error:', err.code, err.message);
      setErrorMsg('שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        התחברות מנהל
      </Typography>

      <Box component="form" onSubmit={handleSignIn} noValidate>
        <TextField
          placeholder="שם משתמש"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          placeholder="סיסמא"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {/* ✅ Google reCAPTCHA widget renders here */}
        <div id="recaptcha-container" style={{ marginTop: '16px', marginBottom: '8px' }}></div>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'התחבר'}
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      )}
    </Container>
  );
};

export default AdminSignIn;
