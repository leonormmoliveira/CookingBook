import React, { useState, useEffect } from 'react';
import { IonPage, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSearchbar, IonFab, IonFabButton, IonIcon, IonModal, IonList, IonItem, IonLabel, IonAlert } from '@ionic/react';
import { add, heart, heartOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../components/AxiosInstance';
import { addFavorite, removeFavorite } from '../../../services/favoriteService';
import { useAuth } from '../../../AppContext.tsx';
import authApi from '../../../hooks/authApi.tsx';
import { logOut, heartSharp } from 'ionicons/icons';

function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoAlert, setShowVideoAlert] = useState(false);
  const navigate = useNavigate();
  const { logout } = authApi(() => {});
  const {user, Logout} = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      Logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [recipesResponse, categoriesResponse] = await Promise.all([
          api.get(`/recipes?userId=${user.id}`),
          api.get(`/categories?userId=${user.id}`),
        ]);

        setRecipes(recipesResponse.data.recipes || []);
        setCategories(categoriesResponse.data.categories || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [user]);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const chooseManual = () => {
    setShowCreateModal(false);
    navigate('/create');
  };

  const chooseVideo = () => {
    setShowCreateModal(false);
    setShowVideoAlert(true);
  };

  const submitVideo = (url) => {
    setShowVideoAlert(false);
    navigate(`/video-analysis?url=${encodeURIComponent(url || '')}`);
  };

  const sortFavoritesFirst = (items) => [...items].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

  const searchedRecipes = recipes.filter((recipe) => {
    const keyword = searchText?.toLowerCase?.() || '';
    if (!keyword) return true;
    return [recipe.title, recipe.description, recipe.ingredients, recipe.instructions, recipe.categoryName]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(keyword));
  });

  const categoryFilteredRecipes = selectedCategory === 'Todos'
    ? searchedRecipes
    : searchedRecipes.filter((recipe) => recipe.categoryName === selectedCategory);

  const categorized = {};
  const uncategorized = [];

  categoryFilteredRecipes.forEach((recipe) => {
    if (recipe.categoryName) {
      categorized[recipe.categoryName] = categorized[recipe.categoryName] || [];
      categorized[recipe.categoryName].push(recipe);
    } else {
      uncategorized.push(recipe);
    }
  });

  const categorySections = Object.keys(categorized).sort().map((categoryName) => ({
    name: categoryName,
    recipes: sortFavoritesFirst(categorized[categoryName]),
  }));

  const renderRecipeCard = (recipe) => {
    const imageSrc = recipe.image_data || recipe.image_url;

    return (
      <div key={recipe.id} className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {imageSrc ? (
          <img src={imageSrc} alt={recipe.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">Sem imagem</div>
        )}
        <IonButton
          className="absolute right-3 top-3 z-10"
          fill="clear"
          onClick={async () => {
            if (!user?.id) return;
            try {
              if (recipe.isFavorite) {
                await removeFavorite(recipe.id, user.id);
              } else {
                await addFavorite(recipe.id, user.id);
              }
              setRecipes((current) => current.map((item) => item.id === recipe.id ? { ...item, isFavorite: item.isFavorite ? 0 : 1 } : item));
            } catch (err) {
              console.error('Erro ao atualizar favorito', err);
            }
          }}
        >
          <IonIcon icon={recipe.isFavorite ? heart : heartOutline} style={{ fontSize: '1.4rem', color: recipe.isFavorite ? '#e0245e' : '#4b5563' }} />
        </IonButton>
        <div className="p-4">
        <h4 className="text-lg font-semibold">{recipe.title}</h4>
        {recipe.categoryName && <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">{recipe.categoryName}</p>}
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{recipe.description || recipe.instructions?.slice(0, 120) || 'Sem descrição disponível.'}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          {recipe.servings && <span>{recipe.servings} porções</span>}
          {recipe.difficulty && <span>{recipe.difficulty}</span>}
        </div>
        <IonButton className="mt-4 custom-btn w-full" fill="outline" onClick={() => navigate(`/recipe/${recipe.id}`)}>
          Ver receita
        </IonButton>
      </div>
    </div>
  );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-2xl font-bold">CookingBook</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} title="Sair">
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen style={{ '--padding-bottom': '85px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6" style={{ paddingBottom: '80px' }}>
          <div className="mb-6 space-y-4">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value)}
              placeholder="Pesquisar receitas ou categorias"
              className="bg-white rounded-md shadow-sm"
            />
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${selectedCategory === 'Todos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                  onClick={() => setSelectedCategory('Todos')}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-medium ${selectedCategory === category.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <IonButton fill="clear" className="text-gray-700" onClick={() => navigate('/favorites')}>
                <IonIcon icon={heartSharp} slot="icon-only" />
              </IonButton>
            </div>
          </div>
        </div>
          <section className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Minhas Receitas</h3>
                <p className="text-sm text-gray-500 mt-1">Receitas agrupadas por categoria e listadas para acesso rápido.</p>
              </div>
              <IonButton className="custom-btn" onClick={handleCreateClick}>
                Nova receita
              </IonButton>
            </div>
          </section>

          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Carregando receitas...</div>
          ) : (
            <div className="space-y-6">
              {categorySections.length === 0 && uncategorized.length === 0 ? (
                <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Nenhuma receita encontrada.</div>
              ) : (
                <>
                  {categorySections.map((section) => (
                    <div key={section.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-semibold">{section.name}</h4>
                          <p className="text-sm text-gray-500">{section.recipes.length} receita(s)</p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {section.recipes.map(renderRecipeCard)}
                      </div>
                    </div>
                  ))}

                  {uncategorized.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold">Sem categoria</h4>
                        <p className="text-sm text-gray-500">Receitas criadas sem categoria definida.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {uncategorized.map(renderRecipeCard)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ zIndex: 1000, right: 16, bottom: 16 }}>
          <IonFabButton onClick={handleCreateClick} style={{ zIndex: 1001, background: '#0066cc', color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Novo</h3>
            <IonList>
              <IonItem button onClick={chooseVideo}>
                <IonLabel>Gerar a partir de vídeo</IonLabel>
              </IonItem>
              <IonItem button onClick={chooseManual}>
                <IonLabel>Inserir manualmente</IonLabel>
              </IonItem>
              <IonItem button onClick={() => setShowCreateModal(false)}>
                <IonLabel>Cancelar</IonLabel>
              </IonItem>
            </IonList>
          </div>
        </IonModal>

        <IonAlert
          isOpen={showVideoAlert}
          onDidDismiss={() => setShowVideoAlert(false)}
          header={'Analisar vídeo'}
          inputs={[{
            name: 'videoUrl',
            type: 'url',
            placeholder: 'https://youtube.com/watch?v=...'
          }]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setShowVideoAlert(false)
            },
            {
              text: 'Analisar',
              handler: (data) => {
                submitVideo(data.videoUrl || '');
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
}

export default HomePage;