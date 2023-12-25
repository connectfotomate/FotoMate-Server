import express from "express";
import {
  vendorEmailVerify,
  vendorLoginVerify,
  vendorResendOtp,
  vendorSignup,
} from "../controllers/vendorController.js";

const vendorRoute = express();

vendorRoute.post("/signup", vendorSignup);
vendorRoute.post("/otp", vendorEmailVerify);
vendorRoute.post("/resend", vendorResendOtp);
vendorRoute.post("/login", vendorLoginVerify);

export default vendorRoute;
