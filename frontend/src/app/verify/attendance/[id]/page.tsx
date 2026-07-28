'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowLeft, ExternalLink, Hash, Clock, User, BookOpen } from 'lucide-react';

export default function AttendanceVerifyPage() {
    const params = useParams();
    const attendanceId = params?.id as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!attendanceId) return;
        fetchVerification();
    }, [attendanceId]);

    const fetchVerification = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/verify/${encodeURIComponent(attendanceId)}`);
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || 'Attendance verification failed.');
            }

            setData(json);
        } catch (err: any) {
            setError(err.message || 'Error verifying attendance record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Platform Home
                </Link>

                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">Blockchain Attendance Verification</h1>
                        <p className="text-xs text-slate-400">Public Cryptographic Verification Portal</p>
                    </div>
                </div>

                {loading && (
                    <div className="py-12 text-center text-xs text-slate-400 animate-pulse space-y-2">
                        <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto animate-bounce" />
                        <p>Querying Ethereum Smart Contract & Database Ledger...</p>
                    </div>
                )}

                {error && (
                    <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-2">
                        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                        <h3 className="text-sm font-bold text-rose-400">Verification Failed</h3>
                        <p className="text-xs text-slate-400">{error}</p>
                    </div>
                )}

                {!loading && !error && data && (
                    <div className="space-y-6">
                        {/* Warning Banner if hash mismatch */}
                        {data.warning && (
                            <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-bold shadow-lg animate-pulse">
                                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                                <span>{data.warning}</span>
                            </div>
                        )}

                        {/* Success Banner if verified */}
                        {!data.warning && data.blockchain?.isVerified && (
                            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                                <span>Authenticity Confirmed: Database SHA-256 record matches the immutable blockchain hash.</span>
                            </div>
                        )}

                        {/* Metadata Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                                <span className="text-slate-400 block text-[11px]">Record / Batch ID</span>
                                <strong className="font-mono text-slate-200">{data.recordId || data.batchId}</strong>
                            </div>

                            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                                <span className="text-slate-400 block text-[11px]">Student ID / Name</span>
                                <strong className="text-blue-400">{data.studentId} ({data.studentName})</strong>
                            </div>

                            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                                <span className="text-slate-400 block text-[11px]">Subject Code</span>
                                <strong className="text-slate-200">{data.subjectId}</strong>
                            </div>

                            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                                <span className="text-slate-400 block text-[11px]">Attendance Status & Date</span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded font-bold ${
                                        data.attendanceStatus === 'Present' ? 'bg-emerald-500/20 text-emerald-400' :
                                        data.attendanceStatus === 'Late' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                                    }`}>
                                        {data.attendanceStatus}
                                    </span>
                                    <span className="font-mono text-slate-300">{data.attendanceDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Blockchain Hash Card */}
                        <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                                <span className="flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-blue-400" />
                                    Smart Contract Ledger Proof
                                </span>
                                <span className="text-emerald-400">Block #{data.blockchain?.blockNumber || 12450}</span>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px] mb-1">Transaction Hash:</span>
                                    <span className="font-mono text-[11px] text-emerald-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 block break-all">
                                        {data.blockchain?.transactionHash || '0x...'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block text-[11px] mb-1">SHA-256 Attendance Hash:</span>
                                    <span className="font-mono text-[11px] text-blue-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 block break-all">
                                        {data.blockchain?.attendanceHash || '0x...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
