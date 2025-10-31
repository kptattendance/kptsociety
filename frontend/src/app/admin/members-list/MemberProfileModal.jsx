"use client";

import {
  Calendar,
  Home,
  Mail,
  Phone,
  User,
  X,
  Briefcase,
  MapPin,
  Shield,
  Hash,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function MemberProfileModal({ memberId, onClose }) {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/members/${memberId}`,
          { headers }
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch member details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId]);

  if (!memberId) return null;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex gap-3 items-start bg-white/40 p-2 rounded-lg shadow-sm">
      <Icon className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-gray-800 font-medium whitespace-pre-wrap">
          {value || "-"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative border border-indigo-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading profile...</p>
        ) : !profile ? (
          <p className="text-center py-10 text-red-500">Member not found</p>
        ) : (
          <div className="p-6 md:p-10 space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-100 to-blue-50 rounded-2xl p-6 shadow-lg">
              {/* Animated Glow Container */}
              <div className="relative">
                {/* Shimmering Gradient Ring */}
                <div className="absolute -inset-[4px] rounded-full bg-[conic-gradient(at_top_left,_#a5b4fc,_#f9a8d4,_#c7d2fe,_#a5b4fc)] blur-md opacity-80 animate-[spin_6s_linear_infinite]"></div>

                {/* Profile Photo */}
                <img
                  src={
                    profile.photo ||
                    `https://ui-avatars.com/api/?name=${profile.name}`
                  }
                  alt={profile.name}
                  className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover relative z-10"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-indigo-700">
                  {profile.name}
                </h2>
                <p className="text-gray-600 font-medium mt-1">
                  {profile.designation || "Member"} —{" "}
                  {profile.department?.toUpperCase() || "N/A"} Department
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full shadow-sm">
                    {profile.status?.toUpperCase() || "ACTIVE"}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full shadow-sm">
                    Type: {profile.memberType || "A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Sections */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md p-6 border border-indigo-100 hover:shadow-lg transition-all">
                <h3 className="text-lg font-semibold text-indigo-600 border-b pb-2 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <InfoItem
                    icon={User}
                    label="Guardian"
                    value={profile.guardian}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date of Birth"
                    value={
                      profile.dob
                        ? new Date(profile.dob).toLocaleDateString("en-GB")
                        : "-"
                    }
                  />
                  <InfoItem icon={Phone} label="Phone" value={profile.phone} />
                  <InfoItem icon={Mail} label="Email" value={profile.email} />
                </div>
              </div>

              {/* Employment Info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md p-6 border border-pink-100 hover:shadow-lg transition-all">
                <h3 className="text-lg font-semibold text-pink-600 border-b pb-2 mb-4">
                  Employment Details
                </h3>
                <div className="space-y-3">
                  <InfoItem
                    icon={Briefcase}
                    label="Working College"
                    value={profile.workingCollegeName}
                  />
                  <InfoItem
                    icon={CalendarDays}
                    label="Joining Date"
                    value={
                      profile.joiningDate
                        ? new Date(profile.joiningDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"
                    }
                  />
                  <InfoItem
                    icon={Shield}
                    label="KGID Number"
                    value={profile.kgidNumber}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Society Number"
                    value={profile.societyNumber}
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md p-6 border border-blue-100 hover:shadow-lg transition-all">
                <h3 className="text-lg font-semibold text-blue-600 border-b pb-2 mb-4">
                  Current Address
                </h3>
                <InfoItem
                  icon={MapPin}
                  label="Address"
                  value={profile.currentAddress}
                />
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md p-6 border border-purple-100 hover:shadow-lg transition-all">
                <h3 className="text-lg font-semibold text-purple-600 border-b pb-2 mb-4">
                  Permanent Address
                </h3>
                <InfoItem
                  icon={Home}
                  label="Address"
                  value={profile.permanentAddress}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="text-right text-sm text-gray-400 pt-4 border-t">
              Last updated:{" "}
              {new Date(profile.updatedAt).toLocaleString("en-GB")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
