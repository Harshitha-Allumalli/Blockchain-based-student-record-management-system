"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, XCircle, ArrowLeft, Loader2, ShieldCheck, ExternalLink, Download, Printer, Copy, Check, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCodeLib from "qrcode";
import { showToast } from "@/components/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) { setStudentId(id); triggerVerify(id); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Render QR code onto canvas when result is available
  useEffect(() => {
    if (result && !result.notFound && !result.isTampered && qrCanvasRef.current) {
      const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify?id=${result.studentId}`;
      QRCodeLib.toCanvas(qrCanvasRef.current, verifyUrl, {
        width: 72,
        margin: 1,
        color: { dark: '#1e40af', light: '#fffbf0' },
      });
    }
  }, [result]);

  const triggerVerify = async (id: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/records/verify/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setResult({ notFound: true });
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || "Verification failed");
        }
      } else {
        const data = await res.json();
        setResult({
          ...data.recordDetails,
          isTampered: data.isTampered,
          blockchainHash: data.blockchainHash || data.dbHash,
          dbHash: data.dbHash
        });
      }
    } catch (err: any) {
      setResult({ notFound: true, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    triggerVerify(studentId.trim());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    showToast("Hash copied to clipboard!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Search Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-4">
          <ShieldCheck size={14} /> Public Verification Portal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Verify Certificate Authenticity</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">Enter student roll number to view the official blockchain-verified diploma</p>

        <form onSubmit={handleVerify} className="relative max-w-md mx-auto mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="Enter Student ID (e.g. S1001)"
              className="w-full light-input py-3 pl-11 pr-4 text-sm bg-white"
            />
          </div>
          <button type="submit" disabled={loading || !studentId.trim()} className="btn-primary px-6 text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
          </button>
        </form>
      </div>

      {/* Result View (Screen 8 Mockup) */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={JSON.stringify(result)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {result.notFound ? (
              <div className="light-card p-12 text-center max-w-lg mx-auto">
                <XCircle size={48} className="mx-auto mb-3 text-amber-500" />
                <h2 className="text-xl font-bold text-slate-900 mb-1">Certificate Not Found</h2>
                <p className="text-sm text-slate-500">No record exists on the blockchain for Student ID: <strong className="font-mono text-slate-700">{studentId}</strong></p>
              </div>
            ) : result.isTampered ? (
              <div className="light-card p-12 text-center max-w-lg mx-auto border-rose-300 bg-rose-50/30">
                <XCircle size={56} className="mx-auto mb-3 text-rose-600" />
                <h2 className="text-2xl font-extrabold text-rose-600 mb-2">Data Tampered ❌</h2>
                <p className="text-sm text-slate-600 mb-4">The records on database do not match the cryptographic hash stored on the Ethereum Blockchain.</p>
                <div className="bg-white p-4 rounded-xl border border-rose-200 text-left font-mono text-xs text-rose-700 break-all">
                  Hash: {result.blockchainHash}
                </div>
              </div>
            ) : (
              /* Screen 8 Mockup: Left Official Certificate + Right Verification Details */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: JNTU Vizianagaram Official Certificate Template Layout */}
                <div className="lg:col-span-7 bg-amber-50/40 p-8 rounded-3xl border-4 border-amber-200/80 shadow-xl relative overflow-hidden text-slate-900 font-serif">
                  {/* Decorative Frame Border */}
                  <div className="border-2 border-amber-400/50 p-6 rounded-2xl relative text-center">
                    
                    {/* Crest */}
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-900 text-amber-400 rounded-full flex items-center justify-center mb-2 shadow-md">
                        <GraduationCap size={36} />
                      </div>
                      <h2 className="font-extrabold text-xl tracking-wider text-blue-950 uppercase font-sans">JNTU VIZIANAGARAM</h2>
                      <p className="text-[10px] text-slate-600 tracking-widest font-sans uppercase font-bold">Jawaharlal Nehru Technological University</p>
                    </div>

                    <div className="w-24 h-0.5 bg-amber-400 mx-auto mb-6" />

                    <p className="text-xs italic text-slate-600 mb-1">This is to certify that</p>
                    <h3 className="text-2xl font-bold text-blue-950 font-sans tracking-wide mb-3">{result.name}</h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      has successfully completed the degree program in
                    </p>

                    <h4 className="text-lg font-bold text-slate-900 font-sans mb-1">{result.course}</h4>
                    <p className="text-xs font-sans font-bold text-emerald-700 mb-6">with Marks / CGPA of {result.marks}</p>

                    {/* Bottom Row: QR & Signatures */}
                    <div className="pt-6 border-t border-amber-300/60 flex items-center justify-between font-sans">
                      <div className="text-left text-[10px] text-slate-500">
                        <p className="font-bold text-slate-800">Registrar Signature</p>
                        <p className="italic text-slate-400 mt-3">Verified Digital Seal</p>
                      </div>

                      <div className="bg-amber-50 p-2 rounded-xl shadow-sm border border-amber-300">
                        <canvas ref={qrCanvasRef} className="rounded-lg" width={72} height={72} />
                      </div>

                      <div className="text-right text-[10px] text-slate-500">
                        <p className="font-bold text-slate-800">Controller of Exams</p>
                        <p className="italic text-slate-400 mt-3">Verified Digital Seal</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Side: Certificate Verified Details Card (Screen 8 Mockup) */}
                <div className="lg:col-span-5 light-card p-6 space-y-6">
                  
                  {/* Verified Badge */}
                  <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-emerald-800 text-base">Certificate Verified</h3>
                      <p className="text-xs text-emerald-600">This certificate is valid and stored on the blockchain.</p>
                    </div>
                  </div>

                  {/* Key-Value Details */}
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Student Name</span>
                      <strong className="text-slate-900 font-semibold">{result.name}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Student ID</span>
                      <strong className="font-mono text-blue-600 font-bold">{result.studentId}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Degree / Course</span>
                      <strong className="text-slate-900 font-semibold">{result.course}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Institute</span>
                      <strong className="text-slate-900 font-semibold">JNTU Vizianagaram</strong>
                    </div>
                    <div className="py-2 border-b border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transaction Hash</span>
                        <button onClick={() => handleCopy(result.blockchainHash)} className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                          {copiedHash ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy
                        </button>
                      </div>
                      <p className="font-mono text-[11px] text-blue-600 break-all bg-slate-50 p-2 rounded-xl border border-slate-200">
                        {result.blockchainHash}
                      </p>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Block Number</span>
                      <strong className="font-mono text-slate-900">17864532</strong>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Timestamp</span>
                      <strong className="text-slate-700">{new Date(result.createdAt).toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Action Buttons (Screen 8 Mockup) */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button onClick={handlePrint} className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5">
                      <Download size={14} /> Download
                    </button>
                    <button onClick={handlePrint} className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5">
                      <Printer size={14} /> Print
                    </button>
                    <a href="#" className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1 text-blue-600">
                      <ExternalLink size={14} /> Explorer
                    </a>
                  </div>

                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 text-slate-900">
      <div className="w-full max-w-6xl mt-4 mb-6 flex justify-start">
        <Link href="/" className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <Suspense fallback={<div className="mt-20 text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" size={18}/>Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
