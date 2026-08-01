const supabase = require("../config/supabase");
const usersDb = {

  async findByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email)
      .single();

    if (error || !data) return null;

    return data;
  },

  async findByStudentId(studentId) {

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("studentId", studentId)
      .single();

    if (error || !data) return null;

    return data;

  },

  async create(user) {

    const row = {

      id: user.id || Date.now().toString(),

      name: user.name,

      email: user.email.toLowerCase().trim(),

      password: user.password,

      role: user.role || "student",

      studentId: user.studentId || null,

      isVerified: user.isVerified ?? true,

      createdAt: user.createdAt || new Date().toISOString()

    };

    const { error } = await supabase

      .from("users")

      .insert(row);

    if (error) throw error;

    return await this.findByEmail(user.email);

  },

  async updatePassword(email, newPassword) {

    const { error } = await supabase

      .from("users")

      .update({

        password: newPassword

      })

      .ilike("email", email);

    if (error) throw error;

    return await this.findByEmail(email);

  }

};
const otpsDb = {

async findByEmail(email){

const {data,error}=await supabase

.from("otps")

.select("*")

.ilike("email",email)

.single();

if(error||!data) return null;

return data;

},

async upsert(email,otp){

const existing=await this.findByEmail(email);

const row={

id:Date.now().toString(),

email:email.toLowerCase(),

otp,

isVerified:false,

createdAt:Date.now()

};

if(existing){

const {error}=await supabase

.from("otps")

.update({

otp,

isVerified:false,

createdAt:Date.now()

})

.ilike("email",email);

if(error) throw error;

}else{

const {error}=await supabase

.from("otps")

.insert(row);

if(error) throw error;

}

return await this.findByEmail(email);

},

async setVerified(email){

const {error}=await supabase

.from("otps")

.update({

isVerified:true

})

.ilike("email",email);

if(error) throw error;

},

async delete(email){

const {error}=await supabase

.from("otps")

.delete()

.ilike("email",email);

if(error) throw error;

}

};
const logsDb={

async add(log){

const row={

id:log.id||Date.now().toString(),

action:log.action,

actor:log.actor,

target:log.target,

details:log.details,

severity:log.severity||"info",

createdAt:new Date().toISOString()

};

const {error}=await supabase

.from("logs")

.insert(row);

if(error) throw error;

},

async findAll(limit=100){

const {data,error}=await supabase

.from("logs")

.select("*")

.order("createdAt",{ascending:false})

.limit(limit);

if(error) throw error;

return data;

}

};
const recordsDb = {

  async findAll(search = "", course = "") {

    let query = supabase
      .from("records")
      .select("*")
      .order("createdAt", { ascending: false });

    if (search) {
      query = query.or(
        `studentId.ilike.%${search}%,name.ilike.%${search}%,dataHash.ilike.%${search}%`
      );
    }

    if (course) {
      query = query.eq("course", course);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  },

  async findPending() {

    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("status", "pending")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async findByStudentIdOrHash(value) {

    const { data, error } = await supabase
      .from("records")
      .select("*")
      .or(`studentId.eq.${value},dataHash.eq.${value}`)
      .single();

    if (error || !data) return null;

    return data;
  },

  async createOrUpdate(record) {

    const { data, error } = await supabase
      .from("records")
      .upsert(record)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
  async updateStatus(studentId, status, verifiedBy) {

  const { data, error } = await supabase
    .from("records")
    .update({
      status,
      verifiedBy
    })
    .eq("studentId", studentId)
    .select()
    .single();

  if (error) throw error;

  return data;
},

async addDocument(studentId, docObj) {

  const record = await this.findByStudentIdOrHash(studentId);

  if (!record) return null;

  const documents = record.documents || [];
  documents.push(docObj);

  const { data, error } = await supabase
    .from("records")
    .update({
      documents
    })
    .eq("studentId", studentId)
    .select()
    .single();

  if (error) throw error;

  return data;
},

async deleteDocument(studentId, docId) {

  const record = await this.findByStudentIdOrHash(studentId);

  if (!record) return null;

  const documents = (record.documents || []).filter(
    d => d._id !== docId
  );

  const { data, error } = await supabase
    .from("records")
    .update({
      documents
    })
    .eq("studentId", studentId)
    .select()
    .single();

  if (error) throw error;

  return data;
},

async deleteByStudentId(studentId) {

  const { error } = await supabase
    .from("records")
    .delete()
    .eq("studentId", studentId);

  if (error) throw error;

  return true;
}

};
const attendanceDb = {

    async getEnrolledStudents(course, year) {

        let query = supabase
            .from("records")
            .select("*");

        if (course)
            query = query.eq("course", course);

        if (year)
            query = query.eq("year", year);

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    },

    async checkDuplicate(studentId, subjectId, attendanceDate) {

        // keep your existing code here

    },

    // keep the remaining attendanceDb functions...
};

    const { data, error } = await supabase
      .from("attendance")
      .select("id")
      .eq("student_id", studentId)
      .eq("subject_id", subjectId)
      .eq("attendance_date", attendanceDate)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  },

  async saveBatchAttendance(batch) {

    const rows = batch.records.map(r => ({
      id: Date.now().toString() + Math.random(),
      batch_id: batch.batchId,
      faculty_id: batch.facultyId,
      student_id: r.studentId,
      subject_id: batch.subjectId,
      course: batch.course,
      year: batch.year,
      section: batch.section,
      attendance_date: batch.date,
      attendance_status: r.status,
      transaction_hash: batch.txHash,
      attendance_hash: batch.dataHash,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from("attendance")
      .insert(rows);

    if (error) throw error;

    return rows;
  },
  async getFacultyStudentAttendance(facultyId) {

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("faculty_id", facultyId)
    .order("attendance_date", { ascending: false });

  if (error) throw error;

  return data || [];
},

async getFacultyHistory(facultyId, filterDate = null) {

  let query = supabase
    .from("attendance")
    .select("*")
    .eq("faculty_id", facultyId)
    .order("attendance_date", { ascending: false });

  if (filterDate) {
    query = query.eq("attendance_date", filterDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
},

async deleteBatch(batchId, facultyId) {

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("batch_id", batchId)
    .eq("faculty_id", facultyId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
},

async getStudentAttendance(studentId, filters = {}) {

  let query = supabase
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .order("attendance_date", { ascending: false });

  if (filters.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }

  if (filters.semester) {
    query = query.eq("semester", filters.semester);
  }

  if (filters.month) {
    query = query.like("attendance_date", `${filters.month}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
},
async createCorrectionRequest(request) {

  const row = {
    id: Date.now().toString(),
    ...request,
    status: "pending",
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("attendance_corrections")
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  return data;
},

async getAttendanceById(id) {

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return data;
},

async getOverallStats() {

  const { data, error } = await supabase
    .from("attendance")
    .select("*");

  if (error) throw error;

  const records = data || [];

  const totals = {
    total_records: records.length,
    present_count: records.filter(r => r.attendance_status === "Present").length,
    absent_count: records.filter(r => r.attendance_status === "Absent").length,
    late_count: records.filter(r => r.attendance_status === "Late").length
  };

  return {
    totals,
    studentSummaries: []
  };
},

async getBlockchainLogs(limit = 50) {

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .not("transaction_hash", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
},

async getCorrections(status = "pending") {

  const { data, error } = await supabase
    .from("attendance_corrections")
    .select("*")
    .eq("status", status);

  if (error) throw error;

  return data || [];
},

async approveCorrection(correctionId, approvedBy, decision) {

  const { data, error } = await supabase
    .from("attendance_corrections")
    .update({
      status: decision,
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    })
    .eq("id", correctionId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

};
module.exports = {
  usersDb,
  otpsDb,
  logsDb,
  recordsDb,
  attendanceDb
};
