"use client";

import React, { useState } from "react";

import MemberSidebar from "../../components/MemberPageComponents/MemberSidebar";
import UserProfile from "../../components/MemberPageComponents/UserProfile";
import MemberLoan from "../../components/MemberPageComponents/MemberLoan";
import MemberRD from "../../components/MemberPageComponents/MemberRD";
import MemberFD from "../../components/MemberPageComponents/MemberFD";

export default function MemberPage() {
  const [selected, setSelected] = useState("/member-my-profile");

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-100 border-r">
          <div className="flex-1 overflow-y-auto">
            <MemberSidebar selected={selected} setSelected={setSelected} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {selected === "/member-my-profile" && <UserProfile />}
            {selected === "/member-loan" && <MemberLoan />}
            {selected === "/member-rd-list" && <MemberRD />}
            {selected === "/member-fd-list" && <MemberFD />}

            {selected === "/settings" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-2">Settings</h2>
                <p className="text-sm text-gray-600">
                  User-level settings and preferences coming soon...
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
