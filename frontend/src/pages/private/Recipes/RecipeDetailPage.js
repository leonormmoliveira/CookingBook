import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonButton,
  IonIcon, IonInput, IonTextarea, IonSelect, IonSelectOption
} from '@ionic/react';
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
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
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
        setPrepTime(fetched.prep_time || '');
        setCookTime(fetched.cook_time || '');
        setServings(fetched.servings || '');
        setDifficulty(fetched.difficulty || '');
        setVideoUrl(fetched.video_url || '');
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

  const handleEdit = () => { setEditing(true); setError(''); };
  const handleCancel = () => {
    if (recipe) {
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setCategoryName(recipe.categoryName || '');
      setIngredients(recipe.ingredients || '');
      setInstructions(recipe.instructions || '');
      setPrepTime(recipe.prep_time || '');
      setCookTime(recipe.cook_time || '');
      setServings(recipe.servings || '');
      setDifficulty(recipe.difficulty || '');
      setVideoUrl(recipe.video_url || '');
      setImagePreview(recipe.image_url || recipe.image_data || '');
      setImageFile(null);
    }
    setError('');
    setEditing(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) { setImageFile(null); return; }
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
      formData.append('prepTime', prepTime || '');
      formData.append('cookTime', cookTime || '');
      formData.append('servings', servings || '');
      formData.append('difficulty', difficulty || '');
      formData.append('videoUrl', videoUrl.trim() || '');
      if (imageFile) formData.append('image', imageFile);

      await updateRecipe(id, formData);
      const { recipe: updated } = await getRecipeById(id, user.id);
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
            <IonButton fill="clear" onClick={() => navigate(-1)}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            {!editing && recipe && (
              <>
                {user?.id && recipe.ownerId === user.id && (
                  <button
                    onClick={handleEdit}
                    className="text-blue-600 font-medium text-sm mr-2"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="text-red-500 font-medium text-sm"
                >
                  Excluir
                </button>
              </>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen style={{ '--background': '#f9fafb', '--padding-bottom': '100px' }}>
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center text-gray-500">Carregando receita...</div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : recipe ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {imagePreview && (
                <img src={imagePreview} alt={recipe.title} className="w-full h-56 object-cover" />
              )}

              <div className="p-6 space-y-6">
                {/* Title and Meta */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
                    {recipe.categoryName && (
                      <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mt-1">
                        {recipe.categoryName}
                      </p>
                    )}
                  </div>

                  {!editing && (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <button
                        onClick={async () => {
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
                        }}
                      >
                        <IonIcon
                          icon={isFavorite ? heart : heartOutline}
                          style={{ color: isFavorite ? '#e0245e' : '#9ca3af', fontSize: '1.3rem' }}
                        />
                      </button>
                      <div>
                        {recipe.servings ? `${recipe.servings} porções` : 'Sem porções'}
                        <br />
                        {recipe.difficulty || 'Sem dificuldade'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                  {recipe.prep_time && <div><strong>Preparação:</strong> {recipe.prep_time} min</div>}
                  {recipe.cook_time && <div><strong>Cozimento:</strong> {recipe.cook_time} min</div>}
                </div>

                {/* Share Button */}
                {!editing && user?.id && recipe.ownerId === user.id && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleShare}
                      disabled={shareLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <IonIcon icon={shareSocial} />
                      {shareLoading ? 'Gerando...' : 'Compartilhar'}
                    </button>
                  </div>
                )}

                {/* Video Link */}
                {recipe.video_url && (
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Vídeo da Receita</h3>
                    <a
                      href={recipe.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all text-sm"
                    >
                      {recipe.video_url}
                    </a>
                  </div>
                )}

                {shareUrl && (
                  <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    Link de compartilhamento gerado e copiado!
                    <div className="mt-2 break-all text-blue-700">
                      <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
                    </div>
                  </div>
                )}

                {shareError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{shareError}</div>
                )}

                {/* Editing Form */}
                {editing ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                        <IonInput
                          value={title}
                          onIonInput={(e) => setTitle(e.detail.value)}
                          style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px', '--padding-bottom': '10px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                        <IonInput
                          value={categoryName}
                          onIonInput={(e) => setCategoryName(e.detail.value)}
                          style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px', '--padding-bottom': '10px' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Porções</label>
                        <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                          <IonInput
                            type="number"
                            value={servings}
                            onIonInput={(e) => setServings(e.detail.value)}
                            style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px', '--padding-bottom': '10px' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dificuldade</label>
                        <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                          <IonSelect
                            value={difficulty}
                            onIonChange={(e) => setDifficulty(e.detail.value)}
                            style={{ '--padding-start': '14px', '--padding-end': '14px' }}
                          >
                            <IonSelectOption value="Fácil">Fácil</IonSelectOption>
                            <IonSelectOption value="Médio">Médio</IonSelectOption>
                            <IonSelectOption value="Difícil">Difícil</IonSelectOption>
                          </IonSelect>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Prep (min)</label>
                        <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                          <IonInput
                            type="number"
                            value={prepTime}
                            onIonInput={(e) => setPrepTime(e.detail.value)}
                            style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px', '--padding-bottom': '10px' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Cozimento (min)</label>
                        <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                          <IonInput
                            type="number"
                            value={cookTime}
                            onIonInput={(e) => setCookTime(e.detail.value)}
                            style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px', '--padding-bottom': '10px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link do Vídeo</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                        <IonInput
                          value={videoUrl}
                          onIonInput={(e) => setVideoUrl(e.detail.value)}
                          placeholder="https://"
                          style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px', '--padding-bottom': '10px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto da receita</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                        <IonTextarea
                          value={description}
                          onIonInput={(e) => setDescription(e.detail.value)}
                          rows={3}
                          style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                        <IonTextarea
                          value={ingredients}
                          onIonInput={(e) => setIngredients(e.detail.value)}
                          rows={6}
                          style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Modo de preparo</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                        <IonTextarea
                          value={instructions}
                          onIonInput={(e) => setInstructions(e.detail.value)}
                          rows={8}
                          style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px' }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row pt-4">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Salvando...' : 'Salvar alterações'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Descrição</h3>
                      <p className="text-gray-600 mt-2">{recipe.description || 'Sem descrição.'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Ingredientes</h3>
                      <div className="mt-3 space-y-2 text-gray-700">
                        {recipe.ingredients.split('\n').map((line, index) => (
                          line.trim() && <p key={index}>• {line.trim()}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Modo de preparo</h3>
                      <div className="mt-3 space-y-2 text-gray-700">
                        {recipe.instructions.split('\n').map((line, index) => (
                          line.trim() && <p key={index}>{line.trim()}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center text-gray-500">Receita não encontrada.</div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default RecipeDetailPage;