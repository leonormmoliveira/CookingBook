import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSearchbar, IonFab, IonFabButton, IonIcon, IonModal, IonList, IonItem, IonLabel, IonAlert } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../components/AxiosInstance';

function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoAlert, setShowVideoAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRecipes() {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);

      try {
        setLoading(true);
        const { data } = await api.get(`/recipes?userId=${user.id}`);
        setRecipes(data.recipes || []);
      } catch (err) {
        console.error('Failed to load recipes', err);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const chooseManual = () => {
    setShowCreateModal(false);
    navigate('/create');
  };

  const chooseVideo = () => {
    setShowCreateModal(false);
    setShowVideoAlert(true);
  };

  const submitVideo = (url) => {
    setShowVideoAlert(false);
    navigate(`/video-analysis?url=${encodeURIComponent(url || '')}`);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const keyword = searchText?.toLowerCase?.() || '';
    if (!keyword) return true;
    return [recipe.title, recipe.description, recipe.ingredients, recipe.instructions, recipe.categoryName]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(keyword));
  });

  const categorized = {};
  const uncategorized = [];

  filteredRecipes.forEach((recipe) => {
    if (recipe.categoryName) {
      categorized[recipe.categoryName] = categorized[recipe.categoryName] || [];
      categorized[recipe.categoryName].push(recipe);
    } else {
      uncategorized.push(recipe);
    }
  });

  const categorySections = Object.keys(categorized).sort().map((categoryName) => ({
    name: categoryName,
    recipes: categorized[categoryName],
  }));

  const renderRecipeCard = (recipe) => {
    const imageSrc = recipe.image_data || recipe.image_url;

    return (
      <div key={recipe.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {imageSrc ? (
          <img src={imageSrc} alt={recipe.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">Sem imagem</div>
        )}
        <div className="p-4">
        <h4 className="text-lg font-semibold">{recipe.title}</h4>
        {recipe.categoryName && <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">{recipe.categoryName}</p>}
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{recipe.description || recipe.instructions?.slice(0, 120) || 'Sem descrição disponível.'}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          {recipe.servings && <span>{recipe.servings} porções</span>}
          {recipe.difficulty && <span>{recipe.difficulty}</span>}
        </div>
        <IonButton className="mt-4 custom-btn w-full" fill="outline" onClick={() => navigate(`/recipe/${recipe.id}`)}>
          Ver receita
        </IonButton>
      </div>
    </div>
  );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-2xl font-bold">CookingBook</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4" fullscreen>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value)}
              placeholder="Pesquisar receitas ou categorias"
              className="bg-white rounded-md shadow-sm"
            />
          </div>

          <section className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Minhas Receitas</h3>
                <p className="text-sm text-gray-500 mt-1">Receitas agrupadas por categoria e listadas para acesso rápido.</p>
              </div>
              <IonButton className="custom-btn" onClick={handleCreateClick}>
                Nova receita
              </IonButton>
            </div>
          </section>

          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Carregando receitas...</div>
          ) : (
            <div className="space-y-6">
              {categorySections.length === 0 && uncategorized.length === 0 ? (
                <div className="rounded-lg bg-white p-6 shadow-sm text-center text-gray-500">Nenhuma receita encontrada.</div>
              ) : (
                <>
                  {categorySections.map((section) => (
                    <div key={section.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-semibold">{section.name}</h4>
                          <p className="text-sm text-gray-500">{section.recipes.length} receita(s)</p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {section.recipes.map(renderRecipeCard)}
                      </div>
                    </div>
                  ))}

                  {uncategorized.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold">Sem categoria</h4>
                        <p className="text-sm text-gray-500">Receitas criadas sem categoria definida.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {uncategorized.map(renderRecipeCard)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ zIndex: 1000, right: 16, bottom: 16 }}>
          <IonFabButton onClick={handleCreateClick} style={{ zIndex: 1001, background: '#0066cc', color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <button
          onClick={handleCreateClick}
          aria-label="Criar"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white"
          style={{ background: '#0066cc' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Novo</h3>
            <IonList>
              <IonItem button onClick={chooseVideo}>
                <IonLabel>Gerar a partir de vídeo</IonLabel>
              </IonItem>
              <IonItem button onClick={chooseManual}>
                <IonLabel>Inserir manualmente</IonLabel>
              </IonItem>
              <IonItem button onClick={() => setShowCreateModal(false)}>
                <IonLabel>Cancelar</IonLabel>
              </IonItem>
            </IonList>
          </div>
        </IonModal>

        <IonAlert
          isOpen={showVideoAlert}
          onDidDismiss={() => setShowVideoAlert(false)}
          header={'Analisar vídeo'}
          inputs={[{
            name: 'videoUrl',
            type: 'url',
            placeholder: 'https://youtube.com/watch?v=...'
          }]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setShowVideoAlert(false)
            },
            {
              text: 'Analisar',
              handler: (data) => {
                submitVideo(data.videoUrl || '');
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
}

export default HomePage;