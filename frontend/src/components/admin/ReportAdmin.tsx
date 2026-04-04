import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getReports, updateReportStatus, hidePost, deletePost } from "../../api/post/handleReport";
import AlertSuccess from "../AlertSuccess";
import AlertError from "../AlertError";

const ReportAdmin = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPostActionModal, setShowPostActionModal] = useState(false);
  const [postActionType, setPostActionType] = useState<"hide" | "delete" | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
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
    fetchReports();
  }, [page, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports(filterStatus || undefined, page, 10);
      setReports(data.reports);
      setTotalPages(data.pagination.pages);
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi khi tải báo cáo");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReportId || !updateStatus) {
      setErrorMessage("Vui lòng chọn trạng thái");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
      return;
    }

    try {
      await updateReportStatus(selectedReportId, updateStatus, adminNote);
      setSuccessMessage("Cập nhật báo cáo thành công");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setShowUpdateModal(false);
      fetchReports();
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi khi cập nhật báo cáo");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    }
  };

  const handlePostAction = async (reason: string) => {
    if (!selectedReportId || !selectedReport) {
      return;
    }

    try {
      if (postActionType === "hide") {
        await hidePost(selectedReport.post._id, reason);
      } else if (postActionType === "delete") {
        await deletePost(selectedReport.post._id, reason);
      }

      // Mark report as resolved
      await updateReportStatus(selectedReportId, "resolved", `${postActionType === "hide" ? "Đã ẩn" : "Đã xóa"} bài viết. ${reason}`);

      setSuccessMessage(`Bài viết đã được ${postActionType === "hide" ? "ẩn" : "xóa"} thành công`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setShowPostActionModal(false);
      setPostActionType(null);
      fetchReports();
    } catch (error: any) {
      setErrorMessage(error.message || "Lỗi khi xử lý bài viết");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    }
  };

  const selectedReport = reports.find(r => r._id === selectedReportId);

  const getReasonLabel = (reason: string) => {
    const labels: any = {
      spam: "Spam",
      inappropriate_content: "Nội dung không phù hợp",
      harassment: "Qu骚 nhiễu/Tấn công",
      misinformation: "Thông tin sai lệch",
      copyright_violation: "Vi phạm bản quyền",
      hate_speech: "Lời nói thù hận",
      violence: "Bạo lực",
      self_harm: "Tự gây hại",
      other: "Lý do khác"
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Quản lý báo cáo</h2>
        
        <div className="flex gap-3 mb-6">
          {["pending", "resolved", "rejected", ""].map((status) => (
            <button
              key={status || "all"}
              onClick={() => {
                setFilterStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {status === "pending" && "Chờ xử lý"}
              {status === "resolved" && "Đã xử lý"}
              {status === "rejected" && "Từ chối"}
              {status === "" && "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">Không có báo cáo nào</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Người báo cáo</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Lý do</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Người vi phạm</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Ngày</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={report.reporter?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"}
                          alt={report.reporter?.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium text-slate-900">{report.reporter?.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{getReasonLabel(report.reason)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{report.reportedUser?.username || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
                        {report.status === "pending" && "Chờ xử lý"}
                        {report.status === "resolved" && "Đã xử lý"}
                        {report.status === "rejected" && "Từ chối"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">
                      {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedReportId(report._id);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative w-full max-w-[600px] bg-white rounded-[28px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Chi tiết báo cáo</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Người báo cáo</p>
                <p className="text-slate-900 font-semibold">{selectedReport.reporter?.username}</p>
                <p className="text-sm text-slate-600">{selectedReport.reporter?.email}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lý do báo cáo</p>
                <p className="text-slate-900 font-semibold">{getReasonLabel(selectedReport.reason)}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả</p>
                <p className="text-slate-700 leading-relaxed">{selectedReport.description || "Không có mô tả"}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bài viết bị báo cáo</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-slate-700 leading-relaxed">{selectedReport.post?.content}</p>
                  {selectedReport.post?.fileUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                      {isVideo(selectedReport.post.fileUrl) ? (
                        <video
                          src={resolveAssetUrl(selectedReport.post.fileUrl)}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={resolveAssetUrl(selectedReport.post.fileUrl)}
                          alt="reported-post"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trạng thái hiện tại</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status === "pending" && "Chờ xử lý"}
                  {selectedReport.status === "resolved" && "Đã xử lý"}
                  {selectedReport.status === "rejected" && "Từ chối"}
                </span>
              </div>

              {selectedReport.adminNote && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ghi chú admin</p>
                  <p className="text-slate-700 leading-relaxed">{selectedReport.adminNote}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-4">
                <button
                  onClick={() => {
                    setPostActionType("hide");
                    setShowDetailModal(false);
                    setShowPostActionModal(true);
                  }}
                  className="px-3 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  Ẩn bài
                </button>
                <button
                  onClick={() => {
                    setPostActionType("delete");
                    setShowDetailModal(false);
                    setShowPostActionModal(true);
                  }}
                  className="px-3 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Xóa bài
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowUpdateModal(true);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedReport && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUpdateModal(false)} />
          <div className="relative w-full max-w-[400px] bg-white rounded-[28px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Cập nhật trạng thái</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Trạng thái <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {["pending", "resolved", "rejected"].map((status) => (
                    <label key={status} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={updateStatus === status}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700 font-medium">
                        {status === "pending" && "Chờ xử lý"}
                        {status === "resolved" && "Đã xử lý"}
                        {status === "rejected" && "Từ chối"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Ghi chú admin (tùy chọn)</label>
                <textarea
                  placeholder="Nhập ghi chú..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Action Modal */}
      {showPostActionModal && postActionType && selectedReport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPostActionModal(false)} />
          <div className="relative w-full max-w-[450px] bg-white rounded-[28px] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {postActionType === "hide" ? "Ẩn bài viết" : "Xóa bài viết"}
              </h3>
              <button
                onClick={() => setShowPostActionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900 leading-relaxed">
                  {postActionType === "hide"
                    ? "Bài viết này sẽ bị ẩn khỏi tất cả người dùng nhưng không bị xóa hoàn toàn."
                    : "Bài viết này sẽ bị xóa hoàn toàn từ hệ thống."}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Bài viết bị báo cáo:</p>
                <p className="text-slate-700 line-clamp-3 bg-slate-50 p-3 rounded-lg text-sm">
                  {selectedReport.post?.content}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do {postActionType === "hide" ? "ẩn" : "xóa"} bài viết
                </label>
                <input
                  type="text"
                  placeholder="Nhập lý do (vd: Vi phạm tiêu chuẩn cộng đồng)..."
                  defaultValue={getReasonLabel(selectedReport.reason)}
                  id="postActionReason"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPostActionModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => {
                    const reason = (document.getElementById("postActionReason") as HTMLInputElement)?.value;
                    handlePostAction(reason);
                  }}
                  className={`flex-1 px-4 py-3 text-white font-bold rounded-lg transition-colors ${
                    postActionType === "hide"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {postActionType === "hide" ? "Ẩn bài viết" : "Xóa bài viết"}
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

export default ReportAdmin;
