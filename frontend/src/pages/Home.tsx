import React, { useState } from "react";
import {
  Home,
  Tv,
  ShoppingBag,
  Users2,
  PlusCircle,
  Bookmark,
  Compass,
  Settings,
} from "lucide-react";
import Header from "../components/Header";
import PostCreator from "../components/PostCreator";
import ListFriends from "../components/ListFriends";
import ListPost from "../components/ListPost";
const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600">
      <Header />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-24 pb-12 px-4 md:px-8">
        <aside className="hidden lg:block lg:col-span-3 space-y-2 sticky top-24 self-start">
          {[
            { id: "home", icon: Home, label: "Bảng tin" },
            { id: "explore", icon: Compass, label: "Khám phá" },
            { id: "video", icon: Tv, label: "Watch" },
            { id: "friends", icon: Users2, label: "Bạn bè" },
            { id: "market", icon: ShoppingBag, label: "Marketplace" },
            { id: "saved", icon: Bookmark, label: "Đã lưu" },
            { id: "settings", icon: Settings, label: "Cài đặt" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 font-semibold"
                  : "hover:bg-white text-slate-600 hover:text-blue-600 hover:shadow-sm"
              }`}
            >
              <item.icon
                size={22}
                className={
                  activeTab === item.id
                    ? "text-white"
                    : "text-slate-400 group-hover:text-blue-600"
                }
              />
              <span className="text-[15px]">{item.label}</span>
            </button>
          ))}

          <div className="mt-8 pt-8 border-t border-slate-200/60">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Lối tắt của bạn
            </p>
            <div className="space-y-4 px-4">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  UI
                </div>
                <span className="text-sm font-medium text-slate-600">
                  UI/UX Designer VN
                </span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs group-hover:bg-orange-600 group-hover:text-white transition-all">
                  JS
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Javascript VietNam
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-6 space-y-6">

          <ListPost/>
        </main>

        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 self-start">
         

          <ListFriends />
          <div className="px-5 py-2">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Quyền riêng tư · Điều khoản · Quảng cáo · Cookies · FutureSocial ©
              2024
            </p>
          </div>
        </aside>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default HomePage;