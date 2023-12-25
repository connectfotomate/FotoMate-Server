import express from "express";
import {
  emailOtpVerification,
  forgotPassword,
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
userRoute.post("/forgotPassword", forgotPassword);
userRoute.put("/resetPassword/:id/:token", resetPassword);
userRoute.post("/login", userLogin);
userRoute.get("/userList", getUserDetails);


export default userRoute;
