import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Zap,
} from "lucide-react";
import handleForgotPassword from "../api/user/handleForgotPassword";
import AlertSuccess from "../components/AlertSuccess";
const Forgot: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      const result = await handleForgotPassword(email);
      console.log("res", result);

      if (result.success) {
        setSuccess(true);
        setIsSubmitted(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
                <Sparkles size={14} /> Security First
              </div>
              <h1 className="text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Khôi phục <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  quyền truy cập.
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại tài khoản một cách
                nhanh chóng và bảo mật.
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
                  Xác thực nhanh
                </span>
              </div>
            </div>
          </div>

          {/* --- Cột phải: Forgot Password Form --- */}
          <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center">
            <div className="mb-10 text-center lg:text-left">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group">
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />{" "}
                Quay lại đăng nhập
              </button>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Quên mật khẩu?
              </h2>
              <p className="text-slate-500 font-medium">
                Nhập email của bạn để nhận liên kết khôi phục
              </p>
            </div>

            {!isSubmitted ? (
              <form className="space-y-6" onSubmit={handleSubmitForgot}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Địa chỉ Email
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      name="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang gửi yêu cầu...</span>
                    </>
                  ) : (
                    <>
                      Gửi mã xác nhận{" "}
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center lg:text-left p-8 bg-blue-50/50 rounded-[32px] border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20 mx-auto lg:mx-0">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Kiểm tra hộp thư!
                </h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                  Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến email của
                  bạn. Vui lòng kiểm tra cả hòm thư rác nếu không thấy.
                </p>
              </div>
            )}

            <div className="mt-10 text-center text-sm text-slate-500 font-medium">
              Bạn cần hỗ trợ?{" "}
              <a
                href="#"
                className="font-black text-blue-600 hover:text-blue-700 transition-colors"
              >
                Liên hệ trung tâm trợ giúp
              </a>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <AlertSuccess message="Vui Lòng Xác Thực Trong Email Để Hoàn Tất Quá Trình" />
      )}
    </>
  );
};

export default Forgot;
