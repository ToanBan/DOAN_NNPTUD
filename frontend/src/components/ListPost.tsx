import { useEffect, useRef, useState } from "react";
import { Compass, Heart, MessageSquare, Pencil, Send, Share2, Trash2, X } from "lucide-react";
import { useUser } from "../context/authContext";
import { useSocket } from "../context/socketContext";
import PostCreator from "./PostCreator";
import api from "../lib/axios";
import { API_URL } from "../lib/config";

interface CommentItem {
  commentId: string;
  content: string;
  userId: string | null;
  username: string;
  avatar: string;
  parentComment: string | null;
  createdAt?: string;
}

interface SharedPost {
  postId: string;
  content: string;
  username: string;
  avatar: string;
  userId: string | null;
  fileUrl: string;
  fileType: string | null;
  createdAt?: string;
}

interface PostItem {
  postId: string;
  content: string;
  privacy: string;
  username: string;
  avatar: string;
  userId: string | null;
  fileUrl: string;
  fileType: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isShared: boolean;
  isOwner: boolean;
  sharedPost: SharedPost | null;
  likedByCurrentUser: boolean;
  comments: CommentItem[];
  createdAt?: string;
}

const isVideoFile = (fileType?: string | null, url?: string) => {
  if (fileType === "video") {
    return true;
  }

  if (fileType === "image") {
    return false;
  }

  return Boolean(url && /\.(mp4|webm|mov|mkv|m4v|avi)$/i.test(url));
};

