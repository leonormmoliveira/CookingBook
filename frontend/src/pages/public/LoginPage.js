import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig.ts';
import authApi from '../../hooks/authApi.tsx';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const shareToken = new URLSearchParams(location.search).get('shareToken');

  const { login } = authApi();

  // Clear error when user starts typing
  useEffect(() => {
    if (error) setError('');
  }, [email, password, error]);

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

      localStorage.setItem('token', idToken);

      const response = await login(idToken);
      
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // Redirect back to share page
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

      <IonContent className="ion-padding" fullscreen>
        <div className="max-w-xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
              <p className="text-gray-600 mt-1">Faça login para continuar</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <IonInput
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value || '')}
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <IonInput
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value || '')}
                  type="password"
                  placeholder="Digite sua senha"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <IonButton 
              className="custom-btn w-full" 
              onClick={handleLogin} 
              disabled={loading}
              expand="block"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </IonButton>

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