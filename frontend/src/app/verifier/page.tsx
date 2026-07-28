"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck,
  Search, CheckCircle2, AlertTriangle, Hash, X, Clock,
  ThumbsUp, ThumbsDown, RefreshCw, FileText, ExternalLink, Download,
  LayoutDashboard, CheckSquare, LogOut, Mail, Lock,
  Copy, Check, FileCheck, User
} from "lucide-react";
import Link from "next/link";
import { showToast } from "@/components/Toast";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getCertificateUrl(ipfsCid: string): string | null {
  if (!ipfsCid || ipfsCid === 'QmNoFile') return null;
  const filename = ipfsCid.replace(/^QmMockIPFS_/, '');
  if (!filename) return null;
  return `${API_URL}/uploads/${encodeURIComponent(filename)}`;
}

function getFileExtension(ipfsCid: string): string {
  const filename = ipfsCid.replace(/^QmMockIPFS_/, '');
  return filename.split('.').pop()?.toLowerCase() || '';
}

export default function VerifierPage() {
  const [loggedIn,        setLoggedIn]        = useState(false);
  const [authToken,       setAuthToken]       = useState("");
  const [verifierEmail,   setVerifierEmail]   = useState("verifier@blockedu.com");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [loginLoading,    setLoginLoading]    = useState(false);
  const [loginError,      setLoginError]      = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Navigation State: 'dashboard' | 'pending' | 'verified' | 'verify'
  const [activeNav, setActiveNav] = useState<"dashboard" | "pending" | "verified" | "verify">("dashboard");
  const [searchTab, setSearchTab] = useState<"id" | "hash">("id");

  // Data States
  const [pendingRecords,  setPendingRecords]  = useState<any[]>([]);
  const [allRecords,      setAllRecords]      = useState<any[]>([]);
  const [pendingLoading,  setPendingLoading]  = useState(false);
  const [actionLoading,   setActionLoading]   = useState<string | null>(null);
  const [actionMsg,       setActionMsg]       = useState<{ id: string; type: "success" | "error"; msg: string } | null>(null);
  const [previewCid,      setPreviewCid]      = useState<string | null>(null);
  const [copiedHash,      setCopiedHash]      = useState<string | null>(null);

  // Search / Verify State
  const [searchId,  setSearchId]  = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result,    setResult]    = useState<any>(null);

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role  = localStorage.getItem("role");
    if (token && role === "verifier") {
      setAuthToken(token);
      setLoggedIn(true);
      fetchAllData(token);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "verifier") throw new Error("Access denied. Verifier account required.");

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", data.user.role);
      setAuthToken(data.token);
      setVerifierEmail(data.user.email);
      setLoggedIn(true);
      fetchAllData(data.token);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Fetch Pending & All Records ────────────────────────────────────────────
  const fetchAllData = async (token: string) => {
    setPendingLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch(`${API_URL}/api/records/pending`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/records`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (pendingRes.ok) setPendingRecords(await pendingRes.json());
      if (allRes.ok) setAllRecords(await allRes.json());
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setAuthToken("");
    setShowProfileMenu(false);
  };

  // ── Approve / Reject Record ────────────────────────────────────────────────
  const handleAction = async (recordId: string, studentId: string, action: "approve" | "reject") => {
    setActionLoading(recordId + action);
    setActionMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/records/verify-action/${studentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      showToast(
        action === "approve"
          ? `Record for ${studentId} Approved & Stored on Blockchain!`
          : `Record for ${studentId} Rejected`,
        action === "approve" ? "success" : "info"
      );

      setActionMsg({
        id: recordId,
        type: "success",
        msg: action === "approve" ? "Approved & stored on blockchain ✅" : "Record rejected ❌"
      });

      // Refresh list
      fetchAllData(authToken);
    } catch (err: any) {
      setActionMsg({ id: recordId, type: "error", msg: err.message });
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Verify by ID / Hash ────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/records/verify/${encodeURIComponent(searchId.trim())}`);
      if (!res.ok) {
        if (res.status === 404) { setResult({ notFound: true }); }
        else { const d = await res.json(); throw new Error(d.error || "Verification failed"); }
      } else {
        const data = await res.json();
        setResult({ ...data.recordDetails, isTampered: data.isTampered, dataHash: data.blockchainHash || data.dbHash });
      }
    } catch (err: any) {
      setResult({ notFound: true, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
    showToast("Unique Hash Code copied to clipboard!", "success");
  };

  const verifiedRecordsList = allRecords.filter(r => r.status === "verified");

  // ── Login Screen ───────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Left Graphic Side */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors mb-8">
                <ArrowLeft size={16} /> Back to Home
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Building2 size={22} className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">BlockEdu</span>
              </div>
            </div>

            <div className="my-12 flex flex-col items-center text-center z-10">
              <div className="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 mb-6 backdrop-blur-md shadow-inner">
                <Building2 size={56} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verifier Portal</h2>
              <p className="text-sm text-emerald-100/80 max-w-xs">For employers, HR teams, and academic institutions verifying credentials</p>
            </div>

            <div className="text-xs text-emerald-200/60 text-center z-10">
              Verifier Email: verifier@blockedu.com
            </div>
          </div>

          {/* Right Form Side */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome Back 👋</h1>
              <p className="text-sm text-slate-500">Sign in to Verifier Portal</p>
            </div>



            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Organization / Verifier Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full light-input py-3 pl-11 pr-4 text-sm"
                    placeholder="verifier@blockedu.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full light-input py-3 pl-11 pr-11 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-rose-600 text-xs font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {loginLoading ? <><Loader2 size={18} className="animate-spin" /> Accessing...</> : "Access Verifier Dashboard"}
              </button>
            </form>
          </div>

        </div>

        {showForgotModal && (
          <ForgotPasswordModal
            defaultEmail={email}
            onClose={() => setShowForgotModal(false)}
          />
        )}
      </div>
    );
  }

  // ── Verifier Dashboard Navigation Items (Organizations & Settings Removed) ─
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "pending",   icon: Clock,            label: `Pending Records (${pendingRecords.length})` },
    { id: "verified",  icon: CheckCircle2,     label: `Verified Records (${verifiedRecordsList.length})` },
    { id: "verify",    icon: CheckSquare,      label: "Verify Certificate" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      
      {/* ── Left Sidebar Navigation ── */}
      <aside className="w-64 shrink-0 light-sidebar flex flex-col p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">BlockEdu</span>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold border border-blue-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-blue-600" : "text-slate-500"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-all">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 relative">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome, HR Verifier 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">{verifierEmail} · Review student records &amp; verify credentials</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => fetchAllData(authToken)} className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5">
              <RefreshCw size={14} className={pendingLoading ? "animate-spin" : ""} /> Refresh Data
            </button>

            {/* Interactive Working Profile Icon Button */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-sm border border-emerald-300 shadow-sm transition-all cursor-pointer focus:ring-2 focus:ring-emerald-400"
                title="View Profile Details"
              >
                HR
              </button>

              {/* Profile Dropdown Menu Card */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-64 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xl z-50 space-y-3"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                        HR
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">HR Verifier</p>
                        <p className="text-xs text-slate-500 truncate">{verifierEmail}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Role:</span>
                        <strong className="text-emerald-600 font-semibold">Verifier Node</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Status:</span>
                        <strong className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active &amp; Connected
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full btn-secondary py-2 text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── VIEW 1: DASHBOARD OVERVIEW ── */}
        {activeNav === "dashboard" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="light-card p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Pending Review</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{pendingRecords.length}</p>
                </div>
              </div>

              <div className="light-card p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Verified Records</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{verifiedRecordsList.length}</p>
                </div>
              </div>

              <div className="light-card p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center shrink-0">
                  <FileCheck size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Records</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{allRecords.length}</p>
                </div>
              </div>
            </div>

            {/* Recently Uploaded Documents by Admin (Pending Queue Preview) */}
            <div className="light-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" /> Pending Admin Submissions
                  </h2>
                  <p className="text-xs text-slate-500">Student records and documents uploaded by Admin waiting for your verification</p>
                </div>
                <button onClick={() => setActiveNav("pending")} className="text-xs font-bold text-blue-600 hover:underline">
                  View All Pending ({pendingRecords.length}) →
                </button>
              </div>

              {pendingRecords.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                  No pending records to review right now! All uploaded documents are verified.
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingRecords.slice(0, 3).map((r) => (
                    <RecordVerificationCard
                      key={r._id}
                      record={r}
                      actionLoading={actionLoading}
                      actionMsg={actionMsg}
                      previewCid={previewCid}
                      setPreviewCid={setPreviewCid}
                      copiedHash={copiedHash}
                      handleCopy={handleCopy}
                      handleAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VIEW 2: PENDING RECORDS QUEUE ── */}
        {activeNav === "pending" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock size={22} className="text-amber-500" /> Pending Records Verification Queue
                </h2>
                <p className="text-xs text-slate-500 mt-1">Review student details, view uploaded documents, and approve to store on blockchain</p>
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-600 border border-amber-200">
                {pendingRecords.length} Pending
              </span>
            </div>

            {pendingLoading ? (
              <div className="light-card p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="text-sm font-medium">Fetching pending records from database...</p>
              </div>
            ) : pendingRecords.length === 0 ? (
              <div className="light-card p-12 text-center text-slate-400 border-dashed">
                <CheckCircle2 size={44} className="mx-auto mb-3 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900">All Clean!</h3>
                <p className="text-xs text-slate-500 mt-1">No pending student documents awaiting verification.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingRecords.map((r) => (
                  <RecordVerificationCard
                    key={r._id}
                    record={r}
                    actionLoading={actionLoading}
                    actionMsg={actionMsg}
                    previewCid={previewCid}
                    setPreviewCid={setPreviewCid}
                    copiedHash={copiedHash}
                    handleCopy={handleCopy}
                    handleAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 3: VERIFIED RECORDS ── */}
        {activeNav === "verified" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-emerald-600" /> Verified Blockchain Records
                </h2>
                <p className="text-xs text-slate-500 mt-1">All student credentials verified and stored permanently on Ethereum</p>
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
                {verifiedRecordsList.length} Verified
              </span>
            </div>

            {pendingLoading ? (
              <div className="light-card p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="text-sm font-medium">Loading verified records...</p>
              </div>
            ) : verifiedRecordsList.length === 0 ? (
              <div className="light-card p-12 text-center text-slate-400 border-dashed">
                <CheckCircle2 size={44} className="mx-auto mb-3 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-900">No verified records yet</h3>
                <p className="text-xs text-slate-500 mt-1">Approved records will appear here after verification.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {verifiedRecordsList.map((r: any) => {
                  const docsList: any[] = Array.isArray(r.documents) ? r.documents : [];
                  return (
                    <div key={r._id || r.id} className="light-card p-6 border border-slate-200 bg-white shadow-md space-y-5">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-lg text-slate-900">{r.name}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              ✅ Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Student ID: <strong className="font-mono text-blue-600">{r.studentId}</strong>
                            {r.verifiedBy && <> · Verified by: <strong className="text-emerald-600">{r.verifiedBy}</strong></>}
                            {r.createdAt && <> · {new Date(r.createdAt).toLocaleDateString()}</>}
                          </p>
                        </div>

                        {/* Unique Cryptographic Hash Display */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between gap-3 text-slate-400 mb-1">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <Hash size={12} className="text-emerald-600" /> SHA-256 Blockchain Hash
                            </span>
                            <button onClick={() => handleCopy(r.dataHash)} className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                              {copiedHash === r.dataHash ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy
                            </button>
                          </div>
                          <p className="font-mono text-[11px] text-emerald-700 font-semibold truncate max-w-[280px]">
                            {r.dataHash || "0x8f3a......7c2e9b"}
                          </p>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Course / Degree</span>
                          <strong className="text-slate-900 font-semibold">{r.course}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Year</span>
                          <strong className="text-blue-600 font-bold">{r.year || '—'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Submitted By</span>
                          <strong className="text-slate-700 font-medium">{r.addedBy || "Admin"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Verified By</span>
                          <strong className="text-emerald-700 font-medium">{r.verifiedBy || "—"}</strong>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                          <FileText size={14} className="text-emerald-600" /> Attached Documents ({docsList.length})
                        </h4>

                        {docsList.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">No document files attached.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {docsList.map((doc: any, i: number) => {
                              const certUrl = getCertificateUrl(doc.ipfsCid);
                              const ext     = getFileExtension(doc.ipfsCid);
                              const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext);
                              const isPdf   = ext === 'pdf';
                              const isPreviewOpen = previewCid === doc.ipfsCid + "_verified_" + r.studentId;

                              return (
                                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 font-bold">
                                        <FileCheck size={16} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{doc.label || `Document ${i + 1}`}</p>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">{doc.filename || doc.ipfsCid}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {certUrl && (
                                        <button
                                          onClick={() => setPreviewCid(isPreviewOpen ? null : doc.ipfsCid + "_verified_" + r.studentId)}
                                          className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                          <Eye size={12} /> {isPreviewOpen ? "Hide" : "View"}
                                        </button>
                                      )}
                                      {certUrl && (
                                        <a
                                          href={certUrl}
                                          download
                                          className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                          <Download size={12} />
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* Inline Document Preview */}
                                  <AnimatePresence>
                                    {isPreviewOpen && certUrl && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden pt-2"
                                      >
                                        <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
                                          {isPdf && (
                                            <iframe src={certUrl} className="w-full" style={{ height: "300px" }} title="Doc Preview" />
                                          )}
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          {isImage && (
                                            <img src={certUrl} alt="Student Document" className="w-full max-h-[300px] object-contain p-2 bg-slate-100" />
                                          )}
                                          {!isPdf && !isImage && (
                                            <div className="p-4 text-center text-xs text-slate-500">
                                              <a href={certUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline flex items-center justify-center gap-1">
                                                Open Document in New Tab <ExternalLink size={12} />
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* ── VIEW 4: VERIFY CERTIFICATE SEARCH (Verify by QR Removed) ── */}
        {activeNav === "verify" && (
          <div className="space-y-6">
            <div className="light-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare size={20} className="text-blue-600" /> Verify Certificate Authenticity
              </h2>

              {/* Sub Tabs: Only Verify by ID & Verify by Hash (Verify by QR Removed) */}
              <div className="flex gap-2 border-b border-slate-100 pb-3">
                {[
                  { id: "id", label: "Verify by Student ID" },
                  { id: "hash", label: "Verify by Unique Hash Code" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSearchTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      searchTab === tab.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleVerify} className="flex gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input
                    type="text"
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    placeholder={
                      searchTab === "id"
                        ? "Enter Student Roll No / ID (e.g. S1001)"
                        : "Enter SHA-256 Unique Data Hash Code (e.g. 0x8f3a...)"
                    }
                    className="w-full light-input py-3 pl-11 pr-4 text-sm bg-white font-mono"
                  />
                </div>
                <button type="submit" disabled={verifying || !searchId.trim()} className="btn-primary px-7 py-3 text-sm">
                  {verifying ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                </button>
              </form>
            </div>

            {/* Verification Result Display */}
            {result && (
              <div className="light-card p-6 border border-slate-200 space-y-4">
                {result.notFound ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold">
                    No matching record found for query: <strong className="font-mono">{searchId}</strong>. Please check the ID or Hash Code and try again.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{result.name}</h3>
                        <p className="text-xs text-slate-500">Student ID: <strong className="font-mono text-blue-600">{result.studentId}</strong></p>
                      </div>
                      <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Blockchain Verified ✅
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div><span className="text-slate-400 block mb-0.5">Course / Degree</span> <strong className="text-slate-900 text-sm font-semibold">{result.course}</strong></div>
                      <div><span className="text-slate-400 block mb-0.5">Year</span> <strong className="text-blue-600 text-sm font-bold">{result.year || '—'}</strong></div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Status</span>
                        <strong className="text-emerald-600 text-sm font-semibold capitalize">{result.status || "Verified"}</strong>
                      </div>
                    </div>

                    <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs">
                      <span className="text-slate-400 block mb-1 font-semibold">Unique Cryptographic SHA-256 Hash:</span>
                      <div className="flex items-center justify-between font-mono text-blue-700 font-bold text-xs">
                        <span className="break-all">{result.dataHash}</span>
                        <button onClick={() => handleCopy(result.dataHash)} className="text-blue-600 hover:underline shrink-0 ml-2">
                          {copiedHash === result.dataHash ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// ─── Component: Single Record Verification Card (With Docs & Hash) ──────────────
function RecordVerificationCard({
  record,
  actionLoading,
  actionMsg,
  previewCid,
  setPreviewCid,
  copiedHash,
  handleCopy,
  handleAction
}: any) {
  const docsList = record.documents && record.documents.length > 0
    ? record.documents
    : (record.ipfsCid && record.ipfsCid !== 'QmNoFile')
      ? [{ ipfsCid: record.ipfsCid, label: 'Certificate Document', uploadedAt: record.createdAt }]
      : [];

  return (
    <div className="light-card p-6 border border-slate-200 bg-white shadow-md space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900">{record.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
              Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Student ID: <strong className="font-mono text-blue-600">{record.studentId}</strong> · Submitted: {new Date(record.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Unique Cryptographic Hash Display */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between gap-3 text-slate-400 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Hash size={12} className="text-blue-600" /> SHA-256 Unique Data Hash
            </span>
            <button onClick={() => handleCopy(record.dataHash)} className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]">
              {copiedHash === record.dataHash ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy
            </button>
          </div>
          <p className="font-mono text-[11px] text-blue-600 font-semibold truncate max-w-[280px]">
            {record.dataHash || "0x8f3a......7c2e9b"}
          </p>
        </div>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-100">
        <div>
          <span className="text-slate-400 block mb-0.5">Course / Degree</span>
          <strong className="text-slate-900 font-semibold">{record.course}</strong>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Year</span>
          <strong className="text-blue-600 font-bold">{record.year || '—'}</strong>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Submitted By</span>
          <strong className="text-slate-700 font-medium">{record.addedBy || "Admin"}</strong>
        </div>
      </div>

      {/* Uploaded Documents List & Viewer Section */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <FileText size={14} className="text-purple-600" /> Attached Student Documents ({docsList.length})
        </h4>

        {docsList.length === 0 ? (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">No document files attached.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {docsList.map((doc: any, i: number) => {
              const certUrl = getCertificateUrl(doc.ipfsCid);
              const ext     = getFileExtension(doc.ipfsCid);
              const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext);
              const isPdf   = ext === 'pdf';
              const isPreviewOpen = previewCid === doc.ipfsCid;

              return (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0 font-bold">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{doc.label || `Document ${i + 1}`}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{doc.filename || doc.ipfsCid}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {certUrl && (
                        <button
                          onClick={() => setPreviewCid(isPreviewOpen ? null : doc.ipfsCid)}
                          className="px-2.5 py-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Eye size={12} /> {isPreviewOpen ? "Hide" : "View"}
                        </button>
                      )}
                      {certUrl && (
                        <a
                          href={certUrl}
                          download
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Download size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Inline Document Preview Box */}
                  <AnimatePresence>
                    {isPreviewOpen && certUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
                          {isPdf && (
                            <iframe src={certUrl} className="w-full" style={{ height: "300px" }} title="Doc Preview" />
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {isImage && (
                            <img src={certUrl} alt="Student Document" className="w-full max-h-[300px] object-contain p-2 bg-slate-100" />
                          )}
                          {!isPdf && !isImage && (
                            <div className="p-4 text-center text-xs text-slate-500">
                              <a href={certUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
                                Open Document in New Tab <ExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Message Feedback */}
      {actionMsg && actionMsg.id === record._id && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${
          actionMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          {actionMsg.msg}
        </div>
      )}

      {/* Footer Row: Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={() => handleAction(record._id, record.studentId, "reject")}
          disabled={actionLoading === record._id + "reject"}
          className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {actionLoading === record._id + "reject" ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />} Reject
        </button>

        <button
          onClick={() => handleAction(record._id, record.studentId, "approve")}
          disabled={actionLoading === record._id + "approve"}
          className="btn-primary px-6 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
        >
          {actionLoading === record._id + "approve" ? (
            <><Loader2 size={14} className="animate-spin" /> Verifying &amp; Storing Hash...</>
          ) : (
            <><ThumbsUp size={14} /> Approve &amp; Store on Blockchain</>
          )}
        </button>
      </div>
    </div>
  );
}
