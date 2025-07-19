import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebase'; // your initialized Firestore as `db`
import { browserSessionPersistence, setPersistence } from 'firebase/auth';

// CAPTCHA callback (same as before)…
function onCaptchaVerify(token) {
  window.dispatchEvent(new CustomEvent('captcha-verified', { detail: token }));
}

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
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      setErrorMsg('אימייל או סיסמא שגויים');
    } finally {
      setLoading(false);
    }
  };


  const handleForgot = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setInfoMsg('נשלח קישור לאיפוס הסיסמה');
    } catch (err) {
      setErrorMsg(`שגיאה: ${err.code || 'לא ידוע'}`);
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
                      onMouseLeave={() => setShowPassword(false)}
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