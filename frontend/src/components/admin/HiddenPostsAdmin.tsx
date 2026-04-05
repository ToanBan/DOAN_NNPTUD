import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getHiddenPosts, restorePost } from "../../api/post/handleReport";
import AlertSuccess from "../AlertSuccess";
import AlertError from "../AlertError";

const HiddenPostsAdmin = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const resolveAssetUrl = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${import.meta.env.VITE_API_URL}/${url}`;
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov|mkv)$/i.test(url);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getHiddenPosts(page, 10);
      setPosts(data.posts);
      setTotalPages(data.pagination.pages);
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi khi tải bài viết");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (postId: string) => {
    try {
      await restorePost(postId);
      setSuccessMessage("Bài viết đã được khôi phục");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      fetchPosts();
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi khi khôi phục bài viết");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    }
  };

  const selectedPost = posts.find(p => p.postId === selectedPostId);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Bài viết ẩn/xóa</h2>
        <p className="text-slate-600">Quản lý các bài viết đã bị ẩn hoặc xóa do báo cáo</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500 text-lg">Không có bài viết nào bị ẩn hoặc xóa</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.postId} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={post.avatar || "https://api.dicebear.com/7.x/avataaars/svg"}
                        alt={post.username}
                        className="w-9 h-9 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{post.username}</p>
                        <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        post.isHidden ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                      }`}>
                        {post.isHidden ? "Ẩn" : "Đã xóa"}
                      </span>
                      {post.hiddenReason && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {post.hiddenReason}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPostId(post.postId);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleRestore(post.postId)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                    >
                      Khôi phục
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 font-semibold text-slate-700">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative w-full max-w-[600px] bg-white rounded-[28px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Chi tiết bài viết</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tác giả</p>
                <div className="flex items-center gap-2">
                  <img
                    src={selectedPost.avatar || "https://api.dicebear.com/7.x/avataaars/svg"}
                    alt={selectedPost.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-slate-900 font-semibold">{selectedPost.username}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nội dung</p>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">{selectedPost.content}</p>
              </div>

              {selectedPost.fileUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tệp đính kèm</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                    {isVideo(selectedPost.fileUrl) ? (
                      <video
                        src={resolveAssetUrl(selectedPost.fileUrl)}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={resolveAssetUrl(selectedPost.fileUrl)}
                        alt="post-media"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trạng thái</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedPost.isHidden ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                }`}>
                  {selectedPost.isHidden ? "Đang bị ẩn" : "Đã bị xóa"}
                </span>
              </div>

              {selectedPost.hiddenReason && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lý do</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedPost.hiddenReason}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleRestore(selectedPost.postId);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Khôi phục bài viết
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && <AlertSuccess message={successMessage} />}
      {showError && <AlertError messages={errorMessage} />}
    </div>
  );
};

export default HiddenPostsAdmin;
