import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import './index.css';

import HomePage from './pages/private/Home/HomePage';
import RecipeDetailPage from './pages/private/Recipes/RecipeDetailPage';
import CreateRecipePage from './pages/private/Recipes/CreateRecipePage';
import CategoriesPage from './pages/private/Categories/CategoriesPage';
import FavoritesPage from './pages/private/Favorite/FavoritesPage';
import VideoAnalysisPage from './pages/private/VideoAnalsisPage/VideoAnalysisPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import SharePage from './pages/public/SharePage';

setupIonicReact();

function App() {
  return (
    <IonApp>
      <BrowserRouter>
        <IonRouterOutlet>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/create" element={<CreateRecipePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/video-analysis" element={<VideoAnalysisPage />} />
            <Route path="/share" element={<SharePage />} />
          </Routes>
        </IonRouterOutlet>
      </BrowserRouter>
    </IonApp>
  );
}

export default App;
