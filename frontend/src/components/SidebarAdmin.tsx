import React, { useState } from "react";

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  Share2,
  AlertCircle,
  EyeOff,
} from "lucide-react";

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

const SidebarAdmin = ({
  page,
  setPage,
}: {
  page: string;
  setPage: (page: string) => void;
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Share2 size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              SocialAdmin
            </span>
          </div>

          <nav className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
              Chính
            </p>

            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              label="Tổng quan"
              active={page === "dashboard"}
              onClick={() => setPage("dashboard")}
            />

            <SidebarItem
              icon={<MessageSquare size={20} />}
              label="Diễn Đàn"
              active={page === "forum"}
              onClick={() => setPage("forum")}
            />

            <SidebarItem
              icon={<Users size={20} />}
              label="Người dùng"
              active={page === "users"}
              onClick={() => setPage("users")}
            />

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3">
              Quản lý
            </p>

            <SidebarItem
              icon={<MessageSquare size={20} />}
              label="Bài viết"
              active={page === "posts"}
              onClick={() => setPage("posts")}
            />

            <SidebarItem
              icon={<AlertCircle size={20} />}
              label="Báo cáo vi phạm"
              active={page === "reports"}
              onClick={() => setPage("reports")}
            />

            <SidebarItem
              icon={<EyeOff size={20} />}
              label="Bài viết ẩn/xóa"
              active={page === "hidden-posts"}
              onClick={() => setPage("hidden-posts")}
            />

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3">
              Hệ thống
            </p>

            <SidebarItem icon={<Settings size={20} />} label="Cài đặt" />
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SidebarAdmin;
