const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    ipfsCid: { type: String, required: true },
    label: { type: String, default: 'Certificate' },
    uploadedAt: { type: Date, default: Date.now }
});

const RecordSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    marks: {
        type: String,
        required: true
    },
    documents: [DocumentSchema],
    ipfsCid: {
        type: String,
        default: 'QmNoFile'
    },
    dataHash: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Record', RecordSchema);
