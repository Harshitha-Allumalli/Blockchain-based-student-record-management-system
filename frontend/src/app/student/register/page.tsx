"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, Eye, EyeOff, ArrowLeft, Loader2,
  CheckCircle2, Mail, ShieldCheck, User, Hash, Lock,
  Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STEPS = [
  { num: 1, title: "Personal Info" },
  { num: 2, title: "Verify Email" },
  { num: 3, title: "Set Password" },
  { num: 4, title: "Complete" },
];

export default function StudentRegister() {
  const router = useRouter();

  // Form State
  const [name,            setName]            = useState("");
  const [studentId,       setStudentId]       = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp,             setOtp]             = useState("");

  // Stepper State
  const [step, setStep] = useState(1);

  // Verification State
  const [isOtpSent,       setIsOtpSent]       = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [countdown,       setCountdown]       = useState(0);

  // UI State
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Loading States
  const [loadingSend,     setLoadingSend]     = useState(false);
  const [loadingVerify,   setLoadingVerify]   = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email) { showToast("Please enter an email address", "warning"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showToast("Please enter a valid email format", "error"); return; }

    setLoadingSend(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");
      showToast("Verification code sent to your email!", "success");
      setIsOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingSend(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { showToast("Please enter a valid 6-digit code", "warning"); return; }
    setLoadingVerify(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");
      showToast("Email verified successfully!", "success");
      setIsEmailVerified(true);
      setIsOtpSent(false);
      setStep(3); // Move to password step
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) { showToast("Please verify your email first", "warning"); return; }
    if (password !== confirmPassword) { showToast("Passwords do not match", "error"); return; }
    if (password.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }

    setLoadingRegister(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, studentId, role: "student" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      showToast("Registration successful! Redirecting...", "success");
      setStep(4);
      setTimeout(() => router.push("/student/login"), 2500);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

        {/* ── Left Graphic Side ── */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <Link href="/student/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors mb-8">
              <ArrowLeft size={16} /> Back to Login
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <GraduationCap size={22} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">BlockEdu</span>
            </div>
          </div>

          <div className="my-12 flex flex-col items-center text-center z-10">
            <div className="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 mb-6 backdrop-blur-md">
              <GraduationCap size={56} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Create Your Account</h2>
            <p className="text-sm text-blue-100/80 max-w-xs mb-6">
              Register to access your blockchain-verified academic credentials
            </p>

            {/* Progress Steps Preview */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {STEPS.map((s) => (
                <div key={s.num} className={`flex items-center gap-3 text-sm transition-all ${
                  step >= s.num ? "text-white" : "text-white/40"
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step > s.num ? "bg-emerald-400 text-white" :
                    step === s.num ? "bg-white text-blue-600" : "bg-white/20 text-white/40"
                  }`}>
                    {step > s.num ? <Check size={13} strokeWidth={3} /> : s.num}
                  </div>
                  <span className={`font-medium ${step === s.num ? "font-bold" : ""}`}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-blue-200/60 text-center z-10">
            Secured by Blockchain Cryptography
          </div>
        </div>

        {/* ── Right Form Side ── */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">

          {/* Stepper Indicator (Top) */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.num  ? "bg-emerald-500 text-white" :
                  step === s.num ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                  "bg-slate-100 text-slate-400"
                }`}>
                  {step > s.num ? <Check size={14} strokeWidth={3} /> : s.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s.num ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Personal Information</h1>
              <p className="text-sm text-slate-500 mb-6">Enter your full name and unique student roll number</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full light-input py-3 pl-11 pr-4 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Student Roll Number (Unique)</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
                      placeholder="e.g. S1001 — must be unique"
                      className="w-full light-input py-3 pl-11 pr-4 text-sm font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">This ID is permanent and cannot be changed later.</p>
                </div>

                <button
                  type="button"
                  disabled={!name.trim() || !studentId.trim()}
                  onClick={() => setStep(2)}
                  className="w-full btn-primary py-3.5 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Email Verification →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Email Verification ── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Verify Your Email</h1>
              <p className="text-sm text-slate-500 mb-6">We&apos;ll send a 6-digit OTP to confirm your email address</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Email Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setIsEmailVerified(false); setIsOtpSent(false); }}
                        disabled={isEmailVerified}
                        placeholder="student@blockedu.com"
                        className="w-full light-input py-3 pl-11 pr-4 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    {isEmailVerified ? (
                      <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <CheckCircle2 size={16} /> Verified
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!email || countdown > 0 || loadingSend}
                        className="btn-primary px-4 py-2 text-xs shrink-0 disabled:opacity-50 min-w-[110px]"
                      >
                        {loadingSend ? <Loader2 size={14} className="animate-spin mx-auto" /> : countdown > 0 ? `Resend (${countdown}s)` : "Send OTP"}
                      </button>
                    )}
                  </div>
                </div>

                {/* OTP Input Section */}
                <AnimatePresence>
                  {isOtpSent && !isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                        <label className="text-xs font-semibold text-blue-700 block">
                          Enter the 6-digit code sent to <strong>{email}</strong>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                            maxLength={6}
                            disabled={loadingVerify}
                            placeholder="000000"
                            className="flex-1 light-input py-3 px-4 text-center tracking-[0.5em] text-lg font-mono font-bold text-blue-700"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otp.length !== 6 || loadingVerify}
                            className="btn-primary px-5 text-xs disabled:opacity-50"
                          >
                            {loadingVerify ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary w-full py-3 text-xs"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Set Password ── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create Password</h1>
              <p className="text-sm text-slate-500 mb-6">Choose a strong password of at least 6 characters</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Min 6 characters"
                      className="w-full light-input py-3 pl-11 pr-11 text-sm"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      placeholder="Re-enter password"
                      className={`w-full light-input py-3 pl-11 pr-11 text-sm ${
                        confirmPassword && confirmPassword !== password ? "border-rose-400 bg-rose-50/40" : ""
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Summary Preview */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{name}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Student ID:</span> <strong className="font-mono text-blue-600">{studentId}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email:</span> <strong className="text-emerald-600">{email} ✓</strong></div>
                </div>

                <button
                  type="submit"
                  disabled={loadingRegister || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full btn-primary py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingRegister ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : "Complete Registration"}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Registration Complete!</h1>
              <p className="text-sm text-slate-500 max-w-xs">
                Your account has been created successfully. Redirecting you to login...
              </p>
              <Loader2 size={22} className="animate-spin text-blue-600 mt-2" />
            </motion.div>
          )}

          {/* Bottom Link */}
          {step < 4 && (
            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <Link href="/student/login" className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">
                Already have an account? Sign in here →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
