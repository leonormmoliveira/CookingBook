import apiClient from './api';

export const getFavorites = async (userId) => {
  const response = await apiClient.get(`/favorites?userId=${userId}`);
  return response.data;
};

export const addFavorite = async (recipeId, userId) => {
  const response = await apiClient.post('/favorites', { recipeId, userId });
  return response.data;
};

export const removeFavorite = async (recipeId, userId) => {
  const response = await apiClient.delete(`/favorites/${recipeId}?userId=${userId}`);
  return response.data;
};

export const checkFavorite = async (recipeId, userId) => {
  const response = await apiClient.get(`/favorites/check/${recipeId}?userId=${userId}`);
  return response.data;
};
