const ErrorHander = require("../utils/errorHander");
const User = require("../models/userModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const bcrypt = require("bcryptjs");
const userOtpVerification = require("../models/userOtpVerification");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail")
var emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHander("All Fields are required", 400));
  var valid = emailRegex.test(email);
  if (!valid)
    return next(new ErrorHander("Please give the valid email address", 400));
    const alreadyUser = await User.findOne({email:email});
    if(alreadyUser) return next(new ErrorHander("User already exits with this email",400))
  const trimmedPassword = password.trim();
  if (trimmedPassword.length < 6)
    return next(
      new ErrorHander(
        "Password Length Should be Greater than or Equal to 6. Spaces not be considered",
        400
      )
    );
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    message: "User Register Successfuly",
    user: user,
  });
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(
      new ErrorHander("Email and Password is mandatory for login", 400)
    );

  const user = await User.findOne({ email: email, password: password });
  if (!user)
    return next(new ErrorHander("Email or Password is not valid", 400));
    
  res.status(200).json({
    success: true,
    message: "User login Successfully",
  });
});

//send otp on email && generate the hash
exports.sendUserPasswordResetEmail = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const user = await User.findOne({ email: email });
    if (user) {
      //send mail
      try {
        const otp = `${Math.floor(100000 + Math.random() * 9000)}`;
        const saltRounds = 10;
        const hashOtp = await bcrypt.hash(otp, saltRounds);
        await userOtpVerification.deleteMany({ userID: user._id });
        const newOtpVerification = await new userOtpVerification({
          userId: user._id,
          otp: hashOtp,
          createdAt: Date.now(),
          expiresAt: Date.now() + 300000,
        });
        await newOtpVerification.save();

        await sendEmail({
          email: user.email,
          subject: "Verify Your email",
          html: `<p>Enter this <b>${otp}</b> in the app to verify your email</p>.<p>This code expires in <b>5 Minutes</b></p>.`,
        });
        res.status(200).json({
          success: true,
          message:
            "Otp Sent successfully. Please Check your email and spam box also",
        });
      } catch (error) {
        return next(new ErrorHander(error, 400));
      }
    } else {
      return next(new ErrorHander("Email doesn't exists", 400));
    }
  } else {
    return next(new ErrorHander("Email field is required", 400));
  }
});

//verify otp
exports.VerifyOtp = catchAsyncError(async (req, res, next) => {
  const { otp, email } = req.body;
  if (!otp) return next(new ErrorHander("please enter the otp", 400));
  if (!email) return next(new ErrorHander("please enter the email", 400));
  const user = await User.findOne({ email: email });
  if (user) {
    const otpVerify = await userOtpVerification.find({ userId: user._id });
    if (otpVerify.length <= 0)
      return next(
        new ErrorHander("Something Went wrong Please request again", 400)
      );
    const { expiresAt } = otpVerify[0];
    const hashOtp = otpVerify[0].otp;
    
    if (expiresAt < Date.now()) {
      await userOtpVerification.deleteMany({ userID: user._id });
      return next(
        new ErrorHander("Code has been expired . Please request again")
      );
    }

    const validOtp = await bcrypt.compare(otp, hashOtp);
    if (!validOtp) {
      return next(new ErrorHander("Invalid Otp", 400));
    } else {
      await userOtpVerification.deleteMany({ userID: user._id });
      const ttl = 5 * 60 * 1000;
      const expires = Date.now() + ttl;
      const data = `${email}.${expires}`;
      const hash = crypto
        .createHmac("sha256", "0bacb03db26b8755676c5852e0e156152b6962dd31cf6997ea12e3101ebdcff2f9c9eefb0e89b9c7df8350a6d2b41f8be115ee8ea3d97c4fd3de6df782993f69")
        .update(data)
        .digest("hex");
      const fullHash = `${hash}.${expires}`;
      res.status(200).json({
        success: true,
        Otp: "Otp verify Successfully. Use this hash to change this password. This hash is valid only for 5 minutes",
        hash: fullHash,
      });
    }
  } else {
    return next(new ErrorHander("User does not exists", 400));
  }
});

//change password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    
  const { email, hash, password, confirm_password } = req.body;
  if (!email || !hash || !password || !confirm_password)
    return next(new ErrorHander("All fields is required", 400));

  //first check the user existence
  const user = await User.findOne({ email });
  if (user) {
    if (password === confirm_password) {
      let trimmedpassword = password;
      trimmedpassword = trimmedpassword.trim();
      if (trimmedpassword.length < 6) {
        return next(
          new ErrorHander(
            "password should be greater than or equal to 6 Characters. Spaces not be considered",
            400
          )
        );
      }
      //check the validity of hash
      let [hashValue, expires] = hash.split(".");

      let now = Date.now();
      if (now > parseInt(expires)) {
        return next(
          new ErrorHander("Your time is out . Please send the email again")
        );
      }
      let data = `${email}.${expires}`;
      let newCalculatedHash = crypto
        .createHmac("sha256", "0bacb03db26b8755676c5852e0e156152b6962dd31cf6997ea12e3101ebdcff2f9c9eefb0e89b9c7df8350a6d2b41f8be115ee8ea3d97c4fd3de6df782993f69")
        .update(data)
        .digest("hex");
      if (newCalculatedHash === hashValue) {
       
        await User.findByIdAndUpdate(user._id, {
          $set: { password: password },
        });

        res.status(200).json({
          success: true,
          message: "passord Change sucessfully",
        });
      } else {
        return next(new ErrorHander("Incorrect Hash", 401));
      }
    } else {
      return next(
        new ErrorHander("Passowrd and Confirm Password is must be same", 400)
      );
    }
  } else {
    return next(new ErrorHander("User doen not exists with this email", 400));
  }
});
