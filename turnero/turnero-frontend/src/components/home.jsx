import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext.jsx';
import './styles/home.css';


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
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-1 mb-4">Canchitas</h1>
      <button className="btn btn-primary btn-lg" onClick={handleStart}>
        Comenzar
      </button>
    </div>
  );
};

export default Home;