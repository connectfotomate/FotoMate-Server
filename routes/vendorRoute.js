import express from "express";
import {
  createStudio,
  vendorEmailVerify,
  vendorLoginVerify,
  vendorResendOtp,
  vendorSignup,
  vendorStudio,
} from "../controllers/vendorController.js";

const vendorRoute = express();

vendorRoute.post("/signup", vendorSignup);
vendorRoute.post("/otp", vendorEmailVerify);
vendorRoute.post("/resend", vendorResendOtp);
vendorRoute.post("/login", vendorLoginVerify);
vendorRoute.post("/addStudio", createStudio);
vendorRoute.get("/studio/:vendorId", vendorStudio);

export default vendorRoute;
