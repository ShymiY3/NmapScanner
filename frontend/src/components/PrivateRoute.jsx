import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserStatus } from '../services/user';
import { getToken } from '../services/auth';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await getUserStatus();
      if (result.status === 'authenticated') {
        setAuthenticated(true)
        setMustChangePassword(result.data.must_change_password);
        setIsAdmin(result.data.is_superuser);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!authenticated) {
    return <Navigate to="/" />; 
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  
  if (mustChangePassword) {
    return <Navigate to="/change-password" />;
  }

  return getToken() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;