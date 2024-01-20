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
  singleStudio,
  updateProfileImage,
  getCategories,
  filterCategories,
  studioList,
} from "../controllers/userController.js";
import { userTokenVerify } from '../middlewares/authVerify.js'
import { createStudio } from "../controllers/vendorController.js";
import {uploadOptions} from '../config/multer.js'
const userRoute = express();  

userRoute.post("/signup", userSignup);

userRoute.post("/otp", emailOtpVerification);
userRoute.post("/resendOtp", resendOtp);
userRoute.post("/forgotPassword", forgotPassword);
userRoute.put("/resetPassword/:id/:token", resetPassword);
userRoute.post("/login", userLogin);
// userRoute.get("/userList", getUserDetails);
userRoute.get("/vendorList", vendorList);
userRoute.post("/google", google);
userRoute.get("/singleStudio/:id", singleStudio);
userRoute.patch("/updateProfile", updateProfileImage);
userRoute.get('/userDetails/:id', getUserDetails);
userRoute.get('/categoryDetails',getCategories)
userRoute.get('/filterCat',filterCategories)
userRoute.get('/studioList',studioList)




export default userRoute;
