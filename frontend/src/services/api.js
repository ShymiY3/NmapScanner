import { obtainValidToken } from './auth';

const API_URL = 'http://localhost:8000/api/';


export const fetchWithAuth = async (url, options = {}) => {
  let token = await obtainValidToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = {}
  try{
    response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(error)
  }

  return response;
};