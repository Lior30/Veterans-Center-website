// src/components/FlyersSection.jsx
import React from 'react';
import Slider from 'react-slick';
import {
  Box,
  Container,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  useTheme,
  styled,
  IconButton
} from '@mui/material';
import SectionTitle from './SectionTitle';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// חיצי ניווט מותאמים
const PrevArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      top: '50%',
      left: 8,
      transform: 'translateY(-50%)',
      zIndex: 2,
      backgroundColor: 'rgba(0,0,0,0.4)',
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
      color: '#fff',
    }}
  >
    <ArrowBackIosNewIcon />
  </IconButton>
);
const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      top: '50%',
      right: 8,
      transform: 'translateY(-50%)',
      zIndex: 2,
      backgroundColor: 'rgba(0,0,0,0.4)',
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
      color: '#fff',
    }}
  >
    <ArrowForwardIosIcon />
  </IconButton>
);

const FlyerCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  margin: theme.spacing(1),
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

export default function FlyersSection({ flyers, openDialog }) {
  const theme = useTheme();

  // הגדרות הסליידר
  const settings = {
    infinite: flyers.length > 3,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: theme.breakpoints.values.md, // <960px
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: theme.breakpoints.values.sm, // <600px
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, sm: 6 },
        backgroundColor: theme.palette.background.default,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="פליירים אחרונים" />

        <Slider {...settings}>
          {flyers.map((f) => (
            <Box key={f.id} sx={{ px: 1 }}>
              <FlyerCard>
                <CardActionArea onClick={() => openDialog('flyer', f)}>
                 <CardMedia
  component="img"
  image={f.fileUrl}
  alt={f.name}
  sx={{
    width: '100%',
    aspectRatio: '4.5/8',    // שומר על יחס רוחב־גובה מלבני
    objectFit: 'cover',
  }}
/>

                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {f.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(f.date).toLocaleDateString('he-IL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </FlyerCard>
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
}
