'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, LogIn, ArrowLeft, AlertCircle, Eye, EyeOff, Laptop } from 'lucide-react';

export default function FacultyLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.user?.role !== 'faculty' && data.user?.role !== 'admin') {
                throw new Error('Access denied: User is not authorized as Faculty.');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push('/faculty/dashboard');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

                {/* ── Left Graphic Panel ── */}
                <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />

                    <div className="z-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors mb-8"
                        >
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <ShieldCheck size={22} className="text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">BlockEdu</span>
                        </div>
                    </div>

                    <div className="my-12 flex flex-col items-center text-center z-10">
                        <div className="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 mb-6 backdrop-blur-md shadow-inner">
                            <Laptop size={56} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Faculty Portal</h2>
                        <p className="text-sm text-blue-100/80 max-w-xs">
                            Mark class attendance, generate SHA-256 hashes, and anchor records on the blockchain
                        </p>
                    </div>

                    <div className="text-xs text-blue-200/60 text-center z-10">
                        Faculty Email: faculty@blockedu.com
                    </div>
                </div>

                {/* ── Right Form Panel ── */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome Back 👋</h1>
                        <p className="text-sm text-slate-500">Sign in to your Faculty Account</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-medium">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Faculty Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full light-input py-3 pl-11 pr-4 text-sm"
                                    placeholder="faculty@blockedu.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full light-input py-3 pl-11 pr-11 text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In to Faculty Portal
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-5 border-t border-slate-200 text-center space-y-2">
                        <Link href="/admin" className="block text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                            Are you an admin? Sign in here →
                        </Link>
                        <Link href="/student/login" className="block text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                            Are you a student? Sign in here →
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
