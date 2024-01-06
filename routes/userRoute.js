import express from "express";
import {
  emailOtpVerification,
  forgotPassword,
  resendOtp,
  userSignup,
  resetPassword,
  userLogin,
  getUserDetails,
  google,
  vendorList,
  singleStudio
} from "../controllers/userController.js";
import { userTokenVerify } from '../middlewares/authVerify.js'
import { createStudio } from "../controllers/vendorController.js";
const userRoute = express();

userRoute.post("/signup", userSignup);

userRoute.post("/otp", emailOtpVerification);
userRoute.post("/resendOtp", resendOtp);
userRoute.post("/forgotPassword", forgotPassword);
userRoute.put("/resetPassword/:id/:token", resetPassword);
userRoute.post("/login", userLogin);
userRoute.get("/userList", getUserDetails);
userRoute.get("/vendorList", vendorList);
userRoute.post("/google", google);
userRoute.get("/singleStudio/:vendorId", singleStudio);



export default userRoute;
