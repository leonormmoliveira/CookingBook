import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonButton } from '@ionic/react';
import { useParams } from 'react-router-dom';

function RecipeDetailPage() {
  const { id } = useParams();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Detalhes da Receita</IonTitle>
          <IonButtons slot="end">
            <IonButton>❤️</IonButton>
            <IonButton>🔗</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4">
        <div className="custom-card p-4">
          <h2 className="text-2xl font-bold mb-4">Receita {id}</h2>
          <p className="text-gray-600">Carregando detalhes da receita...</p>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default RecipeDetailPage;