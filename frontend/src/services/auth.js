import { toast } from "react-toastify";

export const getToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const getUserData = () => JSON.parse(localStorage.getItem('user_data'));

export const setTokens = (token, refreshToken) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refresh_token', refreshToken);
};

export const removeTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

export const setUserData = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData));
};

export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    removeTokens();
    return null;
  }

  const response = await fetch('http://localhost:8000/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (response.ok) {
    const data = await response.json();
    setTokens(data.access, refreshToken);
    await updateUserData(data.access)
    return data.access;
  } else {
    removeTokens();
    throw new Error("Invalid tokens")
  }
};


export const obtainValidToken = async () => {
  let token = getToken();

  if (!token) {
    window.location.href = '/login';
    throw new Error('No token found');
  }

  // Check if the token is expired
  const isTokenExpired = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 1e4;
  };

  if (isTokenExpired(token)) {
    try {
      await refreshToken();
    } catch (error) {
      toast.info("Session expired. Please log in again.");
      throw new Error('Session expired. Please log in again.');
    }
  }

  return getToken();
};

export const updateUserData = async (token) => {
  const response = await fetch('http://localhost:8000/api/users/me/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const userData = await response.json();
    setUserData(userData);
    return userData;
  } else {
    throw new Error('Failed to fetch user data');
  }
};
