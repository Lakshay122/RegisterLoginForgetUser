const express = require('express');
const { registerUser, loginUser, sendUserPasswordResetEmail, VerifyOtp, resetPassword } = require('../Controller/userController');

const router = express.Router();

router.route("/user/registeruser").post(registerUser);
router.route("/user/loginuser").post(loginUser);
router.route("/user/sendemail").post(sendUserPasswordResetEmail);
router.route("/user/verifyotp").post(VerifyOtp);
router.route("/user/forgetpassword").post(resetPassword)

module.exports = router