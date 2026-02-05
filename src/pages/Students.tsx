import { useState, useEffect } from 'react';
import api from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { GraduationCap, Upload, Download, Search, Plus, Edit, Trash2, X, CheckSquare, Square, Edit3 } from 'lucide-react';
import type { Student, CreateStudentRequest, UpdateStudentRequest, UpdateStudentsClassRequest } from '../types';
import { cn } from '../utils';

export const Students = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        registrationNumber: '',
        name: '',
        className: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    
    // Bulk operations state
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [isBulkClassModalOpen, setIsBulkClassModalOpen] = useState(false);
    const [bulkClassName, setBulkClassName] = useState('');
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

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

    const openCreateModal = () => {
        setEditingStudent(null);
        setFormData({ registrationNumber: '', name: '', className: '' });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            registrationNumber: student.registrationNumber,
            name: student.name,
            className: student.className || ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        setFormData({ registrationNumber: '', name: '', className: '' });
        setFormErrors({});
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.registrationNumber.trim()) {
            errors.registrationNumber = 'Matrícula é obrigatória';
        }
        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            if (editingStudent) {
                // Update student
                const updateData: UpdateStudentRequest = {
                    registrationNumber: formData.registrationNumber.trim(),
                    name: formData.name.trim(),
                    className: formData.className.trim() || undefined
                };
                
                await api.put(`/students/${editingStudent.id}`, updateData);
            } else {
                // Create student
                const createData: CreateStudentRequest = {
                    registrationNumber: formData.registrationNumber.trim(),
                    name: formData.name.trim(),
                    className: formData.className.trim() || undefined
                };
                
                await api.post('/students', createData);
            }
            
            fetchStudents();
            closeModal();
        } catch (err: any) {
            console.error('Erro ao salvar aluno', err);
            
            if (err.response?.status === 409) {
                setFormErrors({ registrationNumber: 'Já existe um aluno com esta matrícula' });
            } else {
                setFormErrors({ general: 'Erro ao salvar aluno. Tente novamente.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
        
        try {
            await api.delete(`/students/${studentId}`);
            fetchStudents();
        } catch (err: any) {
            console.error('Erro ao excluir aluno', err);
            
            if (err.response?.status === 409) {
                alert('Não é possível excluir um aluno que possui registros em provas.');
            } else {
                alert('Erro ao excluir aluno. Tente novamente.');
            }
        }
    };

    // Bulk operations functions
    const handleSelectStudent = (studentId: string, checked: boolean) => {
        const newSelected = new Set(selectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.size === 0) return;
        
        const count = selectedStudents.size;
        if (!confirm(`Tem certeza que deseja excluir ${count} aluno${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}?`)) return;
        
        try {
            const studentIds = Array.from(selectedStudents);
            await api.delete('/students', { data: studentIds });
            setSelectedStudents(new Set());
            fetchStudents();
        } catch (err: any) {
            console.error('Erro ao excluir alunos', err);
            
            if (err.response?.status === 409) {
                alert('Não é possível excluir alunos que possuem registros em provas.');
            } else {
                alert('Erro ao excluir alunos. Tente novamente.');
            }
        }
    };

    const handleBulkClassUpdate = async () => {
        if (selectedStudents.size === 0) return;
        
        setIsBulkSubmitting(true);
        
        try {
            const request: UpdateStudentsClassRequest = {
                studentIds: Array.from(selectedStudents),
                className: bulkClassName.trim() || undefined
            };
            
            await api.patch('/students/class', request);
            setSelectedStudents(new Set());
            setIsBulkClassModalOpen(false);
            setBulkClassName('');
            fetchStudents();
        } catch (err: any) {
            console.error('Erro ao atualizar turmas', err);
            alert('Erro ao atualizar turmas. Tente novamente.');
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    const openBulkClassModal = () => {
        if (selectedStudents.size === 0) return;
        setBulkClassName('');
        setIsBulkClassModalOpen(true);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="w-5 h-5" />
                        Adicionar
                    </Button>
                    {selectedStudents.size > 0 && (
                        <>
                            <Button 
                                onClick={openBulkClassModal} 
                                variant="outline" 
                                className="gap-2"
                            >
                                <Edit3 className="w-5 h-5" />
                                Editar Turma ({selectedStudents.size})
                            </Button>
                            <Button 
                                onClick={handleBulkDelete} 
                                variant="danger" 
                                className="gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Excluir ({selectedStudents.size})
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-800 p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nome ou matrícula..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="text-sm text-slate-400 font-medium">
                            {filteredStudents.length} de {students.length} alunos
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                    <th className="px-6 py-4">
                                        <button
                                            onClick={() => handleSelectAll(selectedStudents.size !== filteredStudents.length)}
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? (
                                                <CheckSquare className="w-4 h-4" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                    </th>
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
                                            <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-32 text-center">
                                            <GraduationCap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                            <p className="text-slate-500">
                                                {searchTerm ? 'Nenhum aluno encontrado para esta busca.' : 'Nenhum aluno cadastrado ainda.'}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {searchTerm ? 'Tente ajustar os termos da busca.' : 'Use a importação para adicionar alunos em lote ou clique em "Adicionar" para criar manualmente.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleSelectStudent(student.id, !selectedStudents.has(student.id))}
                                                    className="text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {selectedStudents.has(student.id) ? (
                                                        <CheckSquare className="w-4 h-4" />
                                                    ) : (
                                                        <Square className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
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
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="p-1.5"
                                                        onClick={() => openEditModal(student)}
                                                    >
                                                        <Edit className="w-4 h-4 text-slate-400 hover:text-blue-400" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="p-1.5"
                                                        onClick={() => handleDelete(student.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                                                    </Button>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white">
                                {editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={closeModal} className="p-1">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formErrors.general && (
                                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                                    <p className="text-sm text-red-400">{formErrors.general}</p>
                                </div>
                            )}
                            
                            <Input
                                label="Matrícula"
                                value={formData.registrationNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                error={formErrors.registrationNumber}
                                placeholder="Digite a matrícula do aluno"
                            />
                            
                            <Input
                                label="Nome Completo"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                error={formErrors.name}
                                placeholder="Digite o nome completo do aluno"
                            />
                            
                            <Input
                                label="Turma (opcional)"
                                value={formData.className}
                                onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                                placeholder="Digite a turma do aluno"
                            />
                            
                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={closeModal} 
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1" 
                                    isLoading={isSubmitting}
                                >
                                    {editingStudent ? 'Salvar' : 'Adicionar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Bulk Class Edit Modal */}
            {isBulkClassModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h3 className="text-lg font-semibold text-white">
                                Editar Turma em Lote
                            </h3>
                            <button
                                onClick={() => setIsBulkClassModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-400">
                                Definir turma para {selectedStudents.size} aluno{selectedStudents.size > 1 ? 's' : ''} selecionado{selectedStudents.size > 1 ? 's' : ''}:
                            </p>
                            
                            <Input
                                label="Turma"
                                placeholder="Digite o nome da turma (deixe vazio para remover)"
                                value={bulkClassName}
                                onChange={(e) => setBulkClassName(e.target.value)}
                            />
                            
                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsBulkClassModalOpen(false)} 
                                    className="flex-1"
                                    disabled={isBulkSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="button"
                                    onClick={handleBulkClassUpdate}
                                    className="flex-1" 
                                    isLoading={isBulkSubmitting}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
