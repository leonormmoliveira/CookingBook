import React, { useState, useEffect } from 'react';
import { IonActionSheet, IonSelect, IonSelectOption, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonInput, IonTextarea, IonButton } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { camera, image, images, document as fileIcon } from 'ionicons/icons';
import api from '../../../components/AxiosInstance';
import { useAuth } from '../../../AppContext.tsx';

function CreateRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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

  const [showImageSheet, setShowImageSheet] = useState(false);
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loadingImage, setLoadingImage] = useState(false);
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
      setIngredients(
        Array.isArray(recipe.ingredients)
          ? recipe.ingredients.join('\n')
          : recipe.ingredients || ''
      );
      setInstructions(
        Array.isArray(recipe.instructions)
          ? recipe.instructions.join('\n')
          : recipe.instructions || ''
      );
    }
  }, [location.state]);

  useEffect(() => {
    async function loadCategories() {
      try {
        if (!user?.id) return;
        const { data } = await api.get(`/categories?userId=${user.id}`);
        if (data?.success) setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, [user]);

  const openCamera = async () => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // abre câmara no telemóvel
    input.onchange = (e) => handleImageChange(e);
    input.click();
  };

  const openGallery = async () => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleImageChange(e);
    input.click();
  };

  const openFiles = async () => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (e) => handleImageChange(e);
    input.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageName(file.name);
    setSelectedImage(null);
    setSuggestedImages([]);
  };

  const handleFetchImages = async () => {
    try {
      setLoadingImage(true);
      const query = `${title || 'food'}`;
      const { data } = await api.get(
        `/analysisVideo/image-suggestions?query=${encodeURIComponent(query)}`
      );
      if (data.success) {
        setSuggestedImages(data.images);
        setImageFile(null);
        setImageName('');
      }
    } catch (err) {
      setError('Erro ao buscar imagens do Pexels');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = (category || '').trim();
    if (!name) return;
    try {
      if (!user?.id) {
        setError('Faça login para criar categorias.');
        return;
      }
      const { data } = await api.post('/categories', { userId: user.id, name });
      if (data?.success) {
        const newCat = data.category;
        setCategories((prev) => [newCat, ...prev.filter((c) => c.id !== newCat.id)]);
        setCategory(newCat.name);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao criar categoria.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!user?.id) {
      setError('Usuário não encontrado. Faça login e tente novamente.');
      return;
    }
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      setError('Título, ingredientes e instruções são obrigatórios.');
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
      if (imageFile) formData.append('image', imageFile);

      const { data } = await api.post('/recipes', formData);
      if (data.success) {
        navigate('/home');
      } else {
        setError(data.message || 'Não foi possível criar a receita.');
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
        style={{ '--background': '#f9fafb', '--padding-bottom': '100px' }}
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nova Receita</h2>
              <p className="text-sm text-gray-500 mt-1">Preencha os detalhes da sua receita</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                    <IonInput
                      value={title}
                      onIonInput={(e) => setTitle(e.detail.value)}
                      placeholder="Ex: Bolo de Chocolate"
                      style={{
                        '--padding-start': '14px',
                        '--padding-end': '14px',
                        '--padding-top': '10px',
                        '--padding-bottom': '10px',
                        '--placeholder-color': '#9ca3af',
                        '--color': '#111827',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria (opcional)</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-3">
                      <IonInput
                        value={category}
                        onIonInput={(e) => setCategory(e.detail.value)}
                        placeholder="Ex: Sobremesas"
                        style={{
                          '--padding-start': '14px',
                          '--padding-end': '14px',
                          '--padding-top': '10px',
                          '--padding-bottom': '10px',
                          '--placeholder-color': '#9ca3af',
                          '--color': '#111827',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors"
                    >
                      Criar
                    </button>
                  </div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className="text-xs bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded-full transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Porções</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                    <IonInput
                      type="number"
                      value={servings}
                      onIonInput={(e) => setServings(e.detail.value)}
                      placeholder="4"
                      style={{
                        '--padding-start': '14px',
                        '--padding-end': '14px',
                        '--padding-top': '10px',
                        '--padding-bottom': '10px',
                        '--placeholder-color': '#9ca3af',
                        '--color': '#111827',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dificuldade</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                    <IonSelect
                      value={difficulty}
                      onIonChange={(e) => setDifficulty(e.detail.value)}
                      placeholder="Selecione"
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
                      placeholder="15"
                      style={{
                        '--padding-start': '14px',
                        '--padding-end': '14px',
                        '--padding-top': '10px',
                        '--padding-bottom': '10px',
                        '--placeholder-color': '#9ca3af',
                        '--color': '#111827',
                      }}
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
                      placeholder="30"
                      style={{
                        '--padding-start': '14px',
                        '--padding-end': '14px',
                        '--padding-top': '10px',
                        '--padding-bottom': '10px',
                        '--placeholder-color': '#9ca3af',
                        '--color': '#111827',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Image & Video */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto da Receita</label>
                  <IonButton expand="block" className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white" onClick={() => setShowImageSheet(true)}>
                    Escolher imagem
                  </IonButton>
                  {imageName && <p className="text-xs text-gray-500 mt-1">Selecionado: {imageName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link do Vídeo (opcional)</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                    <IonInput
                      value={videoUrl}
                      onIonInput={(e) => setVideoUrl(e.detail.value)}
                      placeholder="https://youtube.com/..."
                      type="url"
                      style={{
                        '--padding-start': '14px',
                        '--padding-end': '14px',
                        '--padding-top': '10px',
                        '--padding-bottom': '10px',
                        '--placeholder-color': '#9ca3af',
                        '--color': '#111827',
                      }}
                    />
                  </div>
                </div>
                {/* Removido bloco duplicado de categorias */}
              </div>

              {/* Description, Ingredients, Instructions */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                    <IonTextarea
                      value={description}
                      onIonInput={(e) => setDescription(e.detail.value)}
                      placeholder="Uma breve descrição da receita..."
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
                      placeholder="1 xícara de farinha&#10;2 ovos&#10;..."
                      rows={6}
                      style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Preparo</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                    <IonTextarea
                      value={instructions}
                      onIonInput={(e) => setInstructions(e.detail.value)}
                      placeholder="1. Misture os ingredientes secos...&#10;2. ..."
                      rows={8}
                      style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '10px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Guardar Receita'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
        <IonActionSheet
          isOpen={showImageSheet}
          onDidDismiss={() => setShowImageSheet(false)}
          header="Adicionar imagem"
          buttons={[
            {
              text: 'Tirar foto',
              icon: camera,
              handler: () => openCamera()
            },
            {
              text: 'Galeria',
              icon: images,
              handler: () => openGallery()
            },
            {
              text: 'Ficheiros',
              icon: fileIcon,
              handler: () => openFiles()
            },
            {
              text: 'Gerar imagens',
              icon: image,
              handler: () => handleFetchImages()
            },
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
}

export default CreateRecipePage;