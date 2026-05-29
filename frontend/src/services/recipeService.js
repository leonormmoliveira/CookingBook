import api from './api';

export const getRecipes = async () => {
  const response = await api.get('/recipes');
  return response.data;
};

export const getRecipeById = async (id, userId = null) => {
  const query = userId ? `?userId=${userId}` : '';
  const response = await api.get(`/recipes/${id}${query}`);
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await api.post('/recipes', recipeData);
  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await api.put(`/recipes/${id}`, recipeData);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await api.delete(`/recipes/${id}`);
  return response.data;
};
