import { useState, useEffect } from 'react';
import api from '../api/client';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Modal } from '../components/Modal';
import { MultiSelect } from '../components/MultiSelect';
import type { Exam, Student, CreateExamRequest, UpdateExamRequest } from '../types';
import { ClipboardList, Plus, Search, ChevronRight, Settings2, Users, UserCheck, Edit } from 'lucide-react';
import { formatDate } from '../utils';
import { Link } from 'react-router-dom';

export const Exams = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [newExam, setNewExam] = useState({
        name: '',
        totalQuestions: 40,
        alternativesCount: 5,
        assignmentType: 'all' as 'all' | 'class' | 'students',
        selectedClass: '',
        selectedStudents: [] as string[]
    });
    const [editExam, setEditExam] = useState({
        name: '',
        totalQuestions: 40,
        alternativesCount: 5,
        assignmentType: 'all' as 'all' | 'class' | 'students',
        selectedClass: '',
        selectedStudents: [] as string[]
    });

    const fetchData = async () => {
        try {
            const [examsResponse, studentsResponse] = await Promise.all([
                api.get('/exams'),
                api.get('/students')
            ]);
            setExams(examsResponse.data);
            setStudents(studentsResponse.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const request: CreateExamRequest = {
            name: newExam.name,
            totalQuestions: newExam.totalQuestions,
            alternativesCount: newExam.alternativesCount,
            templateVersion: 'v1'
        };

        if (newExam.assignmentType === 'class' && newExam.selectedClass) {
            request.className = newExam.selectedClass;
        } else if (newExam.assignmentType === 'students' && newExam.selectedStudents.length > 0) {
            request.studentIds = newExam.selectedStudents;
        }

        try {
            await api.post('/exams', request);
            setIsCreating(false);
            fetchData();
            // Reset form
            setNewExam({
                name: '',
                totalQuestions: 40,
                alternativesCount: 5,
                assignmentType: 'all',
                selectedClass: '',
                selectedStudents: []
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExam) return;

        const request: UpdateExamRequest = {
            name: editExam.name,
            totalQuestions: editExam.totalQuestions,
            alternativesCount: editExam.alternativesCount
        };

        if (editExam.assignmentType === 'class' && editExam.selectedClass) {
            request.className = editExam.selectedClass;
        } else if (editExam.assignmentType === 'students' && editExam.selectedStudents.length > 0) {
            request.studentIds = editExam.selectedStudents;
        }

        try {
            await api.put(`/exams/${editingExam.id}`, request);
            setIsEditing(false);
            setEditingExam(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = async (exam: Exam) => {
        setEditingExam(exam);
        
        // Fetch current registrations to determine assignment type
        try {
            const registrationsResponse = await api.get(`/exams/${exam.id}/registrations`);
            const registrations = registrationsResponse.data;
            
            if (registrations.length === 0) {
                // No registrations - default to all
                setEditExam({
                    name: exam.name,
                    totalQuestions: exam.totalQuestions,
                    alternativesCount: exam.alternativesCount,
                    assignmentType: 'all',
                    selectedClass: '',
                    selectedStudents: []
                });
            } else {
                // Check if all students are registered
                const allStudentsResponse = await api.get('/students');
                const allStudents = allStudentsResponse.data;
                
                if (registrations.length === allStudents.length) {
                    // All students registered
                    setEditExam({
                        name: exam.name,
                        totalQuestions: exam.totalQuestions,
                        alternativesCount: exam.alternativesCount,
                        assignmentType: 'all',
                        selectedClass: '',
                        selectedStudents: []
                    });
                } else {
                    // Check if it's a class assignment
                    const registeredStudentIds = registrations.map((r: any) => r.studentId);
                    const registeredStudents = allStudents.filter((s: Student) => registeredStudentIds.includes(s.id));
                    const classes = [...new Set(registeredStudents.map((s: Student) => s.className).filter(Boolean))] as string[];
                    
                    if (classes.length === 1 && registeredStudents.every((s: Student) => s.className === classes[0])) {
                        // All registered students are from the same class
                        setEditExam({
                            name: exam.name,
                            totalQuestions: exam.totalQuestions,
                            alternativesCount: exam.alternativesCount,
                            assignmentType: 'class',
                            selectedClass: classes[0],
                            selectedStudents: []
                        });
                    } else {
                        // Specific students
                        setEditExam({
                            name: exam.name,
                            totalQuestions: exam.totalQuestions,
                            alternativesCount: exam.alternativesCount,
                            assignmentType: 'students',
                            selectedClass: '',
                            selectedStudents: registeredStudentIds
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
            // Fallback to basic info
            setEditExam({
                name: exam.name,
                totalQuestions: exam.totalQuestions,
                alternativesCount: exam.alternativesCount,
                assignmentType: 'all',
                selectedClass: '',
                selectedStudents: []
            });
        }
        
        setIsEditing(true);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Provas</h1>
                    <p className="text-slate-400">Gerencie suas provas, gabaritos e correções.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    Nova Prova
                </Button>
            </div>

            {isCreating && (
                <Modal
                    isOpen={isCreating}
                    onClose={() => setIsCreating(false)}
                    title="Configurar Nova Prova"
                >
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nome da Prova
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Prova Mensal de Matemática"
                                value={newExam.name}
                                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Total de Questões
                                </label>
                                <input
                                    type="number"
                                    value={newExam.totalQuestions}
                                    onChange={(e) => setNewExam({ ...newExam, totalQuestions: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Alternativas
                                </label>
                                <input
                                    type="number"
                                    value={newExam.alternativesCount}
                                    onChange={(e) => setNewExam({ ...newExam, alternativesCount: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                Atribuir para
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="all"
                                        name="assignmentType"
                                        value="all"
                                        checked={newExam.assignmentType === 'all'}
                                        onChange={(e) => setNewExam({ ...newExam, assignmentType: e.target.value as 'all' | 'class' | 'students', selectedClass: '', selectedStudents: [] })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="all" className="text-slate-300 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Todos os alunos
                                    </label>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="class"
                                        name="assignmentType"
                                        value="class"
                                        checked={newExam.assignmentType === 'class'}
                                        onChange={(e) => setNewExam({ ...newExam, assignmentType: e.target.value as 'all' | 'class' | 'students', selectedStudents: [] })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="class" className="text-slate-300 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Turma específica
                                    </label>
                                </div>
                                
                                {newExam.assignmentType === 'class' && (
                                    <select
                                        value={newExam.selectedClass}
                                        onChange={(e) => setNewExam({ ...newExam, selectedClass: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required={newExam.assignmentType === 'class'}
                                    >
                                        <option value="">Selecione uma turma</option>
                                        {[...new Set(students.map(s => s.className).filter(Boolean))].map(className => (
                                            <option key={className} value={className}>{className}</option>
                                        ))}
                                    </select>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="students"
                                        name="assignmentType"
                                        value="students"
                                        checked={newExam.assignmentType === 'students'}
                                        onChange={(e) => setNewExam({ ...newExam, assignmentType: e.target.value as 'all' | 'class' | 'students', selectedClass: '' })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="students" className="text-slate-300 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Alunos específicos
                                    </label>
                                </div>
                                
                                {newExam.assignmentType === 'students' && (
                                    <MultiSelect
                                        options={students.map(student => ({
                                            id: student.id,
                                            label: student.name,
                                            sublabel: `${student.registrationNumber || ''}${student.className ? ` • ${student.className}` : ''}`.trim()
                                        }))}
                                        value={newExam.selectedStudents}
                                        onChange={(selectedIds) => setNewExam(prev => ({ ...prev, selectedStudents: selectedIds }))}
                                        placeholder="Selecione os alunos..."
                                        required={newExam.assignmentType === 'students'}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Criar Prova
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {isEditing && editingExam && (
                <Modal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    title="Editar Prova"
                >
                    <form onSubmit={handleEdit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nome da Prova
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Prova Mensal de Matemática"
                                value={editExam.name}
                                onChange={(e) => setEditExam({ ...editExam, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Total de Questões
                                </label>
                                <input
                                    type="number"
                                    value={editExam.totalQuestions}
                                    onChange={(e) => setEditExam({ ...editExam, totalQuestions: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Alternativas
                                </label>
                                <input
                                    type="number"
                                    value={editExam.alternativesCount}
                                    onChange={(e) => setEditExam({ ...editExam, alternativesCount: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                Atribuir para
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="edit-all"
                                        name="edit-assignmentType"
                                        value="all"
                                        checked={editExam.assignmentType === 'all'}
                                        onChange={(e) => setEditExam({ ...editExam, assignmentType: e.target.value as 'all' | 'class' | 'students', selectedClass: '', selectedStudents: [] })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="edit-all" className="text-slate-300 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Todos os alunos
                                    </label>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="edit-class"
                                        name="edit-assignmentType"
                                        value="class"
                                        checked={editExam.assignmentType === 'class'}
                                        onChange={(e) => setEditExam({ ...editExam, assignmentType: e.target.value as 'all' | 'class' | 'students', selectedStudents: [] })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="edit-class" className="text-slate-300 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Turma específica
                                    </label>
                                </div>
                                
                                {editExam.assignmentType === 'class' && (
                                    <select
                                        value={editExam.selectedClass}
                                        onChange={(e) => setEditExam({ ...editExam, selectedClass: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required={editExam.assignmentType === 'class'}
                                    >
                                        <option value="">Selecione uma turma</option>
                                        {[...new Set(students.map(s => s.className).filter(Boolean))].map(className => (
                                            <option key={className} value={className}>{className}</option>
                                        ))}
                                    </select>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="edit-students"
                                        name="edit-assignmentType"
                                        value="students"
                                        checked={editExam.assignmentType === 'students'}
                                        onChange={(e) => setEditExam({ ...editExam, assignmentType: e.target.value as 'all' | 'class' | 'students', selectedClass: '' })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="edit-students" className="text-slate-300 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        Alunos específicos
                                    </label>
                                </div>
                                
                                {editExam.assignmentType === 'students' && (
                                    <MultiSelect
                                        options={students.map(student => ({
                                            id: student.id,
                                            label: student.name,
                                            sublabel: `${student.registrationNumber || ''}${student.className ? ` • ${student.className}` : ''}`.trim()
                                        }))}
                                        value={editExam.selectedStudents}
                                        onChange={(selectedIds) => setEditExam(prev => ({ ...prev, selectedStudents: selectedIds }))}
                                        placeholder="Selecione os alunos..."
                                        required={editExam.assignmentType === 'students'}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                <div className="p-2 text-slate-500"><Search className="w-5 h-5" /></div>
                <input
                    placeholder="Pesquisar provas..."
                    className="bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 flex-1 px-2"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />)
                ) : exams.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <ClipboardList className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-300">Nenhuma prova encontrada</h3>
                        <p className="text-slate-500 mt-2">Crie sua primeira prova para começar a corrigir.</p>
                    </div>
                ) : (
                    exams.map((exam) => (
                        <Card key={exam.id} className="group border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer">
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">{exam.name}</CardTitle>
                                    <CardDescription>Criado em {formatDate(exam.createdAt)}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(exam);
                                        }}
                                        className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition-all"
                                        title="Editar prova"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 transition-all">
                                        <Settings2 className="w-5 h-5" />
                                    </div>
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
                                            Gerenciar Prova
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
