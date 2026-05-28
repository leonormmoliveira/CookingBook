import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner, IonButton } from '@ionic/react';
import api from '../../../components/AxiosInstance';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      if (!user?.id) return;

      try {
        setLoading(true);
        const [categoriesResponse, recipesResponse] = await Promise.all([
          api.get(`/categories?userId=${user.id}`),
          api.get(`/recipes?userId=${user.id}`),
        ]);

        if (categoriesResponse.data?.success) {
          setCategories(categoriesResponse.data.categories || []);
        }
        if (recipesResponse.data?.success) {
          setRecipes(recipesResponse.data.recipes || []);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias e receitas', err);
        setError('Não foi possível carregar categorias.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalRecipes = categories.reduce((sum, category) => sum + Number(category.recipeCount || 0), 0);
  const totalFavorites = categories.reduce((sum, category) => sum + Number(category.favoriteCount || 0), 0);
  const selectedCategoryRecipes = selectedCategoryName
    ? recipes.filter((recipe) => recipe.categoryName === selectedCategoryName)
    : [];
  const favoritesFirst = (items) => [...items].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Categorias</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="p-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Minhas Categorias</h2>
            <p className="text-sm text-gray-500 mt-2">Visualize suas categorias, receitas por categoria e quantos favoritos cada uma tem.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Categorias</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Receitas</p>
                <p className="text-3xl font-bold">{totalRecipes}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Favoritos</p>
                <p className="text-3xl font-bold">{totalFavorites}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Carregando categorias...</div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-sm text-red-700">{error}</div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Nenhuma categoria encontrada.</div>
          ) : selectedCategoryName ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Receitas em {selectedCategoryName}</h2>
                    <p className="text-sm text-gray-500 mt-1">Favoritas em primeiro lugar.</p>
                  </div>
                  <IonButton fill="outline" onClick={() => setSelectedCategoryName(null)}>
                    Voltar
                  </IonButton>
                </div>
              </div>

              {selectedCategoryRecipes.length === 0 ? (
                <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Nenhuma receita encontrada nesta categoria.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {favoritesFirst(selectedCategoryRecipes).map((recipe) => {
                    const imageSrc = recipe.image_data || recipe.image_url;
                    return (
                      <div key={recipe.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        {imageSrc ? (
                          <img src={imageSrc} alt={recipe.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                        ) : null}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold">{recipe.title}</h3>
                          {recipe.isFavorite ? <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Favorita</span> : null}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{recipe.description || recipe.instructions?.slice(0, 120) || 'Sem descrição disponível.'}</p>
                        <div className="mt-4 flex flex-col gap-3">
                          <IonButton fill="outline" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                            Ver receita
                          </IonButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`rounded-xl border p-5 shadow-sm bg-white ${selectedCategoryName === category.name ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}
                  onClick={() => setSelectedCategoryName(category.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      {category.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
                    </div>
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{category.recipeCount || 0} receitas</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div>Receitas: <span className="font-semibold text-gray-900">{category.recipeCount || 0}</span></div>
                    <div>Favoritos: <span className="font-semibold text-gray-900">{category.favoriteCount || 0}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default CategoriesPage;
