import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Heart,
  BarChart3,
  Settings,
  Bell,
  Search,
  Share2,
  ShieldCheck,
  Menu,
  Mail,
  UserPlus,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Activity,
  Server,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

// --- Types & Interfaces ---
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  role: "Admin" | "Moderator" | "User";
  status: "active" | "inactive" | "suspended";
  lastActive: string;
  postsCount: number;
  reputation: number;
  joinedDate: string;
}

interface ApiStatus {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  statusCode: number;
  latency: string;
  status: "operational" | "degraded" | "down";
  requestCount: string;
}

// --- Mock Data ---
const STATS_DATA: StatCardProps[] = [
  {
    title: "Người dùng hoạt động",
    value: "1.2M",
    change: 12.5,
    icon: <Users className="w-6 h-6 text-indigo-500" />,
    trend: "up",
  },
  {
    title: "Đăng ký mới",
    value: "8,420",
    change: 5.2,
    icon: <UserPlus className="w-6 h-6 text-emerald-500" />,
    trend: "up",
  },
  {
    title: "Tỷ lệ giữ chân",
    value: "72.4%",
    change: -1.2,
    icon: <Activity className="w-6 h-6 text-blue-500" />,
    trend: "down",
  },
  {
    title: "Báo cáo vi phạm",
    value: "24",
    change: -15.4,
    icon: <ShieldAlert className="w-6 h-6 text-rose-500" />,
    trend: "down",
  },
];

const API_STATUS_DATA: ApiStatus[] = [
  {
    endpoint: "/api/v1/users",
    method: "GET",
    statusCode: 200,
    latency: "42ms",
    status: "operational",
    requestCount: "45.2k",
  },
  {
    endpoint: "/api/v1/posts",
    method: "POST",
    statusCode: 201,
    latency: "156ms",
    status: "operational",
    requestCount: "12.8k",
  },
  {
    endpoint: "/api/v1/auth/login",
    method: "POST",
    statusCode: 401,
    latency: "89ms",
    status: "degraded",
    requestCount: "8.4k",
  },
  {
    endpoint: "/api/v1/media/upload",
    method: "PUT",
    statusCode: 500,
    latency: "1.2s",
    status: "down",
    requestCount: "2.1k",
  },
  {
    endpoint: "/api/v1/analytics",
    method: "GET",
    statusCode: 200,
    latency: "310ms",
    status: "operational",
    requestCount: "1.5k",
  },
];

const USER_LIST: UserAccount[] = [
  {
    id: "1",
    name: "Phan Minh Anh",
    handle: "@minhanh_creative",
    email: "minhanh@design.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    role: "Admin",
    status: "active",
    lastActive: "Vừa xong",
    postsCount: 1240,
    reputation: 98,
    joinedDate: "15/05/2022",
  },
  {
    id: "2",
    name: "Lê Hoàng Nam",
    handle: "@namle_tech",
    email: "hoangnam@dev.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    role: "Moderator",
    status: "active",
    lastActive: "2 phút trước",
    postsCount: 856,
    reputation: 85,
    joinedDate: "10/01/2023",
  },
  {
    id: "3",
    name: "Nguyễn Thùy Chi",
    handle: "@thuychi_travel",
    email: "thuychi@social.vn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Misty",
    role: "User",
    status: "inactive",
    lastActive: "3 ngày trước",
    postsCount: 142,
    reputation: 62,
    joinedDate: "22/11/2023",
  },
];

// --- Sub-components ---

const SidebarItem = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {icon}
    <span className="font-medium whitespace-nowrap">{label}</span>
  </div>
);

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
      <div
        className={`flex items-center space-x-1 text-sm font-medium ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}
      >
        <span>
          {trend === "up" ? "+" : ""}
          {change}%
        </span>
        {trend === "up" ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider text-[10px]">
        {title}
      </h3>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">
        {value}
      </p>
    </div>
  </div>
);

const ApiStatusRow = ({ api }: { api: ApiStatus }) => {
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300)
      return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (code >= 400 && code < 500)
      return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-rose-500 bg-rose-50 border-rose-100";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "text-blue-500";
      case "POST":
        return "text-emerald-500";
      case "PUT":
        return "text-amber-500";
      case "DELETE":
        return "text-rose-500";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-xl border border-transparent hover:border-slate-100">
      <div className="flex items-center space-x-4 flex-1">
        <div
          className={`text-[10px] font-black w-14 ${getMethodColor(api.method)}`}
        >
          {api.method}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-mono font-medium text-slate-700">
            {api.endpoint}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            {api.requestCount} requests
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <Clock size={14} className="text-slate-300" />
          <span
            className={`text-xs font-bold ${parseInt(api.latency) > 500 ? "text-rose-500" : "text-slate-600"}`}
          >
            {api.latency}
          </span>
        </div>

        <div
          className={`px-3 py-1 rounded-lg border text-xs font-black ${getStatusColor(api.statusCode)}`}
        >
          {api.statusCode}
        </div>

        <div className="w-8 flex justify-end">
          {api.status === "operational" ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : api.status === "degraded" ? (
            <AlertCircle size={18} className="text-amber-500" />
          ) : (
            <ShieldAlert size={18} className="text-rose-500" />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const ErrorAdmin: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 w-full overflow-x-hidden">
      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 w-full">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              >
                <Menu size={24} />
              </button>
              <h2 className="font-bold text-lg hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  System Online
                </span>
              </div>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                alt="Avatar"
                className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="p-6 w-full max-w-[1600px] mx-auto space-y-8 transition-all duration-300">
          {/* API Health Monitoring - 2/5 width */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Zap size={20} className="text-amber-500" />
                <span>API Status & Error Logs</span>
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Live Updates
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-1">
                {API_STATUS_DATA.map((api, idx) => (
                  <ApiStatusRow key={idx} api={api} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ErrorAdmin;