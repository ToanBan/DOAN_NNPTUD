import React, { useState, useEffect, ChangeEvent } from "react";
import {
  LayoutGrid,
  Plus,
  X,
  Menu,
  Edit2,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../lib/axios";
import handleAddForum from "../../api/forum/handleAddForum";
import handleDeleteForum from "../../api/forum/handleDeleteForum";
import handleEditForum from "../../api/forum/handleEditForum";
interface ForumItem {
  forumId: string;
  name: string;
  description: string;
  createdBy: {
    userId: string;
    username: string;
    avatar: string;
  };
  memberCount: number;
  createdAt: string;
}

interface ForumFormData {
  name: string;
  description: string;
}

const Forum: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedForum, setSelectedForum] = useState<ForumItem | null>(null);
  const [formData, setFormData] = useState<ForumFormData>({
    name: "",
    description: "",
  });
  const [forums, setForums] = useState<ForumItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchForums = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ message: string; forums: ForumItem[] }>(
          "/api/forums",
        );
        setForums(res.data.forums || []);
      } catch (error) {
        console.error("fetchForums error:", error);
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể tải danh sách diễn đàn.",
          icon: "error",
          confirmButtonColor: "#4f46e5",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchForums();
  }, []);

  const handleDelete = async (forum: ForumItem): Promise<void> => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa diễn đàn "${forum.name}" không? Hành động này không thể hoàn tác!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;
    try {
      await handleDeleteForum(forum.forumId);
      setForums((prev) => prev.filter((f) => f.forumId !== forum.forumId));
      await Swal.fire({
        title: "Đã xóa!",
        text: "Diễn đàn đã được loại bỏ khỏi hệ thống.",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
    } catch (error) {
      await Swal.fire({
        title: "Lỗi!",
        text: "Không thể xóa diễn đàn. Vui lòng thử lại.",
        icon: "error",
        confirmButtonColor: "#4f46e5",
      });
    }
  };

  const handleAddNew = (): void => {
    setSelectedForum(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  // ── Mở modal chỉnh sửa ──
  const handleEdit = (forum: ForumItem): void => {
    setSelectedForum(forum);
    setFormData({ name: forum.name, description: forum.description });
    setIsModalOpen(true);
  };

  // ── Input change ──
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.name.trim()) {
      Swal.fire({
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập tên diễn đàn.",
        icon: "warning",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (selectedForum) {
        // ── UPDATE ──
        const result = await handleEditForum(selectedForum.forumId, formData);

        setForums((prev) =>
          prev.map((f) =>
            f.forumId === selectedForum.forumId
              ? {
                  ...f,
                  name: result.forum.name ?? f.name,
                  description: result.forum.description ?? f.description,
                }
              : f,
          ),
        );

        setIsModalOpen(false);

        Swal.fire({
          title: "Cập nhật thành công!",
          text: `Diễn đàn "${formData.name}" đã được cập nhật.`,
          icon: "success",
          confirmButtonColor: "#4f46e5",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        // ── CREATE ──
        const result = await handleAddForum(formData);

        if (result && result.forum) {
          setForums((prev) => [result.forum, ...prev]);
          setIsModalOpen(false);

          Swal.fire({
            title: "Tạo thành công!",
            text: `Diễn đàn "${result.forum.name}" đã được tạo.`,
            icon: "success",
            confirmButtonColor: "#4f46e5",
            timer: 2000,
            timerProgressBar: true,
          });
        } else {
          throw new Error("Tạo diễn đàn thất bại");
        }
      }
    } catch (error) {
      console.error("handleSave error:", error);

      Swal.fire({
        title: "Lỗi!",
        text: "Không thể lưu diễn đàn. Vui lòng thử lại.",
        icon: "error",
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredForums = forums.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 w-full overflow-x-hidden">
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu size={24} />
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm diễn đàn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-8 py-6">
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <LayoutGrid size={20} />
                  </div>
                  Quản lý diễn đàn
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {forums.length} diễn đàn đang hoạt động
                </p>
              </div>
              <button
                onClick={handleAddNew}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md active:scale-95 transition-all"
              >
                <Plus size={18} /> Thêm diễn đàn
              </button>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 size={22} className="animate-spin" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : filteredForums.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <LayoutGrid size={36} className="opacity-30" />
                  <p className="text-sm">
                    {searchQuery
                      ? "Không tìm thấy diễn đàn phù hợp."
                      : "Chưa có diễn đàn nào."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase w-20">
                          #
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase w-1/4">
                          Tên diễn đàn
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                          Mô tả
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase w-28 text-center">
                          Thành viên
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right w-32">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredForums.map((forum, index) => (
                        <tr
                          key={forum.forumId}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">
                              {forum.name}
                            </span>
                            <p className="text-xs text-slate-400 mt-0.5">
                              bởi {forum.createdBy?.username || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 line-clamp-1 max-w-xs">
                            {forum.description || (
                              <span className="italic text-slate-300">
                                Không có mô tả
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                              {forum.memberCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleEdit(forum)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(forum)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Thêm / Sửa */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedForum ? "Cập nhật diễn đàn" : "Tạo diễn đàn mới"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                    Tên diễn đàn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    placeholder="VD: Lập trình ReactJS..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    rows={4}
                    placeholder="Mô tả ngắn về diễn đàn..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Forum;
