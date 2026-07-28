"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ShieldCheck, AlertTriangle,
  PlusCircle, Search, Activity, LogOut, Bell,
  Upload, FileText, Hash, X, Loader2, CheckCircle2, Clock,
  Award, ChevronRight, Check, Download, Eye, Trash2, UserPlus, GraduationCap
} from "lucide-react";
import { useRouter } from "next/navigation";
import QRModal from "@/components/QRModal";
import ExportPDF from "@/components/ExportPDF";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Sidebar Item ────────────────────────────────────────────────────────────
function SidebarItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-blue-50 text-blue-600 font-bold shadow-sm border border-blue-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={18} className={active ? "text-blue-600" : "text-slate-500"} />
      {label}
    </button>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600 border-blue-200",
    green:  "bg-emerald-50 text-emerald-600 border-emerald-200",
    red:    "bg-rose-50 text-rose-600 border-rose-200",
    yellow: "bg-amber-50 text-amber-600 border-amber-200",
  };
  return (
    <div className="light-card p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colors[color]} shrink-0`}>
        <Icon size={26} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "verified")
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Verified</span>;
  if (status === "rejected")
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">Rejected</span>;
  return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">Pending</span>;
}

// ─── Add Record Wizard Modal (Screen 6 Mockup Stepper) ────────────────────────
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
  'B.Sc - Physics',
  'B.Sc - Mathematics',
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
  'M.Sc - Physics',
  'M.Sc - Mathematics',
  'MCA - Computer Applications',
  'MBA - Business Administration',
  'M.Com - Commerce',
  'M.E - Software Engineering',
];

