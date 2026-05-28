import apiClient from './api';

export const getRecipes = async () => {
  const response = await apiClient.get('/recipes');
  return response.data;
};

export const getRecipeById = async (id, userId = null) => {
  const query = userId ? `?userId=${userId}` : '';
  const response = await apiClient.get(`/recipes/${id}${query}`);
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await apiClient.post('/recipes', recipeData);
  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await apiClient.put(`/recipes/${id}`, recipeData);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await apiClient.delete(`/recipes/${id}`);
  return response.data;
};
