import React, { useState, useRef } from "react";
import {
  Settings,
  MapPin,
  Edit3,
  Grid,
  Video,
  Bookmark,
  X,
  Lock,
  User,
  Camera,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Heart,
  MessageSquare,
  Share2,
  Clock3,
} from "lucide-react";
import handleEditProfile from "../api/user/handleEditProfile";
import handleChangePassword from "../api/user/handleChangePassword";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";
import { useUser } from "../context/authContext";
interface Post {
  postId: string;
  content: string;
  fileUrl: string;
  fileType?: string | null;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  createdAt?: string;
  isShared?: boolean;
  sharedPost?: {
    postId: string;
    content: string;
    username: string;
    avatar: string;
    fileUrl: string;
    fileType?: string | null;
    createdAt?: string;
  } | null;
}

interface ContextProfileProps {
  user: any;
  myself: boolean;
  posts: Post[];
}

const ContextProfile: React.FC<ContextProfileProps> = ({
  user,
  myself,
  posts,
}: {
  user: any;
  myself: boolean;
  posts: any;
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "none" | "edit-profile" | "change-password"
  >("none");
  const settingsRef = useRef<HTMLDivElement>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const { getProfile } = useUser();
  const isVideo = (url?: string) => (url ? /\.(mp4|webm|mov|mkv)$/i.test(url) : false);

  const resolveAssetUrl = (url?: string) => {
    if (!url) {
      return "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${import.meta.env.VITE_API_URL}/${url}`;
  };

  const formatTimeAgo = (value?: string) => {
    if (!value) {
      return "Vua xong";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Vua xong";
    }

    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Vua xong";
    if (minutes < 60) return `${minutes} phut truoc`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} gio truoc`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngay truoc`;

    return date.toLocaleDateString("vi-VN");
  };

  const handleSubmitEditProfile = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      const phone = formData.get("phone") as string;
      const description = formData.get("description") as string;
      const address = formData.get("address") as string;
      const username = formData.get("username") as string;

      const result = await handleEditProfile(
        phone,
        description,
        address,
        username,
      );

      if (result.success) {
        setSuccess(true);
        setMessage("Cập nhật thông tin thành công");

        setActiveModal("none");
        getProfile();
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(true);
        setMessage("Cập nhật thông tin thất bại");
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
    } catch (error: any) {
      setError(true);
      setMessage(error.response?.data?.message || "Có lỗi xảy ra");
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  };

  const handleSubmitChangePassword = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      const oldPassword = formData.get("oldPassword") as string;
      const newPassword = formData.get("newPassword") as string;
      const confirmNewPassword = formData.get("confirmNewPassword") as string;

      const result = await handleChangePassword(
        oldPassword,
        newPassword,
        confirmNewPassword,
      );

      if (result.success) {
        setSuccess(true);
        setMessage("Thay Đổi Mật Khẩu Thành Công");

        // Đóng modal ngay khi thành công
        setActiveModal("none");

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(true);
        setMessage("Thay Đổi Mật Khẩu Thất Bại");
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
    } catch (error: any) {
      setError(true);
      setMessage(error.response?.data?.message || "Có lỗi xảy ra");
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
        {/* 1. Cover Image & Avatar Section */}
        <div className="relative">
          <div className="h-56 md:h-80 w-full bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 opacity-90"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-5xl mx-auto px-4">
            <div className="relative -mt-20 md:-mt-28 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative group">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-[40px] p-1.5 bg-white shadow-2xl transition-transform group-hover:scale-[1.02] duration-500">
                    <img
                      src={
                        user?.avatar
                          ? `${import.meta.env.VITE_API_MINIO}/${user.avatar}`
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      alt="Avatar"
                      className="w-full h-full rounded-[36px] object-cover bg-slate-100"
                    />
                  </div>
                  {myself == true ? (
                    <button
                      onClick={() => setActiveModal("edit-profile")}
                      className="absolute bottom-2 right-2 p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 hover:scale-110 transition-all border-4 border-white"
                    >
                      <Camera size={20} />
                    </button>
                  ) : (
                    <></>
                  )}
                </div>

                <div className="mb-4 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h1 className="text-4xl font-black text-white md:text-slate-900 tracking-tight">
                      {user?.username}
                    </h1>
                    <ShieldCheck className="text-blue-500" size={24} />
                  </div>
                  <p className="text-slate-300 md:text-slate-500 font-semibold text-lg">
                    @{user?.email}
                  </p>
                </div>
              </div>

              {myself == true ? (
                <div
                  className="flex items-center gap-3 mb-6 relative"
                  ref={settingsRef}
                >
                  <button
                    onClick={() => setActiveModal("edit-profile")}
                    className="flex-1 md:flex-none px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Edit3 size={18} /> Chỉnh sửa
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-3 rounded-2xl transition-all border ${
                        showSettings
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Settings
                        size={22}
                        className={
                          showSettings
                            ? "rotate-90 transition-transform duration-300"
                            : ""
                        }
                      />
                    </button>

                    {showSettings && (
                      <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white p-2 z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Tùy chọn hệ thống
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveModal("edit-profile");
                            setShowSettings(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <User size={18} /> Chỉnh sửa Profile
                          </div>
                          <ChevronRight
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>
                        <button
                          onClick={() => {
                            setActiveModal("change-password");
                            setShowSettings(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Lock size={18} /> Đổi mật khẩu
                          </div>
                          <ChevronRight
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button className="flex-1 md:flex-none px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <User size={18} /> THEO DÕI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Main Content Grid */}
        <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h3 className="font-black text-slate-900 text-xl mb-5">
                Giới thiệu
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8 font-medium">
                {user?.description}
              </p>

              <div className="space-y-5">
                <InfoItem
                  icon={<MapPin className="text-rose-500" />}
                  text={`${user.address ? user.address : "Chưa Xác Định"}`}
                />
                <InfoItem
                  icon={<Phone className="text-blue-500" />}
                  text={`${user.phone ? user.phone : "Chưa Xác Định"}`}
                  isLink
                />
                <InfoItem
                  icon={<Mail className="text-emerald-500" />}
                  text={`${user.email ? user.email : "Chưa Xác Định"}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-slate-50">
                <StatItem label="Posts" value={String(posts.length)} />
                <StatItem label="Followers" value={"12"} isCenter />
                <StatItem label="Following" value="12" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center gap-10 border-b border-slate-200 mb-8">
              <TabItem icon={<Grid size={18} />} label="Bài viết" active />
              <TabItem icon={<Video size={18} />} label="Reels" />
              <TabItem icon={<Bookmark size={18} />} label="Đã lưu" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {posts.map((post: Post) => {
                const previewFileUrl = post.fileUrl || post.sharedPost?.fileUrl || "";
                const displayCaption =
                  post.content || (post.isShared ? "Da chia se bai viet" : "");

                return (
                  <div
                    key={post.postId}
                    className="rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1">
                          <Clock3 size={12} /> {formatTimeAgo(post.createdAt)}
                        </p>
                        {post.isShared && (
                          <p className="text-[11px] uppercase tracking-wide font-black text-blue-600">
                            Shared
                          </p>
                        )}
                      </div>
                      {displayCaption && (
                        <p className="text-sm text-slate-700 leading-6 mt-2">{displayCaption}</p>
                      )}
                    </div>

                    {previewFileUrl ? (
                      <div className="aspect-square w-full bg-slate-100">
                        {isVideo(previewFileUrl) ? (
                          <video
                            src={resolveAssetUrl(previewFileUrl)}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={resolveAssetUrl(previewFileUrl)}
                            alt="profile-post"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square w-full bg-slate-50 p-4 text-sm text-slate-600 leading-6 overflow-auto">
                        {post.content || post.sharedPost?.content || "Bai viet khong co noi dung"}
                      </div>
                    )}

                    {post.sharedPost && (
                      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
                        <p className="text-xs font-bold text-slate-500">
                          Tu {post.sharedPost.username} . {formatTimeAgo(post.sharedPost.createdAt)}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {post.sharedPost.content || "Bai goc khong co mo ta"}
                        </p>
                      </div>
                    )}

                    <div className="px-3 py-2.5 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-slate-400">Tuong tac</p>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Heart size={14} className="text-rose-500" /> {post.likeCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={14} className="text-sky-500" /> {post.commentCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Share2 size={14} className="text-blue-600" /> {post.shareCount || 0}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 pb-3 pt-1">
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {post.content || post.sharedPost?.content || "Khong co mo ta"}
                      </p>
                    </div>
                  </div>
                );
              })}

              {posts.length === 0 && (
                <div className="col-span-2 md:col-span-3 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 font-semibold">
                  Bạn chưa có bài viết nào.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- MODALS --- */}
        {activeModal !== "none" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setActiveModal("none")}
            />
            <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900">
                    {activeModal === "edit-profile"
                      ? "Chỉnh sửa Profile"
                      : "Đổi mật khẩu"}
                  </h2>
                  <button
                    onClick={() => setActiveModal("none")}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {activeModal === "edit-profile" ? (
                  <form onSubmit={handleSubmitEditProfile}>
                    <div className="space-y-5">
                      <InputGroup
                        name="username"
                        label="Họ và tên"
                        placeholder="Felix Nguyen"
                      />
                      <InputGroup
                        name="description"
                        label="Tiểu sử"
                        placeholder="Viết gì đó về bạn..."
                        isTextArea
                      />

                      <InputGroup
                        name="address"
                        label="Địa chỉ"
                        placeholder="An Giang"
                      />
                      <InputGroup
                        name="phone"
                        label="Số Điện Thoại"
                        placeholder="0123456789"
                      />
                      <InputGroup
                        type="file"
                        name="avatar"
                        label="file"
                        placeholder="An Giang"
                      />

                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveModal("none")}
                          className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl"
                        >
                          Hủy
                        </button>
                        <button className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitChangePassword}>
                    <div className="space-y-5">
                      <InputGroup
                        name="oldPassword"
                        label="Mật khẩu hiện tại"
                        type="password"
                        placeholder="••••••••"
                      />
                      <InputGroup
                        name="newPassword"
                        label="Mật khẩu mới"
                        type="password"
                        placeholder="••••••••"
                      />

                      <InputGroup
                        name="confirmNewPassword"
                        label="Mật khẩu mới"
                        type="password"
                        placeholder="••••••••"
                      />
                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveModal("none")}
                          className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {success && <AlertSuccess message={message} />}
      {error && <AlertError messages={message} />}
    </>
  );
};

// --- Helper Components ---
const InfoItem = ({
  icon,
  text,
  isLink,
}: {
  icon: React.ReactNode;
  text: string;
  isLink?: boolean;
}) => (
  <div className="flex items-center gap-4 text-slate-600 group">
    <div className="p-2.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span
      className={`text-sm font-bold ${isLink ? "text-blue-600 hover:underline cursor-pointer" : "text-slate-500"}`}
    >
      {text}
    </span>
  </div>
);

const StatItem = ({
  label,
  value,
  isCenter,
}: {
  label: string;
  value: string;
  isCenter?: boolean;
}) => (
  <div
    className={`text-center ${isCenter ? "border-x border-slate-100 px-2" : ""}`}
  >
    <p className="font-black text-slate-900 text-xl tracking-tight">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
      {label}
    </p>
  </div>
);

const TabItem = ({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <button
    className={`pb-4 px-2 border-b-2 font-black text-sm flex items-center gap-2 transition-all ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-400 hover:text-slate-600"
    }`}
  >
    {icon} {label}
  </button>
);

const InputGroup = ({
  label,
  placeholder,
  isTextArea,
  type = "text",
  name,
}: {
  label: string;
  placeholder: string;
  isTextArea?: boolean;
  name: string;
  type?: string;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
      {label}
    </label>

    {isTextArea ? (
      <textarea
        name={name}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        name={name}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
        placeholder={placeholder}
      />
    )}
  </div>
);

export default ContextProfile;
