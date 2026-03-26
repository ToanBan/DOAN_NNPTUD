import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Bell,
  PlusCircle,
  User,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { useUser } from "../context/authContext";

const Header: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  console.log(user);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleSearch = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="flex items-center gap-2 group cursor-pointer no-underline"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
            <span className="text-white font-black text-xl italic">f</span>
          </div>
          <span className="hidden sm:block font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            FutureSocial
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center bg-slate-100/80 px-4 py-2 rounded-2xl gap-3 w-80 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all duration-300">
          <Search
            size={18}
            className="text-slate-400 cursor-pointer hover:text-blue-500"
            onClick={handleSearch} // Click vào icon kính lúp cũng search được
          />
          <input
            type="text"
            placeholder="Tìm kiếm mọi thứ..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown} // Bắt sự kiện nhấn Enter
          />
        </div>
      </div>

      {/* Right side: Actions & User Dropdown */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* ... (Phần buttons Actions giữ nguyên) */}
        <div className="flex items-center gap-1 md:gap-2 pr-2 border-r border-slate-200">
          <button className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90">
            <PlusCircle size={20} />
          </button>
          <button className="relative p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90">
            <MessageCircle size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="relative p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-4 h-4 bg-blue-600 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white font-bold">
              3
            </span>
          </button>
        </div>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 p-1.5 pl-3 hover:bg-white hover:shadow-md rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-100"
            >
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user.username}
                </p>
                <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                  MEMBER
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-blue-50 transition-transform active:scale-95">
                <img
                  src={
                    user.avatar
                      ? `${import.meta.env.VITE_API_MINIO}/${user.avatar}`
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                />
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-100 p-2 animate-in fade-in zoom-in slide-in-from-top-2 duration-200 origin-top-right">
                {/* ... (Phần nội dung Dropdown giữ nguyên) */}
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    Tài khoản cá nhân
                  </p>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {user.email}
                  </p>
                </div>

                <DropDownItem
                  to="/profile"
                  icon={<User size={18} />}
                  label="Hồ sơ của tôi"
                />
                <DropDownItem
                  to="/settings"
                  icon={<Settings size={18} />}
                  label="Cài đặt"
                />

                <div className="h-px bg-slate-50 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-xl transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-rose-50 group-hover:bg-rose-100 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span className="font-bold">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

// ... (DropDownItem Component giữ nguyên)
const DropDownItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
}> = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
  >
    <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-blue-100 transition-colors">
      {React.cloneElement(icon as React.ReactElement)}
    </div>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Header;
