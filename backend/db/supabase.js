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
module.exports={

usersDb,

otpsDb,

logsDb

};
