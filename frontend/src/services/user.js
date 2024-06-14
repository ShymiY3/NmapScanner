import { obtainValidToken, getUserData, updateUserData } from './auth';
import { fetchWithAuth } from './api';

export const getUserStatus = async () => {
  let token;
  try {
    token = await obtainValidToken();
  } catch (error) {
    console.error(error)
    return { status: 'unauthenticated'}
  }
  let userData = getUserData();

  if (!userData) {
    userData = await updateUserData(token);
  }

  return { status: 'authenticated', data: userData };
};


export const updateUserDetails = async (id, userDetails) => {
  const response = await fetchWithAuth(`users/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDetails),
  });
  return response;
};

export const deleteUser = async (userId) => {
  return await fetchWithAuth(`users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};