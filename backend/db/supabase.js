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
module.exports = {
  usersDb,
  otpsDb,
  logsDb,
  recordsDb,
  attendanceDb
};
