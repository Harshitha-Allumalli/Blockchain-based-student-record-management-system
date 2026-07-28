const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes expiry
});

module.exports = mongoose.model('OTP', OTPSchema);
