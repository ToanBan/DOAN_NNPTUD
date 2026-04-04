import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCreator from "../components/PostCreator";
import { useUser } from "../context/authContext";
import {
  Users,
  Info,
  ShieldCheck,
  Calendar,
  Zap,
  LogOut,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import getForumDetail from "../api/forum/getForumDetail";
import handleJoinForum from "../api/forum/handleJoinForum";
import handleLeaveForum from "../api/forum/handleLeaveForum";

const ForumDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [forumInfo, setForumInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // State tự chế để hiển thị thông báo thay cho toast
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const forumData = await getForumDetail(id);
        setForumInfo(forumData);
      } catch (err) {
        console.error("Lỗi khi tải forum:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForumData();
  }, [id]);

  // Tự động ẩn thông báo sau 3 giây
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const onToggleMembership = async () => {
    if (!id || !forumInfo) return;
    setProcessing(true);
    try {
      if (forumInfo.membership) {
        await handleLeaveForum(id);
        setForumInfo({
          ...forumInfo,
          membership: null,
          memberCount: forumInfo.memberCount - 1,
        });
        setAlert({ type: "success", msg: "Đã rời khỏi nhóm thành công!" });
      } else {
        const res = await handleJoinForum(id);
        setForumInfo({
          ...forumInfo,
          membership: res.membership,
          memberCount: forumInfo.memberCount + 1,
        });
        setAlert({ type: "success", msg: "Chào mừng bạn đã gia nhập nhóm!" });
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "F";
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white font-sans">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans pb-20">
      {/* --- FLOATING NOTIFICATION (Thay thế Toast) --- */}
      {alert && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-red-50 border-red-100 text-red-700"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-bold text-sm">{alert.msg}</span>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div className="relative h-64 md:h-80 w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-6 h-full relative flex items-end">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-[-48px] w-full">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl flex-shrink-0 z-10">
              <div className="w-full h-full rounded-[2.1rem] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-inner italic">
                {getInitials(forumInfo?.name)}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left pb-4 md:pb-14">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm mb-2">
                {forumInfo?.name}
              </h1>
              <p className="text-indigo-100/80 font-medium text-sm md:text-base flex items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1.5">
                  <Users size={18} /> {forumInfo?.memberCount} thành viên
                </span>
                <span className="hidden md:inline text-white/30">|</span>
                <span className="flex items-center gap-1.5">
                  <Zap size={18} /> Cộng đồng năng động
                </span>
              </p>
            </div>

            <div className="pb-4 md:pb-14">
              {forumInfo?.isOwner ? (
                <div className="px-8 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20">
                  Chủ diễn đàn
                </div>
              ) : (
                <button
                  onClick={onToggleMembership}
                  disabled={processing}
                  className={`px-8 py-3 font-bold rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
                    forumInfo?.membership
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-white text-indigo-600 hover:bg-indigo-50"
                  } ${processing ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1"}`}
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin text-inherit"></div>
                  ) : forumInfo?.membership ? (
                    <>
                      <LogOut size={18} /> Rời nhóm
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> Gia nhập
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {forumInfo?.membership || forumInfo?.isOwner ? (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <PostCreator
                  username={user?.username || "Thành viên"}
                  onPostCreated={() => {}}
                />
              </div>
            ) : (
              <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-dashed border-indigo-200 text-center">
                <p className="text-indigo-600 font-bold">
                  Vui lòng gia nhập nhóm để bắt đầu viết bài thảo luận. ✨
                </p>
              </div>
            )}

            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                Bảng tin thảo luận
              </h2>
              <div className="h-[1px] flex-1 bg-slate-100 ml-6"></div>
            </div>

            <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl mb-4 mx-auto flex items-center justify-center font-bold italic border border-slate-100">
                {getInitials(forumInfo?.name)}
              </div>
              <p className="text-slate-400 font-medium">
                Hiện chưa có bài viết nào được đăng tải.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Info size={20} />
                </div>
                <h3 className="font-black text-slate-800 text-lg tracking-tight">
                  Giới thiệu
                </h3>
              </div>
              <p className="text-slate-500 leading-relaxed text-sm mb-8 font-medium">
                {forumInfo?.description ||
                  "Chào mừng bạn đến với cộng đồng thảo luận chung."}
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100/50">
                  <Calendar className="text-indigo-500" size={18} />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Ngày thành lập
                    </p>
                    <p className="text-sm font-black text-slate-700">
                      {forumInfo?.createdAt
                        ? new Date(forumInfo.createdAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "---"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <ShieldCheck className="text-indigo-400" size={22} /> Quy tắc
              </h3>
              <ul className="space-y-4 text-sm font-medium">
                {[
                  "Tôn trọng lẫn nhau",
                  "Đăng bài đúng chủ đề",
                  "Không spam quảng cáo",
                ].map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                      0{i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
