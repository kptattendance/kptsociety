"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, Phone, Calendar, Home, Briefcase, User } from "lucide-react";

export default function UserProfile() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading profile...</p>;
  if (!profile)
    return <p className="p-6 text-center text-red-500">Profile not found.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-10 text-center text-indigo-600">
        👤 Member Profile
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-lg rounded-3xl p-6 flex flex-col items-center">
          <img
            src={
              profile.photo ||
              `https://ui-avatars.com/api/?name=${profile.name}`
            }
            alt={profile.name}
            className="w-36 h-36 rounded-full shadow-md object-cover"
          />
          <h3 className="text-2xl font-semibold mt-4">{profile.name}</h3>
          <p className="text-indigo-700 font-medium mt-1">
            {profile.designation}
          </p>

          <div className="mt-6 w-full space-y-2">
            <Badge label="Role" value={profile.role} color="indigo" />
            <Badge
              label="Department"
              value={profile.department}
              color="green"
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="md:col-span-2 grid gap-4">
          <InfoCard title="Contact Info" color="yellow">
            <InfoItem icon={Mail} label="Email" value={profile.email} />
            <InfoItem
              icon={Phone}
              label="Phone"
              value={profile.phone || "N/A"}
            />
          </InfoCard>

          <InfoCard title="Addresses" color="pink">
            <InfoItem
              icon={Home}
              label="Permanent Address"
              value={profile.permanentAddress}
            />
            <InfoItem
              icon={Home}
              label="Current Address"
              value={profile.currentAddress}
            />
          </InfoCard>

          <InfoCard title="Professional Info" color="purple">
            <InfoItem
              icon={Briefcase}
              label="Working College"
              value={profile.workingCollegeName}
            />
            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={
                profile.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"
              }
            />
            <InfoItem icon={User} label="Guardian" value={profile.guardian} />
            <InfoItem
              icon={User}
              label="KGID Number"
              value={profile.kgidNumber}
            />
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

// Reusable Info Item Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2">
    <Icon className="w-5 h-5 text-indigo-500" />
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

// Reusable Card Component
const InfoCard = ({ title, children, color }) => (
  <div
    className={`bg-gradient-to-br ${
      color === "yellow"
        ? "from-yellow-100 to-yellow-200"
        : color === "pink"
        ? "from-pink-100 to-pink-200"
        : "from-purple-100 to-purple-200"
    } shadow-md rounded-3xl p-6`}
  >
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="divide-y divide-gray-100">{children}</div>
  </div>
);

// Reusable Badge Component
const Badge = ({ label, value, color }) => (
  <div
    className={`flex justify-between px-4 py-2 rounded-xl bg-${color}-200 text-${color}-800 font-medium`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
