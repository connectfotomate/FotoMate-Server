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
  getPackages,
  bookPackage,
  getBooking,
  payment,
  getCheckoutPackage,
  cancelBooking,
} from "../controllers/userController.js";
import { userTokenVerify } from '../middlewares/authVerify.js'
import {uploadOptions} from '../config/multer.js'
import { vendorData } from "../controllers/chatController.js";
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
userRoute.get('/getStudioPackages',getPackages)
userRoute.post('/bookPackage',bookPackage) 
userRoute.post("/create-checkout-session",payment);
userRoute.get('/getBooking',getBooking)
userRoute.get('/getCheckoutPackage',getCheckoutPackage)
userRoute.post('/cancelBooking',cancelBooking)
 



export default userRoute;
