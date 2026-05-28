import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/react';
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
  const { signup } = authApi(() => {});

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

      <IonContent className="p-4" fullscreen style={{ height: '100%' }}>
        <div className="custom-card p-6 space-y-4 max-w-xl mx-auto mt-4">
          <div>
            <h2 className="text-xl font-bold">Crie sua conta</h2>
            <p className="text-sm text-gray-600">Complete os campos e crie sua conta para acessar o CookingBook.</p>
          </div>

          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Nome de usuário</label>
              <IonInput
                value={form.username}
                onIonInput={(e) => updateField('username', e.detail.value || '')}
                placeholder="Digite seu username"
                className="custom-card p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <IonInput
                value={form.email}
                onIonInput={(e) => updateField('email', e.detail.value || '')}
                type="email"
                placeholder="seu@email.com"
                className="custom-card p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <IonInput
                value={form.password}
                onIonInput={(e) => updateField('password', e.detail.value || '')}
                type="password"
                placeholder="Digite sua senha"
                className="custom-card p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirmar senha</label>
              <IonInput
                value={form.confirmPassword}
                onIonInput={(e) => updateField('confirmPassword', e.detail.value || '')}
                type="password"
                placeholder="Confirme sua senha"
                className="custom-card p-2"
              />
            </div>
          </div>

          <IonButton className="custom-btn w-full" onClick={handleSignup} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </IonButton>

          <p className="text-sm text-gray-600 text-center">
            Já tem conta? <Link to={`/login${shareToken ? `?shareToken=${encodeURIComponent(shareToken)}` : ''}`} className="text-blue-600 font-medium">Entrar</Link>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default SignupPage;
