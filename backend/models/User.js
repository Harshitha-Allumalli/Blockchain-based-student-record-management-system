const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'student', 'verifier'],
        default: 'student'
    },
    studentId: { type: String },  // only for student role
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
