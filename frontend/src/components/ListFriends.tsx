import {
  LayoutGrid,
  Search,
  Send,
  X,
  Paperclip,
  Smile,
  FileText,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import getMessageByUser from "../api/message/getMessageByUser";
import { useUser } from "../context/authContext";
import api from "../lib/axios";
import { useSocket } from "../context/socketContext";

interface Friends {
  id: string;
  username: string;
  avatar: string;
}

const ListFriends = () => {
  const { user } = useUser();
  const { socket } = useSocket();

  const [friends, setFriends] = useState<Friends[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friends | null>(null);

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get("/api/users/friends");
        setFriends(res.data.friends || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách bạn bè:", error);
      }
    };
    if (user) fetchFriends();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      if (
        message.senderId === selectedFriend?.id ||
        message.senderId === user?._id
      ) {
        setChatHistory((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, selectedFriend, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Nếu là ảnh thì tạo link preview, nếu không thì thôi
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!socket || !selectedFriend) return;
    if (!messageInput.trim() && !selectedFile) return;

    let fileUrl = "";
    let fileType = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const res = await api.post("/api/chatmessages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        fileUrl = res.data.url;
        fileType = res.data.type;
      } catch (err) {
        console.error("Upload lỗi:", err);
        return;
      }
    }

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: selectedFriend.id,
      content: messageInput,
      fileUrl,
      fileType,
    });

    setMessageInput("");
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend) return;

      try {
        const messages = await getMessageByUser(selectedFriend.id);
        setChatHistory(messages);
      } catch (err) {
        console.error("Lỗi load message:", err);
      }
    };

    fetchMessages();
  }, [selectedFriend]);

  return (
    <div className="relative flex gap-6 h-screen p-6 bg-slate-50">
      <div className="bg-white p-5 rounded-[24px] shadow-sm border min-w-[320px] h-fit">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold uppercase text-[11px] tracking-[2px] text-slate-500">
            Người liên hệ
          </h3>
          <div className="flex gap-2 text-slate-400">
            <Search size={16} className="cursor-pointer hover:text-blue-500" />
            <LayoutGrid
              size={16}
              className="cursor-pointer hover:text-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => {
                setSelectedFriend(friend);
                setChatHistory([]);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                selectedFriend?.id === friend.id
                  ? "bg-blue-50 shadow-sm"
                  : "hover:bg-slate-50"
              }`}
            >
              <img
                src={friend.avatar}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span
                className={`text-sm ${selectedFriend?.id === friend.id ? "font-bold text-blue-600" : "font-semibold text-slate-700"}`}
              >
                {friend.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      {selectedFriend && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white shadow-2xl rounded-[30px] flex flex-col overflow-hidden border border-slate-100">
          {/* HEADER */}
          <div className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedFriend.avatar}
                  className="w-10 h-10 rounded-full border shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">
                  {selectedFriend.username}
                </p>
                <p className="text-[11px] text-green-500 font-medium">
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFriend(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* MESSAGES */}
          <div
            ref={scrollRef}
            className="flex-1 p-5 overflow-y-auto space-y-6 bg-[#f8fafc] scroll-smooth"
          >
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                <Smile size={40} />
                <p className="text-[13px] italic text-center px-10">
                  Hãy bắt đầu cuộc trò chuyện với {selectedFriend.username}
                </p>
              </div>
            )}

            {chatHistory.map((msg, idx) => {
              const isMe = msg.senderId === user?._id;
              const isImage = msg.fileType?.startsWith("image/");

              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] group relative ${isMe ? "bg-blue-600 text-white" : "bg-white border text-slate-800"} p-3 rounded-2xl shadow-sm`}
                  >
                    {msg.content && (
                      <p className="text-[14px] leading-relaxed">
                        {msg.content}
                      </p>
                    )}

                    {msg.fileUrl && (
                      <div
                        className={`mt-2 rounded-lg overflow-hidden ${isMe ? "bg-blue-700/30" : "bg-slate-50"} p-2 border border-black/5`}
                      >
                        {isImage ? (
                          <div className="relative group/img">
                            <img
                              src={msg.fileUrl}
                              className="max-w-full rounded-md object-cover max-h-60"
                              alt="attachment"
                            />
                            <a
                              href={`/api/chatmessages/download/${msg.fileUrl.split("/").pop()}`}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity rounded-md"
                            >
                              <Download className="text-white" size={24} />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 py-1 px-2">
                            <div
                              className={`p-2 rounded-lg ${isMe ? "bg-blue-500" : "bg-blue-100 text-blue-600"}`}
                            >
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[12px] font-medium truncate ${isMe ? "text-blue-50" : "text-slate-700"}`}
                              >
                                Tài liệu đính kèm
                              </p>
                              <p
                                className={`text-[10px] opacity-70 ${isMe ? "text-white" : "text-slate-500"}`}
                              >
                                Bấm để tải xuống
                              </p>
                            </div>
                            <a
                              href={msg.fileUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className={`p-2 rounded-full transition-colors ${isMe ? "hover:bg-blue-500 text-white" : "hover:bg-slate-200 text-slate-500"}`}
                            >
                              <Download size={18} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <span
                      className={`text-[9px] mt-1 block opacity-60 ${isMe ? "text-right" : "text-left"}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t bg-white">
            {/* FILE PREVIEW PANEL */}
            {selectedFile && (
              <div className="mb-3 p-2 bg-blue-50 rounded-2xl flex items-center gap-3 border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                {filePreview ? (
                  <img
                    src={filePreview}
                    className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-blue-700 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-blue-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="p-1.5 hover:bg-blue-200 rounded-full text-blue-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="bg-slate-100 rounded-[24px] px-4 py-2.5 flex items-center gap-3 transition-all focus-within:bg-slate-200 focus-within:ring-2 ring-blue-100">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-500 hover:text-blue-600 p-1 transition-colors"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="bg-transparent flex-1 outline-none text-[14px] text-slate-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && !selectedFile}
                className={`p-2 rounded-full transition-all ${
                  messageInput.trim() || selectedFile
                    ? "bg-blue-600 text-white shadow-md hover:scale-110 active:scale-95"
                    : "text-slate-300"
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListFriends;
