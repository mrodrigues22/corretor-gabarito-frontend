import { useState, useEffect } from 'react';
import api from '../api/client';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Input } from '../components/Input';
import type { Exam } from '../types';
import { ClipboardList, Plus, Search, ChevronRight, Settings2 } from 'lucide-react';
import { formatDate } from '../utils';
import { Link } from 'react-router-dom';

export const Exams = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newExam, setNewExam] = useState({ name: '', totalQuestions: 40, alternativesCount: 5 });

    const fetchExams = async () => {
        try {
            const response = await api.get('/exams');
            setExams(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/exams', {
                ...newExam,
                templateVersion: 'v1'
            });
            setIsCreating(false);
            fetchExams();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Exames</h1>
                    <p className="text-slate-400">Gerencie seus exames, gabaritos e correções.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Exame
                </Button>
            </div>

            {isCreating && (
                <Card className="border-blue-500/30 bg-blue-600/5 animate-in fade-in zoom-in-95 duration-200">
                    <CardHeader>
                        <CardTitle>Configurar Novo Exame</CardTitle>
                        <CardDescription>Defina as informações básicas do seu exame.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="Nome do Exame"
                                placeholder="Ex: Prova Mensal de Matemática"
                                value={newExam.name}
                                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Total de Questões"
                                type="number"
                                value={newExam.totalQuestions}
                                onChange={(e) => setNewExam({ ...newExam, totalQuestions: parseInt(e.target.value) })}
                                required
                            />
                            <div className="flex items-end gap-3">
                                <Input
                                    label="Alternativas"
                                    type="number"
                                    value={newExam.alternativesCount}
                                    onChange={(e) => setNewExam({ ...newExam, alternativesCount: parseInt(e.target.value) })}
                                    required
                                />
                                <Button type="submit" className="flex-1">Criar</Button>
                                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                <div className="p-2 text-slate-500"><Search className="w-5 h-5" /></div>
                <input
                    placeholder="Pesquisar exames..."
                    className="bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 flex-1 px-2"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />)
                ) : exams.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <ClipboardList className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-300">Nenhum exame encontrado</h3>
                        <p className="text-slate-500 mt-2">Crie seu primeiro exame para começar a corrigir.</p>
                    </div>
                ) : (
                    exams.map((exam) => (
                        <Card key={exam.id} className="group border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer">
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">{exam.name}</CardTitle>
                                    <CardDescription>Criado em {formatDate(exam.createdAt)}</CardDescription>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 transition-all">
                                    <Settings2 className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Questões</p>
                                        <p className="text-lg font-bold text-slate-200">{exam.totalQuestions}</p>
                                    </div>
                                    <div className="flex-1 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Opções</p>
                                        <p className="text-lg font-bold text-slate-200">{exam.alternativesCount}</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link to={`/exams/${exam.id}`}>
                                        <Button variant="outline" className="w-full justify-between group/btn" as="div">
                                            Gerenciar Exame
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
