import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext.jsx';
import { Box, Typography, Button } from '@mui/material';

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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h2" sx={{ mb: 4 }}>
        Canchitas
      </Typography>
      <Button variant="contained" color="primary" size="large" onClick={handleStart}>
        Comenzar
      </Button>
    </Box>
  );
};

export default Home;
