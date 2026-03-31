import React, { useEffect, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import handleResetPassword from "../api/user/handleResetPassword";
import AlertSuccess from "../components/AlertSuccess";
import AlertError from "../components/AlertError";
import { useSearchParams, Navigate } from "react-router-dom";
const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword || !token) return;
    const result = await handleResetPassword(
      token,
      newPassword,
      confirmNewPassword,
    );
    if (result.success) {
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
      setTimeout(()=>{
        window.location.href = "/login"
      }, 2000)
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
    }

    try {
    } catch (error) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdfd] font-sans selection:bg-blue-100 selection:text-blue-600">
        <div className="w-full max-w-[1100px] h-[700px] flex overflow-hidden bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 m-4">
          {/* --- Cột trái: Brand Showcase --- */}
          <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-between overflow-hidden bg-[#0A0A0B]">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-xl">f</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                FutureSocial
              </span>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-semibold mb-6">
                <Sparkles size={14} /> Account Recovery
              </div>
              <h1 className="text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Đặt lại <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  mật khẩu mới.
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Hãy tạo một mật khẩu mạnh để bảo vệ tài khoản và dữ liệu cá nhân
                của bạn.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                  Mã hóa đầu cuối
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-400">
                  <Zap size={20} />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                  Cập nhật tức thì
                </span>
              </div>
            </div>
          </div>

          {/* --- Cột phải: Reset Password Form --- */}
          <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center">
            {!isSuccess ? (
              <>
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Mật khẩu mới
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Nhập mật khẩu mới cho tài khoản của bạn
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleResetSubmit}>
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                        required
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <ShieldAlert size={18} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                        required
                        name="confirmNewPassword"
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Cập nhật mật khẩu{" "}
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center lg:text-left animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500 rounded-[20px] flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200 mx-auto lg:mx-0">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">
                  Thành công!
                </h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-sm mx-auto lg:mx-0">
                  Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có
                  thể đăng nhập bằng mật khẩu mới.
                </p>
                <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2">
                  Đăng nhập ngay
                </button>
              </div>
            )}

            <div className="mt-10 text-center text-sm text-slate-500 font-medium">
              Gặp sự cố?{" "}
              <a
                href="#"
                className="font-black text-blue-600 hover:text-blue-700 transition-colors"
              >
                Liên hệ kỹ thuật
              </a>
            </div>
          </div>
        </div>
      </div>

      {success && <AlertSuccess message="Đổi Mật Khẩu Thành Công" />}
      {error && <AlertError messages={"Đổi Mật Khẩu Thất Bại"} />}
    </>
  );
};

export default ResetPassword;
