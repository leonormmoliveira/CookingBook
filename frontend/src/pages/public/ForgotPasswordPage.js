import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
} from '@ionic/react';
import { Link } from 'react-router-dom';
import api from '../../components/AxiosInstance';
function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('Por favor, insira o seu email.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            setMessage(
                'Se o email existir na nossa base de dados, receberá um link de recuperação.'
            );
        } catch (err) {
            setError(
                err?.response?.data?.message || 'Erro ao enviar pedido.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Recuperar Palavra-passe</IonTitle>
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
                                Esqueceu-se da password?
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Insira o seu email para receber um link de recuperação.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'A enviar...' : 'Enviar link de recuperação'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-600">
                            <Link
                                to="/login"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Voltar ao login
                            </Link>
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default ForgotPasswordPage;