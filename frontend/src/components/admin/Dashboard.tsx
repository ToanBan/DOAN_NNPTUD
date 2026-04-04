import {
  MessageSquare,
  Heart,
  BarChart3,
  Bell,
  Search,
  MoreVertical,
  Share2,
  Menu,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "../../lib/axios";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalForums?: number;
  totalInteractions: number;
  avgInteractionsPerPost: number;
}

interface Post {
  _id: string;
  id: number;
  fileUrl: string;
  content: string;
  createdAt: string;
  type: string;
  user: {
    _id: string;
    id: number;
    avatar: string;
    username: string;
  };
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}

const StatCard = ({ title, value, change, icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>

      <div
        className={`flex items-center space-x-1 text-sm font-medium ${
          trend === "up" ? "text-emerald-600" : "text-rose-600"
        }`}
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

const Dashboard = ({ contextstats }: { contextstats: Stats | null }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(contextstats || null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/api/admin/dashboard');
        setStats(response.data.stats);
        setPosts(response.data.newestPosts);
        setUsers(response.data.newestUsers);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, []);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|mov|mkv)$/i.test(url);
  };  const statsData = stats
    ? [
        {
          title: "Người dùng",
          value: stats.totalUsers,
          change: 12,
          icon: <Users className="w-6 h-6 text-indigo-600" />,
          trend: "up" as const,
        },
        {
          title: "Bài viết",
          value: stats.totalPosts,
          change: 8,
          icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
          trend: "up" as const,
        },
        {
          title: "Diễn đàn",
          value: stats.totalForums ?? 0,
          change: 5,
          icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
          trend: "up" as const,
        },
        {
          title: "Tương Tác",
          value: stats.totalInteractions,
          change: 5,
          icon: <Heart className="w-6 h-6 text-indigo-600" />,
          trend: "up" as const,
        },
      ]
    : [];

  return (
    <>
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu size={24} />
              </button>

              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />

                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng, bài viết..."
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
                  <p className="text-xs text-slate-500">
                    Quản trị viên cao cấp
                  </p>
                </div>

                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full bg-slate-200 ring-2 ring-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}

        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Bảng điều khiển
              </h1>
              <p className="text-slate-500">
                Chào mừng trở lại! Đây là tóm tắt hệ thống hôm nay.
              </p>
            </div>

            <button className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2">
              <BarChart3 size={18} />
              <span>Xuất báo cáo</span>
            </button>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Recent Posts & Recent Users */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">
                    Bài viết gần đây
                  </h2>

                  <button className="text-indigo-600 text-sm font-medium hover:underline">
                    Xem tất cả
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {posts.map((post) => {
                    const filePath = post.fileUrl
                      ? `${import.meta.env.VITE_API_MINIO}/${post.fileUrl}`
                      : "";

                    return (
                      <div
                        key={post._id || post.id}
                        className="p-6 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex space-x-4">
                          <img
                            src={
                              post.user?.avatar
                                ? `${import.meta.env.VITE_API_MINIO}/${post.user.avatar}`
                                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`
                            }
                            alt={post.user.username}
                            className="w-12 h-12 rounded-full bg-slate-100"
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="font-bold text-slate-800">
                                  {post.user.username}
                                </span>

                                <span className="mx-2 text-slate-300">•</span>

                                <span className="text-xs text-slate-400 font-medium">
                                  {post.createdAt
                                    ? post.createdAt
                                    : "2 days ago"}
                                </span>
                              </div>

                              <button className="p-1 hover:bg-white rounded-lg transition-colors">
                                <MoreVertical
                                  size={18}
                                  className="text-slate-400"
                                />
                              </button>
                            </div>

                            {/* Content */}
                            {post.content && (
                              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                {post.content}
                              </p>
                            )}

                            {/* Media */}
                            {post.type === "FILE" &&
                              post.fileUrl &&
                              (isVideo(post.fileUrl) ? (
                                <video
                                  src={filePath}
                                  controls
                                  className="mb-4 rounded-xl max-h-80 w-full object-cover"
                                />
                              ) : (
                                <img
                                  src={filePath}
                                  className="mb-4 rounded-xl max-h-80 w-full object-cover"
                                  alt="post-media"
                                />
                              ))}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6 text-slate-400">
                                <div className="flex items-center space-x-1">
                                  <Heart size={18} />
                                  <span className="text-xs font-medium">
                                    {post.likeCount || 0}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <MessageSquare size={18} />
                                  <span className="text-xs font-medium">
                                    {post.commentCount || 0}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <Share2 size={18} />
                                  <span className="text-xs font-medium">
                                    {post.shareCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Newest Users */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">
                    Người dùng mới đăng ký
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {users.map((user: any, idx: number) => (
                    <div
                      key={user._id || idx}
                      className="p-6 hover:bg-slate-50 transition-colors flex items-center space-x-4"
                    >
                      <img
                        src={
                          user.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                        }
                        alt={user.username}
                        className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {user.username}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {user.email || user.fullName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;