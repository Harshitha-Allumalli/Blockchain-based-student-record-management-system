"use client";

import { FileDown } from "lucide-react";
import jsPDF from "jspdf";

interface ExportPDFProps {
  record: {
    studentId: string;
    name: string;
    course: string;
    marks: string;
    dataHash: string;
    ipfsCid: string;
    status: string;
    addedOn: string;
  };
}

export default function ExportPDF({ record }: ExportPDFProps) {
  const handleExport = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;

    // ── Header background ──────────────────────────────────────
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 50, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BlockEdu", margin, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Blockchain-Verified Academic Record", margin, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, margin, 40);

    // ── Status badge ───────────────────────────────────────────
    const statusColor = record.status === "verified" ? [34, 197, 94] : [239, 68, 68];
    doc.setFillColor(...(statusColor as [number, number, number]));
    doc.roundedRect(pageW - margin - 35, 15, 35, 12, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const statusText = record.status === "verified" ? "VERIFIED" : "TAMPERED";
    doc.text(statusText, pageW - margin - 17.5, 22.5, { align: "center" });

    // ── Body ───────────────────────────────────────────────────
    let y = 68;

    const addField = (label: string, value: string) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(label.toUpperCase(), margin, y);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(value, margin, y + 7);

      // Underline
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 11, pageW - margin, y + 11);
      y += 22;
    };

    addField("Student ID", record.studentId);
    addField("Full Name", record.name);
    addField("Course / Programme", record.course);
    addField("Marks / Grade", record.marks);
    addField("Date Added", record.addedOn);
    addField("IPFS Certificate CID", record.ipfsCid);

    // ── Blockchain Hash ────────────────────────────────────────
    y += 4;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("BLOCKCHAIN HASH (SHA-256)", margin + 4, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246); // blue-500
    doc.text(record.dataHash, margin + 4, y + 17);
    y += 34;

    // ── Footer ─────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 270, pageW, 27, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This document is blockchain-certified. Verify at: blockedu.app/verify",
      pageW / 2,
      282,
      { align: "center" }
    );

    doc.save(`BlockEdu_${record.studentId}_${record.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
    >
      <FileDown size={12} /> PDF
    </button>
  );
}
