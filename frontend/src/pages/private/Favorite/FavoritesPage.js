import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { heart, heartOutline, arrowBack } from 'ionicons/icons';
import { getFavorites, removeFavorite } from '../../../services/favoriteService';
import { useAuth } from '../../../AppContext.tsx';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function loadFavorites() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await getFavorites(user.id);
        if (data?.success) {
          setFavorites(data.favorites || []);
        }
      } catch (err) {
        console.error('Erro ao carregar favoritos', err);
        setError('Não foi possível carregar os favoritos.');
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [user]);

  const handleRemove = async (recipeId) => {
    if (!user?.id) return;
    try {
      await removeFavorite(recipeId, user.id);
      setFavorites((current) => current.filter((item) => item.recipeId !== recipeId));
    } catch (err) {
      console.error('Erro ao remover favorito', err);
      setError('Não foi possível remover o favorito.');
    }
  };

  return (
    <IonPage>
      <IonHeader className="shadow-none">
        <IonToolbar style={{ '--background': '#ffffff', '--border-color': '#f3f4f6' }}>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate(-1)}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle className="font-bold text-gray-900">Receitas Favoritas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        fullscreen
        style={{ '--background': '#f9fafb', '--padding-bottom': '80px' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-center text-gray-500 text-sm">
              Carregando favoritos...
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : favorites.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-gray-500 text-sm">
              Nenhuma receita favorita ainda.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.map((favorite) => {
                const imageSrc = favorite.image_data || favorite.image_url;
                return (
                  <div
                    key={favorite.recipeId}
                    className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                  >
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt={favorite.title}
                        className="w-full h-32 object-cover"
                      />
                    )}

                    {/* Botão remover favorito (coração) */}
                    <button
                      className="absolute right-3 top-3 z-10 bg-white rounded-full p-1.5 shadow-sm"
                      onClick={() => handleRemove(favorite.recipeId)}
                    >
                      <IonIcon
                        icon={heart}
                        style={{ fontSize: '1.1rem', color: '#e0245e' }}
                      />
                    </button>

                    <div className="p-3">
                      <h4 className="text-base font-semibold text-gray-900 leading-snug">
                        {favorite.title}
                      </h4>
                      {favorite.categoryName && (
                        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mt-0.5">
                          {favorite.categoryName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {favorite.description || favorite.instructions?.slice(0, 100) || 'Sem descrição disponível.'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                        {favorite.servings && <span>{favorite.servings} porções</span>}
                        {favorite.difficulty && <span>· {favorite.difficulty}</span>}
                      </div>
                      <button
                        onClick={() => navigate(`/recipe/${favorite.recipeId}`)}
                        className="mt-3 w-full py-1.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Ver receita
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default FavoritesPage;