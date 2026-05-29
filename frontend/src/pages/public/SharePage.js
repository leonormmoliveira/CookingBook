import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonIcon } from '@ionic/react';
import { homeOutline } from 'ionicons/icons';
import api from '../../components/AxiosInstance';
import { createRecipe } from '../../services/recipeService';

function SharePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [cloning, setCloning] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadShareData();
  }, []);

  const loadShareData = async () => {
    const stored = localStorage.getItem('user');
    let currentUser = null;

    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        setUser(currentUser);
      } catch (err) {
        console.error('Invalid stored user', err);
      }
    }

    if (!token) {
      setError('Token de compartilhamento ausente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const validation = await api.get(`/sharing/validate?token=${encodeURIComponent(token)}`);
      setPreview(validation.data.recipe);

      if (currentUser?.id) {
        const details = await api.get(`/sharing/recipe?token=${encodeURIComponent(token)}&userId=${currentUser.id}`);
        setRecipe(details.data.recipe);
      }
    } catch (err) {
      console.error('SharePage load error:', err);
      setError(err?.response?.data?.message || 'Não foi possível carregar o link de compartilhamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    if (!user) {
      navigate(`/login?shareToken=${encodeURIComponent(token)}`);
      return;
    }

    if (!recipe) {
      setError('Receita não encontrada para clonar.');
      return;
    }

    if (recipe.ownerId === user.id) {
      setError('Você já é o dono desta receita.');
      return;
    }

    setCloning(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', recipe.title || 'Receita compartilhada');
      formData.append('description', recipe.description || '');
      formData.append('categoryName', recipe.categoryName || '');
      formData.append('ingredients', recipe.ingredients || '');
      formData.append('instructions', recipe.instructions || '');
      formData.append('imageUrl', recipe.image_url || '');
      formData.append('videoUrl', recipe.video_url || '');
      formData.append('prepTime', recipe.prep_time || '');
      formData.append('cookTime', recipe.cook_time || '');
      formData.append('servings', recipe.servings || '');
      formData.append('difficulty', recipe.difficulty || '');

      await createRecipe(formData);
      setSuccess('Receita clonada com sucesso e salva na sua conta.');
    } catch (err) {
      console.error('Clone error:', err);
      setError(err?.response?.data?.message || 'Não foi possível clonar a receita.');
    } finally {
      setCloning(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IonIcon icon={homeOutline} style={{ fontSize: '1.4rem' }} />
            </button>
          </IonButtons>
          <IonTitle>Receita Compartilhada</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen style={{ '--background': '#f9fafb', '--padding-bottom': '100px' }}>
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center text-gray-500">Carregando receita...</div>
          ) : error && !recipe ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : recipe ? (
            <>
              {/* Recipe Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-56 object-cover"
                  />
                )}

                <div className="p-6 space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
                      {recipe.categoryName && (
                        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mt-1">
                          {recipe.categoryName}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      {recipe.servings ? `${recipe.servings} porções` : 'Sem porções'}
                      <br />
                      {recipe.difficulty || 'Sem dificuldade'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                    {recipe.prep_time && <div><strong>Preparação:</strong> {recipe.prep_time} min</div>}
                    {recipe.cook_time && <div><strong>Cozimento:</strong> {recipe.cook_time} min</div>}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Descrição</h3>
                    <p className="text-gray-600 mt-2">{recipe.description || 'Sem descrição.'}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Ingredientes</h3>
                    <div className="mt-3 space-y-2 text-gray-700">
                      {recipe.ingredients?.split('\n').map((line, index) => (
                        line.trim() && <p key={index}>• {line.trim()}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Modo de preparo</h3>
                    <div className="mt-3 space-y-2 text-gray-700">
                      {recipe.instructions?.split('\n').map((line, index) => (
                        line.trim() && <p key={index}>{line.trim()}</p>
                      ))}
                    </div>
                  </div>

                  {recipe.video_url && (
                    <div className="pt-4">
                      <h3 className="text-lg font-semibold text-gray-800">Vídeo</h3>
                      <a
                        href={recipe.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {recipe.video_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Save / Login Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                {user ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Salve essa receita na sua conta</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Clique em clonar para criar uma cópia desta receita no seu CookingBook.
                      </p>
                    </div>

                    {success && (
                      <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {success}
                      </div>
                    )}

                    {error && (
                      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleClone}
                      disabled={cloning}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {cloning ? 'Clonando...' : 'Clonar Receita'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/home')}
                      className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                      Voltar para o App
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Faça login para salvar</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Entre na sua conta para clonar esta receita.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/login?shareToken=${encodeURIComponent(token)}`)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                      Entrar
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/signup?shareToken=${encodeURIComponent(token)}`)}
                      className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                      Criar conta
                    </button>
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default SharePage;