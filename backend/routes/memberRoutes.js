import express from "express";
import multer from "multer";

import {
  addMember,
  bulkUploadMembers,
  deleteMember,
  getMember,
  getMembers,
  updateMember,
} from "../controllers/memberController.js";
import { uploadSingleImage } from "../middlewares/upload.js";
import { requireAuthWithRole } from "../middlewares/auth.js";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

// Only admins can add members
router.post(
  "/add",
  requireAuthWithRole(["admin"]),
  uploadSingleImage,
  addMember
);

router.post(
  "/bulk",
  requireAuthWithRole(["admin"]),
  upload.single("file"), // Excel/CSV file
  bulkUploadMembers
);
router.get("/", requireAuthWithRole(["admin"]), getMembers);
router.get("/:id", requireAuthWithRole(["admin", "member"]), getMember);
router.put(
  "/:id",
  requireAuthWithRole(["admin"]),
  uploadSingleImage,
  updateMember
);
router.delete("/:id", requireAuthWithRole(["admin"]), deleteMember);

export default router;
