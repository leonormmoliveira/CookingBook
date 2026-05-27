import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonInput, IonTextarea, IonButton } from '@ionic/react';
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
  const [imageName, setImageName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
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
    }
  }, [location.state]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageName('');
      setImageBase64('');
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('Usuário não encontrado. Faça login e tente novamente.');
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user?.id) {
      setError('ID de usuário inválido. Faça login novamente.');
      return;
    }

    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      setError('Título, ingredientes e instruções são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/recipes', {
        userId: user.id,
        title: title.trim(),
        description: description.trim() || null,
        categoryName: category.trim() || null,
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        imageBase64: imageBase64 || null,
      });

      if (data.success) {
        navigate('/home');
      } else {
        setError(data.message || 'Não foi possível criar a receita.');
      }
    } catch (err) {
      console.error(err);
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

      <IonContent className="p-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Criar Nova Receita</h2>
              <p className="text-sm text-gray-600">Preencha os detalhes e salve no seu livro de receitas.</p>
            </div>

            {error && (
              <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-2">
                  <IonInput
                    value={title}
                    onIonInput={(e) => setTitle(e.detail.value)}
                    placeholder="Nome da receita"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoria (opcional)</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-2">
                  <IonInput
                    value={category}
                    onIonInput={(e) => setCategory(e.detail.value)}
                    placeholder="Digite ou escolha uma categoria existente"
                  />
                </div>
                {categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.name)}
                        className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-blue-50"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto da Receita (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded border border-gray-200 bg-white p-2 text-sm"
                />
                {imageName && (
                  <p className="mt-2 text-sm text-gray-600">Imagem selecionada: {imageName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-2">
                  <IonTextarea
                    value={description}
                    onIonInput={(e) => setDescription(e.detail.value)}
                    placeholder="Breve descrição"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ingredientes</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-2">
                  <IonTextarea
                    value={ingredients}
                    onIonInput={(e) => setIngredients(e.detail.value)}
                    placeholder="Um ingrediente por linha"
                    rows={5}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Modo de Preparação</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-2">
                  <IonTextarea
                    value={instructions}
                    onIonInput={(e) => setInstructions(e.detail.value)}
                    placeholder="Instruções passo a passo"
                    rows={5}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <IonButton className="custom-btn flex-1" type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Guardar'}
                </IonButton>
                <IonButton className="custom-btn-secondary flex-1" type="button" onClick={() => navigate('/home')}>
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