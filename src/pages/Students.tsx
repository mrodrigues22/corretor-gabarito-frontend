import { useState, useEffect } from 'react';
import api from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GraduationCap, Upload, Download, Search, UserMinus, UserCheck } from 'lucide-react';
import type { Student } from '../types';
import { cn } from '../utils';

export const Students = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            setStudents(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/students/template.xlsx', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template_alunos.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Erro ao baixar template', err);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('File', file);

        try {
            await api.post('/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchStudents();
        } catch (err) {
            console.error('Erro ao importar alunos', err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Alunos</h1>
                    <p className="text-slate-400">Importe e gerencie a lista de alunos da sua escola.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                        <Download className="w-5 h-5" />
                        Template
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            id="student-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".xlsx"
                        />
                        <Button as="label" htmlFor="student-upload" className="gap-2 cursor-pointer" isLoading={isUploading}>
                            <Upload className="w-5 h-5" />
                            Importar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-800 p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    placeholder="Buscar por nome ou matrícula..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="text-sm text-slate-400 font-medium">
                            {students.length} alunos cadastrados
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                    <th className="px-6 py-4">Matrícula</th>
                                    <th className="px-6 py-4">Nome Completo</th>
                                    <th className="px-6 py-4">Turma</th>
                                    <th className="px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-32 text-center">
                                            <GraduationCap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                            <p className="text-slate-500">Nenhum aluno cadastrado ainda.</p>
                                            <p className="text-xs text-slate-600 mt-1">Use a importação para adicionar alunos em lote.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-blue-400 text-sm">{student.registrationNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-slate-200 font-medium">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-md text-xs font-bold",
                                                    student.className ? "bg-slate-800 text-slate-300" : "text-slate-600 italic"
                                                )}>
                                                    {student.className || 'Sem turma'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" className="p-1.5"><UserCheck className="w-4 h-4 text-slate-400 hover:text-green-400" /></Button>
                                                    <Button variant="ghost" size="sm" className="p-1.5"><UserMinus className="w-4 h-4 text-slate-400 hover:text-red-400" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
