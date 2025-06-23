// src/components/FooterSection.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  styled,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactService from "../services/ContactService";

/* backround for flyer*/
const FooterBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#9B3FAF",
  padding: theme.spacing(6, 0),
  boxShadow: `0 -4px 20px ${theme.palette.mode === "light"
    ? "rgba(0,0,0,0.08)"
    : "rgba(0,0,0,0.5)"}`
}));

/* headline*/
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  fontSize: "1.25rem",
  [theme.breakpoints.down("sm")]: { fontSize: "1.1rem" },
}));

/* icon+content*/
const InfoLine = ({ icon: Icon, children }) => (
  <Box display="flex" alignItems="center" mb={1}>
    <Icon sx={{ ml: 1, fontSize: 20 }} />
    {children}
  </Box>
);

/* button+link*/
const LinkButton = (props) => {
  const theme = useTheme();
  return (
    <Button
      {...props}
      variant="text"
      color="inherit"
      sx={{
        textTransform: "none",
        p: 0,
        fontWeight: 500,
        "&:hover": {
          textDecoration: "underline",
          backgroundColor: "transparent",
          opacity: 0.9,
        },
      }}
    />
  );
};

export default function FooterSection({
  onScrollTop,
  onOpenIdentify,
  onOpenAdmin,
}) {
  const [contact, setContact] = useState({
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
  });

  useEffect(() => {
    ContactService.get().then(setContact);
  }, []);

  return (
    <FooterBox>
      <Container dir="rtl">
        <Grid
          container
          spacing={4}
          textAlign={{ xs: "center", md: "right" }}
          justifyContent="space-between"
        >
          {/* senior center*/}
          <Grid item xs={12} md={4}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: "center", md: "flex-start" }}
              mb={1}
            >
              <HomeIcon sx={{ ml: 1 }} />
              <Typography component="h6" variant="h6" fontWeight={700}>
                מרכז ותיקים בית הכרם
              </Typography>
            </Box>
            <LinkButton onClick={onScrollTop}>לראש האתר</LinkButton>
          </Grid>

          {/* getintact*/}
          <Grid item xs={12} md={4}>
            <SectionTitle component="h6">צור קשר</SectionTitle>

            <InfoLine icon={PhoneIcon}>
              <LinkButton
                component="a"
                href={`tel:${contact.contactPhone.replace(/\D/g, "")}`}
              >
                {contact.contactPhone}
              </LinkButton>
            </InfoLine>

            <InfoLine icon={MailIcon}>
              <LinkButton component="a" href={`mailto:${contact.contactEmail}`}>
                {contact.contactEmail}
              </LinkButton>
            </InfoLine>

            <InfoLine icon={LocationOnIcon}>
              <Typography variant="body2" lineHeight={1.4}>
                {contact.contactAddress}
              </Typography>
            </InfoLine>
          </Grid>

          {/* enterys*/}
          <Grid item xs={12} md={4}>
            <SectionTitle component="h6">כניסות</SectionTitle>
            <Box mb={1}>
              <LinkButton onClick={onOpenIdentify}>הזדהות</LinkButton>
            </Box>
            <Box>
              <LinkButton onClick={onOpenAdmin}>התחברות מנהל</LinkButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </FooterBox>
  );
}
