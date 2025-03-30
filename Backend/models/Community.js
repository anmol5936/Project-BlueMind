import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  festival: { type: String, required: true },
  practice: { type: String, required: true },
  region: { type: String, required: true },
});

export const Community = mongoose.model("Community", communitySchema);
