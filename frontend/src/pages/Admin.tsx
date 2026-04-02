import React, { useState, useEffect } from "react";

import SidebarAdmin from "../components/SidebarAdmin";
import Dashboard from "../components/admin/Dashboard";
import UserAdmin from "../components/admin/UserAdmin";
import PostAdmin from "../components/admin/PostAdmin";
import ErrorAdmin from "../components/admin/ErrorAdmin";
import Forum from "../components/admin/Forum";
interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalInteractions: number;
  avgInteractionsPerPost: number;
}

const Admin: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState("dashboard");

  



  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard contextstats={stats} />;

      case "forum":
        return <Forum />;

      case "users":
        return <UserAdmin />;

      case "posts":
        return <PostAdmin contextstats={stats} />;

      case "reports":
        return <ErrorAdmin />;

      default:
        return <Dashboard contextstats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <SidebarAdmin page={page} setPage={setPage} />
      {renderPage()}
    </div>
  );
};

export default Admin;