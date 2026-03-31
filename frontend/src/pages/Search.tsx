import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/axios";
import Header from "../components/Header";
import { Search as SearchIcon, UserPlus, UserCheck } from "lucide-react";

interface UserResult {
  _id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  relationship?: string;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  console.log(results);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
        setResults(res.data.users);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto pt-24 px-4 pb-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <SearchIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Kết quả tìm kiếm</h1>
            <p className="text-sm font-medium text-slate-500">
              {query ? `Hiển thị kết quả cho "${query}"` : "Hãy nhập từ khóa để tìm kiếm"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((user) => (
              <div key={user._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full p-0.5 border-2 border-slate-100 overflow-hidden">
                    <img 
                      src={user.avatarUrl && !user.avatarUrl.includes('dicebear') ? `${user.avatarUrl}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      alt={user.username} 
                      className="w-full h-full object-cover rounded-full bg-slate-100"
                    />
                  </div>
                  <div>
                    <Link to={`/profile/${user._id}`} className="font-bold text-lg text-slate-800 hover:text-blue-600 transition-colors">
                      {user.username}
                    </Link>
                    <p className="text-sm text-slate-500">{user.fullName || "Người dùng FutureSocial"}</p>
                  </div>
                </div>
                {user.relationship === "Friend" ? (
                  <Link to={`/profile/${user._id}`} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors" title="Bạn bè">
                    <UserCheck size={20} />
                  </Link>
                ) : user.relationship === "Self" ? null : (
                  <Link to={`/profile/${user._id}`} className="p-2.5 bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors" title="Thêm bạn/Xem hồ sơ">
                    <UserPlus size={20} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-slate-500">Chúng tôi không tìm thấy bất kỳ người dùng nào khớp với "{query}".</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
