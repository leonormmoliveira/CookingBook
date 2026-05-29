import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig.ts';
import { useAuth } from '../../AppContext.tsx';

import authApi from '../../hooks/authApi.tsx';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const shareToken = new URLSearchParams(location.search).get('shareToken');
  const { login } = authApi(() => {});
  const { Login } = useAuth();

  const handleLogin = async () => {
    setError('');

    const trimmedEmail = String(email).trim();
    if (!trimmedEmail || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);

      const idToken = await userCredential.user.getIdToken();
      const response = await login(idToken);
      
      Login(response.user);

      if (shareToken) {
        navigate(`/share?token=${encodeURIComponent(shareToken)}`);
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      const firebaseCode = err?.code ? ` (${err.code})` : '';
      const message = err?.response?.data?.message || err?.message || 'Não foi possível fazer login.';
      setError(`${message}${firebaseCode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Entrar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="p-4" fullscreen style={{ height: '100%' }}>
        <div className="custom-card p-6 space-y-4 max-w-xl mx-auto mt-4">
          <div>
            <h2 className="text-xl font-bold">Acesse sua conta</h2>
            <p className="text-sm text-gray-600">Use o e-mail e senha cadastrados para entrar no CookingBook.</p>
          </div>

          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <IonInput
                value={email}
                onIonInput={(e) => setEmail(e.detail.value || '')}
                type="email"
                placeholder="seu@email.com"
                className="custom-card p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <IonInput
                value={password}
                onIonInput={(e) => setPassword(e.detail.value || '')}
                type="password"
                placeholder="Digite sua senha"
                className="custom-card p-2"
              />
            </div>
          </div>

          <IonButton className="custom-btn w-full" onClick={handleLogin} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </IonButton>

          <p className="text-sm text-gray-600 text-center">
            Ainda não tem conta? <Link to={`/signup${shareToken ? `?shareToken=${encodeURIComponent(shareToken)}` : ''}`} className="text-blue-600 font-medium">Cadastre-se</Link>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default LoginPage;