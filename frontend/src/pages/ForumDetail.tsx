import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCreator from "../components/PostCreator";
import { useUser } from "../context/authContext";
import { Users, Info, MessageSquare, ShieldCheck } from "lucide-react";
import getForumDetail from "../api/forum/getForumDetail";
const ForumDetail = () => {
  const { id } = useParams(); 
  const { user } = useUser();
  const [forumInfo, setForumInfo] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        setLoading(true);
        // Thay bằng API thật của bạn:
        if(!id) return;
        const forumData = await getForumDetail(id);
        setForumInfo(forumData);
        
        
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải forum:", err);
      }
    };

    fetchForumData();
  }, [id]);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return <div className="flex justify-center p-10 font-medium">Đang tải forum...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 1. Banner & Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-48 md:h-64 w-full bg-slate-200 overflow-hidden relative">
          <img 
            src={forumInfo?.banner} 
            className="w-full h-full object-cover" 
            alt="Cover" 
          />
        </div>
        
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative flex flex-col md:flex-row items-end md:items-center gap-4 -mt-12 pb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-white bg-white shadow-sm overflow-hidden flex-shrink-0 z-10">
              <img src={forumInfo?.avatar} alt="Forum Logo" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 pt-12 md:pt-0">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {forumInfo?.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-slate-500 text-sm font-medium">
                <span className="flex items-center gap-1">
                  <Users size={16} /> {forumInfo?.memberCount} Thành viên
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={16} /> 2.4K Bài viết
                </span>
              </div>
            </div>

            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95">
              Tham gia nhóm
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Posts Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Post Creator */}
            <PostCreator 
              username={user?.username || "Khách"} 
              onPostCreated={handlePostCreated} 
            />

            {/* Feed Divider */}
            <div className="flex items-center justify-between py-2">
              <h2 className="font-bold text-slate-800">Bài viết mới nhất</h2>
              <select className="bg-transparent text-sm font-semibold text-slate-500 outline-none">
                <option>Mới nhất</option>
                <option>Phổ biến</option>
              </select>
            </div>

            {/* Posts List - Bạn sẽ map qua dữ liệu bài viết ở đây */}
            <div className="space-y-4">
               {/* Placeholder cho danh sách bài viết */}
               <div className="bg-white p-10 rounded-[24px] text-center border border-dashed border-slate-300">
                  <p className="text-slate-400 font-medium">Chưa có bài viết nào trong forum này.</p>
               </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* About Box */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-2 mb-4">
                <Info size={20} className="text-blue-500" />
                <h3 className="font-bold text-slate-800">Giới thiệu</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {forumInfo?.description}
              </p>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Ngày tạo</span>
                  <span className="font-medium text-slate-700">01/01/2024</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Chủ đề</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">Công nghệ</span>
                </div>
              </div>
            </div>

            {/* Rules Box */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h3 className="font-bold text-slate-800">Quy định cộng đồng</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Tôn trọng các thành viên khác",
                  "Không đăng nội dung rác (spam)",
                  "Sử dụng ngôn từ văn minh",
                  "Chia sẻ kiến thức có giá trị"
                ].map((rule, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex gap-3">
                    <span className="font-bold text-slate-300">{idx + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForumDetail;