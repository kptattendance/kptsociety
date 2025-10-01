"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Save, X } from "lucide-react";

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editData, setEditData] = useState({});
  const [preview, setPreview] = useState(null);
  const { getToken } = useAuth();

  // Dropdown options
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
  ];

  const designations = [
    "Lecturer",
    "Senior Lecturer",
    "Selection Grade Lecturer",
    "Principal",
    "SDA",
    "FDA",
    "Registrar",
    "Superindent",
  ];

  // Fetch all members
  const fetchMembers = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(response.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(members.filter((m) => m._id !== id));
      alert("Member deleted successfully");
    } catch (err) {
      console.error("Error deleting member:", err);
      alert("Failed to delete member");
    }
  };

  // Handle edit input change
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setEditData({ ...editData, photo: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  // Handle update
  const handleUpdate = async (id) => {
    try {
      const token = await getToken();
      const formData = new FormData();

      Object.entries(editData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Member updated successfully");
      setEditingMemberId(null);
      setPreview(null);
      fetchMembers();
    } catch (err) {
      console.error("Error updating member:", err);
      alert("❌ Failed to update member");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">⏳ Loading members...</div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        👥 Members List
      </h2>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="px-3 py-2">Photo</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">KGID</th>
              <th className="px-3 py-2">Guardian</th>
              <th className="px-3 py-2">DOB</th>
              <th className="px-3 py-2">Designation</th>
              <th className="px-3 py-2">Working College</th>
              <th className="px-3 py-2">Permanent Address</th>
              <th className="px-3 py-2">Current Address</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member._id}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* Photo */}
                <td className="px-3 py-2 text-center">
                  {editingMemberId === member._id ? (
                    <div>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleEditChange}
                      />
                      {(preview || member.photo) && (
                        <img
                          src={preview || member.photo}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover mt-1 mx-auto"
                        />
                      )}
                    </div>
                  ) : member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <span className="text-gray-400">No Photo</span>
                  )}
                </td>

                {/* Editable vs Normal Rows */}
                {editingMemberId === member._id ? (
                  <>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        name="name"
                        value={editData.name || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">{member.email}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        name="phone"
                        value={editData.phone || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        name="department"
                        value={editData.department || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      >
                        {departments.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        name="kgidNumber"
                        value={editData.kgidNumber || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        name="guardian"
                        value={editData.guardian || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        name="dob"
                        value={
                          editData.dob ||
                          (member.dob
                            ? new Date(member.dob).toISOString().split("T")[0]
                            : "")
                        }
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        name="designation"
                        value={editData.designation || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      >
                        {designations.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        name="workingCollegeName"
                        value={editData.workingCollegeName || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <textarea
                        name="permanentAddress"
                        value={editData.permanentAddress || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <textarea
                        name="currentAddress"
                        value={editData.currentAddress || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        name="role"
                        value={editData.role || "member"}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleUpdate(member._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingMemberId(null);
                          setPreview(null);
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{member.name}</td>
                    <td className="px-3 py-2">{member.email}</td>
                    <td className="px-3 py-2">{member.phone}</td>
                    <td className="px-3 py-2">{member.department}</td>
                    <td className="px-3 py-2">{member.kgidNumber}</td>
                    <td className="px-3 py-2">{member.guardian}</td>
                    <td className="px-3 py-2">
                      {member.dob
                        ? new Date(member.dob).toISOString().split("T")[0]
                        : ""}
                    </td>
                    <td className="px-3 py-2">{member.designation}</td>
                    <td className="px-3 py-2">{member.workingCollegeName}</td>
                    <td className="px-3 py-2">{member.permanentAddress}</td>
                    <td className="px-3 py-2">{member.currentAddress}</td>
                    <td className="px-3 py-2">{member.role}</td>
                    <td className="px-3 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setEditingMemberId(member._id);
                          setEditData(member);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
