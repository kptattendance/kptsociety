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

  const statuses = ["active", "closed"];

  const filteredMembers = members.filter((member) => {
    const term = search.toLowerCase();
    return (
      member.name?.toLowerCase().includes(term) ||
      member.phone?.toLowerCase().includes(term) ||
      member.department?.toLowerCase().includes(term) ||
      member.kgidNumber?.toLowerCase().includes(term) ||
      member.designation?.toLowerCase().includes(term) ||
      member.workingCollegeName?.toLowerCase().includes(term) ||
      member.role?.toLowerCase().includes(term) ||
      member.status?.toLowerCase().includes(term)
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-50 to-violet-100 p-6">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl shadow-inner">
        <LoadOverlay show={loading} message={loadingMessage} />

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          👥 Members List
        </h2>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, phone, dept, status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

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
                  "Member Type",
                  "Joining Date",
                  "Resign Date",
                  "Society Number",
                  "Status",
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
                  <td colSpan="16" className="text-center py-6 text-gray-500">
                    No members found.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, index) => (
                  <tr
                    key={member._id}
                    className="border-b hover:bg-indigo-50 transition duration-200"
                  >
                    <td className="px-4 py-2 text-gray-600">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
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
                        statuses={statuses}
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
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Read-only Row
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
      <td className="px-3 py-2">{member.memberType}</td>
      <td className="px-3 py-2">
        {member.joiningDate
          ? new Date(member.joiningDate).toLocaleDateString("en-GB")
          : ""}
      </td>
      <td className="px-3 py-2">
        {member.resignDate
          ? new Date(member.resignDate).toLocaleDateString("en-GB")
          : ""}
      </td>

      <td className="px-3 py-2">{member.societyNumber}</td>
      <td className="px-3 py-2">{member.status || "active"}</td>
      <td className="px-3 py-2 flex gap-2 justify-center">
        <button
          onClick={() => {
            setEditingMemberId(member._id);
            setEditData(member);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Pencil className="w-4 h-4 inline-block" /> Edit
        </button>
        <button
          onClick={() => handleDelete(member._id)}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 inline-block" /> Delete
        </button>
      </td>
    </>
  );
}

// ✅ Editable Row
function EditableRow({
  member,
  editData,
  handleEditChange,
  handleUpdate,
  setEditingMemberId,
  setPreview,
  departments,
  designations,
  statuses,
}) {
  const memberTypes = ["A", "B", "C"];

  return (
    <>
      <td className="px-3 py-2">
        <input
          type="text"
          name="name"
          value={editData.name || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      <td className="px-3 py-2 text-gray-500 italic">{member.email}</td>

      <td className="px-3 py-2">
        <input
          type="text"
          name="phone"
          value={editData.phone || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
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

      {/* Member Type */}
      <td className="px-3 py-2">
        <select
          name="memberType"
          value={editData.memberType || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select</option>
          {memberTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </td>

      {/* Joining Date */}
      <td className="px-3 py-2">
        <input
          type="date"
          name="joiningDate"
          value={
            editData.joiningDate ||
            (member.joiningDate
              ? new Date(member.joiningDate).toISOString().split("T")[0]
              : "")
          }
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Resign Date */}
      <td className="px-3 py-2">
        <input
          type="date"
          name="resignDate"
          value={
            editData.resignDate ||
            (member.resignDate
              ? new Date(member.resignDate).toISOString().split("T")[0]
              : "")
          }
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Society Number */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="societyNumber"
          value={editData.societyNumber || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Status */}
      <td className="px-3 py-2">
        <select
          name="status"
          value={editData.status || "active"}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </td>

      <td className="px-3 py-2 flex gap-2 justify-center">
        <button
          onClick={() => handleUpdate(member._id)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Save className="w-4 h-4 inline-block" /> Save
        </button>
        <button
          onClick={() => {
            setEditingMemberId(null);
            setPreview(null);
          }}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          <X className="w-4 h-4 inline-block" /> Cancel
        </button>
      </td>
    </>
  );
}
