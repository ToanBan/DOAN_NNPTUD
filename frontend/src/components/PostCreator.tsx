import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Smile,
  Video,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";
import api from "../lib/axios";

interface PostCreatorProps {
  username: string;
  onPostCreated?: (newPost: any) => void;
  forumId?: string;
}

const PostCreator = ({ username, onPostCreated, forumId }: PostCreatorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "private" | "friends">(
    "public",
  );
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setContent("");
    setFile(null);
    setPrivacy("public");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isVideoFile = (selectedFile: File | null) => {
    return Boolean(selectedFile && selectedFile.type.startsWith("video/"));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim() && !file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("privacy", privacy);

      if (file) {
        formData.append("file", file);
      }

      if (forumId) {
        formData.append("forum", forumId);
      }

      const res = await api.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onPostCreated?.(res.data.post);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-200/50">
        <div className="flex gap-4 mb-5">
          <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full text-left px-5 py-2.5 bg-slate-100/80 hover:bg-slate-200/60 rounded-2xl text-slate-500 text-sm font-medium transition-all outline-none"
          >
            Chao {username}, hom nay ban thay the nao?
          </button>
        </div>

        <div className="flex gap-2 sm:gap-4 pt-4 border-t border-slate-100">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-rose-50 rounded-xl text-rose-500 font-semibold text-xs transition-all group">
            <Video
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="hidden sm:inline">Truc tiep</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-emerald-50 rounded-xl text-emerald-500 font-semibold text-xs transition-all group"
          >
            <ImageIcon
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="hidden sm:inline">Anh/Video</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-orange-50 rounded-xl text-orange-500 font-semibold text-xs transition-all group">
            <Smile
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="hidden sm:inline">Cam xuc</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !loading && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-[550px] bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 w-full text-center ml-8">
                Tao bai viet
              </h3>
              <button
                onClick={() => !loading && setIsModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight mb-1">
                      {username}
                    </p>
                    <label className="relative inline-flex items-center">
                      <Globe
                        size={14}
                        className="absolute left-2.5 text-slate-500 pointer-events-none"
                      />
                      <select
                        value={privacy}
                        onChange={(e) =>
                          setPrivacy(
                            e.target.value as "public" | "private" | "friends",
                          )
                        }
                        disabled={loading}
                        className="appearance-none pl-8 pr-8 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[12px] font-bold text-slate-600 transition-colors outline-none disabled:opacity-60"
                      >
                        <option value="public">Cong khai</option>
                        <option value="friends">Ban be</option>
                        <option value="private">Rieng tu</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2 text-slate-500 pointer-events-none"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  placeholder={`${username} oi, ban dang nghi gi the?`}
                  className="w-full min-h-[120px] text-lg text-slate-800 placeholder:text-slate-400 border-none outline-none resize-none focus:ring-0 mb-4"
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                />

                <div className="relative group rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center mb-6 hover:bg-blue-50/50 hover:border-blue-200 transition-all">
                  {file ? (
                    <div className="flex items-center justify-between w-full bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isVideoFile(file) ? (
                          <Video
                            className="text-blue-500 flex-shrink-0"
                            size={20}
                          />
                        ) : (
                          <ImageIcon
                            className="text-blue-500 flex-shrink-0"
                            size={20}
                          />
                        )}
                        <span className="text-sm font-semibold text-slate-700 truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <Video size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-1">
                        Them anh hoac video vao bai viet
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ho tro image va video toi da 100MB
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                        disabled={loading}
                      />
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (!content.trim() && !file)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Dang xu ly...
                    </>
                  ) : (
                    "Dang bai viet"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {success && <AlertSuccess message="Them bai viet thanh cong!" />}
      {error && (
        <AlertError messages={["Them bai viet that bai, vui long thu lai!"]} />
      )}
    </>
  );
};

export default PostCreator;
