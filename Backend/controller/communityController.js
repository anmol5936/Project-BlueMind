import { Community } from "../models/Community.js";

export const communityPost = async (req, res) => {
  try {
    const { festival, practice, region } = req.body;
    const community = new Community({
      festival: festival,
      practice: practice,
      region: region,
    });
    await community.save();
    return res.status(200).json({ message: "Sucessfully saved the data" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const communityGet = async (req, res) => {
  try {
    const { region } = req.body;
    const data = await Community.find({ region });
    return res
      .status(200)
      .json({ message: "Sucessfully retrived the data", data: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
