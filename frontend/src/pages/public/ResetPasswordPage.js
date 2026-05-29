import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
} from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../components/AxiosInstance';

function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = new URLSearchParams(location.search).get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newPassword || !confirmPassword) {
            setError('Preencha todos os campos.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As passwords não coincidem.');
            return;
        }
        if (!token) {
            setError('Token inválido ou em falta.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(
                'Password redefinida com sucesso! Redirecionando para o login...'
            );
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Erro ao redefinir password. O token pode ter expirado.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Erro</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent
                    className="ion-padding"
                    style={{ '--background': '#f9fafb' }}
                >
                    <div className="max-w-xl mx-auto mt-8 bg-white rounded-2xl shadow-sm p-6 text-center text-red-600">
                        Token inválido ou ausente.
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Redefinir Palavra-passe</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent
                className="ion-padding"
                fullscreen
                style={{ '--background': '#f9fafb' }}
            >
                <div className="max-w-xl mx-auto mt-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Criar nova password
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Escolha uma nova password para a sua conta.
                            </p>
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nova password
                                </label>
                                <IonInput
                                    value={newPassword}
                                    onIonInput={(e) => setNewPassword(e.detail.value || '')}
                                    type="password"
                                    placeholder="••••••••"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar nova password
                                </label>
                                <IonInput
                                    value={confirmPassword}
                                    onIonInput={(e) => setConfirmPassword(e.detail.value || '')}
                                    type="password"
                                    placeholder="••••••••"
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'A redefinir...' : 'Redefinir password'}
                            </button>
                        </form>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default ResetPasswordPage;