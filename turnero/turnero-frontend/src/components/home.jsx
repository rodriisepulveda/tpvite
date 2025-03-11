import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext.jsx';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Slide,
  Fade
} from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/turnos');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          'url(https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Overlay sutil con degradado */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))',
        }}
      />
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        <Slide in={true} direction="up" timeout={1000}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                  Bienvenido a Canchitas
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
                  Reserva tu turno en las mejores canchas de la ciudad
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: '#777' }}>
                  Abierto desde las 14:00 hasta las 23:00. ¡Fácil, rápido y confiable!
                </Typography>
                <Button variant="contained" color="primary" size="large" onClick={handleStart}>
                  Comenzar
                </Button>
              </Box>
            </Fade>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Home;
