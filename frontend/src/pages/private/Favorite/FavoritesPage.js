import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonButton } from '@ionic/react';
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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Receitas Favoritas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="p-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Carregando favoritos...</div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-sm text-red-700">{error}</div>
          ) : favorites.length === 0 ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Nenhuma receita favorita ainda.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.map((favorite) => {
                const imageSrc = favorite.image_data || favorite.image_url;
                return (
                  <div key={favorite.recipeId} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    {imageSrc ? (
                      <img src={imageSrc} alt={favorite.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                    ) : null}
                    <h3 className="text-lg font-semibold">{favorite.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{favorite.description || favorite.instructions?.slice(0, 120) || 'Sem descrição disponível.'}</p>
                    {favorite.categoryName && <p className="mt-3 text-xs uppercase tracking-wide text-blue-600 font-semibold">{favorite.categoryName}</p>}
                    <div className="mt-4 flex flex-col gap-3">
                      <IonButton fill="outline" onClick={() => navigate(`/recipe/${favorite.recipeId}`)}>
                        Ver receita
                      </IonButton>
                      <IonButton color="danger" fill="clear" onClick={() => handleRemove(favorite.recipeId)}>
                        Remover dos favoritos
                      </IonButton>
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
