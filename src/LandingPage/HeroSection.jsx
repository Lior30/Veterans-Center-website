// src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { WhatsApp as WhatsAppIcon, Phone as PhoneIcon } from '@mui/icons-material';
import CtaButton from './CtaButton';
import BannerService from '../services/BannerService';
import ContactService from "../services/ContactService";

export default function HeroSection({ userProfile, onOpenIdentify, onOpenMyActivities }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    BannerService.getBanners()
      .then(items => setBanners(items.map(b => b.url)))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const displayDuration = 5000;
    const fadeDuration = 800;
    let hideTimeout, showTimeout, interval;

    const cycle = () => {
      hideTimeout = setTimeout(() => {
        setVisible(false);
        showTimeout = setTimeout(() => {
          setIdx(i => (i + 1) % banners.length);
          setVisible(true);
        }, fadeDuration);
      }, displayDuration);
    };

    cycle();
    interval = setInterval(cycle, displayDuration + fadeDuration * 2);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);
      clearInterval(interval);
    };
  }, [banners]);

  const [contact, setContact] = useState({
    contactPhone: "",
    contactWhatsapp: "",
  });

  useEffect(() => {
    ContactService.get().then(data => {
      setContact({
        contactPhone: data.contactPhone || "",
        contactWhatsapp: data.contactWhatsapp || "",
      });
    });
  }, []);

  const currentBg = banners[idx] || '';

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#F3E5F5',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: { xs: 0, sm: '20px' },
        overflow: 'hidden',
        my: { xs: 2, sm: 4 },
        mx: { xs: 0, sm: 'auto' },
        maxWidth: { xs: '100%', sm: '95%', md: '90%' },
        height: { xs: 250, sm: 250 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* רקע תמונה - חצי שמאל עם פינות עגולות */}
      <Fade in={visible} timeout={800}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '60%',
            height: '100%',
            backgroundImage: `url(${currentBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: { sm: '20px' },
            borderBottomLeftRadius: { sm: '20px' },
            opacity: visible ? 1 : 0,
          }}
        />
      </Fade>

      {/* מעבר חלק בצבע */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '45%',
          width: '10%',
          height: '100%',
          background: 'linear-gradient(to right, transparent, #fff)',
        }}
      />

      {/* רקע ימין */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '55%',
          width: '45%',
          height: '100%',
          backgroundColor: '#fff',
        }}
      />

      {/* תוכן עליון */}
      <Container sx={{ position: 'relative', zIndex: 1, py: 3 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              sx={{ color: '#6A0DAD', fontWeight: 700, mb: 2 }}
            >
              מרכז ותיקים בית הכרם
            </Typography>

            {userProfile?.first_name && (
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{ color: '#4B0082', fontWeight: 700, mb: 2 }}
              >
                שלום {userProfile.first_name}!
              </Typography>
            )}

            <Typography
              sx={{
                color: '#4B0082',
                mb: 3,
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              ברוכים הבאים למועדון שמביא לכם פעילויות, הרצאות ורווחה בכל יום!
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {!userProfile?.first_name && (
                <CtaButton color="primary" onClick={onOpenIdentify}>
                  הזדהות
                </CtaButton>
              )}
              <CtaButton
                sx={{ backgroundColor: '#CE93D8', color: 'white', '&:hover': { backgroundColor: '#BA68C8' } }}
                component="a"
                href={`https://wa.me/972${contact.contactWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
              >
                וואטסאפ
              </CtaButton>
              <CtaButton
                sx={{ backgroundColor: '#E1BEE7', color: 'black', '&:hover': { backgroundColor: '#D1A3D6' } }}
                component="a"
                href={`tel:972${contact.contactPhone}`}
                startIcon={<PhoneIcon />}
              >
                התקשר
              </CtaButton>
              {userProfile?.id && (
                <CtaButton
                  sx={{ backgroundColor: '#AB47BC', color: 'white', '&:hover': { backgroundColor: '#9C27B0' } }}
                  onClick={onOpenMyActivities}
                >
                  הפעילויות שלי
                </CtaButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
