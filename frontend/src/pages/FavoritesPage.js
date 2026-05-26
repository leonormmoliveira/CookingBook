import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons } from '@ionic/react';

function FavoritesPage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Receitas Favoritas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4">
        <p className="text-gray-600 text-center">Nenhuma receita favorita ainda.</p>
      </IonContent>
    </IonPage>
  );
}

export default FavoritesPage;
