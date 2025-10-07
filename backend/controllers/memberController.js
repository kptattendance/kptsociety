import Member from "../models/memberModel.js";
import cloudinary from "../config/cloudinary.js";
import { clerkClient } from "@clerk/express";

import XLSX from "xlsx";

// -------------------- BULK UPLOAD MEMBERS --------------------
export const bulkUploadMembers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel/CSV file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const createdMembers = [];

    for (const row of worksheet) {
      const { email, role, ...rest } = row;

      if (!email) continue; // skip if no email

      // 1️⃣ Create Clerk user
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        publicMetadata: { role: role || "member" },
      });

      // 2️⃣ Save in MongoDB
      const member = new Member({
        ...rest,
        clerkId: clerkUser.id,
        email,
        role: role || "member",
        photo: null, // no image for bulk
      });

      await member.save();
      createdMembers.push(member);
    }

    res.status(201).json({
      message: "Bulk upload successful",
      count: createdMembers.length,
      members: createdMembers,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- ADD MEMBER --------------------
export const addMember = async (req, res) => {
  try {
    const { email, role, ...rest } = req.body;

    // 1️⃣ Create Clerk user
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      // password: "Test@1234", // Temporary password
      publicMetadata: { role },
    });

    // 2️⃣ Save member in MongoDB
    const member = new Member({
      ...rest,
      clerkId: clerkUser.id,
      email,
      role,
      photo: req.file?.cloudinaryUrl || null, // Use your upload middleware
    });

    await member.save();
    res.status(201).json({ member, clerkId: clerkUser.id });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- GET MEMBERS --------------------
export const getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const findMemberByIdOrClerk = async (id) => {
  // If it's a valid Mongo ObjectId, try that first
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const member = await Member.findById(id);
    if (member) return member;
  }
  // Otherwise, fall back to Clerk ID
  return await Member.findOne({ clerkId: id });
};

// -------------------- GET SINGLE MEMBER --------------------
export const getMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await findMemberByIdOrClerk(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error("Get Member Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- UPDATE MEMBER --------------------
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, ...rest } = req.body;

    let member = await findMemberByIdOrClerk(id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Handle photo update
    if (req.file?.cloudinaryUrl) {
      if (member.photo) {
        const publicId = member.photo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`kpt society users/${publicId}`);
      }
      member.photo = req.file.cloudinaryUrl;
    }

    // Sync Clerk user if email/role updated
    if (email || role) {
      await clerkClient.users.updateUser(member.clerkId, {
        emailAddress: email ? [email] : undefined,
        publicMetadata: role ? { role } : undefined,
      });
      member.email = email || member.email;
      member.role = role || member.role;
    }

    Object.assign(member, rest);
    await member.save();

    res.json(member);
  } catch (error) {
    console.error("Update Member Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- DELETE MEMBER --------------------
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await findMemberByIdOrClerk(id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    if (member.clerkId) {
      await clerkClient.users.deleteUser(member.clerkId);
    }

    if (member.photo) {
      const publicId = member.photo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`kpt society users/${publicId}`);
    }

    await member.deleteOne();
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Delete Member Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
