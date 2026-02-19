import express from "express";
import upload from "../middlewares/upload.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();


router.post("/thumbnail", upload.single("image"), async (req, res) => {
  try {
        console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "devswipe/projects" }
    );

    res.status(201).json({ thumbnailUrl: uploadResult.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
