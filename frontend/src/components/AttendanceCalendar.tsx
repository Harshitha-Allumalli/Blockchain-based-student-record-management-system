'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttendanceRecord {
    attendance_id: string;
    attendance_date: string;
    attendance_status: string;
    subject_id: string;
    transaction_hash?: string;
}

interface Props {
    records: AttendanceRecord[];
}

export default function AttendanceCalendar({ records }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Map records by YYYY-MM-DD
    const recordsMap: { [key: string]: AttendanceRecord[] } = {};
    records.forEach(r => {
        if (!recordsMap[r.attendance_date]) recordsMap[r.attendance_date] = [];
        recordsMap[r.attendance_date].push(r);
    });

    const days: (null | { day: number; dateStr: string; dayRecords: AttendanceRecord[] })[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ day: d, dateStr, dayRecords: recordsMap[dateStr] || [] });
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Attendance Calendar</h3>
                        <p className="text-xs text-slate-500">Monthly schedule and verification timeline</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg transition-colors"
                        title="Previous Month"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 min-w-[130px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg transition-colors"
                        title="Next Month"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center gap-5 mb-4 text-xs text-slate-500 justify-end">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    Present
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    Late
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    Absent
                </div>
            </div>

            {/* ── Day-of-week header ── */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            {/* ── Calendar Grid ── */}
            <div className="grid grid-cols-7 gap-1.5">
                {days.map((item, idx) => {
                    // Empty leading cell
                    if (!item) {
                        return (
                            <div
                                key={`empty-${idx}`}
                                className="h-14 rounded-xl bg-slate-50"
                            />
                        );
                    }

                    const { day, dayRecords } = item;
                    const hasRecords = dayRecords.length > 0;

                    // Determine cell colour based on attendance status
                    let cellCls    = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50';
                    let badgeIcon  = null;
                    let countColor = 'text-slate-400';

                    if (hasRecords) {
                        const hasAbsent = dayRecords.some(r => r.attendance_status === 'Absent');
                        const hasLate   = dayRecords.some(r => r.attendance_status === 'Late');

                        if (hasAbsent) {
                            cellCls    = 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300';
                            badgeIcon  = <XCircle className="w-3.5 h-3.5 text-rose-500" />;
                            countColor = 'text-rose-400';
                        } else if (hasLate) {
                            cellCls    = 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300';
                            badgeIcon  = <Clock className="w-3.5 h-3.5 text-amber-500" />;
                            countColor = 'text-amber-400';
                        } else {
                            cellCls    = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300';
                            badgeIcon  = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
                            countColor = 'text-emerald-500';
                        }
                    }

                    return (
                        <div
                            key={`day-${day}`}
                            className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between transition-all group relative cursor-default ${cellCls}`}
                        >
                            {/* Day number + status icon */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">{day}</span>
                                {badgeIcon}
                            </div>

                            {/* Class count */}
                            {hasRecords && (
                                <div className={`text-[10px] truncate font-mono ${countColor}`}>
                                    {dayRecords.length} {dayRecords.length === 1 ? 'class' : 'classes'}
                                </div>
                            )}

                            {/* Hover tooltip */}
                            {hasRecords && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-48 p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg text-xs text-slate-700 pointer-events-none">
                                    <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1.5">
                                        {item.dateStr}
                                    </div>
                                    {dayRecords.map((r, i) => (
                                        <div key={i} className="flex justify-between items-center py-0.5 gap-2">
                                            <span className="text-slate-500 font-mono truncate">{r.subject_id}</span>
                                            <span className={`font-semibold shrink-0 ${
                                                r.attendance_status === 'Present' ? 'text-emerald-600' :
                                                r.attendance_status === 'Late'    ? 'text-amber-600'   :
                                                                                    'text-rose-600'
                                            }`}>
                                                {r.attendance_status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
