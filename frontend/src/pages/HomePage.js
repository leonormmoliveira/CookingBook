import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSearchbar, IonGrid, IonRow, IonCol } from '@ionic/react';
import { Link } from 'react-router-dom';

function HomePage() {
  const [searchText, setSearchText] = useState('');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-2xl font-bold">Meu Livro de Receitas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4">
        <div className="mb-4">
          <IonSearchbar 
            value={searchText} 
            onIonInput={(e) => setSearchText(e.detail.value)}
            placeholder="Pesquise uma receita..."
          />
        </div>

        <div className="flex gap-2 mb-6">
          <Link to="/create">
            <IonButton className="custom-btn">+ Nova Receita</IonButton>
          </Link>
          <Link to="/video-analysis">
            <IonButton className="custom-btn">📹 Analisar Vídeo</IonButton>
          </Link>
          <Link to="/categories">
            <IonButton className="custom-btn-secondary">Categorias</IonButton>
          </Link>
          <Link to="/favorites">
            <IonButton className="custom-btn-secondary">❤️ Favoritos</IonButton>
          </Link>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600 text-center">Nenhuma receita carregada ainda.</p>
          <p className="text-gray-500 text-center text-sm">Crie sua primeira receita ou analise um vídeo para começar!</p>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default HomePage;
