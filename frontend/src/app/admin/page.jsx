"use client";

import React, { useState } from "react";

import AdminSidebar from "../../components/AdminPageComponents/AdminSidebar";
import AdminAddMember from "../../components/AdminPageComponents/AdminAddMember";
import AdminDashboard from "../../components/AdminPageComponents/AdminDashboard";
import MembersList from "../../components/AdminPageComponents/MembersList";
import AdminLoanApplicationForm from "../../components/AdminPageComponents/AdminLoanApplicationForm";
import AdminLoanList from "../../components/AdminPageComponents/AdminLoanList";
import AdminFDForm from "../../components/AdminPageComponents/AdminFDForm";
import AdminFDTable from "../../components/AdminPageComponents/AdminFDTable";
import AdminRDForm from "../../components/AdminPageComponents/AdminRDForm";
import AdminRDTable from "../../components/AdminPageComponents/AdminRDTable";

export default function AdminPage() {
  const [selected, setSelected] = useState("/admindashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-100 border-r">
          <div className="flex-1 overflow-y-auto">
            <AdminSidebar selected={selected} setSelected={setSelected} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {selected === "/admindashboard" && <AdminDashboard />}
            {selected === "/add-member" && <AdminAddMember />}
            {selected === "/members-list" && <MembersList />}
            {selected === "/add-loan" && <AdminLoanApplicationForm />}
            {selected === "/loan-list" && <AdminLoanList />}
            {selected === "/add-fd" && <AdminFDForm />}
            {selected === "/fd-list" && <AdminFDTable />}
            {selected === "/add-rd" && <AdminRDForm />}
            {selected === "/rd-list" && <AdminRDTable />}

            {/* 
            {selected === "/members-list" && <AdminHODList />}
            {selected === "/settings" && <StudentReports />}
            */}
            {selected === "settings" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-2">Settings</h2>
                <p className="text-sm text-gray-600">
                  Admin-level settings and preferences.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
