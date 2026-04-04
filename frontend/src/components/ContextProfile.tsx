import React, { useState, useEffect, useRef } from "react";
import {
  Settings, MapPin, Edit3, Plus, Grid, X, Lock, User, Camera,
  ChevronRight, ShieldCheck, Phone, Mail, Heart, MessageSquare,
  Share2, Clock3, Users, Layers,
} from "lucide-react";
import handleEditProfile from "../api/user/handleEditProfile";
import handleAddForum from "../api/forum/handleAddForum";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";
import { useUser } from "../context/authContext";
import getMyForum from "../api/forum/getMyForum";
import { API_URL } from "../lib/config";
import getForumCreated from "../api/forum/getForumCreated";

// --- Interfaces ---
interface Post {
  postId: string;
  content: string;
  fileUrl: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
}

interface ForumItem {
  forumId: string;
  name: string;
  description: string;
  memberCount?: number;
}

interface ContextProfileProps {
  user: any;
  myself: boolean;
  posts: Post[];
  stats?: { followers: number; following: number; posts: number };
  relationshipAction?: string;
  onToggleFollow?: () => void;
}

const ContextProfile: React.FC<ContextProfileProps> = ({
  user,
  myself,
  posts,
  stats = { followers: 0, following: 0, posts: 0 },
  relationshipAction = "None",
  onToggleFollow,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "forums" | "my-forums">("posts");
  const [activeModal, setActiveModal] = useState<"none" | "edit-profile" | "change-password" | "create-forum">("none");
  const [joinForums, setJoinForums] = useState<ForumItem[]>([]);
  const [createdForums, setCreatedForums] = useState<ForumItem[]>([]);
  const [forumFormData, setForumFormData] = useState({ name: "", description: "" });
  const [isSavingForum, setIsSavingForum] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  // New states for Avatar
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const settingsRef = useRef<HTMLDivElement>(null);
  const { getProfile } = useUser();

  const isVideo = (url?: string) => (url ? /\.(mp4|webm|mov|mkv)$/i.test(url) : false);
  
  const resolveAssetUrl = (url?: string) => {
    if (!url) return "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
    // Ưu tiên hiển thị ảnh từ server (avatarUrl)
    return /^https?:\/\//i.test(url) ? url : `${API_URL}/${url}`;
  };

  const formatTimeAgo = (value?: string) => {
    if (!value) return "Vừa xong";
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    const fetchForums = async () => {
      if (!user?._id) return;
      try {
        const [joined, created] = await Promise.all([
          getMyForum(user._id),
          getForumCreated(user._id)
        ]);
        setJoinForums(joined || []);
        setCreatedForums(created || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu diễn đàn:", err);
      }
    };
    fetchForums();
  }, [user?._id]);

  // Clean up preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const result = await handleEditProfile(
        formData.get("phone") as string,
        formData.get("description") as string,
        formData.get("address") as string,
        formData.get("username") as string,
        selectedAvatar // Pass the file here
      );
      if (result?.success) {
        setSuccess(true);
        setMessage("Cập nhật thành công!");
        setActiveModal("none");
        setSelectedAvatar(null);
        setPreviewUrl(null);
        getProfile(); // Refresh context user
      }
    } catch (err: any) {
      setError(true);
      setMessage("Có lỗi xảy ra khi cập nhật.");
    } finally {
      setTimeout(() => { setSuccess(false); setError(false); }, 3000);
    }
  };

  const handleSubmitCreateForum = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forumFormData.name.trim()) return;
    setIsSavingForum(true);
    try {
      const result = await handleAddForum(forumFormData);
      if (result?.forum) {
        setCreatedForums((prev) => [result.forum, ...prev]);
        setSuccess(true);
        setMessage("Tạo diễn đàn thành công.");
        setActiveModal("none");
        setForumFormData({ name: "", description: "" });
      }
    } catch (err: any) {
      setError(true);
      setMessage("Không thể tạo diễn đàn.");
    } finally {
      setIsSavingForum(false);
      setTimeout(() => { setSuccess(false); setError(false); }, 3000);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
        {/* Banner Section */}
        <div className="relative">
          <div className="h-56 md:h-80 w-full bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 opacity-90" />
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-5xl mx-auto px-4">
            <div className="relative -mt-20 md:-mt-28 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative group">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-[40px] p-1.5 bg-white shadow-2xl transition-transform group-hover:scale-[1.02] duration-500">
                    <img
                      src={user?.avatarUrl ? resolveAssetUrl(user.avatarUrl) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                      alt="Avatar"
                      className="w-full h-full rounded-[36px] object-cover bg-slate-100"
                    />
                  </div>
                  {myself && (
                    <button onClick={() => setActiveModal("edit-profile")} className="absolute bottom-2 right-2 p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 hover:scale-110 transition-all border-4 border-white">
                      <Camera size={20} />
                    </button>
                  )}
                </div>

                <div className="mb-4 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h1 className="text-4xl font-black text-white md:text-slate-900 tracking-tight">{user?.username}</h1>
                    <ShieldCheck className="text-blue-500" size={24} />
                  </div>
                  <p className="text-slate-300 md:text-slate-500 font-semibold text-lg">@{user?.email?.split('@')[0]}</p>
                </div>
              </div>

              {myself ? (
                <div className="flex items-center gap-3 mb-6 relative" ref={settingsRef}>
                  <button onClick={() => setActiveModal("edit-profile")} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Edit3 size={18} /> Chỉnh sửa
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-2xl transition-all border ${showSettings ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>
                      <Settings size={22} className={showSettings ? "rotate-90 transition-transform duration-300" : ""} />
                    </button>
                    {showSettings && (
                      <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white p-2 z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <SettingsMenuItem icon={<Plus size={18} />} label="Tạo diễn đàn" onClick={() => { setActiveModal("create-forum"); setShowSettings(false); }} />
                        <SettingsMenuItem icon={<User size={18} />} label="Chỉnh sửa Profile" onClick={() => { setActiveModal("edit-profile"); setShowSettings(false); }} />
                        <SettingsMenuItem icon={<Lock size={18} />} label="Đổi mật khẩu" onClick={() => { setActiveModal("change-password"); setShowSettings(false); }} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button onClick={onToggleFollow} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 mb-6">
                  <User size={18} /> {relationshipAction === "Friend" ? "BẠN BÈ" : relationshipAction === "Following" ? "ĐANG THEO DÕI" : "THEO DÕI"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-900 text-xl mb-5">Giới thiệu</h3>
              <p className="text-slate-600 leading-relaxed mb-8 font-medium">{user?.description || "Chưa có giới thiệu."}</p>
              <div className="space-y-5">
                <InfoItem icon={<MapPin className="text-rose-500" />} text={user?.address || "Chưa xác định"} />
                <InfoItem icon={<Phone className="text-blue-500" />} text={user?.phone || "Chưa xác định"} isLink />
                <InfoItem icon={<Mail className="text-emerald-500" />} text={user?.email || "Chưa xác định"} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-slate-50">
                <StatItem label="Posts" value={stats.posts.toString()} />
                <StatItem label="Followers" value={stats.followers.toString()} isCenter />
                <StatItem label="Following" value={stats.following.toString()} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center gap-10 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
              <TabItem icon={<Grid size={18} />} label="Bài viết" active={activeTab === "posts"} onClick={() => setActiveTab("posts")} />
              <TabItem icon={<Users size={18} />} label="Tham gia" active={activeTab === "forums"} onClick={() => setActiveTab("forums")} />
              <TabItem icon={<Layers size={18} />} label={myself ? "Của tôi" : "Đã tạo"} active={activeTab === "my-forums"} onClick={() => setActiveTab("my-forums")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === "posts" && (
                posts.length > 0 ? posts.map(post => (
                  <PostCard key={post.postId} post={post} formatTimeAgo={formatTimeAgo} resolveAssetUrl={resolveAssetUrl} isVideo={isVideo} />
                )) : <EmptyState message="Chưa có bài viết nào." />
              )}

              {activeTab === "forums" && (
                joinForums.length > 0 ? joinForums.map(forum => (
                  <ForumCard key={forum.forumId} forum={forum} />
                )) : <EmptyState message="Chưa tham gia diễn đàn nào." />
              )}

              {activeTab === "my-forums" && (
                createdForums.length > 0 ? createdForums.map(forum => (
                  <ForumCard key={forum.forumId} forum={forum} isOwner />
                )) : <EmptyState message="Chưa tạo diễn đàn nào." />
              )}
            </div>
          </div>
        </div>

        {/* Modal Logic */}
        {activeModal !== "none" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal("none")} />
            <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">
                  {activeModal === "edit-profile" ? "Chỉnh sửa Profile" : activeModal === "change-password" ? "Đổi mật khẩu" : "Tạo diễn đàn"}
                </h2>
                <button onClick={() => setActiveModal("none")} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
              </div>

              <form onSubmit={activeModal === "create-forum" ? handleSubmitCreateForum : handleSubmitEditProfile} className="space-y-5">
                {activeModal === "create-forum" ? (
                  <>
                    <InputGroup label="Tên diễn đàn" value={forumFormData.name} onChange={(e:any)=>setForumFormData({...forumFormData, name: e.target.value})} placeholder="Tên cộng đồng..." />
                    <InputGroup label="Mô tả" isTextArea value={forumFormData.description} onChange={(e:any)=>setForumFormData({...forumFormData, description: e.target.value})} placeholder="Mô tả..." />
                  </>
                ) : (
                  <>
                    {/* Avatar Upload Selection in Modal */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatarInput')?.click()}>
                        <img
                          src={user?.avatarUrl ? resolveAssetUrl(user.avatarUrl) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                          alt="Preview"
                          className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-50 group-hover:brightness-75 transition-all"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Camera className="text-white" size={24} />
                        </div>
                      </div>
                      <input id="avatarInput" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Nhấn để thay đổi ảnh</p>
                    </div>

                    <InputGroup name="username" label="Họ và tên" defaultValue={user?.username} />
                    <InputGroup name="phone" label="Số điện thoại" defaultValue={user?.phone} />
                    <InputGroup name="address" label="Địa chỉ" defaultValue={user?.address} />
                    <InputGroup name="description" label="Tiểu sử" isTextArea defaultValue={user?.description} />
                  </>
                )}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setActiveModal("none")} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl">Hủy</button>
                  <button type="submit" disabled={isSavingForum} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors">
                    {isSavingForum ? "Đang lưu..." : "Xác nhận"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {success && <AlertSuccess message={message} />}
      {error && <AlertError messages={message} />}
    </>
  );
};

// --- Sub-components (Giữ nguyên cấu trúc nhưng đổi placeholder thành defaultValue ở InputGroup) ---

const ForumCard = ({ forum, isOwner }: { forum: any, isOwner?: boolean }) => (
  <a href={`/forum/${forum.forumId}`} className="group relative bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
        <MessageSquare size={26} />
      </div>
      {isOwner && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full tracking-wider">Chủ Sở Hữu</span>}
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600">{forum.name}</h3>
    <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6">{forum.description || "Không có mô tả."}</p>
    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs"><Users size={14} /> {forum.memberCount || 1} thành viên</div>
      <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={16} /></div>
    </div>
  </a>
);

const PostCard = ({ post, formatTimeAgo, resolveAssetUrl, isVideo }: any) => (
  <div className="rounded-[28px] border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group">
    <div className="p-5 border-b border-slate-50">
      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase mb-3"><Clock3 size={12} /> {formatTimeAgo(post.createdAt)}</span>
      <p className="text-sm text-slate-700 font-medium line-clamp-2">{post.content}</p>
    </div>
    <div className="aspect-square bg-slate-100 overflow-hidden">
      {post.fileUrl ? (
        isVideo(post.fileUrl) ? <video src={resolveAssetUrl(post.fileUrl)} className="w-full h-full object-cover" controls />
        : <img src={resolveAssetUrl(post.fileUrl)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
      ) : <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">Bản tin văn bản</div>}
    </div>
    <div className="p-4 flex items-center justify-between bg-slate-50/50">
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><Heart size={16} className="text-rose-500" /> {post.likeCount || 0}</div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><MessageSquare size={16} className="text-sky-500" /> {post.commentCount || 0}</div>
      </div>
      <Share2 size={16} className="text-slate-400" />
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] bg-white/50 text-slate-400 font-bold">
    <Layers size={32} className="mb-4 text-slate-300" /> {message}
  </div>
);

const SettingsMenuItem = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group">
    <div className="flex items-center gap-3">{icon} {label}</div>
    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
  </button>
);

const InfoItem = ({ icon, text, isLink }: any) => (
  <div className="flex items-center gap-4 text-slate-600 group">
    <div className="p-2.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    <span className={`text-sm font-bold ${isLink ? "text-blue-600 hover:underline cursor-pointer" : "text-slate-500"}`}>{text}</span>
  </div>
);

const StatItem = ({ label, value, isCenter }: any) => (
  <div className={`text-center ${isCenter ? "border-x border-slate-100" : ""}`}>
    <p className="font-black text-slate-900 text-xl">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{label}</p>
  </div>
);

const TabItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`pb-4 px-2 border-b-2 font-black text-sm flex items-center gap-2 transition-all ${active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
    {icon} {label}
  </button>
);

const InputGroup = ({ label, placeholder, isTextArea, type = "text", name, value, onChange, defaultValue }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-500 uppercase ml-1">{label}</label>
    {isTextArea ? 
      <textarea name={name} value={value} onChange={onChange} defaultValue={defaultValue} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder={placeholder} rows={3} />
      : 
      <input type={type} name={name} value={value} onChange={onChange} defaultValue={defaultValue} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder={placeholder} />
    }
  </div>
);

export default ContextProfile;