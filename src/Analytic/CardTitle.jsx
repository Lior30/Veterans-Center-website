// src/components/CardTitle.jsx
import React from 'react';
import { Typography } from '@mui/material';

export default function CardTitle({ children }) {
  return (
    <Typography
      variant="subtitle1"       // או "h6" לפי גודל רצוי
      align="center"
      sx={{
        fontWeight: 600,
        color: '#495057',
        marginBottom: 2,        // theme.spacing(2) = 16px
        direction: 'rtl'
      }}
    >
      {children}
    </Typography>
  );
}
