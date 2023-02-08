const catchAsyncError = require("./catchAsyncError");
const User = require("../models/userModel");
const ErrorHander = require("../utils/errorHander");
const jwt = require("jsonwebtoken")
exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    console.log("isAuthenticated")
    const bearerHeader = req.headers["authorization"];
  
    if (typeof bearerHeader !== "undefined") {
      
      const bearer = bearerHeader.split(" ");
      const token = bearer[1];
      jwt.verify(token, "DF983kjhfqn7@$@%*bjbfh12_", async (err, decodedData) => {
        if (err) {
          return next(new ErrorHander("Invalid token", 401));
        } else {
         
          req.user = await User.findById(decodedData.userID); 
          
          if(!req.user ){
            return next(new ErrorHander("You are not a Valid User ",400));
          }
         
          next();
         
        }
      });
  
      
    } 
    else {
      
      return next(
        new ErrorHander(
          "PLease login to access this resouces . Invalid token",
          401
        )
      );
    }
  });