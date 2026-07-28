'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { X, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    record: {
        attendance_id: string;
        batch_id?: string;
        subject_id: string;
        attendance_date: string;
        attendance_status: string;
        transaction_hash?: string;
        attendance_hash?: string;
        student_id?: string;
        student_name?: string;
    } | null;
}

export default function AttendanceQRModal({ isOpen, onClose, record }: Props) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !record) return null;

    const verifyUrl = `${window.location.origin}/verify/attendance/${record.attendance_id || record.batch_id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(verifyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Blockchain Verification</h3>
                        <p className="text-xs text-slate-400">Tamper-proof record details</p>
                    </div>
                </div>

                {/* QR Container */}
                <div className="bg-white p-4 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto w-48 h-48">
                    <QRCode value={verifyUrl} size={160} />
                </div>

                {/* Record Details */}
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs mb-6">
                    <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Subject:</span>
                        <span className="font-semibold text-slate-100">{record.subject_id}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Date:</span>
                        <span className="font-mono">{record.attendance_date}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                            record.attendance_status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' :
                            record.attendance_status === 'Late' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                            {record.attendance_status}
                        </span>
                    </div>
                    {record.transaction_hash && (
                        <div className="pt-2 border-t border-slate-800">
                            <span className="text-slate-400 block mb-1">Transaction Hash:</span>
                            <span className="font-mono text-[10px] text-blue-400 break-all bg-slate-900 p-2 rounded-lg block border border-slate-800">
                                {record.transaction_hash}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                    <a
                        href={verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Verify Page
                    </a>
                </div>
            </div>
        </div>
    );
}
