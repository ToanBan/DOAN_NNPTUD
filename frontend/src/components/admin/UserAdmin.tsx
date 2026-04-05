import React, { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Bell,
  Search,
  ShieldCheck,
  Menu,
  UserPlus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from "lucide-react";
import api from "../../lib/axios";

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
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const UserAdmin: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersHasPosts: 0,
    usersNoPosts: 0,
  });
 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/admin/users');
        setUsers(response.data.users);
        setStats(response.data.stats);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/toggle-status`);
      setUsers(users.map(u => u.id === userId ? { ...u, status: response.data.status } : u));
    } catch (error) {
      console.error(error);
    }
  };
  const statsData: StatCardProps[] = [
    {
      title: "Người dùng",
      value: stats.totalUsers.toString(),
      change: 0,
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      trend: "up",
    },
    {
      title: "Người Dùng Đã Đăng Bài Viết",
      value: stats.usersHasPosts.toString(),
      change: 0,
      icon: <UserPlus className="w-6 h-6 text-emerald-500" />,
      trend: "up",
    },
    {
      title: "Người Dùng Chưa Đăng Bài Viết",
      value: stats.usersNoPosts.toString(),
      change: 0,
      icon: <UserPlus className="w-6 h-6 text-emerald-500" />,
      trend: "up",
    },
  ];

 

  console.log(users);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 w-full overflow-x-hidden">
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title={isSidebarOpen ? "Đóng menu" : "Mở menu"}
              >
                <Menu size={24} />
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm tên, email hoặc username..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    Admin User
                  </p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter text-indigo-600">
                    Premium
                  </p>
                </div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full bg-slate-200 ring-2 ring-indigo-50 shadow-sm"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content - max-w-full để đảm bảo tràn màn hình */}
        <div className="p-6 w-full max-w-[1600px] mx-auto transition-all duration-300">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* User Table Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Thành viên
                    </th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Vai trò
                    </th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Trạng thái
                    </th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Uy tín
                    </th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Hoạt động
                    </th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm"
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                user.status === "active"
                                  ? "bg-emerald-500"
                                  : user.status === "suspended"
                                    ? "bg-rose-500"
                                    : "bg-slate-300"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 flex items-center">
                              {user.name}
                              {user.role === "Admin" && (
                                <ShieldCheck
                                  size={14}
                                  className="ml-1 text-indigo-500"
                                />
                              )}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              {user.handle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === "Admin"
                              ? "bg-indigo-100 text-indigo-600"
                              : user.role === "Moderator"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold ${
                              user.status === "active"
                                ? "text-emerald-600"
                                : user.status === "suspended"
                                  ? "text-rose-600"
                                  : "text-slate-400"
                            }`}
                          >
                            {user.status === "active"
                              ? "Đang hoạt động"
                              : user.status === "suspended"
                                ? "Đã khóa"
                                : "Ngoại tuyến"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {user.lastActive}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="w-24">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-500">
                              {user.reputation}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                user.reputation > 80
                                  ? "bg-emerald-500"
                                  : user.reputation > 50
                                    ? "bg-indigo-500"
                                    : "bg-rose-500"
                              }`}
                              style={{ width: `${user.reputation}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center space-x-1 text-slate-700">
                          <MessageSquare size={14} className="text-slate-400" />
                          <span className="text-xs font-bold">
                            {user.postsCount}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium ml-1">
                            bài viết
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Xem hồ sơ"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            title="Chỉnh sửa"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            title={user.status === 'active' ? "Vô hiệu hóa" : "Mở khóa"}
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-rose-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <button className="p-2 text-slate-400 group-hover:hidden transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            <div className="p-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <p>Hiển thị 1 - 5 trong tổng số 1,240 thành viên</p>
              </div>
              <div className="flex items-center space-y-0 space-x-2">
                <button className="p-2 border border-slate-200 rounded-xl bg-white text-slate-400 cursor-not-allowed">
                  <ArrowDownRight className="w-4 h-4 rotate-135" />
                </button>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        page === 1
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:border-indigo-600 transition-all">
                  <ArrowUpRight className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAdmin;