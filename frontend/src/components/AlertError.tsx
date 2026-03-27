import React from "react";

interface AlertErrorProps {
  messages: string | string[];
}

const AlertError: React.FC<AlertErrorProps> = ({ messages }) => {
  const msgs = Array.isArray(messages) ? messages : [messages];
  return (
    <div className="fixed top-5 right-5 flex flex-col gap-4 z-[100]">
      {msgs.map((message, index) => (
        <div
          key={index}
          className="flex items-center w-full max-w-sm p-4 bg-white rounded-[1.5rem] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border-l-4 border-rose-500 animate-slide-in"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-rose-100 rounded-xl mr-4 flex-shrink-0">
            <svg
              className="w-6 h-6 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Thất bại
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{message}</p>
          </div>
          <button className="ml-4 text-slate-400 hover:text-slate-600 transition">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertError;
