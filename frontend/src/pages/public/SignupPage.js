import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput } from '@ionic/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import authApi from '../../hooks/authApi.tsx';

function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const shareToken = new URLSearchParams(location.search).get('shareToken');
  const { signup } = authApi(() => { });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSignup = async () => {
    setError('');
    setSuccess('');

    const requiredFields = ['username', 'email', 'password', 'confirmPassword'];
    const missing = requiredFields.find((field) => !form[field]);

    if (missing) {
      setError('Preencha os campos obrigatórios do cadastro.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
    };

    setLoading(true);

    try {
      await signup(payload);
      setSuccess('Cadastro realizado com sucesso. Verifique seu e-mail e, depois, faça login.');

      setTimeout(() => {
        navigate(`/login${shareToken ? `?shareToken=${encodeURIComponent(shareToken)}` : ''}`);
      }, 1800);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Não foi possível concluir o cadastro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cadastro</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen style={{ '--background': '#f9fafb' }}>
        <div className="max-w-xl mx-auto mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crie sua conta</h2>
              <p className="text-sm text-gray-500">Complete os campos e crie sua conta para acessar o CookingBook.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome de utilizador</label>
                <IonInput
                  value={form.username}
                  onIonInput={(e) => updateField('username', e.detail.value || '')}
                  placeholder="seu nome de utilizador"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <IonInput
                  value={form.email}
                  onIonInput={(e) => updateField('email', e.detail.value || '')}
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
                  value={form.password}
                  onIonInput={(e) => updateField('password', e.detail.value || '')}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar senha</label>
                <IonInput
                  value={form.confirmPassword}
                  onIonInput={(e) => updateField('confirmPassword', e.detail.value || '')}
                  type="password"
                  placeholder="Confirme sua senha"
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
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Já tem conta?{' '}
              <Link to={`/login${shareToken ? `?shareToken=${encodeURIComponent(shareToken)}` : ''}`} className="text-blue-600 font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default SignupPage;