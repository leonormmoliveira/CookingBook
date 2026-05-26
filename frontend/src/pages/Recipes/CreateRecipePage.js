import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonInput, IonTextarea, IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import { useHistory } from 'react-router-dom';

function CreateRecipePage() {
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = () => {
    // TODO: Send to API
    alert('Receita criada com sucesso!');
    history.push('/');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Criar Nova Receita</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-4">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <IonInput 
              value={title} 
              onIonInput={(e) => setTitle(e.detail.value)}
              placeholder="Nome da receita"
              className="custom-card p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <IonSelect value={category} onIonChange={(e) => setCategory(e.detail.value)}>
              <IonSelectOption value="">Selecione uma categoria</IonSelectOption>
              <IonSelectOption value="doces">Doces</IonSelectOption>
              <IonSelectOption value="salgados">Salgados</IonSelectOption>
              <IonSelectOption value="bebidas">Bebidas</IonSelectOption>
            </IonSelect>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <IonTextarea 
              value={description} 
              onIonInput={(e) => setDescription(e.detail.value)}
              placeholder="Breve descrição"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ingredientes</label>
            <IonTextarea 
              value={ingredients} 
              onIonInput={(e) => setIngredients(e.detail.value)}
              placeholder="Um ingrediente por linha"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modo de Preparação</label>
            <IonTextarea 
              value={instructions} 
              onIonInput={(e) => setInstructions(e.detail.value)}
              placeholder="Instruções passo a passo"
              rows={5}
            />
          </div>

          <div className="flex gap-2">
            <IonButton className="custom-btn flex-1" onClick={handleSubmit}>Guardar</IonButton>
            <IonButton className="custom-btn-secondary flex-1" onClick={() => history.push('/')}>Cancelar</IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
}

export default CreateRecipePage;
