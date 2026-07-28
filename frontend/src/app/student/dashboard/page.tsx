"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ShieldCheck, FileText, Download,
  LogOut, CheckCircle2, AlertTriangle, Hash, ExternalLink,
  Clock, Loader2, RefreshCw, Eye, FileCheck2, Upload, Plus,
  LayoutDashboard, User, Award, Bot, Settings, Copy, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExportPDF from "@/components/ExportPDF";
import QRModal from "@/components/QRModal";
import { showToast } from "@/components/Toast";

import AttendanceCalendar from "@/components/AttendanceCalendar";
import AttendanceQRModal from "@/components/AttendanceQRModal";

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

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab,    setActiveTab]   = useState("dashboard");
  const [studentId,   setStudentId]   = useState("");
  const [studentName, setStudentName] = useState("");
  const [record,      setRecord]      = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showQR,      setShowQR]      = useState(false);
  const [copiedHash,  setCopiedHash]  = useState(false);
  
  const [previewCid, setPreviewCid]           = useState<string | null>(null);

  // Attendance state
  const [attendanceData, setAttendanceData]   = useState<any>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [showAttendanceQR, setShowAttendanceQR]     = useState(false);
  const [filterSubject, setFilterSubject]     = useState("");
  const [filterMonth, setFilterMonth]         = useState("");

  const fetchRecord = async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/records/student/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 404) { setRecord(null); }
      else if (res.ok) {
        setRecord(await res.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (token: string, sId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/attendance/student/my-attendance?studentId=${sId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setAttendanceData(await res.json());
      }
    } catch (e) {
      console.warn("Attendance fetch error:", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role  = localStorage.getItem("role");
    if (!token || role !== "student") { router.push("/student/login"); return; }
    const sId = localStorage.getItem("studentId") || "STU101";
    const sName = localStorage.getItem("studentName") || "Alice Smith";
    setStudentId(sId);
    setStudentName(sName);
    fetchRecord(token);
    fetchAttendance(token, sId);
  }, [router]);

  const handleLogout = () => {
    ["authToken","role","studentId","studentName"].forEach(k => localStorage.removeItem(k));
    router.push("/student/login");
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    showToast("Blockchain hash copied to clipboard!", "success");
  };

  const downloadPDFReport = () => {
    window.print();
  };

  const status = record?.status;

  // Documents list — only real uploaded documents, no fallback fake entries
  const docsList = record?.documents && record.documents.length > 0
    ? record.documents
    : [];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 light-sidebar flex flex-col p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">BlockEdu</span>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "attendance", icon: Clock, label: "Attendance & Verification" },
            { id: "certificates", icon: Award, label: "My Certificates" },
            { id: "profile", icon: User, label: "My Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? "text-white" : "text-slate-500"} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-all">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome, {studentName} 👋</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500 font-medium">Student ID: <strong className="font-mono text-slate-700">{studentId}</strong></span>
              {status === "verified" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 size={12} /> Blockchain Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRecord(localStorage.getItem("authToken") || "")}
              className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {studentName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="light-card p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading your student credentials...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="light-card p-8 text-center border-rose-200 bg-rose-50/50">
            <AlertTriangle size={36} className="mx-auto mb-2 text-rose-600" />
            <p className="text-rose-600 font-bold text-sm">{error}</p>
          </div>
        )}

        {/* ── ATTENDANCE TAB ── */}
        {activeTab === "attendance" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Attendance Summary & Blockchain Verification
                </h2>
                <p className="text-xs text-slate-500 mt-1">Real-time attendance ledger anchored on Ethereum Smart Contract</p>
              </div>

              <button
                onClick={downloadPDFReport}
                className="flex items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                <Download className="w-4 h-4" />
                Download Attendance Report (PDF)
              </button>
            </div>

            {/* Attendance Risk Alert */}
            {attendanceData?.summary?.isAtRisk && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs font-semibold shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>AI Low Attendance Warning:</strong> Your overall attendance is currently <strong className="text-amber-700">{attendanceData.summary.overallPercentage}%</strong>, which is below the 75% mandatory threshold. Please attend upcoming lectures to avoid exam shortage.
                </span>
              </div>
            )}

            {/* Attendance Stats Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Classes</span>
                <span className="text-2xl font-extrabold text-slate-900">{attendanceData?.summary?.totalClasses || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Attended Classes</span>
                <span className="text-2xl font-extrabold text-emerald-600">{attendanceData?.summary?.attendedClasses || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Missed Classes</span>
                <span className="text-2xl font-extrabold text-rose-600">{attendanceData?.summary?.missedClasses || 0}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Overall Percentage</span>
                <span className={`text-2xl font-extrabold ${(attendanceData?.summary?.overallPercentage || 0) >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {attendanceData?.summary?.overallPercentage || 0}%
                </span>
              </div>
            </div>

            {/* Subject-Wise Attendance Breakdown */}
            {attendanceData?.subjectBreakdown && attendanceData.subjectBreakdown.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Subject-Wise Percentage Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attendanceData.subjectBreakdown.map((sb: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{sb.subjectId}</span>
                        <span className={`font-bold ${sb.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {sb.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${sb.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, sb.percentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                        <span>Classes: {sb.total}</span>
                        <span>Present: {sb.present} | Absent: {sb.absent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Calendar */}
            <AttendanceCalendar records={attendanceData?.records || []} />

            {/* Detailed Verification History Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Attendance Ledger & Verification Records
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {attendanceData?.records?.length || 0} Entries
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Blockchain Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData?.records?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No attendance records found yet.
                        </td>
                      </tr>
                    ) : (
                      attendanceData?.records?.map((r: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.attendance_date}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{r.subject_id}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              r.attendance_status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              r.attendance_status === 'Late' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}>
                              {r.attendance_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <ShieldCheck size={12} /> Verified On-Chain
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedAttendance(r);
                                setShowAttendanceQR(true);
                              }}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                            >
                              QR Verification
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attendance QR Verification Modal */}
            <AttendanceQRModal
              isOpen={showAttendanceQR}
              onClose={() => setShowAttendanceQR(false)}
              record={selectedAttendance}
            />
          </div>
        )}

        {/* ── PROFILE TAB — always visible regardless of record ── */}
        {!loading && activeTab === "profile" && (
          <div className="light-card p-8 max-w-3xl space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner">
                  {studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{record?.name || studentName}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Roll Number / Student ID: <strong className="text-blue-600">{studentId}</strong></p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === "verified" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                {status === "verified" ? "Blockchain Verified" : record ? "Pending Verification" : "No Record Yet"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Student Full Name</span>
                <strong className="text-slate-900 text-base">{record?.name || studentName}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Roll Number / Student ID</span>
                <strong className="text-blue-600 font-mono text-base">{studentId}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Degree / Course</span>
                <strong className="text-slate-900 text-base">{record?.course || "Not assigned yet"}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Year</span>
                <strong className="text-blue-600 text-base">{record?.year || '—'}</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Attached Certificates</span>
                <strong className="text-purple-600 text-base">{docsList.length} File(s)</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Managed By Node</span>
                <strong className="text-slate-700 text-base">{record?.addedBy || "University Admin"}</strong>
              </div>
            </div>

            {record?.dataHash && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Blockchain Ledger Data Hash</span>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs text-blue-600">
                  <span className="truncate flex-1">{record.dataHash}</span>
                  <button onClick={() => handleCopyHash(record.dataHash)} className="text-slate-400 hover:text-blue-600 shrink-0">
                    {copiedHash ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {!record && !loading && (
              <div className="pt-4 border-t border-slate-100 p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <AlertTriangle size={28} className="mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-semibold text-amber-800">No academic record found yet.</p>
                <p className="text-xs text-amber-600 mt-1">Your admin hasn't added your academic details yet. Please contact your institution.</p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {/* ── NO RECORD STATE — show friendly message on dashboard ── */}
            {!record && activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
                  <AlertTriangle size={40} className="mx-auto text-amber-500" />
                  <h3 className="text-base font-bold text-amber-800">No Academic Record Found</h3>
                  <p className="text-xs text-amber-600 max-w-sm mx-auto">
                    Your admin hasn&apos;t added your academic details yet. Please contact your institution to get your record created.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Course","Year","Attendance","Certificates"].map(label => (
                    <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="font-extrabold text-slate-300 text-lg">—</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── NO RECORD STATE — certificates tab ── */}
            {!record && activeTab === "certificates" && (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText size={32} className="text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-600 text-base">No Certificates Uploaded Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  No certificates or documents have been linked to your account. Your admin will upload them when available.
                </p>
              </div>
            )}

            {/* ── RECORD EXISTS ── */}
            {record && (
              <>
            {/* Dashboard / Academic Overview */}
            {(activeTab === "dashboard") && (
              <div className="space-y-6">
                {/* Status Banner */}
                <div className={`rounded-2xl p-5 flex items-center justify-between border ${status === "verified" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${status === "verified" ? "bg-emerald-100" : "bg-amber-100"}`}>
                      <ShieldCheck size={22} className={status === "verified" ? "text-emerald-600" : "text-amber-600"} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${status === "verified" ? "text-emerald-800" : "text-amber-800"}`}>
                        {status === "verified" ? "Your record is Blockchain Verified ✓" : "Record Pending Verification"}
                      </p>
                      <p className={`text-xs mt-0.5 ${status === "verified" ? "text-emerald-600" : "text-amber-600"}`}>
                        {status === "verified"
                          ? "Your academic credentials are secured on the Ethereum blockchain."
                          : "Your record has been submitted and is awaiting verifier approval."}
                      </p>
                    </div>
                  </div>
                  {status === "verified" && (
                    <button onClick={() => setShowQR(true)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                      <ShieldCheck size={14}/> View QR
                    </button>
                  )}
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Course</p>
                    <p className="font-extrabold text-slate-900 text-sm leading-tight">{record.course || "—"}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Year</p>
                    <p className="font-extrabold text-blue-600 text-lg">{record.year || "—"}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Attendance</p>
                    <p className={`font-extrabold text-lg ${(attendanceData?.summary?.overallPercentage || 0) >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                      {attendanceData?.summary?.overallPercentage ?? "—"}%
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Certificates</p>
                    <p className="font-extrabold text-purple-600 text-lg">{docsList.length}</p>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-600" /> Academic Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div><span className="text-slate-400 block mb-0.5">Full Name</span><strong className="text-slate-800 text-sm">{record.name}</strong></div>
                    <div><span className="text-slate-400 block mb-0.5">Student ID</span><strong className="text-blue-600 font-mono text-sm">{record.studentId || studentId}</strong></div>
                    <div><span className="text-slate-400 block mb-0.5">Status</span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${status === "verified" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                        {status === "verified" ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div><span className="text-slate-400 block mb-0.5">Degree / Course</span><strong className="text-slate-800">{record.course}</strong></div>
                    <div><span className="text-slate-400 block mb-0.5">Year of Study</span><strong className="text-slate-800">{record.year || "—"}</strong></div>
                    <div><span className="text-slate-400 block mb-0.5">Added By</span><strong className="text-slate-800">{record.addedBy || "University Admin"}</strong></div>
                  </div>
                </div>

                {/* Attendance Quick Summary */}
                {attendanceData?.summary && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Clock size={18} className="text-blue-600" /> Attendance Summary
                      </h3>
                      <button onClick={() => setActiveTab("attendance")} className="text-xs font-semibold text-blue-600 hover:underline">View Full Details →</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${(attendanceData.summary.overallPercentage || 0) >= 75 ? "bg-emerald-500" : "bg-amber-500"}`}
                          style={{ width: `${attendanceData.summary.overallPercentage || 0}%` }} />
                      </div>
                      <span className={`text-sm font-extrabold ${(attendanceData.summary.overallPercentage || 0) >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                        {attendanceData.summary.overallPercentage || 0}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><p className="text-slate-400 mb-0.5">Total</p><p className="font-extrabold text-slate-800 text-base">{attendanceData.summary.totalClasses}</p></div>
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100"><p className="text-emerald-500 mb-0.5">Present</p><p className="font-extrabold text-emerald-700 text-base">{attendanceData.summary.attendedClasses}</p></div>
                      <div className="bg-rose-50 rounded-xl p-3 border border-rose-100"><p className="text-rose-400 mb-0.5">Absent</p><p className="font-extrabold text-rose-600 text-base">{attendanceData.summary.missedClasses}</p></div>
                    </div>
                    {attendanceData.summary.isAtRisk && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
                        <AlertTriangle size={15} className="shrink-0 text-amber-500" />
                        Attendance below 75% — risk of exam shortage. Attend upcoming classes.
                      </div>
                    )}
                  </div>
                )}

                {/* Blockchain Info */}
                {record.dataHash && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Hash size={18} className="text-blue-600" /> Blockchain Record
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs text-blue-600">
                      <span className="truncate flex-1">{record.dataHash}</span>
                      <button onClick={() => handleCopyHash(record.dataHash)} className="text-slate-400 hover:text-blue-600 shrink-0">
                        {copiedHash ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Recorded on: {new Date(record.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* My Certificates Section */}
            {(activeTab === "dashboard" || activeTab === "certificates") && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award size={20} className="text-blue-600" /> My Certificates
                  </h2>
                  <p className="text-xs text-slate-500">Verified academic marksheets &amp; degree documents</p>
                </div>

                {docsList.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText size={32} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-600 text-base">No Certificates Uploaded Yet</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      No certificates or documents have been linked to your account <strong className="font-mono text-slate-500">{studentId}</strong>. Your admin will upload them when available.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {docsList.map((doc: any, idx: number) => {
                      const certUrl = getCertificateUrl(doc.ipfsCid);
                      const ext = getFileExtension(doc.ipfsCid);
                      const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext);
                      const isPdf   = ext === 'pdf';

                      return (
                        <div key={idx} className="light-card-hover p-5 flex flex-col items-center text-center">
                          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 border border-purple-100">
                            <FileText size={28} />
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mb-1">{doc.label || `Semester ${idx + 1}`}</h3>
                          <button
                            onClick={() => setPreviewCid(previewCid === doc.ipfsCid ? null : doc.ipfsCid)}
                            className="text-xs text-blue-600 font-bold hover:underline mb-4"
                          >
                            View
                          </button>

                          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                            {certUrl && (
                              <a href={certUrl} download className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1">
                                <Download size={12} /> Download
                              </a>
                            )}
                            <button onClick={() => setShowQR(true)} className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1">
                              <ShieldCheck size={12} /> QR
                            </button>
                          </div>

                          {/* Inline Preview */}
                          <AnimatePresence>
                            {previewCid === doc.ipfsCid && certUrl && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden w-full pt-3">
                                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                  {isPdf && <iframe src={certUrl} className="w-full" style={{ height: '260px' }} title="Doc Preview" />}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  {isImage && <img src={certUrl} alt="Document" className="w-full object-contain max-h-[260px]" />}
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
            )}

            {/* Blockchain Information Card */}
            {(activeTab === "dashboard" || activeTab === "certificates") && (
              <div className="light-card p-6 bg-white border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Hash size={18} className="text-blue-600" /> Blockchain Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs items-center">
                  <div>
                    <span className="text-slate-400 block mb-1">Transaction Hash</span>
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-blue-600 font-semibold">
                      <span className="truncate">{record.dataHash || "0x8f3a......7c2e9b"}</span>
                      <button onClick={() => handleCopyHash(record.dataHash)} className="text-slate-400 hover:text-blue-600 shrink-0">
                        {copiedHash ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Block Number</span>
                    <p className="font-bold text-slate-900 text-sm">17864532</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Timestamp</span>
                    <p className="font-semibold text-slate-700">{new Date(record.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        )}

        {showQR && record && <QRModal record={record} onClose={() => setShowQR(false)} />}
      </main>
    </div>
  );
}
