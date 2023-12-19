import express from "express";
import {
  emailOtpVerification,
  forgetPassword,
  resendOtp,
  userSignup,
  resetPassword,
  userLogin,
  getUserDetails
} from "../controllers/userController.js";
const userRoute = express();

console.log('hi from route')
userRoute.post("/signup", userSignup);

userRoute.post("/otp", emailOtpVerification);
userRoute.post("/resendOtp", resendOtp);
userRoute.post("/forget", forgetPassword);
userRoute.post("/reset", resetPassword);
userRoute.post("/login", userLogin);
userRoute.get("/userList", getUserDetails);


export default userRoute;
