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

    memberType: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },
    joiningDate: { type: Date, required: true },
    resignDate: { type: Date },
    societyNumber: { type: String, unique: true },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;
