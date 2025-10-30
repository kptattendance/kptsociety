"use client";

import { useState } from "react";
import { Pencil, Trash2, MapPin, Home } from "lucide-react";
import MemberProfileModal from "./MemberProfileModal";

export default function ReadOnlyRow({
  member,
  setEditingMemberId,
  setEditData,
  handleDelete,
}) {
  const [hovered, setHovered] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  return (
    <>
      {/* Photo */}
      <td className="px-3 py-3">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-semibold">
            N/A
          </div>
        )}
      </td>

      {/* Name */}
      <td
        className="px-3 py-3  cursor-pointer hover:text-red-500 font-semibold text-gray-800 whitespace-nowrap"
        onClick={() => setSelectedMemberId(m._id)}
      >
        {member.name}
      </td>

      <td className="px-3 py-3 text-gray-700">{member.email}</td>
      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
        {member.phone}
      </td>
      <td className="px-3 py-3 text-gray-700">{member.department}</td>
      <td className="px-3 py-3 text-gray-700">{member.kgidNumber}</td>
      <td className="px-3 py-3 text-gray-700">{member.guardian}</td>
      <td className="px-3 py-3 text-gray-700">{formatDate(member.dob)}</td>
      <td className="px-3 py-3 text-gray-700">{member.designation}</td>
      <td className="px-3 py-3 text-gray-700">
        {member.workingCollegeName || "-"}
      </td>

      {/* Permanent Address */}
      <td className="px-3 py-3 text-gray-700 max-w-[250px] truncate group relative">
        <div className="flex items-start gap-1">
          <Home size={16} className="mt-[2px] text-indigo-500" />
          <span className="truncate">{member.permanentAddress || "-"}</span>
        </div>
        {member.permanentAddress && (
          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-[250px] z-10 top-full left-0 mt-1">
            {member.permanentAddress}
          </span>
        )}
      </td>

      {/* Current Address */}
      <td className="px-3 py-3 text-gray-700 max-w-[250px] truncate group relative">
        <div className="flex items-start gap-1">
          <MapPin size={16} className="mt-[2px] text-indigo-500" />
          <span className="truncate">{member.currentAddress || "-"}</span>
        </div>
        {member.currentAddress && (
          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-[250px] z-10 top-full left-0 mt-1">
            {member.currentAddress}
          </span>
        )}
      </td>

      <td className="px-3 py-3 text-gray-700">{member.memberType}</td>
      <td className="px-3 py-3 text-gray-700">
        {formatDate(member.joiningDate)}
      </td>
      <td className="px-3 py-3 text-gray-700">
        {formatDate(member.resignDate)}
      </td>
      <td className="px-3 py-3 text-gray-700">{member.societyNumber}</td>
      <td className="px-3 py-3 text-gray-700">{member.role}</td>

      {/* Status pill */}
      <td className="px-3 py-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            member.status === "active"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {member.status}
        </span>
      </td>

      {/* Action buttons */}
      <td
        className="px-3 py-3 flex items-center gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => {
            setEditingMemberId(member._id);
            setEditData(member);
          }}
          title="Edit"
          className="p-2 cursor-pointer rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-sm"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => handleDelete(member._id)}
          title="Delete"
          className="p-2 rounded-full cursor-pointer bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"
        >
          <Trash2 size={16} />
        </button>
      </td>
      {selectedMemberId && (
        <MemberProfileModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
        />
      )}
    </>
  );
}