const ListPost = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, boolean>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [shareModalPost, setShareModalPost] = useState<PostItem | null>(null);
  const [shareCaption, setShareCaption] = useState("");
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);
  const { user } = useUser();
  const { socket } = useSocket();
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

  useEffect(() => {
    if (!socket || !posts.length) {
      return;
    }

    const postIds = posts.map((post) => post.postId);
    postIds.forEach((postId) => {
      socket.emit("join_post", postId);
    });

    const handleRealtimeComment = (payload: { postId: string; comment: CommentItem }) => {
      if (!payload?.postId || !payload?.comment) {
        return;
      }

      updatePostById(payload.postId, (post) => {
        const alreadyExists = (post.comments || []).some(
          (comment) => comment.commentId === payload.comment.commentId
        );

        if (alreadyExists) {
          return post;
        }

        return {
          ...post,
          comments: [...(post.comments || []), payload.comment],
          commentCount: (post.commentCount || 0) + 1,
        };
      });
    };

    socket.on("post_comment_created", handleRealtimeComment);

    return () => {
      postIds.forEach((postId) => {
        socket.emit("leave_post", postId);
      });
      socket.off("post_comment_created", handleRealtimeComment);
    };
  }, [socket, posts]);

  const addNewPost = (newPost: PostItem) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const resolveAssetUrl = (url?: string) => {
    if (!url) {
      return "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${API_URL}/${url}`;
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

  const updatePostById = (postId: string, updater: (post: PostItem) => PostItem) => {
    setPosts((prev) => prev.map((post) => (post.postId === postId ? updater(post) : post)));
  };

  const openShareModal = (post: PostItem) => {
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

  const handleToggleLike = async (postId: string) => {
    if (likingPostId) {
      return;
    }

    const currentPost = posts.find((post) => post.postId === postId);
    if (!currentPost) {
      return;
    }

    const nextLiked = !currentPost.likedByCurrentUser;
    const nextLikeCount = Math.max((currentPost.likeCount || 0) + (nextLiked ? 1 : -1), 0);

    updatePostById(postId, (post) => ({
      ...post,
      likedByCurrentUser: nextLiked,
      likeCount: nextLikeCount,
    }));

    try {
      setLikingPostId(postId);
      const res = await api.post(`/api/posts/${postId}/like`);
      updatePostById(postId, (post) => ({
        ...post,
        likedByCurrentUser: Boolean(res.data?.likedByCurrentUser),
        likeCount: res.data?.likeCount ?? post.likeCount,
      }));
    } catch (_error) {
      updatePostById(postId, (post) => ({
        ...post,
        likedByCurrentUser: currentPost.likedByCurrentUser,
        likeCount: currentPost.likeCount,
      }));
    } finally {
      setLikingPostId(null);
    }
  };

  const handleToggleComments = async (postId: string) => {
    const isExpanded = Boolean(expandedComments[postId]);
    const targetPost = posts.find((post) => post.postId === postId);

    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !isExpanded,
    }));

    if (!isExpanded && targetPost && (!targetPost.comments || targetPost.comments.length === 0)) {
      try {
        const res = await api.get(`/api/posts/${postId}/comments`);
        updatePostById(postId, (post) => ({
          ...post,
          comments: res.data?.comments || [],
          commentCount: res.data?.comments?.length ?? post.commentCount,
        }));
      } catch (_error) {
        // Keep the section open with the current local state.
      }
    }
  };

  const handleSubmitComment = async (postId: string, parentComment: string | null = null) => {
    const draftKey = parentComment || postId;
    const content = ((parentComment ? replyDrafts[draftKey] : commentDrafts[draftKey]) || "").trim();

    if (!content || submittingCommentId) {
      return;
    }

    try {
      setSubmittingCommentId(postId);
      const res = await api.post(`/api/posts/${postId}/comments`, {
        content,
        parentComment,
      });

      const newComment = res.data?.comment;
      if (newComment) {
        updatePostById(postId, (post) => ({
          ...post,
          comments: (post.comments || []).some((comment) => comment.commentId === newComment.commentId)
            ? post.comments
            : [...(post.comments || []), newComment],
          commentCount: res.data?.commentCount ?? post.commentCount,
        }));
      }

      if (parentComment) {
        setReplyDrafts((prev) => ({
          ...prev,
          [draftKey]: "",
        }));
        setReplyingTo((prev) => ({
          ...prev,
          [draftKey]: false,
        }));
      } else {
        setCommentDrafts((prev) => ({
          ...prev,
          [postId]: "",
        }));
      }

      setExpandedComments((prev) => ({
        ...prev,
        [postId]: true,
      }));
    } catch (_error) {
      // Keep the draft so the user can retry.
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleSharePost = async () => {
    if (!shareModalPost || sharingPostId) {
      return;
    }

    try {
      setSharingPostId(shareModalPost.postId);
      setIsSubmittingShare(true);

      const res = await api.post(`/api/posts/${shareModalPost.postId}/share`, {
        caption: shareCaption.trim(),
      });

      if (res.data?.post) {
        setPosts((prev) => [res.data.post, ...prev]);
        updatePostById(shareModalPost.postId, (post) => ({
          ...post,
          shareCount: (post.shareCount || 0) + 1,
        }));
      }

      setShareModalPost(null);
      setShareCaption("");
    } catch (_error) {
      // Keep the modal open so the user can retry.
    } finally {
      setSharingPostId(null);
      setIsSubmittingShare(false);
    }
  };

  const handleEditPost = async (post: PostItem) => {
    const nextContent = window.prompt("Chinh sua noi dung bai viet:", post.content || "");
    if (nextContent === null) {
      return;
    }

    try {
      const res = await api.put(`/api/posts/${post.postId}`, {
        content: nextContent,
        privacy: post.privacy,
      });

      if (res.data?.post) {
        updatePostById(post.postId, () => res.data.post);
      }
    } catch (_error) {
      // Keep the current post unchanged on failed edit.
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm("Ban co chac muon xoa bai viet nay?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post.postId !== postId));
    } catch (_error) {
      // Keep the post visible if deletion fails.
    }
  };

  const getRootComments = (comments: CommentItem[]) => {
    return comments.filter((comment) => !comment.parentComment);
  };

  const getReplies = (comments: CommentItem[], parentCommentId: string) => {
    return comments.filter((comment) => comment.parentComment === parentCommentId);
  };

  const getParentComment = (comments: CommentItem[], parentCommentId: string | null) => {
    if (!parentCommentId) {
      return null;
    }

    return comments.find((comment) => comment.commentId === parentCommentId) || null;
  };

  const renderCommentThread = (post: PostItem, comment: CommentItem, depth = 0) => {
    const replies = getReplies(post.comments || [], comment.commentId);
    const parentComment = getParentComment(post.comments || [], comment.parentComment);
    const marginClass = depth > 0 ? "ml-4 border-l border-slate-200 pl-4" : "";
    const avatarSizeClass = depth > 0 ? "w-8 h-8" : "w-9 h-9";

    return (
      <div key={comment.commentId} className={`space-y-3 ${marginClass}`.trim()}>
        <div className="flex items-start gap-3">
          <img
            src={resolveAssetUrl(comment.avatar)}
            alt={comment.username}
            className={`${avatarSizeClass} rounded-xl object-cover`}
          />
          <div className="flex-1">
            <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-700">{comment.username}</p>
                <span className="text-[11px] text-slate-400">{formatTimeAgo(comment.createdAt)}</span>
              </div>
              {parentComment && (
                <p className="text-xs font-medium text-blue-600 mt-1">
                  Reply {parentComment.username}
                </p>
              )}
              <p className="text-sm text-slate-600 mt-1 leading-6">{comment.content}</p>
            </div>

            <button
              onClick={() =>
                setReplyingTo((prev) => ({
                  ...prev,
                  [comment.commentId]: !prev[comment.commentId],
                }))
              }
              className="mt-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Tra loi
            </button>

            {replyingTo[comment.commentId] && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <input
                  value={replyDrafts[comment.commentId] || ""}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [comment.commentId]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment(post.postId, comment.commentId);
                    }
                  }}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder={`Tra loi ${comment.username}...`}
                  disabled={submittingCommentId === post.postId}
                />
                <button
                  onClick={() => handleSubmitComment(post.postId, comment.commentId)}
                  disabled={
                    submittingCommentId === post.postId ||
                    !(replyDrafts[comment.commentId] || "").trim()
                  }
                  className="p-2 rounded-xl bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            )}

            {replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {replies.map((reply) => renderCommentThread(post, reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-[15px] leading-none">{post.username}</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                <Compass size={10} strokeWidth={2.5} /> Viet Nam . {formatTimeAgo(post.createdAt)}
              </p>
            </div>
            {post.isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Sua bai viet"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDeletePost(post.postId)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Xoa bai viet"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
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
                      {isVideoFile(post.sharedPost.fileType, post.sharedPost.fileUrl) ? (
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
                {isVideoFile(post.fileType, post.fileUrl) ? (
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

          {(post.likeCount > 0 || post.commentCount > 0 || post.shareCount > 0) && (
            <div className="px-5 pb-3 pt-3 text-xs text-slate-400 font-medium flex items-center gap-3">
              <span>{post.likeCount || 0} luot thich</span>
              <span>{post.commentCount || 0} binh luan</span>
              <span>{post.shareCount || 0} chia se</span>
            </div>
          )}

          <div className="p-5 pt-4 flex gap-2 border-t border-slate-50">
            <button
              onClick={() => handleToggleLike(post.postId)}
              disabled={likingPostId === post.postId}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-xs uppercase disabled:opacity-60 ${post.likedByCurrentUser ? "bg-rose-50 text-rose-500" : "hover:bg-slate-50 text-slate-600"}`}
            >
              <Heart size={18} fill={post.likedByCurrentUser ? "currentColor" : "none"} /> Like
            </button>
            <button
              onClick={() => handleToggleComments(post.postId)}
              className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-600 font-bold text-xs uppercase"
            >
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

          {expandedComments[post.postId] && (
            <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/40">
              <div className="space-y-3 py-4">
                {(post.comments || []).length > 0 ? (
                  getRootComments(post.comments || []).map((comment) =>
                    renderCommentThread(post, comment)
                  )
                ) : (
                  <p className="text-sm text-slate-400">Chua co binh luan nao.</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={resolveAssetUrl(user?.avatarUrl || user?.avatar)}
                  alt={user?.username || "Me"}
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div className="flex-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <input
                    value={commentDrafts[post.postId] || ""}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({
                        ...prev,
                        [post.postId]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment(post.postId);
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    placeholder="Viet binh luan..."
                    disabled={submittingCommentId === post.postId}
                  />
                  <button
                    onClick={() => handleSubmitComment(post.postId)}
                    disabled={
                      submittingCommentId === post.postId ||
                      !(commentDrafts[post.postId] || "").trim()
                    }
                    className="p-2 rounded-xl bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {shareModalPost && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeShareModal}
          />

          <div className="relative w-full max-w-[560px] bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Chia se bai viet</h3>
              <button
                onClick={closeShareModal}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                disabled={isSubmittingShare}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <textarea
                placeholder="Viet caption cho bai chia se..."
                className="w-full min-h-[110px] text-lg text-slate-800 placeholder:text-slate-400 border-none outline-none resize-none focus:ring-0 mb-5"
                autoFocus
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                disabled={isSubmittingShare}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200/70">
                  <p className="text-[12px] font-semibold text-slate-500">
                    Bai viet cua {shareModalPost.username}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatTimeAgo(shareModalPost.createdAt)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-slate-700 text-sm leading-6">
                    {shareModalPost.content || "Bai viet khong co mo ta"}
                  </p>
                </div>
                {shareModalPost.fileUrl && (
                  <div className="px-4 pb-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                      {isVideoFile(shareModalPost.fileType, shareModalPost.fileUrl) ? (
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

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeShareModal}
                  disabled={isSubmittingShare}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-colors disabled:opacity-60"
                >
                  Huy
                </button>
                <button
                  type="button"
                  onClick={handleSharePost}
                  disabled={isSubmittingShare}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {isSubmittingShare ? "Dang chia se..." : "Chia se ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPost;
