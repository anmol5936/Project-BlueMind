import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  preferredLanguage: { type: String, required: true, default: "हिंदी" },
  villageName: { type: String, required: true },
  district: { type: String },
  state: { type: String },
  mainWaterPractice: { type: String, required: true },
  waterPracticeDetails: { type: String },
  mainWaterSource: { type: String, required: true },
  currentTechUsage: { type: String, required: true },
  loginMethod: { type: String, enum: ["otp", "password"], default: "password" },
  createdAt: { type: Date, default: Date.now },
});

export const Farmer = mongoose.model("Farmer", farmerSchema);
