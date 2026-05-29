import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonInput, IonTextarea } from '@ionic/react';
import { arrowBack, heart, heartOutline, shareSocial } from 'ionicons/icons';
import { getRecipeById, updateRecipe, deleteRecipe } from '../../../services/recipeService';
import { addFavorite, removeFavorite } from '../../../services/favoriteService';
import { useAuth } from '../../../AppContext.tsx';
import api from '../../../components/AxiosInstance';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true);
      if (!user?.id) {
        setError('Faça login para visualizar a receita.');
        setLoading(false);
        return;
      }

      try {
        const { recipe: fetched } = await getRecipeById(id, user?.id);
        setRecipe(fetched);
        setTitle(fetched.title || '');
        setDescription(fetched.description || '');
        setCategoryName(fetched.categoryName || '');
        setIngredients(fetched.ingredients || '');
        setInstructions(fetched.instructions || '');
        setImagePreview(fetched.image_url || fetched.image_data || '');
        setIsFavorite(Boolean(fetched.isFavorite));
      } catch (err) {
        setError(err?.response?.data?.message || 'Não foi possível carregar a receita.');
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id, user]);

  const handleEdit = () => {
    setEditing(true);
    setError('');
  };

  const handleCancel = () => {
    if (recipe) {
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setCategoryName(recipe.categoryName || '');
      setIngredients(recipe.ingredients || '');
      setInstructions(recipe.instructions || '');
      setImagePreview(recipe.image_url || recipe.image_data || '');
      setImageFile(null);
    }
    setError('');
    setEditing(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      setError('Título, ingredientes e instruções são obrigatórios.');
      return;
    }

    if (!user?.id) {
      setError('Usuário não encontrado. Faça login novamente.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title.trim());
      formData.append('description', description.trim() || '');
      formData.append('categoryName', categoryName.trim() || '');
      formData.append('ingredients', ingredients.trim());
      formData.append('instructions', instructions.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await updateRecipe(id, formData);
      const { recipe: updated } = await getRecipeById(id);
      setRecipe(updated);
      setEditing(false);
      setImageFile(null);
      setImagePreview(updated.image_url || updated.image_data || '');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao salvar a receita.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta receita?');
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      await deleteRecipe(id);
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao excluir a receita.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    setShareError('');
    setShareUrl('');

    if (!user?.id) {
      setShareError('Faça login para gerar o link de compartilhamento.');
      setShareLoading(false);
      return;
    }

    try {
      const { data } = await api.post(`/sharing/${id}`, { userId: user.id });
      setShareUrl(data.shareUrl);

      if (navigator.clipboard && data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl);
      }
    } catch (err) {
      setShareError(err?.response?.data?.message || 'Não foi possível gerar o link de compartilhamento.');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/home');
              }
            }}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Detalhes da Receita</IonTitle>
          <IonButtons slot="end">
            {!editing && recipe && (
              <>
                {(() => {
                  const isOwner = user?.id && recipe.ownerId === user.id;
                  return isOwner ? (
                    <IonButton onClick={handleShare} disabled={shareLoading}>
                      <IonIcon icon={shareSocial} slot="start" />
                      {shareLoading ? 'Gerando...' : 'Compartilhar'}
                    </IonButton>
                  ) : null;
                })()}
                <IonButton onClick={handleEdit}>Editar</IonButton>
                <IonButton color="danger" onClick={handleDelete}>Excluir</IonButton>
              </>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen style={{ '--padding-bottom': '65px' }}>
        <div className="max-w-3xl mx-auto space-y-4" style={{ paddingBottom: '60px' }}>
          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Carregando receita...</div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : recipe ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {imagePreview ? (
                <img src={imagePreview} alt={recipe.title} className="w-full h-56 object-cover" />
              ) : null}

              <div className="p-6 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{recipe.title}</h2>
                    {recipe.categoryName && <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold mt-1">{recipe.categoryName}</p>}
                  </div>
                  {!editing && (
                    <div className="flex items-center gap-3 text-right text-sm text-gray-500">
                      <IonButton fill="clear" size="small" onClick={async () => {
                        if (!user?.id) return;
                        try {
                          if (isFavorite) {
                            await removeFavorite(id, user.id);
                            setIsFavorite(false);
                          } else {
                            await addFavorite(id, user.id);
                            setIsFavorite(true);
                          }
                        } catch (err) {
                          console.error('Erro ao atualizar favorito', err);
                        }
                      }}>
                        <IonIcon icon={isFavorite ? heart : heartOutline} style={{ color: isFavorite ? '#e0245e' : '#4b5563', fontSize: '1.2rem' }} />
                      </IonButton>
                      <div>
                        {recipe.servings ? `${recipe.servings} porções` : 'Sem porções'}
                        <br />
                        {recipe.difficulty || 'Sem dificuldade'}
                      </div>
                    </div>
                  )}
                </div>

                {shareUrl ? (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    Link de compartilhamento gerado e copiado para a área de transferência.
                    <div className="mt-2 break-all text-blue-700">
                      <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
                    </div>
                  </div>
                ) : null}
                {shareError ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{shareError}</div>
                ) : null}

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <div className="bg-gray-50 border border-gray-300 rounded p-2">
                        <IonInput value={title} onIonInput={(e) => setTitle(e.detail.value)} placeholder="Título da receita" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <div className="bg-gray-50 border border-gray-300 rounded p-2">
                        <IonInput value={categoryName} onIonInput={(e) => setCategoryName(e.detail.value)} placeholder="Categoria" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Foto da receita</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded border border-gray-300 bg-white p-2 text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição</label>
                      <div className="bg-gray-50 border border-gray-300 rounded p-2">
                        <IonTextarea value={description} onIonInput={(e) => setDescription(e.detail.value)} rows={3} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Ingredientes</label>
                      <div className="bg-gray-50 border border-gray-300 rounded p-2">
                        <IonTextarea value={ingredients} onIonInput={(e) => setIngredients(e.detail.value)} rows={5} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Modo de preparo</label>
                      <div className="bg-gray-50 border border-gray-300 rounded p-2">
                        <IonTextarea value={instructions} onIonInput={(e) => setInstructions(e.detail.value)} rows={6} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <IonButton className="custom-btn flex-1" onClick={handleSave} disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar alterações'}
                      </IonButton>
                      <IonButton className="custom-btn-secondary flex-1" color="medium" onClick={handleCancel} disabled={saving}>
                        Cancelar
                      </IonButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Descrição</h3>
                      <p className="text-gray-700 mt-2">{recipe.description || 'Sem descrição.'}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Ingredientes</h3>
                      <div className="mt-2 space-y-2 text-gray-700">
                        {recipe.ingredients.split('\n').map((line, index) => (
                          <p key={index}>• {line}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Modo de preparo</h3>
                      <div className="mt-2 space-y-2 text-gray-700">
                        {recipe.instructions.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Receita não encontrada.</div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default RecipeDetailPage;