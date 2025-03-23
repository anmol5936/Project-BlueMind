import bcrypt from "bcryptjs";
import { Farmer } from "../models/Farmer.js";
import jwt from "jsonwebtoken";

export const registerFarmer = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      username,
      password,
      preferredLanguage,
      villageName,
      mainWaterPractice,
      waterPracticeDetails,
      mainWaterSource,
      currentTechUsage,
      loginMethod,
    } = req.body;

    // Check if farmer exists
    const existingFarmer = await Farmer.findOne({ phoneNumber });
    if (existingFarmer)
      return res
        .status(400)
        .json({ message: "Phone number already registered" });

    if (username) {
      const existingUsername = await Farmer.findOne({ username });
      if (existingUsername)
        return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password if provided
    let hashedPassword;
    if (loginMethod === "password" && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create farmer
    const farmer = new Farmer({
      fullName,
      phoneNumber,
      username,
      password: hashedPassword,
      preferredLanguage,
      villageName,
      mainWaterPractice,
      waterPracticeDetails,
      mainWaterSource,
      currentTechUsage,
      loginMethod: loginMethod || "otp",
    });
    await farmer.save();

    const token = jwt.sign(
      {
        id: farmer._id,
        fullName: farmer.fullName,
        phoneNumber: farmer.phoneNumber,
        username: farmer.username,
        preferredLanguage: farmer.preferredLanguage,
        villageName: farmer.villageName,
        loginMethod: farmer.loginMethod,
      },
      "2478a4e47b9c1389f9e1946615413f4fdff16d70857904fe0b0662ebd617a2a3",
      { expiresIn: "1h" }
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${phoneNumber}: ${otp}`); // Mock SMS

    res.status(201).json({
      message: "Registration successful, please verify OTP or log in",
      token,
      farmer: farmer,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error",
      errorMessage: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const farmer = await Farmer.findOne({ phoneNumber });
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${phoneNumber}: ${otp}`); // Mock SMS, replace with Twilio

    // In production, store OTP temporarily (e.g., Redis) with expiration
    res.status(200).json({ message: "OTP sent", otp }); // For dev; remove OTP in prod
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const farmer = await Farmer.findOne({ phoneNumber });
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    const expectedOtp = "123456"; // Replace with actual OTP validation
    if (otp !== expectedOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token, farmer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { username, password } = req.body;
    const farmer = await Farmer.findOne({ username: username });
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    if (farmer.loginMethod !== "password") {
      return res.status(400).json({ message: "This account uses OTP login" });
    }

    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: farmer._id,
        fullName: farmer.fullName,
        phoneNumber: farmer.phoneNumber,
        username: farmer.username,
        preferredLanguage: farmer.preferredLanguage,
        villageName: farmer.villageName,
        loginMethod: farmer.loginMethod,
      },
      "2478a4e47b9c1389f9e1946615413f4fdff16d70857904fe0b0662ebd617a2a3",
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token, farmer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
