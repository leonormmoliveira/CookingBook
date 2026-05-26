import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

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
          <Route path="/" component={HomePage} exact />
          <Route path="/recipe/:id" component={RecipeDetailPage} />
          <Route path="/create" component={CreateRecipePage} />
          <Route path="/categories" component={CategoriesPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/video-analysis" component={VideoAnalysisPage} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
