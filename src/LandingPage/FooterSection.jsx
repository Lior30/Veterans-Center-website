// src/components/FooterSection.jsx
import React, { useState, useEffect }from "react";
import { Box, Container, Grid, Typography, Button, styled } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactService from "../services/ContactService";

const FooterBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(4, 0),
}));

export default function FooterSection({
  onScrollTop,
  onOpenInfo,
  onOpenIdentify,
  onOpenAdmin,
}) {

  const [contact, setContact] = useState({
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
  });

  useEffect(() => {
    ContactService.get().then(data => {
      setContact(data);
    });
  }, []);

  return (
    <FooterBox>
      <Container dir="rtl">
        <Grid container spacing={4} textAlign="right">
          {/* מרכז ותיקים */}
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <HomeIcon sx={{ ml: 1, color: "inherit" }} />
              <Typography variant="h6" color="inherit" fontWeight={600}>
                מרכז ותיקים בית הכרם
              </Typography>
            </Box>
            <Button
              onClick={onScrollTop}
              variant="text"
              color="inherit"
              sx={{ textTransform: "none", p: 0 }}
            >
              לראש האתר
            </Button>
          </Grid>

          {/* צור קשר */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" color="inherit" fontWeight={600} gutterBottom>
              צור קשר
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <PhoneIcon sx={{ ml: 1, color: "inherit" }} />
              <Typography color="inherit">{contact.contactPhone}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <MailIcon sx={{ ml: 1, color: "inherit" }} />
              <Typography color="inherit">{contact.contactEmail}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <LocationOnIcon sx={{ ml: 1, color: "inherit" }} />
              <Typography color="inherit">
                {contact.contactAddress}
              </Typography>
            </Box>
           
          </Grid>

          {/* כניסות */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" color="inherit" fontWeight={600} gutterBottom>
              כניסות
            </Typography>
            <Box mb={1}>
              <Button
                onClick={onOpenIdentify}
                variant="text"
                color="inherit"
                sx={{ textTransform: "none", p: 0 }}
              >
                הזדהות
              </Button>
            </Box>
            <Box>
              <Button
                onClick={onOpenAdmin}
                variant="text"
                color="inherit"
                sx={{ textTransform: "none", p: 0 }}
              >
                התחברות מנהל
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </FooterBox>
  );
}
