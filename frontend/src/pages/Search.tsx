import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/axios";
import Header from "../components/Header";
import {
  Search as SearchIcon,
  UserPlus,
  UserCheck,
  LayoutGrid,
  Users,
} from "lucide-react";

interface UserResult {
  _id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  relationship?: string;
}

interface ForumResult {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    userId: string;
    username: string;
    avatar: string;
  };
  memberCount: number;
  membershipStatus: "active" | "banned" | "pending" | null;
  createdAt: string;
}

type TabType = "users" | "forums";

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [forumResults, setForumResults] = useState<ForumResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("users");

  console.log("Search query:", forumResults);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setUserResults([]);
        setForumResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(
          `/api/users/search?query=${encodeURIComponent(query)}`,
        );
        setUserResults(res.data.users || []);
        setForumResults(res.data.forums || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalCount = userResults.length + forumResults.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto pt-24 px-4 pb-10">
        {/* Page heading */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <SearchIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Kết quả tìm kiếm
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {query
                ? loading
                  ? "Đang tìm kiếm..."
                  : `Tìm thấy ${totalCount} kết quả cho "${query}"`
                : "Hãy nhập từ khóa để tìm kiếm"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        {query && !loading && (
          <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Users size={16} />
              Người dùng
              {userResults.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "users"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {userResults.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("forums")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "forums"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid size={16} />
              Diễn đàn
              {forumResults.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "forums"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {forumResults.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "users" ? (
          // ── Danh sách người dùng ──
          userResults.length > 0 ? (
            <div className="grid gap-4">
              {userResults.map((user) => (
                <div
                  key={user._id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full p-0.5 border-2 border-slate-100 overflow-hidden">
                      <img
                        src={
                          user.avatarUrl && !user.avatarUrl.includes("dicebear")
                            ? user.avatarUrl
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                        }
                        alt={user.username}
                        className="w-full h-full object-cover rounded-full bg-slate-100"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/profile/${user._id}`}
                        className="font-bold text-lg text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        {user.username}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {user.fullName || "Người dùng FutureSocial"}
                      </p>
                    </div>
                  </div>
                  {user.relationship === "Friend" ? (
                    <Link
                      to={`/profile/${user._id}`}
                      className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                      title="Bạn bè"
                    >
                      <UserCheck size={20} />
                    </Link>
                  ) : user.relationship === "Self" ? null : (
                    <Link
                      to={`/profile/${user._id}`}
                      className="p-2.5 bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors"
                      title="Thêm bạn / Xem hồ sơ"
                    >
                      <UserPlus size={20} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : query ? (
            <EmptyState
              message={`Không tìm thấy người dùng nào khớp với "${query}".`}
            />
          ) : null
        ) : 
        forumResults.length > 0 ? (
          <div className="grid gap-4">
            {forumResults.map((forum) => (
              <div
                key={String(forum._id)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between gap-4 hover:shadow-md transition-shadow"
              >
                {/* Forum icon */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <LayoutGrid size={22} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-base truncate">
                      {forum.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                      {forum.description || (
                        <span className="italic text-slate-400">
                          Không có mô tả
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">
                        bởi{" "}
                        <span className="font-medium text-slate-600">
                          {forum.createdBy.username}
                        </span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-400">
                        {forum.memberCount} thành viên
                      </span>
                    </div>
                  </div>
                </div>

                {/* Membership badge */}
                {forum.membershipStatus === "active" ? (
                  <span className="flex-shrink-0 text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl">
                    Đã tham gia
                  </span>
                ) : forum.membershipStatus === "banned" ? (
                  <span className="flex-shrink-0 text-xs font-semibold bg-rose-50 text-rose-500 px-3 py-1.5 rounded-xl">
                    Bị cấm
                  </span>
                ) : (
                  <a href={`/forum/${forum._id}`} className="flex-shrink-0">
                    <span className="flex-shrink-0 text-xs font-semibold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200">
                      Tham gia
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : query ? (
          <EmptyState
            message={`Không tìm thấy diễn đàn nào khớp với "${query}".`}
          />
        ) : null}
      </div>
    </div>
  );
};

// ─── Empty State helper ─────────────────────────────────────────────────────
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <SearchIcon size={32} className="text-slate-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">
      Không tìm thấy kết quả
    </h3>
    <p className="text-slate-500">{message}</p>
  </div>
);

export default Search;
