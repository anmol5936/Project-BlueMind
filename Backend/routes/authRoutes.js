import express from "express";
import {
  loginWithOtp,
  loginWithPassword,
  registerFarmer,
  sendOtp,
} from "../controller/authController.js";
export const authRoute = express.Router();

authRoute.post("/register", registerFarmer);
authRoute.post("/send-otp", sendOtp);
authRoute.post("/login-otp", loginWithOtp);
authRoute.post("/login-password", loginWithPassword);
