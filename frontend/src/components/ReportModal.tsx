import { useState } from "react";
import { X } from "lucide-react";
import { submitReport } from "../api/post/handleReport";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";

interface ReportModalProps {
  postId: string;
  onClose: () => void;
  onReportSuccess: () => void;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate_content", label: "Nội dung không phù hợp" },
  { value: "harassment", label: "Qu騷 nhiễu/Tấn công" },
  { value: "misinformation", label: "Thông tin sai lệch" },
  { value: "copyright_violation", label: "Vi phạm bản quyền" },
  { value: "hate_speech", label: "Lời nói thù hận" },
  { value: "violence", label: "Bạo lực" },
  { value: "self_harm", label: "Tự gây hại" },
  { value: "other", label: "Lý do khác" }
];

const ReportModal = ({ postId, onClose, onReportSuccess }: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!selectedReason) {
      setErrorMessage("Vui lòng chọn lý do report");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
      return;
    }

    try {
      setIsLoading(true);
      await submitReport(postId, selectedReason, description);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onReportSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || "Có lỗi khi gửi report");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 w-full text-center ml-8">
              Báo cáo bài viết
            </h3>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Lý do báo cáo <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      disabled={isLoading}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Chi tiết bổ sung (tùy chọn)
              </label>
              <textarea
                placeholder="Mô tả chi tiết lý do báo cáo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full min-h-[100px] p-3 text-sm text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                Tối đa 500 ký tự
              </p>
            </div>

            <p className="text-xs text-slate-600 bg-blue-50/50 border border-blue-100/50 rounded-lg p-3 mb-6 leading-relaxed">
              ℹ️ Báo cáo của bạn sẽ được gửi tới admin. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors disabled:opacity-60"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedReason}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
              >
                {isLoading ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && <AlertSuccess message="Báo cáo đã được gửi thành công!" />}
      {showError && <AlertError messages={errorMessage} />}
    </>
  );
};

export default ReportModal;
