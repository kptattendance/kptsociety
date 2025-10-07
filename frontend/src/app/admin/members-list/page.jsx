"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Save, X } from "lucide-react";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching members...");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editData, setEditData] = useState({});
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const { getToken } = useAuth();

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
    "Superintendent",
  ];

  // 🔍 Filtered + Paginated Data
  const filteredMembers = members.filter((member) => {
    const term = search.toLowerCase();
    return (
      member.name?.toLowerCase().includes(term) ||
      member.phone?.toLowerCase().includes(term) ||
      member.department?.toLowerCase().includes(term) ||
      member.kgidNumber?.toLowerCase().includes(term) ||
      member.designation?.toLowerCase().includes(term) ||
      member.workingCollegeName?.toLowerCase().includes(term) ||
      member.role?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredMembers, totalPages]);

  // 🧾 Fetch members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching members...");
      const token = await getToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(response.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // ❌ Delete member
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Deleting member...");
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(members.filter((m) => m._id !== id));
      toast.success("Member deleted successfully");
    } catch (err) {
      console.error("Error deleting member:", err);
      toast.error("Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Handle input change
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

  // 💾 Update member
  const handleUpdate = async (id) => {
    try {
      setLoading(true);
      setLoadingMessage("Updating member...");
      const token = await getToken();
      const formData = new FormData();
      Object.entries(editData).forEach(([key, value]) => {
        if (value) formData.append(key, value);
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

      toast.success("Member updated successfully");
      setEditingMemberId(null);
      setPreview(null);
      fetchMembers();
    } catch (err) {
      console.error("Error updating member:", err);
      toast.error("Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  // 🌈 UI
  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-50 to-violet-100 p-6">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl shadow-inner">
        <LoadOverlay show={loading} message={loadingMessage} />

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          👥 Members List
        </h2>

        {/* 🔍 Search Bar */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, phone, dept, KGID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        {/* 🧾 Table */}
        <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 bg-white">
          <table className="min-w-full text-sm sm:text-base text-gray-700">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <tr>
                {[
                  "Sl. No.",
                  "Photo",
                  "Name",
                  "Email",
                  "Phone",
                  "Department",
                  "KGID",
                  "Guardian",
                  "DOB",
                  "Designation",
                  "Working College",
                  "Permanent Address",
                  "Current Address",
                  "Role",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-3 py-3 text-left font-medium whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="15" className="text-center py-6 text-gray-500">
                    No members found.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, index) => (
                  <tr
                    key={member._id}
                    className="border-b hover:bg-indigo-50 transition duration-200"
                  >
                    {/* SL. No. */}
                    <td className="px-4 py-2 text-gray-600">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>

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
                        <span className="text-gray-400 italic">No Photo</span>
                      )}
                    </td>

                    {/* Editable / Read-only Rows */}
                    {editingMemberId === member._id ? (
                      <EditableRow
                        member={member}
                        editData={editData}
                        handleEditChange={handleEditChange}
                        handleUpdate={handleUpdate}
                        setEditingMemberId={setEditingMemberId}
                        setPreview={setPreview}
                        departments={departments}
                        designations={designations}
                      />
                    ) : (
                      <ReadOnlyRow
                        member={member}
                        setEditingMemberId={setEditingMemberId}
                        setEditData={setEditData}
                        handleDelete={handleDelete}
                      />
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination Controls */}
        {filteredMembers.length > rowsPerPage && (
          <div className="flex justify-between items-center mt-6 text-sm sm:text-base">
            <p className="text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Helper Components

function ReadOnlyRow({
  member,
  setEditingMemberId,
  setEditData,
  handleDelete,
}) {
  return (
    <>
      <td className="px-3 py-2">{member.name}</td>
      <td className="px-3 py-2">{member.email}</td>
      <td className="px-3 py-2">{member.phone}</td>
      <td className="px-3 py-2">{member.department}</td>
      <td className="px-3 py-2">{member.kgidNumber}</td>
      <td className="px-3 py-2">{member.guardian}</td>
      <td className="px-3 py-2">
        {member.dob ? new Date(member.dob).toISOString().split("T")[0] : ""}
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
          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded flex items-center gap-1 hover:opacity-90 transition"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => handleDelete(member._id)}
          className="px-3 py-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded flex items-center gap-1 hover:opacity-90 transition"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </td>
    </>
  );
}

function EditableRow({
  member,
  editData,
  handleEditChange,
  handleUpdate,
  setEditingMemberId,
  setPreview,
  departments,
  designations,
}) {
  return (
    <>
      <td className="px-3 py-2">
        <input
          type="text"
          name="name"
          value={editData.name || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full focus:ring focus:ring-indigo-300"
        />
      </td>
      <td className="px-3 py-2">{member.email}</td>
      <td className="px-3 py-2">
        <input
          type="text"
          name="phone"
          value={editData.phone || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full focus:ring focus:ring-indigo-300"
        />
      </td>
      <td className="px-3 py-2">
        <select
          name="department"
          value={editData.department || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          {departments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
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
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          name="guardian"
          value={editData.guardian || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="date"
          name="dob"
          value={
            editData.dob ||
            (member.dob ? new Date(member.dob).toISOString().split("T")[0] : "")
          }
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="px-3 py-2">
        <select
          name="designation"
          value={editData.designation || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
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
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="px-3 py-2">
        <textarea
          name="permanentAddress"
          value={editData.permanentAddress || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="px-3 py-2">
        <textarea
          name="currentAddress"
          value={editData.currentAddress || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>
      <td className="px-3 py-2">
        <select
          name="role"
          value={editData.role || "member"}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-3 py-2 flex gap-2 justify-center">
        <button
          onClick={() => handleUpdate(member._id)}
          className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded flex items-center gap-1 hover:opacity-90 transition"
        >
          <Save className="w-4 h-4" /> Save
        </button>
        <button
          onClick={() => {
            setEditingMemberId(null);
            setPreview(null);
          }}
          className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded flex items-center gap-1 hover:opacity-90 transition"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </td>
    </>
  );
}
