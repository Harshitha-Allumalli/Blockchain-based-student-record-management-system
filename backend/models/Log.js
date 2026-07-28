const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['record_added', 'record_verified', 'tamper_detected', 'login', 'export_pdf']
    },
    actor: { type: String },       // email of who performed the action
    target: { type: String },      // studentId or relevant entity
    details: { type: String },     // extra info
    severity: {
        type: String,
        enum: ['info', 'success', 'warning', 'danger'],
        default: 'info'
    },
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);
