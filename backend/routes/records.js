const { uploadFile } = require("../utils/storage");
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { ethers } = require('ethers');
const multer = require('multer');
const path = require('path');
const { protect, requireRole } = require('../middleware/auth');
const { recordsDb, logsDb, usersDb } = require('../db/sqlite');

// ─── Multer Setup ────────────────────────────────────────────────────────────
const multer = require("multer");

// Store files temporarily in memory instead of saving to uploads/
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB
    }
}); // 20MB

// ─── Smart Contract ABI ──────────────────────────────────────────────────────
const contractABI = [
    "function addRecord(string memory studentId, string memory dataHash) public",
    "function verifyRecord(string memory studentId) public view returns (string memory)"
];

// ─── Helper: SHA-256 Hash ────────────────────────────────────────────────────
function generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// ─── Helper: Get Blockchain Contract ────────────────────────────────────────
function getContract(signerNeeded = false) {
    if (!process.env.CONTRACT_ADDRESS || !process.env.RPC_URL) return null;
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    if (signerNeeded) {
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    }
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
}

// ─── Basic Fraud Detection ───────────────────────────────────────────────────
function detectFraud(marks) {
    const numeric = parseFloat(marks);
    if (isNaN(numeric)) return false;
    return numeric > 100 || numeric < 0;
}

