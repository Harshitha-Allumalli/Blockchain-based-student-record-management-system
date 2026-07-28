"use client";

import { useState } from "react";
import { X, Mail, Lock, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ForgotPasswordModalProps {
  onClose: () => void;
  defaultEmail?: string;
}

export default function ForgotPasswordModal({ onClose, defaultEmail = "" }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setMsg({ type: "error", text: "Please enter your email address." });

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code.");

      setMsg({ type: "success", text: data.message || "Verification code sent to your email!" });
      setStep(2);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return setMsg({ type: "error", text: "Verification code is required." });
    if (!newPassword) return setMsg({ type: "error", text: "Please enter a new password." });
    if (newPassword !== confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match." });
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed.");

      setMsg({ type: "success", text: data.message || "Password reset successfully!" });
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 sm:p-8 relative overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-500">
                {step === 1 ? "Step 1 of 2: Get verification code" : "Step 2 of 2: Set new password"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 border ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full light-input py-3 pl-11 pr-4 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                We will send a 6-digit verification code to this email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Verification Code (6 digits)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full light-input py-3 pl-11 pr-4 text-sm font-mono tracking-wider rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full light-input py-3 pl-11 pr-4 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full light-input py-3 pl-11 pr-4 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
