"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, Check, ArrowRight, Lock, Globe, Zap, Search,
  GraduationCap, Building2, Laptop, Award, CheckCircle2,
  Users, BookOpen, BadgeCheck, Info, Phone, Mail
} from "lucide-react";
import Link from "next/link";

const ROLES = [
  { href: "/admin",        icon: ShieldCheck,   label: "Admin Portal",   color: "text-blue-600 bg-blue-50 border-blue-200",      desc: "Manage & issue tamper-proof student records and attendance analytics" },
  { href: "/faculty/login",icon: Laptop,        label: "Faculty Portal", color: "text-blue-600 bg-blue-50 border-blue-200",        desc: "Mark class attendance, generate SHA-256 hashes, and anchor on blockchain" },
  { href: "/student/login",icon: GraduationCap, label: "Student Portal", color: "text-purple-600 bg-purple-50 border-purple-200", desc: "View attendance history, subject percentages, QR proof, and certificates" },
  { href: "/verifier",     icon: Building2,     label: "Verifier Portal",color: "text-emerald-600 bg-emerald-50 border-emerald-200", desc: "Instantly verify any certificate or attendance record authenticity on-chain" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Immutable Blockchain Records",
    desc: "Every academic record is permanently hashed onto the Ethereum blockchain. Once stored, no one — not even the administrator — can alter the data.",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    link: "/admin",
    cta: "Issue Records →"
  },
  {
    icon: Search,
    title: "Instant Certificate Verification",
    desc: "Employers and institutions can verify any degree or certificate in under 2 seconds by entering a student ID or scanning the embedded QR code.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    link: "/verify",
    cta: "Verify a Certificate →"
  },
  {
    icon: Globe,
    title: "IPFS Decentralized Storage",
    desc: "Certificates and documents are stored on IPFS — a distributed file system that ensures high availability and censorship-resistant access worldwide.",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    link: "/student/login",
    cta: "View Your Docs →"
  },
  {
    icon: Zap,
    title: "SHA-256 Tamper Detection",
    desc: "Every record is cryptographically fingerprinted. If even a single character is changed, the system immediately flags it as tampered and alerts verifiers.",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    link: "/verify",
    cta: "Try Verification →"
  },
  {
    icon: Lock,
    title: "Role-Based Secure Access",
    desc: "Separate secured portals for Admins (issue records), Students (view credentials), and Verifiers (approve & verify). JWT-protected API routes.",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    link: "/admin",
    cta: "Admin Dashboard →"
  },
  {
    icon: Award,
    title: "AI Chatbot Assistant",
    desc: "Built-in Gemini-powered AI assistant answers questions about blockchain, verification, and how to navigate the platform — in English or Telugu.",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    link: "/student/login",
    cta: "Student Portal →"
  },
];

const CHECKMARKS = [
  "Immutable Records",
  "Instant Verification",
  "AI Assistant",
  "QR Code Certificates",
];

const ABOUT_POINTS = [
  { icon: BookOpen,    title: "Academic Focus",     desc: "Built specifically for universities and institutions managing degree certificates, transcripts, and professional diplomas." },
  { icon: BadgeCheck,  title: "Blockchain Integrity", desc: "Ethereum smart contracts ensure that records are stored permanently and are cryptographically verifiable by anyone, anywhere." },
  { icon: Users,       title: "Multi-Role System",  desc: "Three dedicated portals for Admins, Students, and Verifiers — each with tailored workflows and access controls." },
  { icon: Globe,       title: "JNTU Vizianagaram",  desc: "Developed as a capstone project for JNTU Vizianagaram — demonstrating real-world application of blockchain in education." },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span>BlockEdu</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="text-blue-600 font-semibold">Home</Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#roles"    className="hover:text-slate-900 transition-colors">Portals</a>
            <a href="#about"    className="hover:text-slate-900 transition-colors">About</a>
            <a href="#contact"  className="hover:text-slate-900 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all">
                Admin Login
              </button>
            </Link>
            <Link href="/student/login">
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
                Student Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-6">
              <ShieldCheck size={14} /> Blockchain Powered · JNTU Vizianagaram
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.15]">
              Student Record <br />
              <span className="text-brand-gradient">Management System</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              Store, Verify and Share Academic Records Securely using Blockchain Technology. Tamper-proof, instant, and globally accessible.
            </p>

            {/* Checkmark Bullets */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {CHECKMARKS.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/student/register">
                <button className="btn-primary px-7 py-3.5 text-base flex items-center gap-2">
                  Get Started <ArrowRight size={18} />
                </button>
              </Link>
              <a href="#about">
                <button className="btn-secondary px-7 py-3.5 text-base flex items-center gap-2">
                  <Info size={18} /> Learn More
                </button>
              </a>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="w-full max-w-lg">
              <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
                {/* Background circle */}
                <ellipse cx="280" cy="270" rx="220" ry="210" fill="#EEF2FF" opacity="0.8"/>

                {/* Clouds */}
                <ellipse cx="120" cy="75" rx="38" ry="18" fill="white" opacity="0.9"/>
                <ellipse cx="100" cy="80" rx="22" ry="14" fill="white" opacity="0.9"/>
                <ellipse cx="145" cy="80" rx="22" ry="14" fill="white" opacity="0.9"/>
                <ellipse cx="380" cy="55" rx="28" ry="13" fill="white" opacity="0.7"/>
                <ellipse cx="365" cy="60" rx="16" ry="10" fill="white" opacity="0.7"/>
                <ellipse cx="398" cy="60" rx="16" ry="10" fill="white" opacity="0.7"/>

                {/* University building (right background) */}
                <rect x="355" y="230" width="120" height="130" rx="2" fill="#C7D2FE" opacity="0.5"/>
                <rect x="365" y="220" width="100" height="20" rx="2" fill="#A5B4FC" opacity="0.6"/>
                <rect x="375" y="205" width="80" height="20" rx="2" fill="#818CF8" opacity="0.5"/>
                {/* Columns */}
                {[378,398,418,438,458].map((x,i) => (
                  <rect key={i} x={x} y="240" width="10" height="90" rx="2" fill="#818CF8" opacity="0.4"/>
                ))}
                <rect x="355" y="325" width="120" height="10" rx="1" fill="#818CF8" opacity="0.5"/>
                {/* Shield on building */}
                <path d="M440 195 L455 200 L455 218 Q455 228 440 233 Q425 228 425 218 L425 200 Z" fill="#0D9488"/>
                <path d="M440 195 L455 200 L455 218 Q455 228 440 233 Q425 228 425 218 L425 200 Z" fill="url(#shieldGrad)" opacity="0.9"/>
                <path d="M433 214 L438 219 L449 208" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

                {/* Blockchain nodes */}
                {/* Node lines */}
                <line x1="230" y1="95" x2="270" y2="60" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"/>
                <line x1="270" y1="60" x2="310" y2="95" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"/>
                <line x1="230" y1="95" x2="310" y2="95" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"/>
                <line x1="270" y1="60" x2="280" y2="130" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"/>
                <line x1="310" y1="95" x2="410" y2="185" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"/>

                {/* Block 1 - top center */}
                <g transform="translate(255,42)">
                  <path d="M15 0 L30 8 L30 24 L15 32 L0 24 L0 8 Z" fill="#6366F1"/>
                  <path d="M15 0 L30 8 L15 16 L0 8 Z" fill="#818CF8"/>
                  <path d="M0 8 L15 16 L15 32 L0 24 Z" fill="#4F46E5"/>
                  <path d="M30 8 L15 16 L15 32 L30 24 Z" fill="#4338CA"/>
                  <rect x="8" y="11" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
                  <rect x="14" y="8" width="4" height="4" rx="1" fill="white" opacity="0.5"/>
                </g>

                {/* Block 2 - mid left */}
                <g transform="translate(215,78)">
                  <path d="M15 0 L30 8 L30 24 L15 32 L0 24 L0 8 Z" fill="#6366F1"/>
                  <path d="M15 0 L30 8 L15 16 L0 8 Z" fill="#818CF8"/>
                  <path d="M0 8 L15 16 L15 32 L0 24 Z" fill="#4F46E5"/>
                  <path d="M30 8 L15 16 L15 32 L30 24 Z" fill="#4338CA"/>
                  <rect x="8" y="11" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
                  <rect x="14" y="8" width="4" height="4" rx="1" fill="white" opacity="0.5"/>
                </g>

                {/* Block 3 - mid right */}
                <g transform="translate(294,78)">
                  <path d="M15 0 L30 8 L30 24 L15 32 L0 24 L0 8 Z" fill="#6366F1"/>
                  <path d="M15 0 L30 8 L15 16 L0 8 Z" fill="#818CF8"/>
                  <path d="M0 8 L15 16 L15 32 L0 24 Z" fill="#4F46E5"/>
                  <path d="M30 8 L15 16 L15 32 L30 24 Z" fill="#4338CA"/>
                  <rect x="8" y="11" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
                  <rect x="14" y="8" width="4" height="4" rx="1" fill="white" opacity="0.5"/>
                </g>

                {/* Floating blue cube (left) */}
                <g transform="translate(62,130)">
                  <path d="M22 0 L44 11 L44 33 L22 44 L0 33 L0 11 Z" fill="#BAE6FD" opacity="0.7"/>
                  <path d="M22 0 L44 11 L22 22 L0 11 Z" fill="#7DD3FC" opacity="0.8"/>
                  <path d="M0 11 L22 22 L22 44 L0 33 Z" fill="#38BDF8" opacity="0.6"/>
                  <path d="M44 11 L22 22 L22 44 L44 33 Z" fill="#0EA5E9" opacity="0.5"/>
                  <rect x="12" y="14" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
                  <rect x="20" y="10" width="6" height="6" rx="1" fill="white" opacity="0.4"/>
                </g>

                {/* Laptop body */}
                <rect x="155" y="200" width="260" height="175" rx="12" fill="#1E1B4B"/>
                <rect x="163" y="208" width="244" height="160" rx="8" fill="white"/>
                {/* Laptop base */}
                <path d="M130 378 Q140 390 155 390 L415 390 Q430 390 440 378 Z" fill="#312E81"/>
                <rect x="200" y="382" width="170" height="6" rx="3" fill="#4C1D95" opacity="0.5"/>

                {/* Certificate on screen */}
                <rect x="175" y="218" width="220" height="142" rx="4" fill="#F8F9FF"/>
                <rect x="175" y="218" width="220" height="142" rx="4" fill="none" stroke="#C7D2FE" strokeWidth="1.5"/>
                {/* Certificate border */}
                <rect x="182" y="225" width="206" height="128" rx="2" fill="none" stroke="#A5B4FC" strokeWidth="1" strokeDasharray="3 2"/>

                {/* Hexagon logo on cert */}
                <path d="M285 240 L295 245 L295 257 L285 262 L275 257 L275 245 Z" fill="#6366F1"/>
                <text x="285" y="256" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">R</text>

                {/* "Student Record" text */}
                <text x="285" y="278" textAnchor="middle" fill="#3730A3" fontSize="13" fontWeight="bold">Student Record</text>

                {/* Record lines */}
                <text x="195" y="296" fill="#94A3B8" fontSize="8">Name</text>
                <rect x="218" y="290" width="80" height="1.5" rx="1" fill="#CBD5E1"/>
                <text x="195" y="308" fill="#94A3B8" fontSize="8">Roll Number</text>
                <rect x="228" y="302" width="70" height="1.5" rx="1" fill="#CBD5E1"/>
                <text x="195" y="320" fill="#94A3B8" fontSize="8">Course</text>
                <rect x="215" y="314" width="75" height="1.5" rx="1" fill="#CBD5E1"/>
                <text x="195" y="332" fill="#94A3B8" fontSize="8">Institution</text>
                <rect x="222" y="326" width="68" height="1.5" rx="1" fill="#CBD5E1"/>

                {/* Medal/badge on cert */}
                <circle cx="360" cy="330" r="12" fill="#DBEAFE"/>
                <circle cx="360" cy="330" r="12" fill="none" stroke="#3B82F6" strokeWidth="2"/>
                <circle cx="360" cy="330" r="7" fill="#1D4ED8"/>
                <rect x="356" y="342" width="8" height="6" fill="#FBBF24"/>
                <rect x="354" y="348" width="4" height="4" fill="#F59E0B"/>
                <rect x="362" y="348" width="4" height="4" fill="#F59E0B"/>

                {/* Student person */}
                {/* Body / hoodie */}
                <path d="M85 310 Q75 295 70 280 Q65 260 72 245 L90 240 Q95 255 95 270 L95 310 Z" fill="#3B5BDB"/>
                <path d="M125 310 Q135 295 140 280 Q145 260 138 245 L120 240 Q115 255 115 270 L115 310 Z" fill="#3B5BDB"/>
                <path d="M85 310 L95 270 L115 270 L125 310 Z" fill="#3B5BDB"/>
                {/* Backpack */}
                <rect x="118" y="248" width="28" height="45" rx="6" fill="#1E3A8A"/>
                <rect x="121" y="248" width="22" height="38" rx="4" fill="#1E40AF"/>
                <rect x="127" y="260" width="10" height="12" rx="2" fill="#1E3A8A"/>
                {/* Hood/neck */}
                <path d="M93 242 L90 255 L105 258 L120 255 L117 242 Q105 248 93 242 Z" fill="#4F46E5"/>
                {/* Head */}
                <ellipse cx="105" cy="225" rx="18" ry="20" fill="#FBBF24"/>
                {/* Hair */}
                <path d="M87 218 Q88 205 105 203 Q122 205 123 218 Q118 210 105 210 Q92 210 87 218 Z" fill="#1E293B"/>
                {/* Face */}
                <ellipse cx="99" cy="222" rx="3" ry="3.5" fill="#F3F4F6"/>
                <ellipse cx="111" cy="222" rx="3" ry="3.5" fill="#F3F4F6"/>
                <ellipse cx="99" cy="223" rx="1.5" ry="2" fill="#1E293B"/>
                <ellipse cx="111" cy="223" rx="1.5" ry="2" fill="#1E293B"/>
                <path d="M100 232 Q105 236 110 232" stroke="#92400E" strokeWidth="1.2" fill="none"/>
                {/* Ear */}
                <ellipse cx="87" cy="226" rx="4" ry="5" fill="#F59E0B"/>
                {/* Arm holding tablet */}
                <path d="M120 258 L142 268 L148 290 L135 295 L125 278 Z" fill="#3B5BDB"/>
                {/* Tablet */}
                <rect x="130" y="268" width="38" height="50" rx="4" fill="#1E1B4B"/>
                <rect x="133" y="271" width="32" height="44" rx="3" fill="white"/>
                <rect x="135" y="273" width="28" height="38" rx="2" fill="#EEF2FF"/>
                <text x="149" y="283" textAnchor="middle" fill="#4338CA" fontSize="4" fontWeight="bold">Student</text>
                <text x="149" y="289" textAnchor="middle" fill="#4338CA" fontSize="4" fontWeight="bold">Record</text>
                <rect x="137" y="293" width="20" height="1.5" rx="1" fill="#C7D2FE"/>
                <rect x="137" y="298" width="16" height="1.5" rx="1" fill="#C7D2FE"/>
                <rect x="137" y="303" width="18" height="1.5" rx="1" fill="#C7D2FE"/>

                {/* Graduation cap (bottom right) */}
                <ellipse cx="440" cy="390" rx="38" ry="12" fill="#1E293B"/>
                <rect x="418" y="370" width="44" height="22" rx="2" fill="#1E293B"/>
                <path d="M418 370 L440 358 L462 370 Z" fill="#334155"/>
                <line x1="462" y1="370" x2="468" y2="395" stroke="#1E293B" strokeWidth="2"/>
                <circle cx="468" cy="398" r="4" fill="#FBBF24"/>
                {/* Tassel */}
                <line x1="468" y1="402" x2="465" y2="415" stroke="#D97706" strokeWidth="1.5"/>
                <line x1="468" y1="402" x2="470" y2="415" stroke="#D97706" strokeWidth="1.5"/>
                <line x1="468" y1="402" x2="468" y2="416" stroke="#D97706" strokeWidth="1.5"/>

                {/* Shield (top right) */}
                <defs>
                  <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6"/>
                    <stop offset="100%" stopColor="#0D9488"/>
                  </linearGradient>
                </defs>
                <path d="M398 108 L418 114 L418 136 Q418 150 398 157 Q378 150 378 136 L378 114 Z" fill="url(#shieldGrad)"/>
                <path d="M388 136 L395 143 L412 126" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Shield outer ring */}
                <path d="M398 102 L422 109 L422 136 Q422 154 398 163 Q374 154 374 136 L374 109 Z" fill="none" stroke="#0F766E" strokeWidth="2" opacity="0.6"/>

                {/* Sparkles / plus signs */}
                <text x="60" y="200" fill="#93C5FD" fontSize="16" opacity="0.6">✦</text>
                <text x="155" y="165" fill="#C4B5FD" fontSize="10" opacity="0.5">+</text>
                <text x="460" y="280" fill="#93C5FD" fontSize="12" opacity="0.4">+</text>
                <text x="80" y="290" fill="#C4B5FD" fontSize="8" opacity="0.4">·</text>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-4">
              <Zap size={14} /> Platform Features
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Everything You Need</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Powered by Ethereum smart contracts and IPFS decentralized storage for enterprise-grade credential management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="light-card-hover p-7 flex flex-col group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border ${f.color} shrink-0`}>
                  <f.icon size={26} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{f.desc}</p>
                <Link href={f.link}>
                  <span className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                    {f.cta}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portals Section ── */}
      <section id="roles" className="py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold mb-4">
            <Users size={14} /> Access Portals
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Choose Your Portal</h2>
          <p className="text-slate-600">Dedicated interfaces designed for every type of user</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role, i) => (
            <motion.div
              key={role.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={role.href} className="group block h-full">
                <div className="light-card-hover p-7 flex flex-col items-center text-center h-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border ${role.color}`}>
                    <role.icon size={30} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{role.label}</h3>
                  <p className="text-xs text-slate-500 mb-5 flex-1 leading-relaxed">{role.desc}</p>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Access Portal <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>



      {/* ── About Section ── */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left Side: Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold mb-6">
              <Info size={14} /> About BlockEdu
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
              Bringing Blockchain <br />
              <span className="text-brand-gradient">to Academic Credentials</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-800">BlockEdu</strong> is a decentralized academic record management system developed as a capstone project for <strong className="text-blue-600">JNTU Vizianagaram</strong>. It leverages Ethereum smart contracts and IPFS storage to create a tamper-proof, verifiable credential ecosystem.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              The system replaces traditional paper-based certificates with cryptographically secured digital credentials that can be verified instantly by employers, institutions, and government bodies — without any intermediary.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/student/register">
                <button className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
                  Register as Student <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Side: 4 About Points Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {ABOUT_POINTS.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="light-card p-5"
              >
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 border border-blue-100">
                  <point.icon size={22} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">{point.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold mb-5">
            <Phone size={14} /> Get in Touch
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Have Questions?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Reach out to the BlockEdu team for any queries about certificate verification, institution onboarding, or technical support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="mailto:admin@blockedu.com" className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all shadow-sm group">
              <Mail size={18} className="text-blue-500 group-hover:text-blue-600" /> admin@blockedu.com
            </a>
            <a href="https://jntuv.ac.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 px-6 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-all shadow-sm group">
              <Globe size={18} className="text-emerald-500 group-hover:text-emerald-600" /> JNTU Vizianagaram
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-10 text-center text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-base">BlockEdu</span>
          </div>
          <p className="mb-3">Blockchain-Secured Academic Record Management System</p>
          <p className="text-xs text-slate-500">Developed at JNTU Vizianagaram · Built with Next.js + Solidity + IPFS · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
