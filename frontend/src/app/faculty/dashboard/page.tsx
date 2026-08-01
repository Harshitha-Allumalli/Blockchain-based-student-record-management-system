'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, XCircle, Clock, ShieldCheck, LogOut,
    Calendar, Users, Send, ExternalLink, RefreshCw,
    Search, Filter, Check, AlertTriangle, Layers, BookOpen, UserCheck, BarChart2, Trash2
} from 'lucide-react';
import { Toast } from '@/components/Toast';

interface StudentItem {
    studentId: string;
    name: string;
    email: string;
    status: 'Present' | 'Absent' | 'Late';
}

interface BatchHistoryItem {
    batch_id: string;
    subject_id: string;
    department: string;
    semester: string;
    section: string;
    attendance_date: string;
    total_students: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    transaction_hash: string;
    attendance_hash: string;
}

export default function FacultyDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'mark' | 'history' | 'view'>('mark');

    // ── Course Category & Course Data ─────────────────────────────────────────
    const UG_COURSES = [
        'B.Tech - Computer Science & Engineering',
        'B.Tech - Information Technology',
        'B.Tech - Electronics & Communication Engineering',
        'B.Tech - Electrical & Electronics Engineering',
        'B.Tech - Mechanical Engineering',
        'B.Tech - Civil Engineering',
        'B.Tech - Chemical Engineering',
        'B.Tech - Artificial Intelligence & Data Science',
        'B.Tech - Cyber Security',
        'B.Sc - Computer Science',
        'B.Sc - Information Technology',
        'B.Sc - Data Science',
        'B.Com - Computer Applications',
        'BCA - Computer Applications',
        'B.E - Mechanical Engineering',
        'B.E - Civil Engineering',
    ];

    const PG_COURSES = [
        'M.Tech - Computer Science & Engineering',
        'M.Tech - Information Technology',
        'M.Tech - Artificial Intelligence & Machine Learning',
        'M.Tech - Data Science',
        'M.Tech - Cyber Security',
        'M.Tech - Electronics & Communication Engineering',
        'M.Tech - Embedded Systems',
        'M.Tech - VLSI Design',
        'M.Tech - Structural Engineering',
        'M.Tech - Thermal Engineering',
        'M.Sc - Computer Science',
        'M.Sc - Data Science',
        'MCA - Computer Applications',
        'MBA - Business Administration',
        'M.Com - Commerce',
        'M.E - Software Engineering',
    ];

    const UG_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const PG_YEARS = ['1st Year', '2nd Year'];

    // Selection Filters
    const [courseCategory, setCourseCategory] = useState<'UG' | 'PG'>('UG');
    const [course, setCourse] = useState(UG_COURSES[0]);
    const [year, setYear] = useState('1st Year');
    const [section, setSection] = useState('Section A');
    const [subjectId, setSubjectId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    // When category changes reset course, year, subject to first valid option
    const handleCategoryChange = (cat: 'UG' | 'PG') => {
        setCourseCategory(cat);
        setCourse(cat === 'UG' ? UG_COURSES[0] : PG_COURSES[0]);
        setYear('1st Year');
        setSubjectId('');
    };

    // Student marking list
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // History & Result Modal
    const [history, setHistory] = useState<BatchHistoryItem[]>([]);
    const [lastTxResult, setLastTxResult] = useState<any>(null);
    const [historyDateFilter, setHistoryDateFilter] = useState('');

    // Student Attendance View
    const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
    const [saLoading, setSaLoading] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!token || !storedUser) {
            router.push('/faculty/login');
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== 'faculty' && parsed.role !== 'admin') {
            router.push('/faculty/login');
            return;
        }
        setUser(parsed);
        // Don't auto-fetch students on mount — subject field is empty.
        // Faculty must fill in the subject then click "Refresh Enrolled Roster".
        fetchHistory();
        fetchStudentAttendance();
    }, []);

    const fetchStudents = async () => {
        if (!subjectId.trim()) {
            setToast({ message: 'Please enter a subject name before loading students.', type: 'info' });
            return;
        }
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/faculty/login'); return; }
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/faculty/students?department=${encodeURIComponent(course)}&semester=${encodeURIComponent(year)}&section=${encodeURIComponent(section)}&subjectId=${encodeURIComponent(subjectId)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load students');
            if (data.students) {
                setStudents(data.students.map((s: any) => ({
                    studentId: s.studentId,
                    name: s.name,
                    email: s.email,
                    status: 'Present'
                })));
            }
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to fetch enrolled students', type: 'error' });
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchHistory = async (dateFilter?: string) => {
        try {
            const token = localStorage.getItem('token');
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/faculty/history${dateFilter ? `?date=${dateFilter}` : ''}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.history) setHistory(data.history);
        } catch (err) {
            console.error('History fetch error:', err);
        }
    };

    const handleDeleteBatch = async (batchId: string) => {
        if (!confirm('Delete this attendance batch? This cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/faculty/students?course=${encodeURIComponent(course)}&year=${encodeURIComponent(year)}&section=${encodeURIComponent(section)}&subjectId=${encodeURIComponent(subjectId)}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            setToast({ message: 'Attendance batch deleted successfully.', type: 'success' });
            fetchHistory(historyDateFilter);
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to delete batch', type: 'error' });
        }
    };

    const fetchStudentAttendance = async () => {
        setSaLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/faculty/students-attendance`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.data) setStudentAttendance(data.data);
        } catch (err) {
            console.error('Student attendance fetch error:', err);
        } finally {
            setSaLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
        setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
    };

    const handleMarkAll = (status: 'Present' | 'Absent' | 'Late') => {
        setStudents(prev => prev.map(s => ({ ...s, status })));
    };

    const handleSubmitAttendance = async () => {
        if (students.length === 0) return;
        setSubmitting(true);
        setLastTxResult(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseCategory,
                    course,
                    semester: year,
                    section,
                    subjectId,
                    attendanceDate,
                    records: students.map(s => ({ studentId: s.studentId, status: s.status }))
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Attendance submission failed.');
            }

            setLastTxResult(data);
            setToast({ message: 'Attendance recorded on blockchain successfully!', type: 'success' });
            fetchHistory();
            fetchStudentAttendance();
        } catch (err: any) {
            setToast({ message: err.message || 'Error submitting attendance', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Clear only subject + students so faculty can mark another subject for same day/course/year
    const handleAddAnotherSubject = () => {
        setSubjectId('');
        setStudents([]);
        setLastTxResult(null);
        setToast({ message: 'Ready to mark attendance for another subject on the same day.', type: 'info' });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/faculty/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 lg:p-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Top Navigation */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Faculty Attendance Portal</h1>
                        <p className="text-xs text-slate-500">
                            Logged in as{' '}
                            <span className="text-blue-600 font-semibold">{user?.name || 'Faculty Member'}</span>{' '}
                            ({user?.email})
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 py-2 px-4 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold text-rose-500 transition-colors shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 gap-6">
                    <button
                        onClick={() => setActiveTab('mark')}
                        className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
                            activeTab === 'mark' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        Mark Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
                            activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        Submission History & Blockchain Logs
                    </button>
                    <button
                        onClick={() => { setActiveTab('view'); fetchStudentAttendance(); }}
                        className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
                            activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                        Student Attendance View
                    </button>
                </div>

                {activeTab === 'mark' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Class Selector Panel */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit space-y-5">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Class & Subject Selection
                            </h2>

                            {/* Course Category — UG / PG toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Course Category</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['UG', 'PG'] as const).map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                                courseCategory === cat
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                        >
                                            {cat === 'UG' ? '🎓 UG — Under Graduate' : '🏅 PG — Post Graduate'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Course */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Course
                                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${courseCategory === 'UG' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {courseCategory}
                                    </span>
                                </label>
                                <select
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                >
                                    {(courseCategory === 'UG' ? UG_COURSES : PG_COURSES).map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Year + Section */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year</label>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    >
                                        {(courseCategory === 'UG' ? UG_YEARS : PG_YEARS).map((y) => (
                                            <option key={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
                                    <select
                                        value={section}
                                        onChange={(e) => setSection(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    >
                                        <option>Section A</option>
                                        <option>Section B</option>
                                        <option>Section C</option>
                                        <option>Section D</option>
                                    </select>
                                </div>
                            </div>

                            {/* Subject — free text input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    placeholder="e.g. CS302 - Blockchain Technology"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <button
                                onClick={fetchStudents}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Enrolled Roster
                            </button>
                        </div>

                        {/* Student Marking Table */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                        Enrolled Students ({students.length})
                                    </h2>
                                    <p className="text-xs text-slate-500">Mark Present, Absent, or Late for {attendanceDate}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleMarkAll('Present')}
                                        className="py-1.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        All Present
                                    </button>
                                    <button
                                        onClick={() => handleMarkAll('Absent')}
                                        className="py-1.5 px-3 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        All Absent
                                    </button>
                                </div>
                            </div>

                            {loadingStudents ? (
                                <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading enrolled students...</div>
                            ) : students.length === 0 ? (
                                <div className="p-12 text-center text-xs text-slate-400">
                                    <p className="font-semibold text-slate-500 mb-1">No students loaded yet.</p>
                                    <p>Enter a subject name and click <strong>Refresh Enrolled Roster</strong> to load students.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {students.map((s) => (
                                        <div key={s.studentId} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                                                <span className="text-[11px] text-slate-400 font-mono">{s.studentId} ({s.email})</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(s.studentId, 'Present')}
                                                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                        s.status === 'Present'
                                                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 font-bold'
                                                            : 'bg-white text-slate-500 border border-slate-200 hover:text-emerald-600 hover:border-emerald-300'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(s.studentId, 'Late')}
                                                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                        s.status === 'Late'
                                                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-200 font-bold'
                                                            : 'bg-white text-slate-500 border border-slate-200 hover:text-amber-600 hover:border-amber-300'
                                                    }`}
                                                >
                                                    <Clock className="w-3.5 h-3.5" /> Late
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(s.studentId, 'Absent')}
                                                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                        s.status === 'Absent'
                                                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-200 font-bold'
                                                            : 'bg-white text-slate-500 border border-slate-200 hover:text-rose-600 hover:border-rose-300'
                                                    }`}
                                                >
                                                    <XCircle className="w-3.5 h-3.5" /> Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleSubmitAttendance}
                                disabled={submitting || students.length === 0}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <span className="animate-pulse">Generating SHA-256 & Anchoring on Blockchain...</span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Finalize & Anchor Attendance on Blockchain
                                    </>
                                )}
                            </button>

                            {/* Transaction Feedback Card */}
                            {lastTxResult && (
                                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Blockchain Transaction Confirmed!
                                        </div>
                                        <button
                                            onClick={handleAddAnotherSubject}
                                            className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Add Another Subject
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-emerald-600">
                                        Same date <strong>{attendanceDate}</strong> · Course <strong>{course}</strong> · Year <strong>{year}</strong> · Section <strong>{section}</strong>
                                    </p>
                                    <div className="space-y-1.5 text-xs text-slate-700">
                                        <div><span className="text-slate-500">Batch ID:</span> <span className="font-mono text-slate-800">{lastTxResult.batchId}</span></div>
                                        <div><span className="text-slate-500">Subject:</span> <span className="font-mono text-slate-800">{subjectId || '—'}</span></div>
                                        <div><span className="text-slate-500">SHA-256 Hash:</span>
                                            <span className="font-mono text-[10px] text-blue-700 block bg-blue-50 p-2 rounded-lg border border-blue-200 break-all mt-1">
                                                {lastTxResult.attendanceHash}
                                            </span>
                                        </div>
                                        <div><span className="text-slate-500">Transaction Hash:</span>
                                            <span className="font-mono text-[10px] text-emerald-700 block bg-emerald-50 p-2 rounded-lg border border-emerald-200 break-all mt-1">
                                                {lastTxResult.transactionHash}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-800">Submission History & Blockchain Logs</h2>
                                <p className="text-xs text-slate-500">Only your submitted attendance batches are shown</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Date filter */}
                                <input
                                    type="date"
                                    value={historyDateFilter}
                                    onChange={(e) => {
                                        setHistoryDateFilter(e.target.value);
                                        fetchHistory(e.target.value);
                                    }}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-400 transition"
                                />
                                {historyDateFilter && (
                                    <button
                                        onClick={() => { setHistoryDateFilter(''); fetchHistory(''); }}
                                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={() => fetchHistory(historyDateFilter)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl text-xs flex items-center gap-2 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" /> Refresh
                                </button>
                            </div>
                        </div>

                        {historyDateFilter && (
                            <div className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                                Showing attendance submitted on <strong>{historyDateFilter}</strong> — {history.length} batch{history.length !== 1 ? 'es' : ''} found
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                                        <th className="py-3 px-4 font-semibold rounded-tl-xl">Date</th>
                                        <th className="py-3 px-4 font-semibold">Subject / Class</th>
                                        <th className="py-3 px-4 font-semibold">Counts</th>
                                        <th className="py-3 px-4 font-semibold">Blockchain Tx Hash</th>
                                        <th className="py-3 px-4 font-semibold">SHA-256 Hash</th>
                                        <th className="py-3 px-4 font-semibold rounded-tr-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                {historyDateFilter ? `No attendance found for ${historyDateFilter}.` : 'No submissions yet.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((h, i) => (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 font-mono text-slate-700">{h.attendance_date}</td>
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-800 block">{h.subject_id}</span>
                                                    <span className="text-[11px] text-slate-400">{h.department} - {h.semester} ({h.section})</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">P: {h.present_count}</span>
                                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[10px] font-bold">A: {h.absent_count}</span>
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-bold">L: {h.late_count}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[10px] text-emerald-700 max-w-[160px] truncate">
                                                    {h.transaction_hash}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[10px] text-blue-600 max-w-[160px] truncate">
                                                    {h.attendance_hash}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleDeleteBatch(h.batch_id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors"
                                                        title="Delete this batch"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'view' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
                            <div>
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-blue-600" />
                                    Student Attendance View
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Attendance records grouped by Course → Year → Subject
                                </p>
                            </div>
                            <button
                                onClick={fetchStudentAttendance}
                                className="flex items-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Refresh
                            </button>
                        </div>

                        {saLoading ? (
                            <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-white border border-slate-200 rounded-2xl">
                                Loading attendance records...
                            </div>
                        ) : studentAttendance.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
                                <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-slate-500">No attendance submitted yet.</p>
                                <p className="text-xs text-slate-400 mt-1">Submit attendance from the Mark Attendance tab to see records here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {studentAttendance.map((group, idx) => {
                                    const key = `${group.course}|${group.year}|${group.subject}`;
                                    const isOpen = expandedGroup === key;
                                    const totalStudents = group.students.length;
                                    const avgPct = totalStudents > 0
                                        ? Math.round(group.students.reduce((s: number, st: any) => s + st.percentage, 0) / totalStudents)
                                        : 0;

                                    return (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                            {/* Group Header — clickable */}
                                            <button
                                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                                                onClick={() => setExpandedGroup(isOpen ? null : key)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl">
                                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{group.course}</p>
                                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                                                                {group.year}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">
                                                                {group.subject}
                                                            </span>
                                                            {group.dates && group.dates.length > 0 && (
                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3 inline" />
                                                                    {group.dates.length === 1
                                                                        ? group.dates[0]
                                                                        : `${group.dates[0]} → ${group.dates[group.dates.length - 1]}`}
                                                                    &nbsp;({group.dates.length} {group.dates.length === 1 ? 'class' : 'classes'})
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] text-slate-400">{totalStudents} student{totalStudents !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    {/* Avg attendance bar */}
                                                    <div className="hidden sm:flex flex-col items-end gap-1">
                                                        <span className="text-[10px] text-slate-400 font-semibold">Avg Attendance</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${avgPct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                    style={{ width: `${avgPct}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-bold ${avgPct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                {avgPct}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-slate-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                                                </div>
                                            </button>

                                            {/* Expanded Student Table */}
                                            {isOpen && (
                                                <div className="border-t border-slate-100">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
                                                                    <th className="py-3 px-6 font-semibold">Student ID</th>
                                                                    <th className="py-3 px-6 font-semibold">Name</th>
                                                                    <th className="py-3 px-6 font-semibold text-center">Total</th>
                                                                    <th className="py-3 px-6 font-semibold text-center">Present</th>
                                                                    <th className="py-3 px-6 font-semibold text-center">Absent</th>
                                                                    <th className="py-3 px-6 font-semibold text-center">Late</th>
                                                                    <th className="py-3 px-6 font-semibold">Attendance %</th>
                                                                    <th className="py-3 px-6 font-semibold">Recent Records</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {group.students.map((st: any, si: number) => (
                                                                    <tr key={si} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                                        <td className="py-3 px-6 font-mono text-blue-600 font-bold">{st.studentId}</td>
                                                                        <td className="py-3 px-6 font-semibold text-slate-800">{st.name}</td>
                                                                        <td className="py-3 px-6 text-center text-slate-600">{st.total}</td>
                                                                        <td className="py-3 px-6 text-center">
                                                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold">{st.present}</span>
                                                                        </td>
                                                                        <td className="py-3 px-6 text-center">
                                                                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded font-bold">{st.absent}</span>
                                                                        </td>
                                                                        <td className="py-3 px-6 text-center">
                                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded font-bold">{st.late}</span>
                                                                        </td>
                                                                        <td className="py-3 px-6">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full rounded-full ${st.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                                        style={{ width: `${st.percentage}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span className={`font-bold ${st.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                                    {st.percentage}%
                                                                                </span>
                                                                                {st.percentage < 75 && (
                                                                                    <span className="text-[10px] text-rose-500 font-semibold">⚠ Low</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 px-6">
                                                                            <div className="flex gap-1 flex-wrap max-w-[180px]">
                                                                                {st.records.slice(0, 5).map((rec: any, ri: number) => (
                                                                                    <span
                                                                                        key={ri}
                                                                                        title={`${rec.date} — ${rec.status}`}
                                                                                        className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold cursor-default ${
                                                                                            rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                                                                            rec.status === 'Late'    ? 'bg-amber-100 text-amber-700'   :
                                                                                                                       'bg-rose-100 text-rose-600'
                                                                                        }`}
                                                                                    >
                                                                                        {rec.status[0]}
                                                                                    </span>
                                                                                ))}
                                                                                {st.records.length > 5 && (
                                                                                    <span className="text-[10px] text-slate-400 self-center">+{st.records.length - 5}</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
