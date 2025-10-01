import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Convert buffer → stream and upload to Cloudinary
export const uploadToCloudinary = (req, res, next) => {
  if (!req.file) return next();

  const stream = cloudinary.uploader.upload_stream(
    { folder: "kpt society users" },
    (err, result) => {
      if (err) return next(err);

      req.file.cloudinaryUrl = result.secure_url; // store URL
      next();
    }
  );

  const bufferStream = new Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null);
  bufferStream.pipe(stream);
};

// Middleware for single file
export const uploadSingleImage = [upload.single("photo"), uploadToCloudinary];
