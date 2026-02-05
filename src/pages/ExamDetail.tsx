import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import type { Exam, AnswerKeyEntry, Result } from '../types';
import {
    ChevronLeft, ClipboardCheck, Upload, Download,
    FileCheck, AlertCircle, Loader2, Play
} from 'lucide-react';
import { cn, formatDate } from '../utils';

export const ExamDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [answerKey, setAnswerKey] = useState<AnswerKeyEntry[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'key' | 'upload' | 'results'>('key');

    const [isSavingKey, setIsSavingKey] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
    const [isGeneratingSheets, setIsGeneratingSheets] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = async () => {
        try {
            const [examRes, keyRes, resultsRes] = await Promise.all([
                api.get(`/exams/${id}`),
                api.get(`/exams/${id}/answer-key`),
                api.get(`/results/${id}`)
            ]);
            setExam(examRes.data);
            setAnswerKey(keyRes.data);
            setResults(resultsRes.data);

            // Initialize answer key if empty
            if (keyRes.data.length === 0 && examRes.data) {
                setAnswerKey(
                    Array.from({ length: examRes.data.totalQuestions }, (_, i) => ({
                        questionNumber: i + 1,
                        correctOption: 'A'
                    }))
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSaveKey = async () => {
        setIsSavingKey(true);
        try {
            await api.put(`/exams/${id}/answer-key`, { entries: answerKey });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingKey(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFiles) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('ExamId', id!);
        for (let i = 0; i < uploadFiles.length; i++) {
            formData.append('Files', uploadFiles[i]);
        }

        try {
            await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setActiveTab('results'); // Switch to results to wait for jobs
            setTimeout(fetchData, 5000); // Wait 5s and refresh
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
            setUploadFiles(null);
        }
    };

    const handleGenerateSheets = async () => {
        setIsGeneratingSheets(true);
        try {
            await api.post(`/exams/${id}/registrations/generate`);

            // Wait a bit for generation to complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if there are registrations
            const registrationsResponse = await api.get(`/exams/${id}/registrations`);
            if (registrationsResponse.data.length === 0) {
                alert('Não há alunos registrados para esta prova. Certifique-se de que há alunos cadastrados na escola.');
                return;
            }

            const response = await api.get(`/exams/${id}/registrations/sheets.pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `gabaritos-${exam?.name || 'prova'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeneratingSheets(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
    );

    if (!exam) return <div>Prova não encontrada.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => navigate('/exams')} className="mb-2 gap-2 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
                Voltar para lista
            </Button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white">{exam.name}</h1>
                    <p className="text-slate-400 mt-1">
                        {exam.totalQuestions} questões • {exam.alternativesCount} alternativas • Template {exam.templateVersion}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleGenerateSheets} isLoading={isGeneratingSheets}>
                        <Download className="w-5 h-5" />
                        Baixar Folhas
                    </Button>
                    <Button className="gap-2" onClick={() => setActiveTab('upload')}>
                        <Upload className="w-5 h-5" />
                        Corrigir Provas
                    </Button>
                </div>
            </div>

            <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
                {[
                    { id: 'key', label: 'Gabarito', icon: ClipboardCheck },
                    { id: 'upload', label: 'Upload', icon: Upload },
                    { id: 'results', label: 'Resultados', icon: FileCheck },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            activeTab === tab.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {activeTab === 'key' && (
                    <Card className="border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-6 mb-6">
                            <div>
                                <CardTitle>Gabarito Oficial</CardTitle>
                                <CardDescription>Defina as respostas corretas para cada questão.</CardDescription>
                            </div>
                            <Button onClick={handleSaveKey} isLoading={isSavingKey} className="gap-2 px-8">
                                Salvar Alterações
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
                                {answerKey.map((entry, idx) => (
                                    <div key={idx} className="space-y-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center group hover:border-blue-500/30 transition-all">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Questão {entry.questionNumber}</span>
                                        <select
                                            value={entry.correctOption}
                                            onChange={(e) => {
                                                const newKey = [...answerKey];
                                                newKey[idx].correctOption = e.target.value;
                                                setAnswerKey(newKey);
                                            }}
                                            className="w-full bg-transparent text-xl font-bold text-center text-blue-400 focus:outline-none cursor-pointer appearance-none"
                                        >
                                            {Array.from({ length: exam.alternativesCount }, (_, i) => String.fromCharCode(65 + i)).map(opt => (
                                                <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'upload' && (
                    <Card className="border-slate-800">
                        <CardHeader>
                            <CardTitle>Upload de Gabaritos</CardTitle>
                            <CardDescription>Arraste ou selecione as fotos das folhas de resposta.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-12 text-center transition-all",
                                    uploadFiles ? "border-blue-500 bg-blue-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-950/30"
                                )}
                            >
                                <Upload className={cn("w-16 h-16 mx-auto mb-4", uploadFiles ? "text-blue-500" : "text-slate-700")} />
                                {!uploadFiles ? (
                                    <>
                                        <p className="text-xl font-bold text-slate-300">Escolha os arquivos</p>
                                        <p className="text-slate-500 mt-1">Formatos suportados: JPG, PNG (Max 10MB por foto)</p>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            id="sheet-upload"
                                            onChange={(e) => setUploadFiles(e.target.files)}
                                            accept="image/*"
                                        />
                                        <Button as="label" htmlFor="sheet-upload" variant="outline" className="mt-6 cursor-pointer">
                                            Selecionar Arquivos
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xl font-bold text-blue-400">{uploadFiles.length} arquivos selecionados</p>
                                        <div className="flex justify-center gap-3 mt-6">
                                            <Button onClick={handleUpload} isLoading={isUploading} className="px-10">Iniciar Processamento</Button>
                                            <Button variant="ghost" onClick={() => setUploadFiles(null)} disabled={isUploading}>Limpar</Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-orange-400 shrink-0" />
                                <div className="text-sm text-orange-200/80">
                                    <p className="font-bold text-orange-400">Dica de Sucesso</p>
                                    <p>Certifique-se de que o QR Code e as marcações estão bem visíveis e a folha não está amassada.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'results' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Últimas Correções</h3>
                            <Button variant="outline" size="sm" onClick={() => api.get(`/results/${id}/export.csv`)} className="gap-2">
                                <Download className="w-4 h-4" /> Exportar CSV
                            </Button>
                        </div>

                        {results.length === 0 ? (
                            <Card className="border-slate-800 py-12 text-center">
                                <Play className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-500">Nenhum resultado processado ainda.</p>
                                <Button variant="link" className="text-blue-400 mt-2" onClick={() => setActiveTab('upload')}>
                                    Ir para Upload
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {results.map(result => (
                                    <Card key={result.id} className="border-slate-800 hover:border-slate-700 transition-all p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg",
                                                    result.score / result.totalQuestions >= 0.6 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                                )}>
                                                    {result.score}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-200">{result.studentName || 'Aluno não identificado'}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        {result.registrationNumber ? `${result.registrationNumber} • ` : ''}
                                                        {result.className ? `${result.className} • ` : ''}
                                                        {result.originalFileName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-300">{((result.score / result.totalQuestions) * 10).toFixed(1)} / 10.0</p>
                                                <p className="text-[10px] text-slate-500 uppercase mt-1">{formatDate(result.processedAt)}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
