// src/components/FlyersSection.jsx
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  styled,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import SectionTitle from './SectionTitle';

const FlyerCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[4],
  },
}));

export default function FlyersSection({ flyers, openDialog }) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, sm: 8 },
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <SectionTitle icon={<EventIcon />} title="פליירים אחרונים" />
        <Grid container spacing={6}>
          {flyers.slice(0, 3).map((f) => (
            <Grid key={f.id} item xs={12} sm={6} md={6}>
              <FlyerCard>
                {/* Pass the full flyer object, not just the ID */}
                <CardActionArea onClick={() => openDialog('flyer', f)}>
                  <CardMedia
                    component="img"
                    image={f.fileUrl}
                    alt={f.name}
                    sx={{
                      height: 260,
                      objectFit: 'cover',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
