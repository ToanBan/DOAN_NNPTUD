import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, MailCheck, CheckCircle2 } from "lucide-react";
import handleVerifyOTP from "../api/user/handleVerifyOTP";
import { useSearchParams, Navigate} from "react-router-dom";
const VerifyOTP: React.FC = () => {
  const [otps, setOtps] = useState<string[]>(new Array(6).fill(""));
  const [otpString, setOtpString] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const val = e.target.value;
    if (!/^[0-9]$/.test(val) && val !== "") return;
    const newOtps = [...otps];
    newOtps[index] = val.slice(-1);
    setOtps(newOtps);
    setOtpString(newOtps.join(""));
    setError("");
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otps[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(data)) return;
    const digits = data.slice(0, 6).split("");
    const newOtps = [...otps];

    digits.forEach((d, i) => {
      if (i < 6) newOtps[i] = d;
    });

    setOtps(newOtps);
    setOtpString(newOtps.join(""));
    const nextIndex = digits.length >= 6 ? 5 : digits.length;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmitVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || otps.join("").length < 6 || !token) {
      if (otps.join("").length < 6) setError("Vui lòng nhập đầy đủ 6 chữ số.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await handleVerifyOTP(otps, token);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = `/reset-password?token=${result.token}`;
        }, 1500);
      } else {
        setError(result.message || "Mã OTP không chính xác. Vui lòng thử lại.");
        setOtps(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error(err);
      setError("Đã có lỗi xảy ra. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdfd] font-sans">
      <div className="w-full max-w-[1100px] h-[700px] flex overflow-hidden bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 m-4">
        <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-between overflow-hidden bg-[#0A0A0B]">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px]"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
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
              Xác thực <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                danh tính.
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Kiểm tra hộp thư đến của bạn. Chúng tôi vừa gửi một mã bảo mật gồm
              6 chữ số.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-slate-300">
            <MailCheck className="text-blue-400" size={20} />
            <span className="text-sm font-medium">Bảo mật đa lớp</span>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center">
          {!isSuccess ? (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  Nhập mã OTP
                </h2>
                <p className="text-slate-500 font-medium">
                  Mã đã được gửi đến email của bạn
                </p>
              </div>

              <form onSubmit={handleSubmitVerify} className="space-y-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-3" onPaste={handlePaste}>
                    {otps.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleChange(e, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-full h-16 sm:h-20 text-center text-3xl font-bold bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-semibold animate-pulse">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Xác nhận <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center lg:text-left animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-100">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Thành công!
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                Tài khoản của bạn đã được xác thực thành công.
              </p>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg">
                Đến bảng điều khiển
              </button>
            </div>
          )}

          <div className="mt-10 text-center text-sm">
            <span className="text-slate-500 font-medium">
              Không nhận được mã?{" "}
            </span>
            <button className="text-blue-600 font-black hover:underline">
              Gửi lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
