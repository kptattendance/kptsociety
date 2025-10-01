import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true }, // Clerk user ID
    name: { type: String, required: true },
    photo: { type: String }, // Cloudinary URL
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    kgidNumber: { type: String },
    permanentAddress: { type: String },
    currentAddress: { type: String },
    guardian: { type: String },
    dob: { type: Date },
    designation: { type: String, required: true },
    workingCollegeName: { type: String },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;
