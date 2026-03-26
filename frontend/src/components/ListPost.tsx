import { useEffect, useState, useRef } from "react";

import { useUser } from "../context/authContext";
import { Heart, MessageSquare, Share2, Compass } from "lucide-react";
import PostCreator from "./PostCreator";

const ListPost = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const { user } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);



  const addNewPost = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  

  const isVideo = (url: string) => /\.(mp4|webm|mov|mkv)$/i.test(url);

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <PostCreator
        username={user?.username || "Me"}
        onPostCreated={addNewPost}
      />

      {posts.map((post) => (
        <div
          key={post.postId}
          className="bg-white rounded-[32px] shadow-sm border border-slate-200/50 overflow-hidden group transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
        >
          <div className="p-5 flex items-center gap-3">
            <img
              src={
                post.avatar
                  ? `${import.meta.env.VITE_API_MINIO}/${post.avatar}`
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
              }
              className="w-10 h-10 rounded-[14px] object-cover"
              alt={post.username}
            />
            <div>
              <h4 className="font-bold text-slate-800 text-[15px] leading-none">
                {post.username}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                <Compass size={10} strokeWidth={2.5} /> Việt Nam
              </p>
            </div>
          </div>

          <div className="px-5 pb-2">
            <p className="text-slate-700 text-[15px] leading-[1.6]">
              {post.content}
            </p>
          </div>

          {post.fileUrl && (
            <div className="px-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-slate-100 border border-slate-100">
                {isVideo(post.fileUrl) ? (
                  <video
                    src={`${import.meta.env.VITE_API_MINIO}/${post.fileUrl}`}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`${import.meta.env.VITE_API_MINIO}/${post.fileUrl}`}
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
              <Heart
                size={18}
                fill={post.likedByCurrentUser ? "currentColor" : "none"}
              />{" "}
              Like
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-xs uppercase">
              <MessageSquare size={18} /> Comment
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-xs uppercase">
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListPost;