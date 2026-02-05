import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { RotateCcw } from 'lucide-react';

export const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', data);
            localStorage.setItem('token', response.data.accessToken);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao entrar. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1d] p-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-slate-800/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8 gap-3">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-12 transition-transform hover:rotate-0">
                        <RotateCcw className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Gabarito.io</h1>
                    <p className="text-slate-400 text-center font-medium">Correção automática de provas em segundos.</p>
                </div>

                <Card className="border-slate-800 bg-slate-900/80">
                    <CardHeader>
                        <CardTitle>Bem-vindo de volta</CardTitle>
                        <CardDescription>Entre com suas credenciais para acessar sua conta.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="seu@email.com"
                                error={errors.Email?.message as string}
                                {...register('Email', { required: 'Email é obrigatório' })}
                            />
                            <Input
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                                error={errors.Password?.message as string}
                                {...register('Password', { required: 'Senha é obrigatória' })}
                            />

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full py-6 text-lg" isLoading={isLoading}>
                                Entrar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Ainda não tem uma conta? <span className="text-blue-400 font-medium cursor-pointer hover:underline">Entre em contato</span>
                </p>
            </div>
        </div>
    );
};
