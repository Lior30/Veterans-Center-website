import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from '../firebase';      // your initialized Firestore as `db`
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// CAPTCHA callback (same as before)…
function onCaptchaVerify(token) {
  window.dispatchEvent(new CustomEvent('captcha-verified', { detail: token }));
}

export const generatePassword = (password) => {
  const generatedPassword = `website_Admin!${password}#2025`;
  return { password: generatedPassword };
};

const AdminSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  // render reCAPTCHA (same as before)…
  useEffect(() => {
    const iv = setInterval(() => {
      if (window.grecaptcha?.render) {
        clearInterval(iv);
        window.grecaptcha.render('recaptcha-container', {
          sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
          callback: onCaptchaVerify,
        });
      }
    }, 500);
    return () => clearInterval(iv);
  }, []);

  // listen for captcha
  useEffect(() => {
    const h = (e) => setCaptchaPassed(true);
    window.addEventListener('captcha-verified', h);
    return () => window.removeEventListener('captcha-verified', h);
  }, []);

  // — Admin login —
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!captchaPassed) {
      setErrorMsg('אנא אמת את עצמך עם CAPTCHA');
      return;
    }
    setLoading(true);
    try {
      const { password: genPwd } = generatePassword(password);
      await signInWithEmailAndPassword(auth, email, genPwd);

      navigate('/home');
    } catch {
      setErrorMsg('אימייל או סיסמא שגויים');
    } finally {
      setLoading(false);
    }
  };

  // — Forgot password —
  const handleForgot = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    // 1) Check they entered the correct admin email:
    if (resetEmail.trim() !== ADMIN_EMAIL) {
      setErrorMsg('כתובת האימייל לא נכונה');
      return;
    }

    setLoading(true);
    try {
      // 2) Send the password-reset email:
      await sendPasswordResetEmail(auth, resetEmail);
      setInfoMsg('נשלח קישור לאיפוס הסיסמה');
    } catch (err) {
      console.error('Error sending reset email:', err);
      // Note: with Email Enumeration Protection on, Firebase won't throw if email/user not found
      setErrorMsg('שגיאה בשליחת המייל, נסה שוב מאוחר יותר');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {forgotMode ? 'שכחתי סיסמא' : 'התחברות מנהל'}
      </Typography>

      <Box component="form" onSubmit={forgotMode ? handleForgot : handleSignIn} noValidate>
        {forgotMode ? (
          <TextField
            placeholder="הזן כתובת אימייל"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        ) : (
          <>
            <TextField
              placeholder="אימייל"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              placeholder="סיסמא"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}n
                      edge="end"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <div id="recaptcha-container" style={{ margin: '16px 0' }}></div>
          </>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : forgotMode ? 'שלח' : 'התחבר'}
        </Button>

        <Box mt={1} textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              setErrorMsg('');
              setInfoMsg('');
              setForgotMode(!forgotMode);
            }}
          >
            {forgotMode ? 'חזור להתחברות' : 'שכחתי סיסמא'}
          </Link>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
      {infoMsg && <Alert severity="success" sx={{ mt: 2 }}>{infoMsg}</Alert>}
    </Container>
  );
};

export default AdminSignIn;
