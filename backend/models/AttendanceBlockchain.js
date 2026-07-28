const mongoose = require('mongoose');

const AttendanceBlockchainSchema = new mongoose.Schema({
    blockchain_id: { type: String, required: true, unique: true },
    attendance_id: { type: String, required: true }, // batch_id reference
    transaction_hash: { type: String, required: true },
    block_number: { type: Number, default: 1 },
    attendance_hash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    subject_id: { type: String },
    faculty_id: { type: String },
    attendance_date: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceBlockchain', AttendanceBlockchainSchema);
