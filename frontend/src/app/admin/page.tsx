"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, ArrowLeft, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user?.role !== "admin") {
          setError("Access denied: Admin credentials required.");
          setLoading(false);
          return;
        }
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("role", data.user.role);
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setError("Server connection failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Left Graphic Side */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors mb-8">
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
              <ShieldCheck size={56} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Portal</h2>
            <p className="text-sm text-blue-100/80 max-w-xs">Secure system management, record issuance &amp; verification control panel</p>
          </div>

          <div className="text-xs text-blue-200/60 text-center z-10">
            Admin Email: admin@blockedu.com
          </div>
        </div>

        {/* Right Form Side */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome Back 👋</h1>
            <p className="text-sm text-slate-500">Sign in to your Admin Account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full light-input py-3 pl-11 pr-4 text-sm"
                  placeholder="admin@blockedu.com"
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
                  className="text-xs text-blue-600 font-semibold hover:underline"
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

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            {error && (
              <p className="text-rose-600 text-xs font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : "Sign In to Admin Console"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2">
            <Link href="/verifier" className="block text-xs font-semibold text-blue-600 hover:underline">
              Are you an employer/verifier? Sign in here →
            </Link>
            <Link href="/student/login" className="block text-xs font-medium text-slate-500 hover:text-slate-700">
              Are you a student? Sign in here →
            </Link>
          </div>
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
