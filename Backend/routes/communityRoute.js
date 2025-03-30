import express from "express";
import {
  communityGet,
  communityPost,
} from "../controller/communityController.js";

export const communityRoute = express.Router();

communityRoute.post("/community", communityPost);
communityRoute.post("/get-community", communityGet);
