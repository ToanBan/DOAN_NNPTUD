import { useEffect, useState, useRef } from "react";

import { useUser } from "../context/authContext";
import { Heart, MessageSquare, Share2, Compass } from "lucide-react";
import PostCreator from "./PostCreator";
import api from "../lib/axios";

const ListPost = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
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

  const handleSharePost = async (postId: string) => {
    if (sharingPostId) {
      return;
    }

    try {
      setSharingPostId(postId);
      const caption = window.prompt("Nhap caption cho bai chia se (co the bo trong):", "") || "";
      const res = await api.post(`/api/posts/${postId}/share`, {
        caption,
      });
      if (res.data?.post) {
        setPosts((prev) => [res.data.post, ...prev]);
      }
    } catch (_error) {
      // Keep UX quiet for now; feed stays unchanged on failed share.
    } finally {
      setSharingPostId(null);
    }
  };

  return (
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
              onClick={() => handleSharePost(post.postId)}
              disabled={sharingPostId === post.postId}
              className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-xs uppercase disabled:opacity-60"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListPost;
