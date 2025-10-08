"use client";

import { useState } from "react";
import { FileText, Upload, UploadCloud, UserPlus } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import * as XLSX from "xlsx";

export default function AdminAddMember() {
  const [formData, setFormData] = useState({
    name: "",
    photo: null,
    email: "",
    phone: "",
    department: "",
    kgidNumber: "",
    permanentAddress: "",
    currentAddress: "",
    guardian: "",
    dob: "",
    designation: "",
    workingCollegeName: "",
    role: "member",
    memberType: "",
    joiningDate: "",
    resignDate: "",
    societyNumber: "",
    status: "active",
  });

  const [previewData, setPreviewData] = useState([]);
  const [preview, setPreview] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const { getToken } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setFormData({ ...formData, photo: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle single member submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) formDataToSend.append(key, value);
      });

      const token = await getToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/add`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Member added successfully!");
      console.log("Member added:", response.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add member.");
    }
  };

  // Handle bulk file
  const handleBulkFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(jsonData.slice(0, 5));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Upload bulk
  const handleBulkUpload = async () => {
    if (!bulkFile) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const token = await getToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Bulk upload successful");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Bulk upload failed");
    }
  };

  const departments = [
    { value: "at", label: "Automobile Engineering" },
    { value: "ch", label: "Chemical Engineering" },
    { value: "ce", label: "Civil Engineering" },
    { value: "cs", label: "Computer Science Engineering" },
    { value: "ec", label: "Electronics & Communication Engineering" },
    { value: "eee", label: "Electrical & Electronics Engineering" },
    { value: "me", label: "Mechanical Engineering" },
    { value: "po", label: "Polymer Engineering" },
    { value: "sc", label: "Science and English" },
    { value: "--", label: "Other" },
  ];

  const designations = [
    "Lecturer",
    "Senior Lecturer",
    "Selection Grade Lecturer",
    "Principal",
    "SDA",
    "FDA",
    "Registrar",
    "Superintendent",
    "Instructor",
    "Other",
  ];

  const roles = ["member", "admin"];
  const memberTypes = ["A", "B", "C"];
  const statuses = ["active", "closed"];

  const inputStyle =
    "mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
      {/* Bulk Upload Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 shadow-lg rounded-xl p-6 md:p-8 border border-green-200">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-green-900 flex items-center gap-2">
          📂 Bulk Upload Members{" "}
          <UploadCloud className="w-7 h-7 text-green-600" />
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow cursor-pointer hover:bg-green-700 transition w-full md:w-auto justify-center">
            <FileText className="w-5 h-5" />
            <span>Select Excel/CSV</span>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleBulkFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleBulkUpload}
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition flex items-center gap-2 justify-center w-full md:w-auto"
          >
            <Upload className="w-5 h-5" />
            Upload Excel
          </button>
        </div>

        {bulkFile && (
          <p className="mt-2 text-sm text-gray-700">
            Selected file: {bulkFile.name}
          </p>
        )}

        {previewData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h3 className="font-semibold text-gray-800">
              Preview (first 5 rows):
            </h3>
            <table className="table-auto border-collapse border border-gray-400 mt-2 w-full text-sm">
              <thead className="bg-green-200">
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="border border-gray-400 px-2 py-1">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="odd:bg-green-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="border border-gray-400 px-2 py-1">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Member Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-lg rounded-xl p-6 md:p-8 border border-indigo-200">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
          ➕ Add Single Member <UserPlus className="w-7 h-7 text-indigo-600" />
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className={inputStyle}
              required
              placeholder="ALL CAPITAL LETTERS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className={inputStyle}
              placeholder="Used to login"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              onChange={handleChange}
              className={inputStyle}
              value={formData.role}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              onChange={handleChange}
              className={inputStyle}
              placeholder="10 digit phone number"
            />
          </div>

          {/* Additional Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Member Type
            </label>
            <select
              name="memberType"
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select Type</option>
              {memberTypes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Society Number
            </label>
            <input
              type="text"
              name="societyNumber"
              onChange={handleChange}
              className={inputStyle}
              placeholder="e.g. KPT-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Joining Date
            </label>
            <input
              type="date"
              name="joiningDate"
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resign Date
            </label>
            <input
              type="date"
              name="resignDate"
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              onChange={handleChange}
              className={inputStyle}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="department"
              onChange={handleChange}
              className={inputStyle}
              defaultValue=""
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Designation
            </label>
            <select
              name="designation"
              onChange={handleChange}
              className={inputStyle}
              defaultValue=""
            >
              <option value="" disabled>
                Select Designation
              </option>
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Working College Name
            </label>
            <input
              type="text"
              name="workingCollegeName"
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          {/* Other Personal Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              KGID Number
            </label>
            <input
              type="text"
              name="kgidNumber"
              onChange={handleChange}
              className={inputStyle}
              placeholder="KGID Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Guardian
            </label>
            <input
              type="text"
              name="guardian"
              onChange={handleChange}
              className={inputStyle}
              placeholder="Father / Mother / Husband"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Permanent Address
            </label>
            <textarea
              name="permanentAddress"
              onChange={handleChange}
              rows={3}
              className={inputStyle}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Current Address
            </label>
            <textarea
              name="currentAddress"
              onChange={handleChange}
              rows={3}
              className={inputStyle}
            />
          </div>

          {/* Photo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow cursor-pointer hover:bg-indigo-700 transition">
                <Upload className="w-5 h-5" />
                <span>Choose Image</span>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border shadow"
                />
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
            >
              ➕ Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
