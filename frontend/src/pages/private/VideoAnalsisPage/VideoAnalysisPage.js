import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonBackButton, IonButtons, IonInput
} from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../components/AxiosInstance';

function VideoAnalysisPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('url');
    if (url) setVideoUrl(url);
  }, [location.search]);

  const handleAnalyzeVideo = useCallback(async () => {
    setError('');
    if (!videoUrl) {
      setError('Por favor, insira o URL do vídeo.');
      return;
    }
    setLoading(true);
    try {
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
      } else {
        setError(data.message || 'Não foi possível analisar o vídeo.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Erro ao analisar vídeo.');
    } finally {
      setLoading(false);
    }
  }, [videoUrl]);

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

      <IonContent className="ion-padding" fullscreen style={{ '--background': '#f9fafb', '--padding-bottom': '80px' }}>
        <div className="max-w-xl mx-auto space-y-4 pt-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gere Receitas Automaticamente</h2>
              <p className="text-sm text-gray-500 mt-1">
                Cole o link de um vídeo de receita e deixe a IA gerar a receita inicial para você.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL do Vídeo</label>
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-3">
                <IonInput
                  value={videoUrl}
                  onIonInput={(e) => setVideoUrl(e.detail.value)}
                  placeholder="https://youtube.com/watch?v=... ou TikTok"
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

            <button
              type="button"
              onClick={handleAnalyzeVideo}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Analisando...' : '🎬 Analisar Vídeo'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/create')}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Inserir manualmente
            </button>

            {analysis && (
              <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Resultado da Análise</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-3 overflow-auto max-h-96">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default VideoAnalysisPage;