import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { ClipboardList, GraduationCap, Upload, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../utils';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ exams: 0, students: 0, processed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [exams, students] = await Promise.all([
                    api.get('/exams'),
                    api.get('/students')
                ]);
                setStats({
                    exams: exams.data.length,
                    students: students.data.length,
                    processed: 0,
                    pending: 0
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { name: 'Provas Criadas', value: stats.exams, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { name: 'Total de Alunos', value: stats.students, icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { name: 'Folhas Processadas', value: stats.processed, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
        { name: 'Aguardando', value: stats.pending, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Visão geral do sistema e estatísticas de correção.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.name} className="border-slate-800 transition-all hover:border-slate-700 hover:-translate-y-0.5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : stat.value}</p>
                                </div>
                                <div className={cn('p-3 rounded-xl', stat.bg)}>
                                    <stat.icon className={cn('w-6 h-6', stat.color)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                <Card className="border-slate-800">
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                        <CardDescription>Principais funcionalidades para começar o trabalho.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => navigate('/exams')} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all group text-left w-full">
                            <ClipboardList className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-white">Nova Prova</span>
                        </button>
                        <button onClick={() => navigate('/students')} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 transition-all group text-left w-full">
                            <GraduationCap className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-white">Importar Alunos</span>
                        </button>
                        <button onClick={() => navigate('/exams')} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-green-600/10 border border-green-500/20 hover:bg-green-600/20 transition-all group text-left w-full">
                            <Upload className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-white">Subir Folhas</span>
                        </button>
                    </CardContent>
                </Card>

                <Card className="border-slate-800">
                    <CardHeader>
                        <CardTitle>Tutoriais e Dicas</CardTitle>
                        <CardDescription>Saiba como tirar o melhor proveito do Gabarito.io.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                            <h4 className="font-semibold text-white flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                Como tirar boas fotos?
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">Sempre mantenha a folha em uma superfície plana e bem iluminada para melhor reconhecimento.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                            <h4 className="font-semibold text-white flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                QR Codes Legíveis
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">Imprima as folhas com qualidade alta para garantir que os QR Codes sejam detectados.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
