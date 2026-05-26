import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Routes } from 'react-router-dom';

import './index.css';

import HomePage from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import CategoriesPage from './pages/CategoriesPage';
import FavoritesPage from './pages/FavoritesPage';
import VideoAnalysisPage from './pages/VideoAnalysisPage';

setupIonicReact();

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/create" element={<CreateRecipePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/video-analysis" element={<VideoAnalysisPage />} />
          </Routes>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
