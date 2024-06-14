import { fetchWithAuth } from './api';
import { toast } from 'react-toastify';

export const getFlags = async () => {
  const response = await fetchWithAuth(`flag/`);
  if (response.ok) {
    return await response.json();
  }
  else {
    toast.error("Can't retrieve flags")
  }
  return {}
};

export const getLoggedUserPermissions = async () => {
  const response = await fetchWithAuth('flag-permissions/me/');
  if (response.ok) {
    return await response.json();
  }
  else {
    toast.error("Can't retrieve flag permissions")
  }
  return []
};

export const getUserFlagPermission = async (userId, flagId) => {

  const response = await fetchWithAuth(`flag-permissions/?users=${userId}&flags=${flagId}`);
  if (response.ok) {
    const temp = await response.json()
    return temp[0];
  }
  else {
    toast.error("Can't retrieve flag permissions")
  }
  return null
};

export const getUserPermissions = async (userId) => {
  const response = await fetchWithAuth(`flag-permissions/?users=${userId}`);
  if (response.ok) {
    return await response.json();
  }
  else {
    toast.error("Can't retrieve flag permissions")
  }
  return []
};

export const filterFlagsBasedOnPermissions = (allFlags, permissions, allowAll) => {
  const bannedFlagIds = permissions
    .filter(permission => permission.is_allowed === false)
    .map(permission => permission.flag_id);

  if (allowAll) {
    // If user is allowed to see all flags, filter out only the banned ones
    
     return allFlags.filter(flag => !bannedFlagIds.includes(flag.id));
     
  } else {
    // If user is not allowed to see all flags, filter by allowed ones
    const allowedFlagIds = permissions
      .filter(permission => permission.is_allowed)
      .map(permission => permission.flag.id);

    return allFlags.filter(flag => allowedFlagIds.includes(flag.id));
  }
};