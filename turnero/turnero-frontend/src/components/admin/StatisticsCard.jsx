import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatisticsCard = ({
  title = "Título",
  value = "0",
  icon,
  bgColor = 'primary.main',
}) => {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: bgColor,
        color: 'white',
        p: 1, // Menos padding para tarjetas más pequeñas
        borderRadius: 2,
        boxShadow: 3,
        minWidth: 150, // Reducir ancho mínimo
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        {/* Título un poco más pequeño */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 500, opacity: 0.85 }}
        >
          {title}
        </Typography>
        {/* Valor con h6 en lugar de h5 */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', mt: 0.5 }}
        >
          {value}
        </Typography>
      </CardContent>
      {icon && (
        <Box
          sx={{
            fontSize: '1.8rem', // Reducir icono
            display: 'flex',
            alignItems: 'center',
            pl: 1,
          }}
        >
          {icon}
        </Box>
      )}
    </Card>
  );
};

export default StatisticsCard;
