import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import handleRegister from "../api/user/handleRegister";
import AlertSuccess from "../components/AlertSuccess";
import AlertError from "../components/AlertError";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleSubmitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const fullname = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(true);
      setErrorMessages(["Mật khẩu và xác nhận mật khẩu không khớp"]);
      setTimeout(() => setError(false), 3000);
      setIsLoading(false);
      return;
    }

    try {
      const result = await handleRegister(username, fullname, email, password, confirmPassword);

      if (result.success) {
        setSuccess(true);
        setErrorMessages([]);
        setTimeout(() => setSuccess(false), 3000);
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setError(true);
        let msgs = ["Đăng ký thất bại"];
        if (result.errors && Array.isArray(result.errors)) {
          msgs = result.errors.map((err: any) => typeof err === 'string' ? err : err.message || "Lỗi không xác định");
        } else if (result.message) {
          msgs = [result.message];
        }
        setErrorMessages(msgs);
        setTimeout(() => setError(false), 3000);
      }
    } catch (err: any) {
      setError(true);
      setErrorMessages(
        err.response?.data?.errors?.map((e: any) => e.message) ||
        [err.response?.data?.message || "Đăng ký thất bại"]
      );
      setTimeout(() => setError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdfd] font-sans selection:bg-blue-100 selection:text-blue-600">
        <div className="w-full max-w-[1100px] h-[820px] flex overflow-hidden bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 m-4">
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
                <Sparkles size={14} /> Join the Community
              </div>
              <h1 className="text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Bắt đầu hành trình <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  sáng tạo của bạn.
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Tạo tài khoản chỉ trong vài giây và kết nối với hàng triệu người
                dùng trên toàn thế giới.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={18} className="text-blue-500" />
                <span className="text-sm font-medium">Miễn phí trọn đời</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={18} className="text-blue-500" />
                <span className="text-sm font-medium">
                  Không giới hạn tính năng
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={18} className="text-blue-500" />
                <span className="text-sm font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          {/* --- Cột phải: Đăng ký Form --- */}
          <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Tạo tài khoản
              </h2>
              <p className="text-slate-500 font-medium">
                Khám phá thế giới kết nối mới ngay hôm nay
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitRegister}>
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="NguyenVanA"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium text-slate-800"
                    required
                    name="username"
                  />
                </div>
              </div>

              {/* Fullname */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Fullname
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="NguyenVanA"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium text-slate-800"
                    required
                    name="fullname"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
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
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium text-slate-800"
                    required
                    name="email"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium text-slate-800"
                      required
                      name="password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Xác nhận
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <ShieldAlert size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium text-slate-800"
                      required
                      name="confirmPassword"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group w-full ml-1 py-1">
                <div className="relative flex items-center mt-0.5">
                  <input type="checkbox" className="peer sr-only" id="terms" required />
                  <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                    <svg className="w-3 h-3 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium leading-relaxed">
                  Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a>.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Tạo tài khoản <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <button
                onClick={() => { window.location.href = `http://localhost:5000/api/auth/google`; }}
                className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
              >
                <FcGoogle size={18} /> Google
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 font-medium">
              Đã có tài khoản? <a href="/login" className="font-black text-blue-600 hover:text-blue-700 transition-colors">Đăng nhập ngay</a>
            </p>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `,
          }}
        />
      </div>

      {success && <AlertSuccess message="Đăng ký thành công" />}
      {error && <AlertError messages={errorMessages} />}
    </>
  );
};

export default Register;