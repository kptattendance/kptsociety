"use client";

import { Save, X } from "lucide-react";

export default function EditableRow({
  member,
  editData,
  handleEditChange,
  handleUpdate,
  setEditingMemberId,
  setPreview,
  departments,
  designations,
  statuses,
  preview,
}) {
  const memberTypes = ["A", "B", "C"];

  // Helper to display date value for input type="date"
  const dateValue = (field) => {
    if (editData[field]) return editData[field];
    if (member[field])
      return new Date(member[field]).toISOString().split("T")[0];
    return "";
  };

  return (
    <>
      {/* Photo */}
      <td className="px-3 py-2 text-center">
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
      </td>

      {/* Name */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="name"
          value={editData.name || member.name || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Email (editable) */}
      <td className="px-3 py-2">
        <input
          type="email"
          name="email"
          value={editData.email || member.email || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
          placeholder="Enter email"
        />
      </td>

      {/* Phone */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="phone"
          value={editData.phone || member.phone || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Department */}
      <td className="px-3 py-2">
        <select
          name="department"
          value={editData.department || member.department || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select</option>
          {departments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </td>

      {/* KGID */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="kgidNumber"
          value={editData.kgidNumber || member.kgidNumber || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Guardian */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="guardian"
          value={editData.guardian || member.guardian || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* DOB */}
      <td className="px-3 py-2">
        <input
          type="date"
          name="dob"
          value={dateValue("dob")}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Designation */}
      <td className="px-3 py-2">
        <select
          name="designation"
          value={editData.designation || member.designation || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select</option>
          {designations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </td>

      {/* Working College */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="workingCollegeName"
          value={editData.workingCollegeName || member.workingCollegeName || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Permanent Address */}
      <td className="px-3 py-2">
        <textarea
          name="permanentAddress"
          value={editData.permanentAddress || member.permanentAddress || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Current Address */}
      <td className="px-3 py-2">
        <textarea
          name="currentAddress"
          value={editData.currentAddress || member.currentAddress || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Member Type */}
      <td className="px-3 py-2">
        <select
          name="memberType"
          value={editData.memberType || member.memberType || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select</option>
          {memberTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>

      {/* Joining Date */}
      <td className="px-3 py-2">
        <input
          type="date"
          name="joiningDate"
          value={dateValue("joiningDate")}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Resign Date */}
      <td className="px-3 py-2">
        <input
          type="date"
          name="resignDate"
          value={dateValue("resignDate")}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Society Number */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="societyNumber"
          value={editData.societyNumber || member.societyNumber || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Role */}
      <td className="px-3 py-2">
        <input
          type="text"
          name="role"
          value={editData.role || member.role || ""}
          onChange={handleEditChange}
          className="border rounded px-2 py-1 w-full"
        />
      </td>

      {/* Status */}
      <td className="px-3 py-2">
        <select
          name="status"
          value={editData.status || member.status || "active"}
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

      {/* Actions */}
      <td className="px-3 py-2 flex gap-2 justify-center">
        <button
          onClick={() => handleUpdate(member._id)}
          className="px-3 py-1 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Save className="w-4 h-4 inline-block cursor-pointer" /> Save
        </button>
        <button
          onClick={() => {
            setEditingMemberId(null);
            setPreview(null);
          }}
          className="px-3 py-1 cursor-pointer bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          <X className="w-4 h-4 inline-block cursor-pointer" /> Cancel
        </button>
      </td>
    </>
  );
}
