export interface User {
    id: string;
    email: string;
    schoolId: string;
}

export interface AuthResponse {
    accessToken: string;
    expiresAt: string;
}

export interface Exam {
    id: string;
    name: string;
    totalQuestions: number;
    alternativesCount: number;
    templateVersion: string;
    createdAt: string;
}

export interface CreateExamRequest {
    name: string;
    totalQuestions: number;
    alternativesCount: number;
    templateVersion: string;
    className?: string;
    studentIds?: string[];
}

export interface UpdateExamRequest {
    name?: string;
    totalQuestions?: number;
    alternativesCount?: number;
    className?: string;
    studentIds?: string[];
}

export interface AnswerKeyEntry {
    questionNumber: number;
    correctOption: string;
}

export interface Student {
    id: string;
    registrationNumber: string;
    name: string;
    className?: string;
}

export interface CreateStudentRequest {
    registrationNumber: string;
    name: string;
    className?: string;
}

export interface UpdateStudentRequest {
    registrationNumber: string;
    name: string;
    className?: string;
}

export interface UpdateStudentsClassRequest {
    studentIds: string[];
    className?: string;
}

export interface ExamRegistration {
    id: string;
    studentId: string;
    studentName: string;
    registrationNumber: string;
    sheetCode: string;
}

export interface Job {
    jobId: string;
    studentSheetId: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    attempts: number;
    errorMessage?: string;
}

export interface Result {
    id: string;
    studentSheetId: string;
    studentName?: string;
    registrationNumber?: string;
    className?: string;
    originalFileName: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    processedAt: string;
}
