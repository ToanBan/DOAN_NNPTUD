import { useEffect, useState, useRef } from "react";

import { useUser } from "../context/authContext";
import { Heart, MessageSquare, Share2, Compass, X, Globe, ChevronDown } from "lucide-react";
import PostCreator from "./PostCreator";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";
import api from "../lib/axios";

const ListPost = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [shareModalPost, setShareModalPost] = useState<any | null>(null);
  const [shareCaption, setShareCaption] = useState("");
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const { user } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/posts");
        setPosts(res.data.posts || []);
      } catch (_error) {
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  const addNewPost = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov|mkv)$/i.test(url);

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

  const openShareModal = (post: any) => {
    setShareModalPost(post);
    setShareCaption("");
  };

  const closeShareModal = () => {
    if (isSubmittingShare) {
      return;
    }

    setShareModalPost(null);
    setShareCaption("");
  };

  const handleSharePost = async () => {
    if (!shareModalPost || sharingPostId || isSubmittingShare) {
      return;
    }

    try {
      setSharingPostId(shareModalPost.postId);
      setIsSubmittingShare(true);
      const res = await api.post(`/api/posts/${shareModalPost.postId}/share`, {
        caption: shareCaption,
      });
      if (res.data?.post) {
        setPosts((prev) => [res.data.post, ...prev]);
      }
      setShareMessage("Chia se bai viet thanh cong!");
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
      setShareModalPost(null);
      setShareCaption("");
    } catch (_error: any) {
      setShareMessage(_error?.response?.data?.message || "Chia se bai viet that bai, vui long thu lai!");
      setShareError(true);
      setTimeout(() => setShareError(false), 2500);
    } finally {
      setSharingPostId(null);
      setIsSubmittingShare(false);
    }
  };

  return (
    <>
      <div ref={scrollRef} className="space-y-6 max-w-2xl mx-auto p-4">
        <PostCreator username={user?.username || "Me"} onPostCreated={addNewPost} />

        {posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white rounded-[32px] shadow-sm border border-slate-200/50 overflow-hidden group transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
          >
            <div className="p-5 flex items-center gap-3">
              <img
                src={resolveAssetUrl(post.avatar)}
                className="w-10 h-10 rounded-[14px] object-cover"
                alt={post.username}
              />
              <div>
                <h4 className="font-bold text-slate-800 text-[15px] leading-none">
                  {post.username}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                  <Compass size={10} strokeWidth={2.5} /> Viet Nam . {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="px-5 pb-2">
              <p className="text-slate-700 text-[15px] leading-[1.6]">{post.content}</p>
            </div>

            {post.sharedPost && (
              <div className="px-5 pb-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200/70">
                    <p className="text-[12px] font-semibold text-slate-500">
                      Chia se tu {post.sharedPost.username}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bai goc: {formatTimeAgo(post.sharedPost.createdAt)}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-slate-700 text-sm leading-6">{post.sharedPost.content}</p>
                  </div>
                  {post.sharedPost.fileUrl && (
                    <div className="px-4 pb-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                        {isVideo(post.sharedPost.fileUrl) ? (
                          <video
                            src={resolveAssetUrl(post.sharedPost.fileUrl)}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={resolveAssetUrl(post.sharedPost.fileUrl)}
                            className="w-full h-full object-cover"
                            alt="shared-post-media"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {post.fileUrl && (
              <div className="px-5">
                <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-slate-100 border border-slate-100">
                  {isVideo(post.fileUrl) ? (
                    <video
                      src={resolveAssetUrl(post.fileUrl)}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={resolveAssetUrl(post.fileUrl)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="post-media"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="p-5 pt-4 flex gap-2 border-t border-slate-50">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-xs uppercase ${post.likedByCurrentUser ? "bg-rose-50 text-rose-500" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <Heart size={18} fill={post.likedByCurrentUser ? "currentColor" : "none"} /> Like
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-xs uppercase">
                <MessageSquare size={18} /> Comment
              </button>
              <button
                onClick={() => openShareModal(post)}
                disabled={sharingPostId === post.postId || isSubmittingShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-xs uppercase disabled:opacity-60"
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {shareModalPost && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeShareModal}
          />

          <div className="relative w-full max-w-[560px] bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 w-full text-center ml-8">
                Chia se bai viet
              </h3>
              <button
                onClick={closeShareModal}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                disabled={isSubmittingShare}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                  <img
                    src={resolveAssetUrl(user?.avatar)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight mb-1">{user?.username || "Me"}</p>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[12px] font-bold text-slate-600"
                  >
                    <Globe size={14} /> Cong khai <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <textarea
                placeholder="Viet caption cho bai chia se..."
                className="w-full min-h-[110px] text-lg text-slate-800 placeholder:text-slate-400 border-none outline-none resize-none focus:ring-0 mb-4"
                autoFocus
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                disabled={isSubmittingShare}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-slate-200/70">
                  <p className="text-[12px] font-semibold text-slate-500">
                    Bai ban muon chia se: {shareModalPost.username}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatTimeAgo(shareModalPost.createdAt)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-slate-700 text-sm leading-6">{shareModalPost.content || "Bai viet khong co mo ta"}</p>
                </div>
                {shareModalPost.fileUrl && (
                  <div className="px-4 pb-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                      {isVideo(shareModalPost.fileUrl) ? (
                        <video
                          src={resolveAssetUrl(shareModalPost.fileUrl)}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={resolveAssetUrl(shareModalPost.fileUrl)}
                          className="w-full h-full object-cover"
                          alt="share-preview-media"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeShareModal}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                  disabled={isSubmittingShare}
                >
                  Huy
                </button>
                <button
                  type="button"
                  onClick={handleSharePost}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:text-slate-500"
                  disabled={isSubmittingShare}
                >
                  {isSubmittingShare ? "Dang chia se..." : "Chia se bai viet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shareSuccess && <AlertSuccess message={shareMessage} />}
      {shareError && <AlertError messages={[shareMessage]} />}
    </>
  );
};

export default ListPost;
