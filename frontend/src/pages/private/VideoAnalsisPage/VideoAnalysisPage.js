import React, { useState, useEffect, useCallback } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonInput, IonButton } from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../components/AxiosInstance';

function VideoAnalysisPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('url');
    if (url) setVideoUrl(url);
  }, [location.search]);

  const createRecipeFromAnalysis = useCallback(async (parsed) => {
    if (!parsed || !parsed.title || !parsed.ingredients || !parsed.instructions) {
      return false;
    }

    setError('');
    setCreating(true);

    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        setError('Faça login para salvar a receita gerada.');
        return false;
      }
      const user = JSON.parse(stored);

      const payload = {
        userId: user.id,
        title: parsed.title.trim(),
        description: parsed.description?.trim() || null,
        categoryName: parsed.category?.trim() || null,
        ingredients: Array.isArray(parsed.ingredients)
          ? parsed.ingredients.join('\n')
          : parsed.ingredients?.trim() || '',
        instructions: Array.isArray(parsed.instructions)
          ? parsed.instructions.join('\n')
          : parsed.instructions?.trim() || '',
        servings: parsed.servings ? Number(parsed.servings) : null,
        difficulty: parsed.difficulty || null,
        videoUrl: videoUrl.trim(),
      };

      const { data } = await api.post('/recipes', payload);
      if (data.success) {
        navigate('/home');
        return true;
      }

      setError(data.message || 'Não foi possível salvar a receita gerada.');
      return false;
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Erro ao salvar a receita gerada.');
      return false;
    } finally {
      setCreating(false);
    }
  }, [navigate, videoUrl]);

  const handleAnalyzeVideo = useCallback(async () => {
    setError('');
    if (!videoUrl) {
      setError('Por favor, insira o URL do vídeo.');
      return;
    }

    try {
      setLoading(true);
      const stored = localStorage.getItem('user');
      if (!stored) {
        setError('Faça login para usar a análise de vídeo.');
        return;
      }
      const user = JSON.parse(stored);

      const { data } = await api.post('/video-analysis', {
        userId: user.id,
        videoUrl: videoUrl.trim(),
      });

      if (data.success) {
        setAnalysis(data.result);
        if (data.result?.parsed) {
          await createRecipeFromAnalysis(data.result.parsed);
        }
      } else {
        setError(data.message || 'Não foi possível analisar o vídeo.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Erro ao analisar vídeo.');
    } finally {
      setLoading(false);
    }
  }, [createRecipeFromAnalysis, videoUrl]);

  useEffect(() => {
    if (videoUrl && !autoAnalyzed) {
      setAutoAnalyzed(true);
      handleAnalyzeVideo();
    }
  }, [videoUrl, autoAnalyzed, handleAnalyzeVideo]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Analisar Vídeo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4 pb-24">{/* extra bottom padding for small screens */}
        <div className="custom-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Gere Receitas Automaticamente</h2>
          <p className="text-gray-600 text-sm">Cole o link de um vídeo de receita e deixe a IA gerar a receita inicial para você.</p>

          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">URL do Vídeo</label>
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <IonInput
                value={videoUrl}
                onIonInput={(e) => setVideoUrl(e.detail.value)}
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />
            </div>
          </div>

          <IonButton 
            className="custom-btn w-full" 
            onClick={handleAnalyzeVideo}
            disabled={loading || creating}
          >
            {loading ? 'Analisando...' : creating ? 'Salvando receita...' : '🎬 Analisar Vídeo'}
          </IonButton>
          <div className="mt-3">
            <IonButton fill="clear" color="medium" onClick={() => navigate('/create')}>
              Inserir manualmente
            </IonButton>
          </div>

          {analysis && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold">Receita Gerada</h3>
              <p className="text-sm text-gray-600 mb-4">Use essa base para ajustar ou salvar no seu livro de receitas.</p>
              <div className="space-y-3">
                {analysis.parsed ? (
                  (() => {
                    const a = analysis.parsed;
                    return (
                      <>
                        <div>
                          <p className="font-semibold">Título</p>
                          <p>{a.title}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Descrição</p>
                          <p>{a.description}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Ingredientes</p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {(a.ingredients || []).map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold">Instruções</p>
                          <ol className="list-decimal list-inside text-sm text-gray-700">
                            {(a.instructions || []).map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div>
                    <p className="font-semibold">Resposta não estruturada</p>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2">{analysis.raw}</pre>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-3">
                <IonButton fill="clear" color="medium" onClick={() => navigate('/create', { state: { analysis } })}>
                  Inserir manualmente
                </IonButton>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default VideoAnalysisPage;