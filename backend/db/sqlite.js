const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'blockedu.sqlite');
const db = new sqlite3.Database(dbPath);

// ─── Initialize Tables ────────────────────────────────────────────────────────
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      studentId TEXT,
      isVerified INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      studentId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      course TEXT NOT NULL,
      year TEXT DEFAULT '',
      marks TEXT NOT NULL,
      ipfsCid TEXT DEFAULT 'QmNoFile',
      documents TEXT DEFAULT '[]',
      dataHash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      addedBy TEXT,
      verifiedBy TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      otp TEXT NOT NULL,
      isVerified INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      target TEXT,
      details TEXT,
      severity TEXT DEFAULT 'info',
      createdAt TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      attendance_id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      faculty_id TEXT NOT NULL,
      attendance_status TEXT NOT NULL,
      attendance_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      batch_id TEXT NOT NULL,
      department TEXT DEFAULT 'Computer Science',
      semester TEXT DEFAULT 'Sem 1',
      section TEXT DEFAULT 'Section A',
      is_finalized INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_blockchain (
      blockchain_id TEXT PRIMARY KEY,
      attendance_id TEXT NOT NULL,
      transaction_hash TEXT NOT NULL,
      block_number INTEGER DEFAULT 1,
      attendance_hash TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      subject_id TEXT,
      faculty_id TEXT,
      attendance_date TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      departmentId TEXT,
      semester TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS academic_assignments (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      facultyId TEXT,
      department TEXT,
      semester TEXT,
      section TEXT,
      subjectId TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_corrections (
      id TEXT PRIMARY KEY,
      attendance_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      requested_by TEXT NOT NULL,
      requested_status TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      approved_by TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // ─── Migrate: add year column if it doesn't exist ────────────────────────
  db.run(`ALTER TABLE records ADD COLUMN year TEXT DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Migration error (year column):', err.message);
    }
  });

  db.get('SELECT id FROM users WHERE LOWER(email) = ?', ['admin@blockedu.com'], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (id, name, email, password, role, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['admin-1', 'System Admin', 'admin@blockedu.com', 'admin123', 'admin', 1, new Date().toISOString()]
      );
      console.log('📦 SQLite: Seeded default admin user (admin@blockedu.com)');
    }
  });

  db.get('SELECT id FROM users WHERE LOWER(email) = ?', ['verifier@blockedu.com'], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (id, name, email, password, role, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['verifier-1', 'Verifier HR', 'verifier@blockedu.com', 'verify123', 'verifier', 1, new Date().toISOString()]
      );
      console.log('📦 SQLite: Seeded default verifier user (verifier@blockedu.com)');
    }
  });

  db.get('SELECT id FROM users WHERE LOWER(email) = ?', ['faculty@blockedu.com'], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (id, name, email, password, role, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['faculty-1', 'Dr. Alan Turing', 'faculty@blockedu.com', 'faculty123', 'faculty', 1, new Date().toISOString()]
      );
      console.log('📦 SQLite: Seeded default faculty user (faculty@blockedu.com)');
    }
  });

  db.get('SELECT id FROM users WHERE LOWER(email) = ?', ['student@blockedu.com'], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (id, name, email, password, role, studentId, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['student-1', 'Alice Smith', 'student@blockedu.com', 'student123', 'student', 'STU101', 1, new Date().toISOString()]
      );
      console.log('📦 SQLite: Seeded default student user (student@blockedu.com / STU101)');
    }
  });
});

console.log('✅ SQLite Database Connected & Initialized at: ' + dbPath);

// ─── Promise Wrapper Helpers ──────────────────────────────────────────────────
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// ─── Users DB Methods ─────────────────────────────────────────────────────────
const usersDb = {
  findByEmail: async (email) => {
    return await getQuery('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  },
  findByStudentId: async (studentId) => {
    return await getQuery('SELECT * FROM users WHERE UPPER(studentId) = UPPER(?)', [studentId]);
  },
  create: async (user) => {
    const id = user.id || Date.now().toString();
    const createdAt = user.createdAt || new Date().toISOString();
    const isVerified = user.isVerified ? 1 : 0;
    await runQuery(
      `INSERT INTO users (id, name, email, password, role, studentId, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.name, user.email.toLowerCase().trim(), user.password, user.role || 'student', user.studentId || null, isVerified, createdAt]
    );
    return await usersDb.findByEmail(user.email);
  },
  updatePassword: async (email, newPassword) => {
    await runQuery('UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)', [newPassword, email.toLowerCase().trim()]);
    return await usersDb.findByEmail(email);
  }
};

// ─── Records DB Methods ───────────────────────────────────────────────────────
const recordsDb = {
  findAll: async (search, course) => {
    let sql = 'SELECT * FROM records WHERE 1=1';
    const params = [];
    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(studentId) LIKE ? OR LOWER(dataHash) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }
    if (course) {
      sql += ' AND course = ?';
      params.push(course);
    }
    sql += ' ORDER BY createdAt DESC';
    const rows = await allQuery(sql, params);
    return rows.map(r => ({ ...r, documents: JSON.parse(r.documents || '[]') }));
  },
  findPending: async () => {
    const rows = await allQuery('SELECT * FROM records WHERE status = "pending" ORDER BY createdAt DESC');
    return rows.map(r => ({ ...r, documents: JSON.parse(r.documents || '[]') }));
  },
  findByStudentIdOrHash: async (queryTerm) => {
    if (!queryTerm) return null;
    const row = await getQuery('SELECT * FROM records WHERE UPPER(studentId) = UPPER(?) OR LOWER(dataHash) = LOWER(?)', [queryTerm, queryTerm]);
    if (!row) return null;
    return { ...row, documents: JSON.parse(row.documents || '[]') };
  },
  createOrUpdate: async (record) => {
    const existing = await getQuery('SELECT * FROM records WHERE UPPER(studentId) = UPPER(?)', [record.studentId]);
    const docsJson = JSON.stringify(record.documents || []);

    if (existing) {
      await runQuery(
        `UPDATE records SET year = ?, marks = ?, ipfsCid = ?, documents = ?, dataHash = ?, status = ? WHERE UPPER(studentId) = UPPER(?)`,
        [record.year || existing.year || '', record.marks, record.ipfsCid || existing.ipfsCid, docsJson, record.dataHash, record.status || 'pending', record.studentId]
      );
      return await recordsDb.findByStudentIdOrHash(record.studentId);
    } else {
      const id = record.id || record._id || Date.now().toString();
      const createdAt = record.createdAt || new Date().toISOString();
      await runQuery(
        `INSERT INTO records (id, studentId, name, course, year, marks, ipfsCid, documents, dataHash, status, addedBy, verifiedBy, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, record.studentId, record.name, record.course, record.year || '',
          record.marks, record.ipfsCid || 'QmNoFile', docsJson, record.dataHash,
          record.status || 'pending', record.addedBy || null, record.verifiedBy || null, createdAt
        ]
      );
      return await recordsDb.findByStudentIdOrHash(record.studentId);
    }
  },
  updateStatus: async (studentId, status, verifiedBy) => {
    await runQuery('UPDATE records SET status = ?, verifiedBy = ? WHERE UPPER(studentId) = UPPER(?)', [status, verifiedBy, studentId]);
    return await recordsDb.findByStudentIdOrHash(studentId);
  },
  addDocument: async (studentId, docObj) => {
    const rec = await recordsDb.findByStudentIdOrHash(studentId);
    if (!rec) return null;
    const docs = rec.documents || [];
    docs.push(docObj);
    await runQuery('UPDATE records SET documents = ?, status = "pending" WHERE UPPER(studentId) = UPPER(?)', [JSON.stringify(docs), studentId]);
    return await recordsDb.findByStudentIdOrHash(studentId);
  },
  deleteDocument: async (studentId, docId) => {
    const rec = await recordsDb.findByStudentIdOrHash(studentId);
    if (!rec) return null;
    const docs = rec.documents || [];
    const filtered = docs.filter(d => d._id !== docId && d.filename !== docId && d.ipfsCid !== docId);
    await runQuery('UPDATE records SET documents = ? WHERE UPPER(studentId) = UPPER(?)', [JSON.stringify(filtered), studentId]);
    return await recordsDb.findByStudentIdOrHash(studentId);
  },
  deleteByStudentId: async (studentId) => {
    await runQuery('DELETE FROM records WHERE UPPER(studentId) = UPPER(?)', [studentId]);
    return true;
  }
};

// ─── OTPs DB Methods ──────────────────────────────────────────────────────────
const otpsDb = {
  findByEmail: async (email) => {
    return await getQuery('SELECT * FROM otps WHERE LOWER(email) = LOWER(?)', [email]);
  },
  upsert: async (email, otp) => {
    const existing = await otpsDb.findByEmail(email);
    const now = Date.now();
    if (existing) {
      await runQuery('UPDATE otps SET otp = ?, isVerified = 0, createdAt = ? WHERE LOWER(email) = LOWER(?)', [otp, now, email]);
    } else {
      await runQuery('INSERT INTO otps (id, email, otp, isVerified, createdAt) VALUES (?, ?, ?, 0, ?)', [now.toString(), email.toLowerCase().trim(), otp, now]);
    }
    return await otpsDb.findByEmail(email);
  },
  setVerified: async (email) => {
    await runQuery('UPDATE otps SET isVerified = 1 WHERE LOWER(email) = LOWER(?)', [email]);
  },
  delete: async (email) => {
    await runQuery('DELETE FROM otps WHERE LOWER(email) = LOWER(?)', [email]);
  }
};

// ─── Logs DB Methods ──────────────────────────────────────────────────────────
const logsDb = {
  add: async (log) => {
    const id = log.id || log._id || Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
    const createdAt = log.createdAt || new Date().toISOString();
    await runQuery(
      `INSERT INTO logs (id, action, actor, target, details, severity, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, log.action, log.actor, log.target || null, log.details || null, log.severity || 'info', createdAt]
    );
  },
  findAll: async (limit = 100) => {
    return await allQuery('SELECT * FROM logs ORDER BY createdAt DESC LIMIT ?', [limit]);
  }
};

// ─── Attendance DB Methods ────────────────────────────────────────────────────
const attendanceDb = {
  // Check duplicate submission for student, subject, and date
  checkDuplicate: async (studentId, subjectId, date) => {
    const row = await getQuery(
      `SELECT * FROM attendance WHERE UPPER(student_id) = UPPER(?) AND UPPER(subject_id) = UPPER(?) AND attendance_date = ?`,
      [studentId, subjectId, date]
    );
    return !!row;
  },

  // Save attendance batch & blockchain tx
  saveBatchAttendance: async ({ batchId, facultyId, subjectId, department, semester, section, date, records, txHash, dataHash }) => {
    const createdAt = new Date().toISOString();
    const insertedRecords = [];

    for (const r of records) {
      const attendanceId = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await runQuery(
        `INSERT INTO attendance (attendance_id, student_id, subject_id, faculty_id, attendance_status, attendance_date, created_at, batch_id, department, semester, section, is_finalized)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [attendanceId, r.studentId, subjectId, facultyId, r.status, date, createdAt, batchId, department || 'Computer Science', semester || 'Sem 1', section || 'Section A']
      );
      insertedRecords.push({ attendance_id: attendanceId, student_id: r.studentId, attendance_status: r.status });
    }

    const blockchainId = `BC-${Date.now()}`;
    await runQuery(
      `INSERT INTO attendance_blockchain (blockchain_id, attendance_id, transaction_hash, block_number, attendance_hash, timestamp, subject_id, faculty_id, attendance_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [blockchainId, batchId, txHash, Math.floor(Math.random() * 1000) + 12000, dataHash, createdAt, subjectId, facultyId, date]
    );

    return { batchId, txHash, dataHash, count: insertedRecords.length };
  },

  // Get student attendance records with blockchain hash info
  getStudentAttendance: async (studentId, { subjectId, month, semester } = {}) => {
    let sql = `
      SELECT a.*, b.transaction_hash, b.attendance_hash, b.block_number, u.name as student_name
      FROM attendance a
      LEFT JOIN attendance_blockchain b ON a.batch_id = b.attendance_id
      LEFT JOIN users u ON UPPER(a.student_id) = UPPER(u.studentId)
      WHERE UPPER(a.student_id) = UPPER(?)
    `;
    const params = [studentId];

    if (subjectId) {
      sql += ` AND UPPER(a.subject_id) = UPPER(?)`;
      params.push(subjectId);
    }
    if (semester) {
      sql += ` AND UPPER(a.semester) = UPPER(?)`;
      params.push(semester);
    }
    if (month) {
      sql += ` AND a.attendance_date LIKE ?`;
      params.push(`${month}%`);
    }

    sql += ` ORDER BY a.attendance_date DESC, a.created_at DESC`;
    return await allQuery(sql, params);
  },

  // Get single record with verification
  getAttendanceById: async (attendanceId) => {
    let row = await getQuery(
      `SELECT a.*, b.transaction_hash, b.attendance_hash, b.block_number, u.name as student_name
       FROM attendance a
       LEFT JOIN attendance_blockchain b ON a.batch_id = b.attendance_id
       LEFT JOIN users u ON UPPER(a.student_id) = UPPER(u.studentId)
       WHERE a.attendance_id = ? OR a.batch_id = ?`,
      [attendanceId, attendanceId]
    );

    if (!row) return null;
    return row;
  },

  // Get batch record details
  getBatchDetails: async (batchId) => {
    const records = await allQuery(
      `SELECT a.*, u.name as student_name FROM attendance a LEFT JOIN users u ON UPPER(a.student_id) = UPPER(u.studentId) WHERE a.batch_id = ?`,
      [batchId]
    );
    const bc = await getQuery(`SELECT * FROM attendance_blockchain WHERE attendance_id = ?`, [batchId]);
    return { batchId, blockchain: bc, records };
  },

  // Per-student attendance breakdown for faculty view (grouped by course, year, subject)
  getFacultyStudentAttendance: async (facultyId) => {
    // Get all individual attendance rows submitted by this faculty
    const rows = await allQuery(
      `SELECT 
          a.student_id,
          a.subject_id,
          a.department,
          a.semester,
          a.section,
          a.attendance_status,
          a.attendance_date,
          a.batch_id,
          u.name as student_name,
          u.email as student_email,
          r.course,
          r.year
       FROM attendance a
       LEFT JOIN users u ON UPPER(a.student_id) = UPPER(u.studentId)
       LEFT JOIN records r ON UPPER(a.student_id) = UPPER(r.studentId)
       WHERE a.faculty_id = ?
       ORDER BY a.department, a.semester, a.subject_id, a.student_id, a.attendance_date`,
      [facultyId]
    );

    // Group: course → year → subject → students
    const grouped = {};
    for (const row of rows) {
      const course   = row.course   || row.department || 'Unknown Course';
      const year     = row.year     || row.semester   || 'Unknown Year';
      const subject  = row.subject_id;
      const studentId = row.student_id;

      if (!grouped[course]) grouped[course] = {};
      if (!grouped[course][year]) grouped[course][year] = {};
      if (!grouped[course][year][subject]) grouped[course][year][subject] = {};
      if (!grouped[course][year][subject][studentId]) {
        grouped[course][year][subject][studentId] = {
          studentId,
          name: row.student_name || studentId,
          email: row.student_email || '',
          total: 0, present: 0, absent: 0, late: 0,
          records: []
        };
      }

      const s = grouped[course][year][subject][studentId];
      s.total++;
      if (row.attendance_status === 'Present')      s.present++;
      else if (row.attendance_status === 'Absent')  s.absent++;
      else if (row.attendance_status === 'Late')    s.late++;
      s.records.push({ date: row.attendance_date, status: row.attendance_status, batchId: row.batch_id });
    }

    // Flatten to array format for easy frontend consumption
    const result = [];
    for (const [course, years] of Object.entries(grouped)) {
      for (const [year, subjects] of Object.entries(years)) {
        for (const [subject, students] of Object.entries(subjects)) {
          const studentList = Object.values(students).map((s) => ({
            ...s,
            percentage: s.total > 0
              ? Math.round(((s.present + s.late * 0.5) / s.total) * 100)
              : 0
          }));
          // Collect all unique dates across all students in this group
          const allDates = [...new Set(
            studentList.flatMap(s => s.records.map(r => r.date))
          )].sort();
          result.push({ course, year, subject, students: studentList, dates: allDates });
        }
      }
    }
    return result;
  },

  // Get faculty submitted history
  getFacultyHistory: async (facultyId, filterDate) => {
    let sql = `
      SELECT a.batch_id, a.subject_id, a.department, a.semester, a.section, a.attendance_date,
             COUNT(a.attendance_id) as total_students,
             SUM(CASE WHEN a.attendance_status = 'Present' THEN 1 ELSE 0 END) as present_count,
             SUM(CASE WHEN a.attendance_status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
             SUM(CASE WHEN a.attendance_status = 'Late' THEN 1 ELSE 0 END) as late_count,
             b.transaction_hash, b.attendance_hash, b.timestamp
      FROM attendance a
      LEFT JOIN attendance_blockchain b ON a.batch_id = b.attendance_id
      WHERE LOWER(a.faculty_id) = LOWER(?)`;
    const params = [facultyId];
    if (filterDate) {
      sql += ` AND a.attendance_date = ?`;
      params.push(filterDate);
    }
    sql += ` GROUP BY a.batch_id ORDER BY a.attendance_date DESC, a.created_at DESC`;
    return await allQuery(sql, params);
  },

  deleteBatch: async (batchId, facultyId) => {
    // Verify this batch belongs to the requesting faculty
    const batch = await getQuery(
      `SELECT DISTINCT faculty_id FROM attendance WHERE batch_id = ?`, [batchId]
    );
    if (!batch) return { error: 'Batch not found' };
    if (batch.faculty_id && batch.faculty_id.toLowerCase() !== facultyId.toLowerCase()) {
      return { error: 'Not authorized to delete this batch' };
    }
    await runQuery(`DELETE FROM attendance WHERE batch_id = ?`, [batchId]);
    await runQuery(`DELETE FROM attendance_blockchain WHERE attendance_id = ?`, [batchId]);
    return { success: true };
  },

  // Enrolled students lookup — matches students whose record course & year align with faculty selection
  getEnrolledStudents: async (department, semester, section, subjectId) => {
    // department param carries the course name, semester param carries the year
    const course = department || '';
    const year   = semester   || '';

    let students = [];

    if (course) {
      // Find matching records first, then lookup user info
      let sql = `
        SELECT r.studentId, r.name, r.course, r.year,
               u.email, u.name as userName
        FROM records r
        LEFT JOIN users u ON UPPER(r.studentId) = UPPER(u.studentId)
        WHERE 1=1
      `;
      const params = [];

      sql += ` AND LOWER(r.course) = LOWER(?)`;
      params.push(course);

      if (year) {
        sql += ` AND (LOWER(r.year) = LOWER(?) OR r.year IS NULL OR r.year = '')`;
        params.push(year);
      }

      const rows = await allQuery(sql, params);

      // If year was specified, prefer exact matches but also include empty-year records
      students = rows.map(s => ({
        studentId: s.studentId,
        name: s.userName || s.name,
        email: s.email || '',
        course: s.course,
        year: s.year || year
      }));
    }

    // Fallback: if no course given or no results, return all student users
    if (students.length === 0) {
      const all = await allQuery(
        `SELECT u.id, u.name, u.email, u.studentId, r.course, r.year
         FROM users u
         LEFT JOIN records r ON UPPER(u.studentId) = UPPER(r.studentId)
         WHERE u.role = 'student'`
      );
      students = all.map(s => ({
        studentId: s.studentId || s.id,
        name: s.name,
        email: s.email,
        course: s.course || '',
        year: s.year || ''
      }));
    }

    return students;
  },

  // Overall Statistics for Admin & AI Insights
  getOverallStats: async () => {
    const totals = await getQuery(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN attendance_status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN attendance_status = 'Late' THEN 1 ELSE 0 END) as late_count,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(DISTINCT batch_id) as total_batches
      FROM attendance
    `);

    const deptStats = await allQuery(`
      SELECT department,
             COUNT(*) as total,
             SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) as present,
             ROUND(SUM(CASE WHEN attendance_status = 'Present' THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*), 1) as percentage
      FROM attendance
      GROUP BY department
    `);

    const subjectStats = await allQuery(`
      SELECT subject_id,
             COUNT(*) as total,
             SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) as present,
             ROUND(SUM(CASE WHEN attendance_status = 'Present' THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*), 1) as percentage
      FROM attendance
      GROUP BY subject_id
    `);

    const studentSummaries = await allQuery(`
      SELECT 
        a.student_id,
        u.name as student_name,
        u.email as student_email,
        COUNT(*) as total_classes,
        SUM(CASE WHEN a.attendance_status = 'Present' THEN 1 ELSE 0 END) as attended,
        SUM(CASE WHEN a.attendance_status = 'Absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN a.attendance_status = 'Late' THEN 1 ELSE 0 END) as late,
        ROUND((SUM(CASE WHEN a.attendance_status = 'Present' THEN 1.0 ELSE 0.0 END) + SUM(CASE WHEN a.attendance_status = 'Late' THEN 0.5 ELSE 0.0 END)) * 100.0 / COUNT(*), 1) as percentage
      FROM attendance a
      LEFT JOIN users u ON UPPER(a.student_id) = UPPER(u.studentId)
      GROUP BY a.student_id
    `);

    return {
      totals: totals || { total_records: 0, present_count: 0, absent_count: 0, late_count: 0, total_students: 0, total_batches: 0 },
      deptStats,
      subjectStats,
      studentSummaries
    };
  },

  // Blockchain Transaction logs
  getBlockchainLogs: async (limit = 100) => {
    return await allQuery(
      `SELECT b.*, COUNT(a.attendance_id) as record_count
       FROM attendance_blockchain b
       LEFT JOIN attendance a ON b.attendance_id = a.batch_id
       GROUP BY b.blockchain_id
       ORDER BY b.timestamp DESC LIMIT ?`,
      [limit]
    );
  },

  // Corrections workflow
  createCorrectionRequest: async ({ attendance_id, student_id, requested_by, requested_status, reason }) => {
    const id = `CORR-${Date.now()}`;
    const createdAt = new Date().toISOString();
    await runQuery(
      `INSERT INTO attendance_corrections (id, attendance_id, student_id, requested_by, requested_status, reason, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, attendance_id, student_id, requested_by, requested_status, reason, createdAt]
    );
    return await getQuery(`SELECT * FROM attendance_corrections WHERE id = ?`, [id]);
  },

  getCorrections: async (status = 'pending') => {
    return await allQuery(
      `SELECT c.*, a.subject_id, a.attendance_date, a.attendance_status as current_status, u.name as student_name
       FROM attendance_corrections c
       LEFT JOIN attendance a ON c.attendance_id = a.attendance_id
       LEFT JOIN users u ON UPPER(c.student_id) = UPPER(u.studentId)
       WHERE c.status = ?
       ORDER BY c.createdAt DESC`,
      [status]
    );
  },

  approveCorrection: async (correctionId, adminEmail, decision) => {
    const corr = await getQuery(`SELECT * FROM attendance_corrections WHERE id = ?`, [correctionId]);
    if (!corr) return null;

    if (decision === 'approved') {
      await runQuery(`UPDATE attendance SET attendance_status = ? WHERE attendance_id = ?`, [corr.requested_status, corr.attendance_id]);
      await runQuery(`UPDATE attendance_corrections SET status = 'approved', approved_by = ? WHERE id = ?`, [adminEmail, correctionId]);
    } else {
      await runQuery(`UPDATE attendance_corrections SET status = 'rejected', approved_by = ? WHERE id = ?`, [adminEmail, correctionId]);
    }
    return await getQuery(`SELECT * FROM attendance_corrections WHERE id = ?`, [correctionId]);
  }
};

module.exports = { db, usersDb, recordsDb, otpsDb, logsDb, attendanceDb };

