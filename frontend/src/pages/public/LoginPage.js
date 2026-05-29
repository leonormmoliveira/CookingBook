import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput } from '@ionic/react';
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
  const { login } = authApi(() => { });
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
        navigate(`/share?token=${encodeURIComponent(shareToken)}`, { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err?.response?.data?.message ||
        err?.message ||
        'Não foi possível fazer login. Verifique suas credenciais.';
      setError(message);
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

      <IonContent className="ion-padding" fullscreen style={{ '--background': '#f9fafb' }}>
        <div className="max-w-xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
              <p className="text-gray-500 mt-1">Faça login para continuar</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <IonInput
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value || '')}
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-gray-50 border border-gray-300 rounded-xl"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <IonInput
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value || '')}
                  type="password"
                  placeholder="Digite sua senha"
                  className="bg-gray-50 border border-gray-300 rounded-xl"
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
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Não tem conta?{' '}
              <Link
                to={`/signup${shareToken ? `?shareToken=${encodeURIComponent(shareToken)}` : ''}`}
                className="text-blue-600 font-medium hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default LoginPage;