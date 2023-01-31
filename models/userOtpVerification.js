const mongoose = require("mongoose");

const userOtpVerificationSchema = new mongoose.Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date

})

module.exports = mongoose.model("userOtpVerification",userOtpVerificationSchema);