// ─── POST /api/records/add — Admin only: create or update student record ─────
router.post('/add', protect, requireRole('admin'), upload.any(), async (req, res) => {
    try {
        const { studentId, name, course, marks, label } = req.body;
        const year = req.body.year || '';

        if (!studentId || !name || !course || !marks) {
            return res.status(400).json({ error: 'All fields are required: studentId, name, course, marks' });
        }

        if (detectFraud(marks)) {
            await logsDb.add({ action: 'tamper_detected', actor: req.user.email, target: studentId, details: 'Suspicious marks value', severity: 'warning' });
            return res.status(422).json({ error: 'Fraud detected: marks value is suspicious.' });
        }

        const uploadedFiles = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
        
        const parseList = (val) => {
            if (!val) return [];
            try { return typeof val === 'string' ? JSON.parse(val) : val; }
            catch { return Array.isArray(val) ? val : [val]; }
        };

        const labelsList       = parseList(req.body.labels);
        const titlesList       = parseList(req.body.titles);
        const descriptionsList = parseList(req.body.descriptions);

        const newDocObjs = uploadedFiles.map((f, i) => {
            const filename = f.filename;
            const ipfsCid = `QmMockIPFS_${filename}`;
            const docLabel = (labelsList && labelsList[i]) || label || f.originalname;
            return {
                _id: (Date.now() + i).toString(),
                filename,
                ipfsCid,
                title:       (titlesList[i]       || docLabel),
                description: (descriptionsList[i] || ''),
                label: docLabel,
                uploadedAt: new Date().toISOString()
            };
        });

        const firstIpfsCid = newDocObjs[0]?.ipfsCid || 'QmNoFile';

        // Check if record already exists in SQLite
        const existing = await recordsDb.findByStudentIdOrHash(studentId);

        if (existing) {
            let docs = existing.documents || [];
            if (newDocObjs.length > 0) {
                docs.push(...newDocObjs);
            }
            const dataToHash = { studentId: existing.studentId, name: existing.name, course: existing.course, marks, ipfsCid: docs[0]?.ipfsCid || 'QmNoFile' };
            const dataHash = generateHash(dataToHash);

            const updated = await recordsDb.createOrUpdate({
                ...existing,
                year: year || existing.year || '',
                marks,
                documents: docs,
                dataHash
            });

            await logsDb.add({
                action: 'record_updated',
                actor: req.user.email,
                target: studentId,
                details: `Added ${newDocObjs.length} document(s) for ${existing.name}`,
                severity: 'info'
            });

            return res.status(200).json({ message: 'Document(s) added to existing student record', record: updated });
        }

        // New record
        const dataToHash = { studentId, name, course, marks, ipfsCid: firstIpfsCid };
        const dataHash = generateHash(dataToHash);

        const record = {
            id: Date.now().toString(),
            studentId, name, course, year, marks,
            ipfsCid: firstIpfsCid,
            documents: newDocObjs,
            dataHash,
            status: 'pending',
            addedBy: req.user.email,
            verifiedBy: null,
            createdAt: new Date().toISOString()
        };

        const saved = await recordsDb.createOrUpdate(record);
        await logsDb.add({
            action: 'record_added',
            actor: req.user.email,
            target: studentId,
            details: `${name} - ${course} (${newDocObjs.length} doc(s)) (Pending Verification)`,
            severity: 'info'
        });

        res.status(201).json({ message: 'Student record submitted for verification', record: saved });
    } catch (err) {
        console.error('Add record error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/records/upload-doc/:studentId — Student or Admin uploads single/multiple files ─
router.post('/upload-doc/:studentId', protect, upload.any(), async (req, res) => {
    try {
        const { studentId } = req.params;
        const uploadedFiles = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);

        if (uploadedFiles.length === 0) {
            return res.status(400).json({ error: 'Please select document file(s) to upload.' });
        }

        const record = await recordsDb.findByStudentIdOrHash(studentId);
        if (!record) return res.status(404).json({ error: 'Student record not found.' });

        const parseList2 = (val) => {
            if (!val) return [];
            try { return typeof val === 'string' ? JSON.parse(val) : val; }
            catch { return Array.isArray(val) ? val : [val]; }
        };

        const labelsList2       = parseList2(req.body.labels);
        const titlesList2       = parseList2(req.body.titles);
        const descriptionsList2 = parseList2(req.body.descriptions);

        const newDocObjs = uploadedFiles.map((f, i) => {
            const filename = f.filename;
            const ipfsCid = `QmMockIPFS_${filename}`;
            const docLabel = (labelsList2 && labelsList2[i]) || req.body.label || f.originalname;
            return {
                _id: (Date.now() + i).toString(),
                filename,
                ipfsCid,
                title:       (titlesList2[i]       || docLabel),
                description: (descriptionsList2[i] || ''),
                label: docLabel,
                uploadedAt: new Date().toISOString()
            };
        });

        let updated = record;
        for (const docObj of newDocObjs) {
            updated = await recordsDb.addDocument(studentId, docObj);
        }

        await logsDb.add({
            action: 'document_uploaded',
            actor: req.user.email,
            target: studentId,
            details: `Uploaded ${newDocObjs.length} document(s) for ${record.name}`,
            severity: 'info'
        });

        res.status(200).json({ message: `${newDocObjs.length} document(s) uploaded successfully!`, documents: newDocObjs, record: updated });
    } catch (err) {
        console.error('Upload document error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── DELETE /api/records/document/:studentId/:docId — Delete document ─────────
router.delete('/document/:studentId/:docId', protect, async (req, res) => {
    try {
        const { studentId, docId } = req.params;
        const record = await recordsDb.findByStudentIdOrHash(studentId);
        if (!record) return res.status(404).json({ error: 'Student record not found.' });

        const updated = await recordsDb.deleteDocument(studentId, docId);

        await logsDb.add({
            action: 'document_deleted',
            actor: req.user.email,
            target: studentId,
            details: `Deleted document (${docId}) for student ${record.name}`,
            severity: 'warning'
        });

        res.status(200).json({ message: 'Document deleted successfully', record: updated });
    } catch (err) {
        console.error('Delete document error:', err.message);
        res.status(500).json({ error: err.message });
    }
});



// ─── GET /api/records/pending — Admin + Verifier ─────────────────────────────
router.get('/pending', protect, requireRole('admin', 'verifier'), async (req, res) => {
    try {
        const pending = await recordsDb.findPending();
        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/records/verify-action/:studentId — Verifier only ──────────────
router.post('/verify-action/:studentId', protect, requireRole('verifier'), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: "action must be 'approve' or 'reject'" });
        }

        const newStatus = action === 'approve' ? 'verified' : 'rejected';
        const record = await recordsDb.findByStudentIdOrHash(studentId);
        if (!record) return res.status(404).json({ error: 'Record not found' });
        if (record.status !== 'pending') return res.status(409).json({ error: `Record is already ${record.status}` });

        const updated = await recordsDb.updateStatus(studentId, newStatus, req.user.email);

        await logsDb.add({
            action: action === 'approve' ? 'record_verified' : 'record_rejected',
            actor: req.user.email,
            target: studentId,
            details: `${record.name} - ${record.course}`,
            severity: action === 'approve' ? 'success' : 'danger'
        });

        // Write to smart contract on approve
        if (action === 'approve') {
            const contract = getContract(true);
            if (contract) {
                try {
                    const tx = await contract.addRecord(studentId, record.dataHash);
                    await tx.wait();
                } catch (e) {
                    console.warn('Blockchain write skipped/error:', e.message);
                }
            }
        }

        res.json({ message: `Record ${newStatus} successfully`, record: updated });
    } catch (err) {
        console.error('Verify action error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/records/student/me — Authenticated student: fetch own record ───
router.get('/student/me', protect, requireRole('student'), async (req, res) => {
    try {
        const user = await usersDb.findByEmail(req.user.email);
        const sid = user?.studentId || req.user.studentId;
        if (!sid) return res.status(404).json({ error: 'No student ID linked to this account' });

        const record = await recordsDb.findByStudentIdOrHash(sid);
        if (!record) return res.status(404).json({ error: 'No record found for your Student ID' });

        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/records — Admin + Verifier: all records ────────────────────────
router.get('/', protect, requireRole('admin', 'verifier'), async (req, res) => {
    try {
        const { search, course } = req.query;
        const records = await recordsDb.findAll(search, course);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/records/logs/all — Admin only ───────────────────────────────────
router.get('/logs/all', protect, requireRole('admin'), async (req, res) => {
    try {
        const logs = await logsDb.findAll(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── DELETE /api/records/:studentId — Admin only: delete record ──────────────
router.delete('/:studentId', protect, requireRole('admin'), async (req, res) => {
    try {
        const { studentId } = req.params;
        const record = await recordsDb.findByStudentIdOrHash(studentId);
        if (!record) return res.status(404).json({ error: 'Student record not found' });

        await recordsDb.deleteByStudentId(studentId);
        await logsDb.add({
            action: 'record_deleted',
            actor: req.user.email,
            target: studentId,
            details: `Deleted student record for ${record.name} (${studentId})`,
            severity: 'danger'
        });

        res.json({ message: 'Student record deleted successfully' });
    } catch (err) {
        console.error('Delete record error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/records/verify/:query — Public: search by studentId or dataHash ─
// NOTE: This route MUST be declared BEFORE /:studentId to avoid route conflicts
router.get('/verify/:query', async (req, res) => {
    try {
        const queryTerm = req.params.query.trim();
        const record = await recordsDb.findByStudentIdOrHash(queryTerm);

        if (!record) return res.status(404).json({ error: 'Record not found' });
        const studentId = record.studentId;

        const firstFileCid = (record.documents && record.documents.length > 0) ? record.documents[0].ipfsCid : (record.ipfsCid || 'QmNoFile');
        const dataToHash = { studentId: record.studentId, name: record.name, course: record.course, marks: record.marks, ipfsCid: firstFileCid };
        const calculatedHash = generateHash(dataToHash);

        let blockchainHash = "";
        const contract = getContract(false);
        if (contract) {
            try {
                blockchainHash = await contract.verifyRecord(studentId);
            } catch (e) {
                console.error("Blockchain fetch error:", e.message);
            }
        }

        const effectiveBlockchainHash = blockchainHash || record.dataHash;
        const isTampered = record.status === 'verified' && calculatedHash !== effectiveBlockchainHash;

        await logsDb.add({
            action: isTampered ? 'tamper_detected' : 'record_verified',
            actor: 'public-verifier',
            target: studentId,
            severity: isTampered ? 'danger' : 'success',
            details: isTampered ? 'Hash mismatch detected' : 'Verified successfully'
        });

        res.json({
            studentId,
            blockchainHash: effectiveBlockchainHash,
            dbHash: calculatedHash,
            isTampered,
            recordDetails: record
        });
    } catch (err) {
        console.error('Verify error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/records/:studentId — Public: get record by studentId ──────────
router.get('/:studentId', async (req, res) => {
    try {
        const record = await recordsDb.findByStudentIdOrHash(req.params.studentId);
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