function AddRecordModal({ onClose, onAdd }: any) {
  const [step, setStep] = useState(1);
  const [courseCategory, setCourseCategory] = useState<'UG' | 'PG'>('UG');
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    course: UG_COURSES[0],
    year: "1st Year",
  });
  const [files, setFiles] = useState<{ file: File; title: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCategoryChange = (cat: 'UG' | 'PG') => {
    setCourseCategory(cat);
    setForm(f => ({ ...f, course: cat === 'UG' ? UG_COURSES[0] : PG_COURSES[0], year: '1st Year' }));
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const newEntries = selected.map(f => ({
      file: f,
      title: f.name.replace(/\.[^.]+$/, ""),
      description: "",
    }));
    setFiles(prev => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleFieldChange = (index: number, field: "title" | "description", val: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, [field]: val } : f));
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("role");
      if (!token || role !== "admin") {
        throw new Error("Access denied. Please log in with your Admin account (admin@blockedu.com).");
      }

      const formData = new FormData();
      formData.append("studentId", form.studentId);
      formData.append("name", form.fullName);
      formData.append("course", form.course);
      formData.append("year", form.year);
      formData.append("marks", "N/A");

      // Append all files with their titles, descriptions and labels
      files.forEach(({ file, title, description }) => {
        formData.append("certificate", file);
        formData.append("labels",       title);
        formData.append("titles",       title);
        formData.append("descriptions", description);
      });

      const res = await fetch(`${API_URL}/api/records/add`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add record");
      }

      setSuccess(true);
      await onAdd();
      setTimeout(onClose, 1800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steppers = [
    { num: 1, title: "Student Details" },
    { num: 2, title: "Academic Details" },
    { num: 3, title: "Upload Documents" },
    { num: 4, title: "Preview & Submit" }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-8 relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X size={20}/>
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PlusCircle size={22} className="text-blue-600"/> Add New Record
        </h2>

        {/* Stepper Header (Screen 6 Mockup) */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {steppers.map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === s.num ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                step > s.num ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {step > s.num ? <Check size={16} strokeWidth={3} /> : s.num}
              </div>
              <span className={`text-xs font-semibold ${step === s.num ? "text-blue-600" : "text-slate-400"}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center py-10 gap-3 text-emerald-600">
            <CheckCircle2 size={56}/>
            <p className="text-xl font-bold">Record Submitted Successfully!</p>
            <p className="text-sm text-slate-500 text-center">Record is now queued for Verifier review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Student Details */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name</label>
                  <input
                    type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                    placeholder="Enter full name" className="w-full light-input py-2.5 px-3.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Student ID / Roll No</label>
                  <input
                    type="text" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}
                    placeholder="Enter student ID (e.g. S1006)" className="w-full light-input py-2.5 px-3.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Email Address</label>
                  <input
                    type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="Enter email address" className="w-full light-input py-2.5 px-3.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Phone Number</label>
                  <input
                    type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="Enter phone number" className="w-full light-input py-2.5 px-3.5 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Academic Details */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Course Category Toggle */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Course Category</label>
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

                {/* Course Dropdown — filtered by category */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Degree / Course
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${courseCategory === 'UG' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {courseCategory}
                    </span>
                  </label>
                  <select
                    value={form.course}
                    onChange={e => setForm({ ...form, course: e.target.value })}
                    className="w-full light-input py-2.5 px-3.5 text-sm bg-white"
                  >
                    {(courseCategory === 'UG' ? UG_COURSES : PG_COURSES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Year</label>
                  <select
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    className="w-full light-input py-2.5 px-3.5 text-sm bg-white"
                  >
                    {(courseCategory === 'UG'
                      ? ['1st Year', '2nd Year', '3rd Year', '4th Year']
                      : ['1st Year', '2nd Year']
                    ).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Upload Certificates / Documents (PDF or Image)</label>
                  <span className="text-xs text-slate-400">{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
                </div>

                {/* Drop zone */}
                <label className="flex flex-col items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                  <Upload size={28} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Click to add files (multiple allowed)</span>
                  <span className="text-xs text-slate-400">PDF, PNG, JPG up to 20MB each</span>
                  <input type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleFileAdd} />
                </label>

                {/* File list with title + description editors */}
                {files.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {files.map(({ file, title, description }, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                        {/* File header */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-blue-600" />
                          </div>
                          <p className="text-xs text-slate-500 truncate flex-1">{file.name} <span className="text-slate-300">({(file.size/1024).toFixed(0)} KB)</span></p>
                          <button type="button" onClick={() => handleRemoveFile(i)} className="text-rose-400 hover:text-rose-600 transition-colors shrink-0">
                            <X size={15} />
                          </button>
                        </div>
                        {/* Title */}
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5 block">Title</label>
                          <input
                            type="text"
                            value={title}
                            onChange={e => handleFieldChange(i, "title", e.target.value)}
                            placeholder="e.g. Semester 1 Marksheet"
                            className="w-full text-xs light-input py-1.5 px-2.5"
                          />
                        </div>
                        {/* Description */}
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5 block">Description</label>
                          <textarea
                            value={description}
                            onChange={e => handleFieldChange(i, "description", e.target.value)}
                            placeholder="Brief description of this document..."
                            rows={2}
                            className="w-full text-xs light-input py-1.5 px-2.5 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {files.length === 0 && (
                  <p className="text-xs text-slate-400 text-center">No files added yet. You can skip this step and add documents later.</p>
                )}
              </div>
            )}

            {/* Step 4: Preview & Submit */}
            {step === 4 && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Record Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-slate-500">Name:</span> <strong className="text-slate-900">{form.fullName || "—"}</strong></div>
                  <div><span className="text-slate-500">Student ID:</span> <strong className="text-blue-600 font-mono">{form.studentId || "—"}</strong></div>
                  <div>
                    <span className="text-slate-500">Category:</span>{' '}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ml-1 ${courseCategory === 'UG' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {courseCategory}
                    </span>
                  </div>
                  <div><span className="text-slate-500">Course:</span> <strong className="text-slate-900">{form.course}</strong></div>
                  <div><span className="text-slate-500">Year:</span> <strong className="text-amber-600">{form.year}</strong></div>
                  <div><span className="text-slate-500">Documents:</span> <strong className="text-purple-600">{files.length} file{files.length !== 1 ? "s" : ""}</strong></div>
                </div>
                {files.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Attached Documents:</p>
                    {files.map(({ file, title, description }, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 space-y-0.5">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center shrink-0">
                            <FileText size={11} className="text-purple-600" />
                          </div>
                          <span className="font-semibold truncate">{title || file.name}</span>
                          <span className="text-slate-400 text-[10px] ml-auto shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                        {description && <p className="text-[10px] text-slate-500 pl-7 truncate">{description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button" disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="btn-secondary px-5 py-2.5 text-xs disabled:opacity-40"
              >
                Previous
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="btn-primary px-6 py-2.5 text-xs flex items-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button" disabled={loading || !form.studentId || !form.fullName}
                  onClick={handleSubmit}
                  className="btn-primary px-6 py-2.5 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Record"}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

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

function DocumentModal({ record, onClose, onRefresh }: { record: any; onClose: () => void; onRefresh?: () => void }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const initialDocs = record.documents && record.documents.length > 0
    ? record.documents
    : (record.ipfsCid && record.ipfsCid !== 'QmNoFile'
        ? [{ ipfsCid: record.ipfsCid, label: 'Student Certificate Document', uploadedAt: record.createdAt, _id: 'raw' }]
        : []);
  const [docs, setDocs] = useState(initialDocs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteDocument = async (docObj: any) => {
    const docId = docObj._id || docObj.ipfsCid || docObj.filename;
    if (!docId) return;
    if (!confirm(`Are you sure you want to delete "${docObj.label || docObj.title || 'this document'}"?`)) return;

    setDeletingId(docId);
    try {
      const res = await fetch(`${API_URL}/api/records/document/${encodeURIComponent(record.studentId)}/${encodeURIComponent(docId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete document');
      
      setDocs((prev: any[]) => prev.filter(d => (d._id || d.ipfsCid || d.filename) !== docId));
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} /> Student Document PDF Preview & Management
            </h3>
            <p className="text-xs text-slate-500">{record.name} ({record.studentId}) — {record.course}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {docs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText size={40} className="mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-sm text-slate-600">No documents remaining for this record.</p>
              <p className="text-xs text-slate-400 mt-1">You can export the official digital Academic Certificate PDF below.</p>
              <div className="mt-4 flex justify-center">
                <ExportPDF record={record} />
              </div>
            </div>
          ) : (
            docs.map((doc: any, i: number) => {
              const certUrl = getCertificateUrl(doc.ipfsCid);
              const ext = getFileExtension(doc.ipfsCid);
              const isPdf = ext === 'pdf';
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
              const docIdentifier = doc._id || doc.ipfsCid || doc.filename;

              return (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{doc.label || doc.title || `Document #${i + 1}`}</h4>
                      {doc.description && <p className="text-xs text-slate-500 mb-1">{doc.description}</p>}
                      <p className="text-xs text-slate-400 font-mono">{doc.ipfsCid}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {certUrl && (
                        <a href={certUrl} download target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1">
                          <Download size={13} /> Download File
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deletingId === docIdentifier}
                        className="px-3 py-1.5 text-xs flex items-center gap-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors font-semibold disabled:opacity-50"
                        title="Delete this document"
                      >
                        {deletingId === docIdentifier ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Delete
                      </button>
                    </div>
                  </div>
                  {certUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white min-h-[350px]">
                      {isPdf && (
                        <iframe src={certUrl} className="w-full h-[380px]" title="PDF Viewer" />
                      )}
                      {isImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={certUrl} alt="Document" className="w-full object-contain max-h-[380px] p-2" />
                      )}
                      {!isPdf && !isImage && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Preview not supported for .{ext} files. <a href={certUrl} download className="text-blue-600 font-bold underline">Click to Download</a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-rose-500">Document URL unavailable</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload More Docs Modal (Admin → Existing Student) ────────────────────────
function UploadDocsModal({ record, onClose, onUploaded }: { record: any; onClose: () => void; onUploaded: () => void }) {
  const [files, setFiles] = useState<{ file: File; title: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const newEntries = selected.map(f => ({
      file: f,
      title: f.name.replace(/\.[^.]+$/, ""),
      description: "",
    }));
    setFiles(prev => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleFieldChange = (i: number, field: "title" | "description", val: string) =>
    setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  const handleRemove = (i: number) =>
    setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (files.length === 0) { setErrorMsg("Please select at least one file."); return; }
    setLoading(true); setErrorMsg("");
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      files.forEach(({ file, title, description }) => {
        formData.append("certificate", file);
        formData.append("labels",       title);
        formData.append("titles",       title);
        formData.append("descriptions", description);
      });
      const res = await fetch(`${API_URL}/api/records/upload-doc/${encodeURIComponent(record.studentId)}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSuccess(true);
      onUploaded();
      setTimeout(onClose, 1600);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-7 relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Upload size={20} className="text-blue-600" /> Upload Documents
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          {record.name} <span className="font-mono text-blue-600">({record.studentId})</span> — {record.course}
        </p>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3 text-emerald-600">
            <CheckCircle2 size={48} />
            <p className="font-bold text-base">Documents Uploaded!</p>
            <p className="text-xs text-slate-500">The files are now attached to this student record.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" /> {errorMsg}
              </div>
            )}

            {/* Drop zone */}
            <label className="flex flex-col items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
              <Upload size={26} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Click to select files</span>
              <span className="text-xs text-slate-400">PDF, PNG, JPG — multiple allowed</span>
              <input type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleFileAdd} />
            </label>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-slate-600">{files.length} file{files.length !== 1 ? "s" : ""} queued</p>
                {files.map(({ file, title, description }, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    {/* File header */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-blue-600" />
                      </div>
                      <p className="text-xs text-slate-500 truncate flex-1">{file.name} <span className="text-slate-300">({(file.size/1024).toFixed(0)} KB)</span></p>
                      <button type="button" onClick={() => handleRemove(i)} className="text-rose-400 hover:text-rose-600 shrink-0">
                        <X size={15} />
                      </button>
                    </div>
                    {/* Title */}
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5 block">Title</label>
                      <input
                        type="text" value={title}
                        onChange={e => handleFieldChange(i, "title", e.target.value)}
                        placeholder="e.g. Semester 2 Certificate"
                        className="w-full text-xs light-input py-1.5 px-2.5"
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5 block">Description</label>
                      <textarea
                        value={description}
                        onChange={e => handleFieldChange(i, "description", e.target.value)}
                        placeholder="Brief description of this document..."
                        rows={2}
                        className="w-full text-xs light-input py-1.5 px-2.5 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button type="button" onClick={onClose} className="btn-secondary px-5 py-2.5 text-xs">Cancel</button>
              <button
                type="button" disabled={loading || files.length === 0}
                onClick={handleUpload}
                className="btn-primary px-6 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload {files.length > 0 ? `${files.length} File${files.length > 1 ? "s" : ""}` : "Files"}</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Admin Dashboard Component ───────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [records, setRecords] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [qrRecord, setQrRecord] = useState<any>(null);
  const [docPreviewRecord, setDocPreviewRecord] = useState<any>(null);
  const [uploadDocsRecord, setUploadDocsRecord] = useState<any>(null);

  // Faculty management state
  const [facultyList, setFacultyList]       = useState<any[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [facultyForm, setFacultyForm]       = useState({ name: '', email: '', password: '', phone: '', department: '', designation: '' });
  const [facultyFormError, setFacultyFormError]   = useState('');
  const [facultyFormSuccess, setFacultyFormSuccess] = useState('');
  const [facultyFormLoading, setFacultyFormLoading] = useState(false);

  // Attendance state
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [attendanceTxs, setAttendanceTxs]     = useState<any[]>([]);
  const [corrections, setCorrections]         = useState<any[]>([]);
  const [aiInsights, setAiInsights]           = useState<any>(null);

  const handleDelete = async (studentId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the student record for ${name} (${studentId})?`)) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/records/${encodeURIComponent(studentId)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete record");

      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete record");
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const [recRes, logRes] = await Promise.all([
        fetch(`${API_URL}/api/records`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/records/logs/all`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (recRes.ok) setRecords(await recRes.json());
      if (logRes.ok) setLogs(await logRes.json());

      await fetchAttendanceData(token);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchFaculty = async () => {
    setFacultyLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/admin/faculty`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setFacultyList(data.faculty || []);
    } catch (err) {
      console.error("Faculty fetch error:", err);
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacultyFormError('');
    setFacultyFormSuccess('');
    setFacultyFormLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/admin/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(facultyForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add faculty');
      setFacultyFormSuccess(`Faculty member "${facultyForm.name}" added successfully!`);
      setFacultyForm({ name: '', email: '', password: '', phone: '', department: '', designation: '' });
      fetchFaculty();
    } catch (err: any) {
      setFacultyFormError(err.message);
    } finally {
      setFacultyFormLoading(false);
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!confirm(`Remove faculty member "${name}"? They will no longer be able to log in.`)) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/admin/faculty/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      fetchFaculty();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchAttendanceData = async (token: string) => {
    try {
      const [statsRes, txsRes, corrRes, aiRes] = await Promise.all([
        fetch(`${API_URL}/api/attendance/admin/stats`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/attendance/admin/transactions`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/attendance/admin/corrections`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/attendance/ai-insights`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setAttendanceStats(d.stats);
      }
      if (txsRes.ok) {
        const d = await txsRes.json();
        setAttendanceTxs(d.transactions);
      }
      if (corrRes.ok) {
        const d = await corrRes.json();
        setCorrections(d.corrections);
      }
      if (aiRes.ok) {
        const d = await aiRes.json();
        setAiInsights(d);
      }
    } catch (e) {
      console.warn("Attendance admin fetch error:", e);
    }
  };

  const handleApproveCorrection = async (correctionId: string, decision: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/attendance/admin/approve-correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ correctionId, decision })
      });
      if (res.ok) {
        alert(`Correction request ${decision}!`);
        fetchAttendanceData(token || '');
      }
    } catch (e: any) {
      alert(e.message || 'Error processing correction');
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role  = localStorage.getItem("role");
      if (!token || role !== "admin") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        router.push("/admin");
      } else {
        fetchData();
        fetchFaculty();
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    router.push("/admin");
  };

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.studentId.toLowerCase().includes(search.toLowerCase()) ||
    r.course.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    records.length,
    pending:  records.filter(r => r.status === "pending").length,
    verified: records.filter(r => r.status === "verified").length,
    rejected: records.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ── Sidebar (Screen 3 Mockup) ── */}
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
            { id: "records",   icon: FileText,        label: "Students & Records" },
            { id: "faculty",   icon: UserPlus,        label: "Faculty Management" },
            { id: "attendance",icon: Clock,           label: "Attendance & On-Chain Logs" },
            { id: "logs",      icon: Activity,        label: "Activity Logs" },
          ].map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">System Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@blockedu.com</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-all">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Dashboard Content ── */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, Admin 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">Here&apos;s what is happening today in your academic node</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition-colors">
              <Bell size={18}/>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <PlusCircle size={16}/> Add Record
            </button>
          </div>
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Students"   value={stats.total}    icon={Users}         color="blue"   />
              <StatCard label="Pending Records"  value={stats.pending}  icon={Clock}         color="yellow" />
              <StatCard label="Verified Records" value={stats.verified} icon={ShieldCheck}   color="green"  />
              <StatCard label="Rejected Records" value={stats.rejected} icon={AlertTriangle} color="red"    />
            </div>

            {/* Pending alert banner */}
            {stats.pending > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-amber-600 shrink-0" />
                  <span className="text-sm font-semibold text-amber-800">
                    <strong>{stats.pending}</strong> student record{stats.pending > 1 ? "s are" : " is"} awaiting verification by the Verifier.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("records")}
                  className="text-xs font-bold text-amber-700 hover:underline shrink-0 ml-4"
                >
                  View Pending →
                </button>
              </div>
            )}

            {/* Grid: Recent Records + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Records Table */}
              <div className="lg:col-span-2 light-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> Recent Records
                  </h2>
                  <button onClick={() => setActiveTab("records")} className="text-xs font-semibold text-blue-600 hover:underline">View All ({records.length})</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-left border-b border-slate-100 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Student ID</th>
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4">Course</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.slice(0, 6).map((r, i) => (
                        <tr key={r.id || r._id || i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 pr-4 font-mono text-blue-600 font-bold">{r.studentId}</td>
                          <td className="py-3.5 pr-4 font-semibold text-slate-800">{r.name}</td>
                          <td className="py-3.5 pr-4 text-slate-600 max-w-[180px] truncate">{r.course}</td>
                          <td className="py-3.5"><StatusBadge status={r.status}/></td>
                        </tr>
                      ))}
                      {records.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-slate-400">No records yet. Click &quot;Add Record&quot; to get started.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="light-card p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-purple-600"/> Activity Feed
                </h2>
                <div className="space-y-4">
                  {logs.slice(0, 7).map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        log.severity === "success" ? "bg-emerald-500" :
                        log.severity === "danger"  ? "bg-rose-500" :
                        log.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate capitalize">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-slate-500 truncate">{log.target || '—'} · {log.actor}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-xs text-slate-400 italic">No recent activity.</p>}
                </div>
              </div>
            </div>

            {/* Status breakdown bar */}
            {records.length > 0 && (
              <div className="light-card p-6 space-y-3">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award size={16} className="text-blue-600"/> Record Status Overview
                </h2>
                <div className="flex h-4 rounded-full overflow-hidden w-full">
                  {stats.verified > 0 && (
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${(stats.verified / stats.total) * 100}%` }}
                      title={`Verified: ${stats.verified}`}
                    />
                  )}
                  {stats.pending > 0 && (
                    <div
                      className="bg-amber-400 transition-all"
                      style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                      title={`Pending: ${stats.pending}`}
                    />
                  )}
                  {stats.rejected > 0 && (
                    <div
                      className="bg-rose-400 transition-all"
                      style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                      title={`Rejected: ${stats.rejected}`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Verified ({stats.verified})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/> Pending ({stats.pending})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"/> Rejected ({stats.rejected})</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Records Tab ── */}
        {activeTab === "records" && (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                type="text"
                placeholder="Search by name, ID, or course..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full light-input py-2.5 pl-11 pr-4 text-sm bg-white"
              />
            </div>

            <div className="light-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Year</th>
                      <th className="px-6 py-4">Documents</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r, i) => (
                      <tr key={r._id || i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-blue-600 font-bold">{r.studentId}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{r.name}</td>
                        <td className="px-6 py-4 text-slate-600">{r.course}</td>
                        <td className="px-6 py-4 text-slate-600">{r.year || '—'}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDocPreviewRecord(r)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            {r.documents?.length || 0} File(s)
                          </button>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={r.status}/></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setUploadDocsRecord(r)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 transition-colors"
                              title="Upload More Documents"
                            >
                              <Upload size={13} /> Upload
                            </button>

                            {r.status === "verified" && (
                              <>
                                <button onClick={() => setQrRecord(r)} className="text-xs text-blue-600 font-semibold hover:underline px-1">QR</button>
                                <ExportPDF record={r}/>
                              </>
                            )}

                            {r.status === "pending" && <span className="text-xs text-amber-600 italic">Awaiting Verifier</span>}

                            <button
                              onClick={() => handleDelete(r.studentId, r.name)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors ml-auto"
                              title="Delete Student Record"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Attendance & On-Chain Logs Tab ── */}
        {activeTab === "attendance" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Attendance Operations & Blockchain Monitor
                </h2>
                <p className="text-xs text-slate-500 mt-1">Real-time attendance statistics, correction approvals, and smart contract logs</p>
              </div>

              <button
                onClick={() => fetchAttendanceData(localStorage.getItem("authToken") || "")}
                className="btn-secondary text-xs px-3.5 py-2"
              >
                Refresh Data
              </button>
            </div>

            {/* AI Risk Insights Alert Panel */}
            {aiInsights?.atRiskCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  AI Attendance Risk Prediction ({aiInsights.atRiskCount} At-Risk Student(s))
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-amber-200 text-xs space-y-1 shadow-sm">
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>{rec.name} ({rec.studentId})</span>
                        <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">{rec.currentPercentage}%</span>
                      </div>
                      <p className="text-slate-600">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrections Request Approval Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Pending Attendance Correction Requests ({corrections.length})
              </h3>
              {corrections.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No pending correction requests.</p>
              ) : (
                <div className="space-y-3">
                  {corrections.map((c: any) => (
                    <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{c.student_name || c.student_id}</span>
                        <span className="text-slate-500">Subject: {c.subject_id} | Date: {c.attendance_date}</span>
                        <span className="text-slate-500 block mt-0.5">Requested: <strong className="text-blue-600">{c.requested_status}</strong> (Reason: {c.reason})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveCorrection(c.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveCorrection(c.id, 'rejected')}
                          className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blockchain Transaction Monitor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Attendance Blockchain Transaction Logs
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4">Batch ID</th>
                      <th className="py-3 px-4">Transaction Hash</th>
                      <th className="py-3 px-4">SHA-256 Hash</th>
                      <th className="py-3 px-4">Block #</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceTxs.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-slate-400">No blockchain transaction logs available yet.</td></tr>
                    ) : (
                      attendanceTxs.map((tx: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 font-mono">
                          <td className="py-3 px-4 font-bold text-slate-800">{tx.attendance_id}</td>
                          <td className="py-3 px-4 text-emerald-600 max-w-[200px] truncate">{tx.transaction_hash}</td>
                          <td className="py-3 px-4 text-blue-600 max-w-[200px] truncate">{tx.attendance_hash}</td>
                          <td className="py-3 px-4 text-slate-700">#{tx.block_number || 12450}</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Faculty Management Tab ── */}
        {activeTab === "faculty" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus size={22} className="text-blue-600" /> Faculty Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">Add, view and remove faculty members</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchFaculty} className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5">
                  <Activity size={14}/> Refresh
                </button>
                <button
                  onClick={() => { setShowAddFaculty(!showAddFaculty); setFacultyFormError(''); setFacultyFormSuccess(''); }}
                  className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <PlusCircle size={14}/> {showAddFaculty ? 'Cancel' : 'Add Faculty'}
                </button>
              </div>
            </div>

            {/* Add Faculty Form */}
            {showAddFaculty && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserPlus size={16} className="text-blue-600" /> Add New Faculty Member
                </h3>

                {facultyFormError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0"/> {facultyFormError}
                  </div>
                )}
                {facultyFormSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0"/> {facultyFormSuccess}
                  </div>
                )}

                <form onSubmit={handleAddFaculty} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name <span className="text-rose-500">*</span></label>
                    <input type="text" required value={facultyForm.name}
                      onChange={e => setFacultyForm({...facultyForm, name: e.target.value})}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      className="w-full light-input py-2.5 px-3.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Email Address <span className="text-rose-500">*</span></label>
                    <input type="email" required value={facultyForm.email}
                      onChange={e => setFacultyForm({...facultyForm, email: e.target.value})}
                      placeholder="e.g. ramesh@blockedu.com"
                      className="w-full light-input py-2.5 px-3.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Password <span className="text-rose-500">*</span></label>
                    <input type="password" required value={facultyForm.password}
                      onChange={e => setFacultyForm({...facultyForm, password: e.target.value})}
                      placeholder="Set a login password"
                      className="w-full light-input py-2.5 px-3.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Phone Number</label>
                    <input type="text" value={facultyForm.phone}
                      onChange={e => setFacultyForm({...facultyForm, phone: e.target.value})}
                      placeholder="e.g. 9876543210"
                      className="w-full light-input py-2.5 px-3.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Department</label>
                    <input type="text" value={facultyForm.department}
                      onChange={e => setFacultyForm({...facultyForm, department: e.target.value})}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full light-input py-2.5 px-3.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Designation</label>
                    <input type="text" value={facultyForm.designation}
                      onChange={e => setFacultyForm({...facultyForm, designation: e.target.value})}
                      placeholder="e.g. Assistant Professor"
                      className="w-full light-input py-2.5 px-3.5 text-sm" />
                  </div>
                  <div className="sm:col-span-2 flex justify-end pt-2 border-t border-slate-100">
                    <button type="submit" disabled={facultyFormLoading}
                      className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2 disabled:opacity-50">
                      {facultyFormLoading
                        ? <><Loader2 size={14} className="animate-spin"/> Adding...</>
                        : <><UserPlus size={14}/> Add Faculty Member</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Faculty List Table */}
            <div className="light-card overflow-hidden">
              {facultyLoading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 size={28} className="animate-spin text-blue-600" />
                  <p className="text-sm">Loading faculty members...</p>
                </div>
              ) : facultyList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <GraduationCap size={36} className="mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">No faculty members found.</p>
                  <p className="text-xs">Click &quot;Add Faculty&quot; to create the first faculty account.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {facultyList.map((f, i) => (
                        <tr key={f.id || i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                {f.name?.charAt(0) || 'F'}
                              </div>
                              <span className="font-semibold text-slate-900">{f.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{f.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                              Faculty
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteFaculty(f.id, f.name)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                            >
                              <Trash2 size={13}/> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Logs Tab ── */}
        {activeTab === "logs" && (
          <div className="light-card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Activity size={18} className="text-purple-600"/> All Activity Logs</h2>
            <div className="divide-y divide-slate-100">
              {logs.map((log, i) => (
                <div key={i} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <div>
                      <p className="font-bold text-slate-800">{log.action}</p>
                      <p className="text-slate-500">{log.target} · {log.actor}</p>
                    </div>
                  </div>
                  <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onAdd={async () => { await fetchData(); setActiveTab("records"); }}
        />
      )}
      {qrRecord         && <QRModal record={qrRecord} onClose={() => setQrRecord(null)}/>}
      {docPreviewRecord && <DocumentModal record={docPreviewRecord} onClose={() => setDocPreviewRecord(null)} onRefresh={fetchData}/>}
      {uploadDocsRecord && <UploadDocsModal record={uploadDocsRecord} onClose={() => setUploadDocsRecord(null)} onUploaded={fetchData}/>}
    </div>
  );
}
