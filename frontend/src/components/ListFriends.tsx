import { LayoutGrid, Search, Send, X, Paperclip, Smile } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { useUser } from "../context/authContext";
import api from "../lib/axios";



interface Friends {
  id: number;
  username: string;
  avatar: string;
}

const ListFriends = () => {
  const { user } = useUser();

  const [friends, setFriends] = useState<Friends[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friends | null>(null);

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);


 



  return (
    <div className="relative flex gap-6">
      <div className="bg-white p-5 rounded-[24px] shadow-sm border min-w-[320px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold uppercase text-[11px] tracking-[2px]">
            Người liên hệ
          </h3>

          <div className="flex gap-2">
            <Search size={14} />
            <LayoutGrid size={14} />
          </div>
        </div>

        <div className="space-y-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-50"
            >
              <img
                src={
                  friend.avatar
                    ? `${import.meta.env.VITE_API_MINIO}/${friend.avatar}`
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`
                }
                className="w-10 h-10 rounded-xl"
              />

              <span className="text-sm font-semibold">{friend.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedFriend && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[550px] bg-white shadow-2xl rounded-[30px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={
                  selectedFriend.avatar
                    ? `${import.meta.env.VITE_API_MINIO}/${selectedFriend.avatar}`
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFriend.username}`
                }
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="text-[14px] font-bold">
                  {selectedFriend.username}
                </p>
              </div>
            </div>

            <button onClick={() => setSelectedFriend(null)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 p-5 overflow-y-auto space-y-6 bg-[#f8fafc] custom-scrollbar"
          >
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                <div className="p-4 bg-white rounded-full shadow-sm">
                  <Smile size={32} className="text-blue-400" />
                </div>
                <p className="text-[13px] font-medium italic">
                  Hãy bắt đầu cuộc trò chuyện...
                </p>
              </div>
            )}

            {chatHistory.map((msg, idx) => {
              const isMe = msg.senderId === user?.id;

              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`relative max-w-[85%] group ${
                      isMe
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-[20px] rounded-tr-none shadow-blue-100"
                        : "bg-white border border-slate-100 text-slate-700 rounded-[20px] rounded-tl-none shadow-sm"
                    } p-3.5 transition-all hover:shadow-md`}
                  >
                    {msg.type === "file" ? (
                      <div className="flex flex-col gap-3 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${isMe ? "bg-white/20" : "bg-blue-50"}`}
                          >
                            <Paperclip
                              size={18}
                              className={isMe ? "text-white" : "text-blue-600"}
                            />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[13px] font-semibold truncate leading-tight">
                              {msg.content}
                            </p>
                            <p
                              className={`text-[10px] uppercase tracking-wider mt-0.5 opacity-70`}
                            >
                              File tài liệu
                            </p>
                          </div>
                        </div>

                       
                      </div>
                    ) : (
                      <p className="text-[14px] leading-relaxed px-1 font-medium">
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="bg-slate-100 rounded-[20px] px-4 py-2 flex items-center gap-3">
              <input
                type="file"
                hidden
                ref={fileInputRef}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-500 hover:text-blue-600"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Aa"
                className="bg-transparent flex-1 outline-none"
              />

              <button className="text-blue-600">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListFriends;