"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { X, Download, ShieldCheck } from "lucide-react";

interface QRModalProps {
  record: {
    studentId: string;
    name: string;
    course: string;
    marks: string;
    dataHash?: string;
  };
  onClose: () => void;
}

export default function QRModal({ record, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/verify?id=${record.studentId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, verifyUrl, {
        width: 220,
        margin: 2,
        color: { dark: "#1e40af", light: "#f8fafc" },
      });
    }
  }, [verifyUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `QR_${record.studentId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm text-center relative border border-slate-200 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={26} />
        </div>

        <h2 className="text-lg font-extrabold text-slate-900 mb-0.5">{record.name}</h2>
        <p className="text-slate-500 text-xs mb-5 font-mono">{record.studentId} · {record.course}</p>

        <div className="flex justify-center mb-5">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
            <canvas ref={canvasRef} className="rounded-xl" />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mb-5 px-2">
          Scan QR code or share this link to verify this certificate on blockchain
        </p>

        <p className="text-xs text-blue-600 break-all font-semibold bg-blue-50 p-2.5 rounded-xl border border-blue-100 mb-5">
          {verifyUrl}
        </p>

        <button
          onClick={handleDownload}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm"
        >
          <Download size={16} /> Download QR Code
        </button>
      </motion.div>
    </div>
  );
}
