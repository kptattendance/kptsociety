"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EditableRow from "./EditableRow";
import ReadOnlyRow from "./ReadOnlyRow";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching members...");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editData, setEditData] = useState({});
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const rowsPerPage = 6;
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

  // ---------- Sorting ----------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      let direction = "asc";
      if (prev.key === key && prev.direction === "asc") direction = "desc";
      return { key, direction };
    });
  };

  const getValue = (m, key) => (m[key] ? m[key].toString().toLowerCase() : "");

  const sortedMembers = [...members].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    const aVal = getValue(a, key);
    const bVal = getValue(b, key);
    if (!isNaN(aVal) && !isNaN(bVal))
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ChevronDown size={14} className="inline-block ml-1 opacity-40" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} className="inline-block ml-1 text-yellow-300" />
    ) : (
      <ChevronDown size={16} className="inline-block ml-1 text-yellow-300" />
    );
  };

  // ---------- Search & Pagination ----------
  const filteredMembers = sortedMembers.filter((m) => {
    const term = search.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(term) ||
      (m.phone || "").toLowerCase().includes(term) ||
      (m.department || "").toLowerCase().includes(term) ||
      (m.kgidNumber || "").toLowerCase().includes(term) ||
      (m.designation || "").toLowerCase().includes(term) ||
      (m.workingCollegeName || "").toLowerCase().includes(term) ||
      (m.role || "").toLowerCase().includes(term) ||
      (m.status || "").toLowerCase().includes(term) ||
      (m.email || "").toLowerCase().includes(term) ||
      (m.societyNumber || "").toLowerCase().includes(term) ||
      (m.memberType || "").toLowerCase().includes(term) ||
      (m.guardian || "").toLowerCase().includes(term)
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

  // ---------- Fetch Members ----------
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching members...");
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Excel Export ----------
  const handleDownloadExcel = () => {
    if (filteredMembers.length === 0) {
      toast.info("No member data available to export!");
      return;
    }

    const exportData = filteredMembers.map((m, i) => ({
      "Sl. No.": i + 1,
      Name: m.name || "-",
      Email: m.email || "-",
      Phone: m.phone || "-",
      Department: m.department || "-",
      "KGID No.": m.kgidNumber || "-",
      Guardian: m.guardian || "-",
      "Date of Birth": m.dob
        ? new Date(m.dob).toLocaleDateString("en-GB")
        : "-",
      Designation: m.designation || "-",
      "Working College": m.workingCollegeName || "-",
      "Permanent Address": m.permanentAddress || "-",
      "Current Address": m.currentAddress || "-",
      "Member Type": m.memberType || "-",
      "Joining Date": m.joiningDate
        ? new Date(m.joiningDate).toLocaleDateString("en-GB")
        : "-",
      "Resign Date": m.resignDate
        ? new Date(m.resignDate).toLocaleDateString("en-GB")
        : "-",
      "Society No.": m.societyNumber || "-",
      Status: m.status || "Active",
      Role: m.role || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({ wch: 20 }));

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Members_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("✅ Excel file downloaded!");
  };

  // ---------- Delete ----------
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
      setMembers((prev) => prev.filter((m) => m._id !== id));
      toast.success("Member deleted successfully");
    } catch (err) {
      console.error("Error deleting member:", err);
      toast.error("Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Edit ----------
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files && files[0];
      if (file) {
        setEditData((prev) => ({ ...prev, photo: file }));
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (id) => {
    try {
      setLoading(true);
      setLoadingMessage("Updating member...");
      const token = await getToken();
      const formData = new FormData();
      Object.entries(editData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
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
      setEditData({});
      fetchMembers();
    } catch (err) {
      console.error("Error updating member:", err);
      toast.error("Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-50 to-violet-100 p-6">
      <div className="p-4 sm:p-6 max-w-8xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl shadow-inner">
        <LoadOverlay show={loading} message={loadingMessage} />

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          👥 Members List
        </h2>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <input
            type="text"
            placeholder="Search by name, phone, dept, status, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 cursor-pointer rounded-lg shadow transition"
          >
            📥 Download Excel
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 bg-white">
          <table className="min-w-full text-sm sm:text-base text-gray-700">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white select-none">
              <tr>
                <th className="px-3 py-3 text-left font-medium">Sl. No.</th>
                <th className="px-3 py-3 text-left font-medium">Photo</th>

                {[
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["department", "Department"],
                  ["kgidNumber", "KGID"],
                  ["guardian", "Guardian"],
                  ["dob", "DOB"],
                  ["designation", "Designation"],
                  ["workingCollegeName", "Working College"],
                  ["permanentAddress", "Permanent Address"],
                  ["currentAddress", "Current Address"],
                  ["memberType", "Member Type"],
                  ["joiningDate", "Joining Date"],
                  ["resignDate", "Resign Date"],
                  ["societyNumber", "Society Number"],
                  ["role", "Role"],
                  ["status", "Status"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-3 py-3 text-left font-medium cursor-pointer hover:text-yellow-300 transition whitespace-nowrap"
                  >
                    {label} {renderSortIcon(key)}
                  </th>
                ))}

                <th className="px-3 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="20" className="text-center py-6 text-gray-500">
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
                        preview={preview}
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

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 cursor-pointer bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 cursor-pointer rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 cursor-pointer bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
