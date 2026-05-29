import api from './api';

export const getFavorites = async (userId) => {
  const response = await api.get(`/favorites?userId=${userId}`);
  return response.data;
};

export const addFavorite = async (recipeId, userId) => {
  const response = await api.post('/favorites', { recipeId, userId });
  return response.data;
};

export const removeFavorite = async (recipeId, userId) => {
  const response = await api.delete(`/favorites/${recipeId}?userId=${userId}`);
  return response.data;
};

export const checkFavorite = async (recipeId, userId) => {
  const response = await api.get(`/favorites/check/${recipeId}?userId=${userId}`);
  return response.data;
};
