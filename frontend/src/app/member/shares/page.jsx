"use client";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import LoadOverlay from "../../../components/LoadOverlay";

export default function MemberSharePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Fetching your share details..."
  );

  const fetchShare = async () => {
    if (!user || !user.id) return; // prevent undefined
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShare(res.data);
    } catch (error) {
      console.error("Error fetching share account:", error);
      toast.error("Failed to fetch your share account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchShare();
    }
  }, [user]);

  if (loading) return <LoadOverlay show={true} message={loadingMessage} />;

  if (!share)
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="italic">No Share Account Found.</p>
      </div>
    );

  const member = share.memberId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          🪙 My Share Account
        </h2>

        {/* ✅ Member Info */}
        {member && (
          <div className="flex items-center gap-4 mb-6 bg-green-50 rounded-lg p-4 shadow">
            <img
              src={member.photo || "/default-avatar.png"}
              alt={member.name}
              className="w-16 h-16 rounded-full border-2 border-green-400 object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {member.name}
              </h3>
              <p className="text-gray-700">
                📞 {member.phone || "Not Available"}
              </p>
              <p className="text-gray-700">
                📧 {member.email || "Not Available"}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Share Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Total Shares</p>
            <p className="text-xl font-bold text-yellow-700">
              {share.totalSharesPurchased}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Share Price (₹)</p>
            <p className="text-xl font-bold text-blue-700">
              {share.sharePrice}
            </p>
          </div>
          <div className="bg-pink-50 rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">Total Investment (₹)</p>
            <p className="text-xl font-bold text-pink-700">
              ₹{share.totalAmount?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ✅ Account Status */}
        <div className="text-center mb-6">
          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              share.status === "Closed"
                ? "bg-gray-200 text-gray-600"
                : "bg-green-100 text-green-700"
            }`}
          >
            {share.status || "Active"}
          </span>
        </div>

        {/* ✅ Purchase History */}
        <h3 className="text-lg font-bold text-indigo-700 mb-3 text-center">
          Purchase History
        </h3>

        {share.purchaseHistory?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Shares</th>
                  <th className="border px-3 py-2 text-left">Amount (₹)</th>
                  <th className="border px-3 py-2 text-left">Mode</th>
                  <th className="border px-3 py-2 text-left">Reference</th>
                  <th className="border px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {share.purchaseHistory.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">
                      {p.date
                        ? new Date(p.date).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="border px-3 py-2">{p.sharesBought}</td>
                    <td className="border px-3 py-2">
                      ₹{p.amountPaid?.toLocaleString()}
                    </td>
                    <td className="border px-3 py-2">{p.paymentMode || "-"}</td>
                    <td className="border px-3 py-2">{p.reference || "-"}</td>
                    <td className="border px-3 py-2">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic mt-3">
            No purchase records found.
          </p>
        )}
      </div>
    </div>
  );
}
