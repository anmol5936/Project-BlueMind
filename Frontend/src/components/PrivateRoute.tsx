import { Navigate } from 'react-router-dom';
import MainApp from './MainApp'; // Adjust the import path as needed

const PrivateRoute = () => {
  const token = localStorage.getItem('userLocation'); // Use the same key as in MainApp
  return token ? <MainApp /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;