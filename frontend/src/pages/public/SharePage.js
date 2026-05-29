import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loginUrl = `/login?shareToken=${encodeURIComponent(token)}`;
  const signupUrl = `/signup?shareToken=${encodeURIComponent(token)}`;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Receita compartilhada</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <div className="max-w-3xl mx-auto space-y-5" style={{ paddingBottom: '60px' }}>
          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Carregando compartilhamento...</div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Receita compartilhada</h2>
                  <p className="text-sm text-gray-600">{preview?.title || 'Receita sem título'}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Porções</div>
                    <div className="text-lg font-semibold">{preview?.servings || 'N/A'}</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Dificuldade</div>
                    <div className="text-lg font-semibold">{preview?.difficulty || 'N/A'}</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Descrição:</strong> {preview?.description || 'Sem descrição.'}</p>
                  <p><strong>Tempo de preparo:</strong> {preview?.prep_time ? `${preview.prep_time} min` : 'N/A'}</p>
                  <p><strong>Tempo de cozimento:</strong> {preview?.cook_time ? `${preview.cook_time} min` : 'N/A'}</p>
                </div>
              </div>

              {user ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Salve essa receita na sua conta</h3>
                  <p className="text-sm text-gray-600">Clique em clonar para criar uma cópia desta receita no seu CookingBook.</p>

                  {success && <div className="rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}
                  {error && <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

                  <IonButton className="custom-btn w-full" onClick={handleClone} disabled={cloning}>
                    {cloning ? 'Clonando...' : 'Clonar receita'}
                  </IonButton>
                  <IonButton fill="clear" className="w-full" onClick={() => navigate('/home')}>
                    Voltar para o app
                  </IonButton>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Faça login para ver e salvar</h3>
                  <p className="text-sm text-gray-600">Você precisa entrar para ver o conteúdo completo e clonar esta receita.</p>

                  <IonButton className="custom-btn w-full" routerLink={loginUrl}>
                    Entrar
                  </IonButton>
                  <IonButton fill="clear" className="w-full" routerLink={signupUrl}>
                    Criar conta
                  </IonButton>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default SharePage;
