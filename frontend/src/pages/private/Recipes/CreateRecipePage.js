import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonInput, IonTextarea, IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../components/AxiosInstance';

function CreateRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const state = location.state;
    if (state?.analysis?.parsed) {
      const recipe = state.analysis.parsed;
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setCategory(recipe.category || '');
      setIngredients(Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : recipe.ingredients || '');
      setInstructions(Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions || '');
      setServings(recipe.servings || '');
      setDifficulty(recipe.difficulty || '');
    }
  }, [location.state]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const { data } = await api.get(`/categories?userId=${user.id}`);
        if (data?.success) setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    const name = category.trim();
    if (!name) return;

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const { data } = await api.post('/categories', { userId: user.id, name });
      if (data?.success) {
        const newCat = data.category;
        setCategories(prev => [newCat, ...prev.filter(c => c.id !== newCat.id)]);
        setCategory(newCat.name);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao criar categoria.');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageName('');
      setImageFile(null);
      return;
    }
    setImageName(file.name);
    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('Usuário não encontrado. Faça login novamente.');
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user?.id) {
      setError('ID de usuário inválido.');
      return;
    }

    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      setError('Título, ingredientes e modo de preparo são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title.trim());
      formData.append('description', description.trim() || '');
      formData.append('categoryName', category.trim() || '');
      formData.append('ingredients', ingredients.trim());
      formData.append('instructions', instructions.trim());
      formData.append('servings', servings || '');
      formData.append('difficulty', difficulty || '');
      formData.append('prepTime', prepTime || '');
      formData.append('cookTime', cookTime || '');
      formData.append('videoUrl', videoUrl.trim() || '');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await api.post('/recipes', formData);

      if (data.success) {
        navigate('/home');
      } else {
        setError(data.message || 'Erro ao criar receita.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao criar receita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Criar Nova Receita</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent 
        className="ion-padding" 
        fullscreen 
        style={{ '--padding-bottom': '100px' }}
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Nova Receita</h2>
              <p className="text-sm text-gray-600 mt-1">Preencha os detalhes da sua receita</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <IonInput
                      value={title}
                      onIonInput={(e) => setTitle(e.detail.value)}
                      placeholder="Ex: Bolo de Chocolate"
                      className="text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (opcional)</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <IonInput
                        value={category}
                        onIonInput={(e) => setCategory(e.detail.value)}
                        placeholder="Ex: Sobremesas"
                      />
                    </div>
                    <IonButton onClick={handleCreateCategory} fill="outline" className="h-12">
                      Criar
                    </IonButton>
                  </div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className="text-xs bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded-full"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porções</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <IonInput
                      type="number"
                      value={servings}
                      onIonInput={(e) => setServings(e.detail.value)}
                      placeholder="4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl">
                    <IonSelect
                      value={difficulty}
                      onIonChange={(e) => setDifficulty(e.detail.value)}
                      placeholder="Selecione"
                      className="w-full"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Prep (min)</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <IonInput
                      type="number"
                      value={prepTime}
                      onIonInput={(e) => setPrepTime(e.detail.value)}
                      placeholder="15"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Cozimento (min)</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <IonInput
                      type="number"
                      value={cookTime}
                      onIonInput={(e) => setCookTime(e.detail.value)}
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              {/* Image & Video */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto da Receita</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                  />
                  {imageName && <p className="text-xs text-gray-500 mt-1">Selecionado: {imageName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link do Vídeo (opcional)</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <IonInput
                      value={videoUrl}
                      onIonInput={(e) => setVideoUrl(e.detail.value)}
                      placeholder="https://youtube.com/..."
                      type="url"
                    />
                  </div>
                </div>
              </div>

              {/* Description, Ingredients, Instructions */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <IonTextarea
                      value={description}
                      onIonInput={(e) => setDescription(e.detail.value)}
                      placeholder="Uma breve descrição da receita..."
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <IonTextarea
                      value={ingredients}
                      onIonInput={(e) => setIngredients(e.detail.value)}
                      placeholder="1 xícara de farinha&#10;2 ovos&#10;..."
                      rows={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modo de Preparo</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <IonTextarea
                      value={instructions}
                      onIonInput={(e) => setInstructions(e.detail.value)}
                      placeholder="1. Misture os ingredientes secos...&#10;2. ..."
                      rows={8}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <IonButton className="custom-btn" type="submit" disabled={loading} expand="block">
                  {loading ? 'Salvando...' : 'Guardar Receita'}
                </IonButton>
                <IonButton className="custom-btn-secondary" onClick={() => navigate('/home')} fill="clear" expand="block">
                  Cancelar
                </IonButton>
              </div>
            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default CreateRecipePage;