import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import AlertSuccess from "../components/AlertSuccess";
import AlertError from "../components/AlertError";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../context/authContext";
const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useUser();

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;
    const currentForm = e.currentTarget;
    setIsLoading(true);

    try {
      const formData = new FormData(currentForm);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const result = await login(email, password);

      if (result.success) {
        setSuccess(true);
        currentForm.reset();

        setTimeout(() => {
          setSuccess(false);
          window.location.href = "/";
        }, 2000);
      } else {
        currentForm.reset();
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
    } catch (error) {
      currentForm.reset();
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdfd] font-sans selection:bg-blue-100 selection:text-blue-600">
        <div className="w-full max-w-[1100px] h-[700px] flex overflow-hidden bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 m-4">
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
                <Sparkles size={14} /> New Generation Social
              </div>
              <h1 className="text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Nơi ý tưởng <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  được kết nối.
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Trải nghiệm không gian mạng xã hội tối giản, hiện đại và bảo mật
                tuyệt đối.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                  Bảo mật đa lớp
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-400">
                  <Zap size={20} />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                  Tốc độ tối ưu
                </span>
              </div>
            </div>
          </div>

          {/* --- Cột phải: Đăng nhập Form --- */}
          <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 overflow-y-auto">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Đăng nhập
              </h2>
              <p className="text-slate-500 font-medium">
                Chào mừng bạn quay trở lại với FutureSocial
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmitLogin}>
              {/* Input Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    required
                    name="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-700">
                    Mật khẩu
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-indigo-600 transition-colors py-1 px-2 hover:bg-blue-50 rounded-lg"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    required
                    name="password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Checkbox Remember */}
              <label className="flex items-center gap-3 cursor-pointer group w-fit ml-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    id="remember"
                  />
                  <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                    <svg
                      className="w-3 h-3 font-bold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-500 font-medium select-none group-hover:text-slate-700">
                  Duy trì đăng nhập
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    Bắt đầu ngay{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">
                  Tiếp tục bằng
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  window.location.href = `http://localhost:3000/api/auth/google`;
                }}
                className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
              >
                <FcGoogle size={18} /> Google
              </button>
            </div>

            {/* Footer Link */}
            <p className="mt-auto pt-10 text-center text-sm text-slate-500 font-medium">
              Bạn là người mới?{" "}
              <a
                href="/register"
                className="font-black text-blue-600 hover:text-blue-700 transition-colors"
              >
                Tạo tài khoản miễn phí
              </a>
            </p>
          </div>
        </div>
      </div>

      {success && <AlertSuccess message="Đăng Nhập Thành Công" />}
      {error && <AlertError messages="Đăng Nhập Thất Bại" />}
    </>
  );
};

export default Login;
