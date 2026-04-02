import React, { useState } from "react";
import {
  MessageSquare,
  Heart,
  BarChart3,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  MoreHorizontal,
  Clock,
} from "lucide-react";


interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

interface Post {
  id: number;
  fileUrl: string | null;
  content: string | null;
  createdAt: string | null;
  type: string;
  user: {
    id: number;
    avatar: string | null;
    username: string;
  };
}

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalInteractions: number;
  avgInteractionsPerPost: number;
}



const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
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

const PostAdmin = ({ contextstats }: { contextstats: Stats | null }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState(contextstats || null);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|mov|mkv)$/i.test(url);
  };

 

  const statsData: StatCardProps[] = stats
    ? [
        {
          title: "Người dùng",
          value: stats.totalUsers.toString(),
          change: 0,
          icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
          trend: "up",
        },
        {
          title: "Bài viết",
          value: stats.totalPosts.toString(),
          change: 0,
          icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
          trend: "up",
        },
        {
          title: "Tương tác",
          value: stats.totalInteractions.toString(),
          change: 0,
          icon: <Heart className="w-6 h-6 text-rose-500" />,
          trend: "up",
        },
        {
          title: "TB tương tác / bài",
          value: stats.avgInteractionsPerPost.toFixed(2),
          change: 0,
          icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
          trend: "up",
        },
      ]
    : [];


  return (
    <div>
      <main className="flex-1 overflow-x-hidden">
        {/* Header */}
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
                  placeholder="Tìm bài viết..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Bell size={20} />
              </button>

              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Quản lý bài viết
              </h1>
              <p className="text-slate-500">Giám sát và kiểm duyệt nội dung.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => {
              const filePath = post.fileUrl
                ? `${import.meta.env.VITE_API_MINIO}/${post.fileUrl}`
                : "";

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          post.user.avatar
                            ? `${import.meta.env.VITE_API_MINIO}/${post.user.avatar}`
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`
                        }
                        className="w-10 h-10 rounded-full"
                      />

                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {post.user.username}
                        </h4>
                      </div>
                    </div>

                    <MoreHorizontal size={18} />
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-4 flex-1">
                    {post.content && (
                      <p className="text-sm text-slate-600 mb-4">
                        {post.content}
                      </p>
                    )}

                    {post.type === "FILE" && post.fileUrl && (
                      <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 mb-4">
                        {isVideo(post.fileUrl) ? (
                          <video
                            src={filePath}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={filePath}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-slate-50 flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock size={14} />
                      <span className="text-xs text-slate-500">
                        {post.createdAt ?? "Just now"}
                      </span>
                    </div>

                    <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                      Hợp lệ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostAdmin;