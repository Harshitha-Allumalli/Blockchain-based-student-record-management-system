const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    attendance_id: { type: String, required: true, unique: true },
    student_id: { type: String, required: true },
    subject_id: { type: String, required: true },
    faculty_id: { type: String, required: true },
    attendance_status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
    attendance_date: { type: String, required: true }, // YYYY-MM-DD
    batch_id: { type: String, required: true },
    department: { type: String, default: 'Computer Science' },
    semester: { type: String, default: 'Sem 1' },
    section: { type: String, default: 'Section A' },
    is_finalized: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
