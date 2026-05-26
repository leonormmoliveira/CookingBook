import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonInput, IonButton } from '@ionic/react';

function VideoAnalysisPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyzeVideo = async () => {
    if (!videoUrl) {
      alert('Por favor, insira o URL do vídeo');
      return;
    }

    setLoading(true);
    // TODO: Call API to analyze video with OpenAI
    setTimeout(() => {
      alert('Análise do vídeo concluída! Receita gerada.');
      setLoading(false);
      setVideoUrl('');
    }, 2000);
  };

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

      <IonContent className="p-4">
        <div className="custom-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Gere Receitas Automaticamente</h2>
          <p className="text-gray-600 text-sm">Cole o link de um vídeo de receita e deixe a IA gerar a receita completa.</p>
          
          <div>
            <label className="block text-sm font-medium mb-2">URL do Vídeo</label>
            <IonInput
              value={videoUrl}
              onIonInput={(e) => setVideoUrl(e.detail.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              className="custom-card p-2"
            />
          </div>

          <IonButton 
            className="custom-btn w-full" 
            onClick={handleAnalyzeVideo}
            disabled={loading}
          >
            {loading ? 'Analisando...' : '🎬 Analisar Vídeo'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default VideoAnalysisPage;
