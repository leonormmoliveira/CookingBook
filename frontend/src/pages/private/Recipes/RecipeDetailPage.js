import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonButton, IonInput, IonTextarea } from '@ionic/react';
import { getRecipeById, updateRecipe, deleteRecipe } from '../../../services/recipeService';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true);
      try {
        const { recipe: fetched } = await getRecipeById(id);
        setRecipe(fetched);
        setTitle(fetched.title || '');
        setDescription(fetched.description || '');
        setCategoryName(fetched.categoryName || '');
        setIngredients(fetched.ingredients || '');
        setInstructions(fetched.instructions || '');
        setImagePreview(fetched.image_url || fetched.image_data || '');
      } catch (err) {
        setError(err?.response?.data?.message || 'Não foi possível carregar a receita.');
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

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

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('Usuário não encontrado. Faça login novamente.');
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user?.id) {
      setError('ID de usuário inválido. Faça login novamente.');
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Detalhes da Receita</IonTitle>
          <IonButtons slot="end">
            {!editing && recipe && (
              <>
                <IonButton onClick={handleEdit}>Editar</IonButton>
                <IonButton color="danger" onClick={handleDelete}>Excluir</IonButton>
              </>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4">
        <div className="max-w-3xl mx-auto space-y-4">
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
                    <div className="text-right text-sm text-gray-500">
                      {recipe.servings ? `${recipe.servings} porções` : 'Sem porções'}
                      <br />
                      {recipe.difficulty || 'Sem dificuldade'}
                    </div>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <IonInput value={title} onIonInput={(e) => setTitle(e.detail.value)} placeholder="Título da receita" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <IonInput value={categoryName} onIonInput={(e) => setCategoryName(e.detail.value)} placeholder="Categoria" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Foto da receita</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded border border-gray-200 bg-white p-2 text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição</label>
                      <IonTextarea value={description} onIonInput={(e) => setDescription(e.detail.value)} rows={3} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Ingredientes</label>
                      <IonTextarea value={ingredients} onIonInput={(e) => setIngredients(e.detail.value)} rows={5} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Modo de preparo</label>
                      <IonTextarea value={instructions} onIonInput={(e) => setInstructions(e.detail.value)} rows={6} />
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