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
      const {
        email,
        role,
        memberType,
        joiningDate,
        resignDate,
        societyNumber,
        status,
        ...rest
      } = row;

      if (!email) continue; // skip if no email

      // 1️⃣ Create Clerk user
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        publicMetadata: { role: role || "member" },
      });

      // 2️⃣ Auto-close if resignDate present
      const finalStatus = resignDate ? "closed" : status || "active";

      // 3️⃣ Save in MongoDB
      const member = new Member({
        ...rest,
        clerkId: clerkUser.id,
        email,
        role: role || "member",
        memberType,
        joiningDate,
        resignDate: resignDate || null,
        societyNumber,
        status: finalStatus,
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
    const {
      email,
      role,
      memberType,
      joiningDate,
      resignDate,
      societyNumber,
      status,
      ...rest
    } = req.body;

    // 1️⃣ Create Clerk user
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      publicMetadata: { role: role || "member" },
    });

    // 2️⃣ Determine status
    const finalStatus = resignDate ? "closed" : status || "active";

    // 3️⃣ Save member in MongoDB
    const member = new Member({
      ...rest,
      clerkId: clerkUser.id,
      email,
      role: role || "member",
      memberType,
      joiningDate,
      resignDate: resignDate || null,
      societyNumber,
      status: finalStatus,
      photo: req.file?.cloudinaryUrl || null,
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

// Helper function
const findMemberByIdOrClerk = async (id) => {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const member = await Member.findById(id);
    if (member) return member;
  }
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

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      email,
      role,
      memberType,
      joiningDate,
      resignDate,
      societyNumber,
      status,
      ...rest
    } = req.body;

    const member = await findMemberByIdOrClerk(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const userId = member.clerkId;

    // -------------------- EMAIL UPDATE -------------------- //
    if (email && email !== member.email) {
      // 1. Add new email (auto verified)
      const newEmailObj = await clerkClient.emailAddresses.createEmailAddress({
        userId,
        emailAddress: email,
        verified: true,
        primary: true,
      });

      // 2. Delete old email
      const clerkUser = await clerkClient.users.getUser(userId);
      const oldEmailObj = clerkUser.emailAddresses.find(
        (e) => e.emailAddress === member.email
      );

      if (oldEmailObj) {
        await clerkClient.emailAddresses.deleteEmailAddress(oldEmailObj.id);
      }

      member.email = email;
    }

    // -------------------- ROLE UPDATE -------------------- //
    if (role && role !== member.role) {
      const allowedRoles = ["member", "secretary", "treasurer", "admin"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      await clerkClient.users.updateUser(userId, {
        publicMetadata: { role },
      });

      member.role = role;
    }

    // -------------------- PHOTO UPDATE -------------------- //
    if (req.file?.cloudinaryUrl) {
      if (member.photo) {
        const publicId = member.photo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`kpt society users/${publicId}`);
      }
      member.photo = req.file.cloudinaryUrl;
    }

    // -------------------- OTHER FIELDS -------------------- //
    if (memberType) member.memberType = memberType;
    if (joiningDate) member.joiningDate = joiningDate;
    if (societyNumber) member.societyNumber = societyNumber;

    if (resignDate) {
      member.resignDate = resignDate;
      member.status = "closed";
    } else if (status) {
      member.status = status;
    }

    Object.assign(member, rest);
    await member.save();

    res.json({
      message: "Member updated successfully",
      member,
    });
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
