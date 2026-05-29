import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSearchbar,
  IonIcon,
  IonModal,
} from '@ionic/react';
import {
  add,
  heart,
  heartOutline,
  chevronDown,
  chevronUp,
  logOut,
  heartSharp,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../components/AxiosInstance';
import { addFavorite, removeFavorite } from '../../../services/favoriteService';
import { useAuth } from '../../../AppContext.tsx';
import authApi from '../../../hooks/authApi.tsx';

function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const navigate = useNavigate();
  const { logout } = authApi(() => { });
  const { user, Logout } = useAuth();

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

  const sortedCategories = [...categories].sort((a, b) => {
    const countA = recipes.filter(r => r.categoryName === a.name).length;
    const countB = recipes.filter(r => r.categoryName === b.name).length;
    return countB - countA;
  });
  const visibleCategories = showAllCategories
    ? sortedCategories
    : sortedCategories.slice(0, 3);

  const chooseManual = () => {
    setShowCreateModal(false);
    navigate('/create');
  };

  const chooseVideo = () => {
    setShowCreateModal(false);
    navigate('/video-analysis');
  };

  const sortFavoritesFirst = (items) =>
    [...items].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

  const searchedRecipes = recipes.filter((recipe) => {
    const keyword = searchText?.toLowerCase?.() || '';
    if (!keyword) return true;
    return [
      recipe.title,
      recipe.description,
      recipe.ingredients,
      recipe.instructions,
      recipe.categoryName,
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(keyword));
  });

  const categoryFilteredRecipes =
    selectedCategory === 'Todos'
      ? searchedRecipes
      : searchedRecipes.filter(
        (recipe) => recipe.categoryName === selectedCategory
      );

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

  const categorySections = Object.keys(categorized)
    .sort()
    .map((categoryName) => ({
      name: categoryName,
      recipes: sortFavoritesFirst(categorized[categoryName]),
    }));

  const renderRecipeCard = (recipe) => {
    const imageSrc = recipe.image_data || recipe.image_url;
    return (
      <div
        key={recipe.id}
        className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={recipe.title}
            className="w-full h-32 object-cover"
          />
        )}
        <button
          className="absolute right-3 top-3 z-10 bg-white rounded-full p-1.5 shadow-sm"
          onClick={async () => {
            if (!user?.id) return;
            try {
              if (recipe.isFavorite) {
                await removeFavorite(recipe.id, user.id);
              } else {
                await addFavorite(recipe.id, user.id);
              }
              setRecipes((current) =>
                current.map((item) =>
                  item.id === recipe.id
                    ? { ...item, isFavorite: item.isFavorite ? 0 : 1 }
                    : item
                )
              );
            } catch (err) {
              console.error('Erro ao atualizar favorito', err);
            }
          }}
        >
          <IonIcon
            icon={recipe.isFavorite ? heart : heartOutline}
            style={{
              fontSize: '1.1rem',
              color: recipe.isFavorite ? '#e0245e' : '#9ca3af',
            }}
          />
        </button>

        <div className="p-3">
          <h4 className="text-base font-semibold text-gray-900 leading-snug">
            {recipe.title}
          </h4>
          {recipe.categoryName && (
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mt-0.5">
              {recipe.categoryName}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {recipe.description ||
              recipe.instructions?.slice(0, 100) ||
              'Sem descrição disponível.'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
            {recipe.servings && <span>{recipe.servings} porções</span>}
            {recipe.difficulty && <span>· {recipe.difficulty}</span>}
          </div>
          <button
            onClick={() => navigate(`/recipe/${recipe.id}`)}
            className="mt-3 w-full py-1.5 rounded-xl border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Ver receita
          </button>
        </div>
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader className="shadow-none">
        <IonToolbar
          style={{ '--background': '#ffffff', '--border-color': '#f3f4f6' }}
        >
          <IonTitle className="font-bold text-gray-900">CookingBook</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={() => navigate('/favorites')}
              title="Favoritos"
            >
              <IonIcon icon={heartSharp} style={{ color: '#e0245e' }} />
            </IonButton>
            <IonButton fill="clear" onClick={handleLogout} title="Sair">
              <IonIcon icon={logOut} style={{ color: '#6b7280' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        fullscreen
        style={{ '--background': '#f9fafb', '--padding-bottom': '180px' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          {/* Search */}
          <div className="mb-4 mt-2">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value)}
              placeholder="Pesquisar receitas ou categorias"
              style={{
                '--background': '#ffffff',
                '--border-radius': '14px',
                '--box-shadow': '0 1px 4px rgba(0,0,0,0.06)',
                '--color': '#111827',
                '--placeholder-color': '#9ca3af',
              }}
            />
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => setSelectedCategory('Todos')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${selectedCategory === 'Todos'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
              >
                Todos
              </button>
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${selectedCategory === category.name
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                >
                  {category.name}
                </button>
              ))}
              {sortedCategories.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((prev) => !prev)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium border bg-white text-gray-500 border-gray-200 hover:border-blue-300 flex items-center gap-1 transition-colors"
                >
                  <IonIcon
                    icon={showAllCategories ? chevronUp : chevronDown}
                    style={{ fontSize: '0.9rem' }}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Recipe Sections */}
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-center text-gray-400 text-sm">
              Carregando receitas...
            </div>
          ) : (
            <div className="space-y-8">
              {categorySections.length === 0 && uncategorized.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center text-gray-400 text-sm">
                  Nenhuma receita encontrada.
                </div>
              ) : (
                <>
                  {categorySections.map((section) => (
                    <div key={section.name}>
                      <div className="mb-3">
                        <h4 className="text-base font-semibold text-gray-800">
                          {section.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {section.recipes.length} receita(s)
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {section.recipes.map(renderRecipeCard)}
                      </div>
                    </div>
                  ))}
                  {uncategorized.length > 0 && (
                    <div>
                      <div className="mb-3">
                        <h4 className="text-base font-semibold text-gray-800">
                          Sem categoria
                        </h4>
                        <p className="text-xs text-gray-400">
                          Receitas sem categoria definida.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {uncategorized.map(renderRecipeCard)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* FAB - botão flutuante + */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors active:scale-95"
          style={{ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
        >
          <IonIcon icon={add} style={{ fontSize: '1.8rem' }} />
        </button>

        {/* Modal de criação */}
        <IonModal
          isOpen={showCreateModal}
          onDidDismiss={() => setShowCreateModal(false)}
          breakpoints={[0, 1]}
          initialBreakpoint={1}
        >
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nova Receita
            </h3>
            <button
              onClick={chooseVideo}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-sm font-medium text-gray-700 transition-colors"
            >
              🎬 Gerar a partir de vídeo
            </button>
            <button
              onClick={chooseManual}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-sm font-medium text-gray-700 transition-colors"
            >
              ✏️ Inserir manualmente
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full text-center px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}

export default HomePage;