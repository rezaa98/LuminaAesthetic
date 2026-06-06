import React from "react";
import { AlertCircle, LogIn, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { AppState } from "../types";

interface LimitModalProps {
  type: "guest" | "user" | null;
  onClose: () => void;
  onLogin: () => void;
  guestDailyLimit?: number;
  userDailyLimit?: number;
}

export const LimitModal: React.FC<LimitModalProps> = ({
  type,
  onClose,
  onLogin,
  guestDailyLimit = 1,
  userDailyLimit = 5
}) => {
  const { language } = useLanguage();

  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in-up border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 mx-auto text-pink-500 shadow-sm border border-pink-100">
          <AlertCircle size={32} />
        </div>

        <h3 className="text-xl font-black text-slate-800 text-center mb-3 tracking-tight">
          {language === "id"
            ? "Batas Pemakaian Tercapai!"
            : "Usage Limit Reached!"}
        </h3>

        <p className="text-[13px] text-slate-500 text-center mb-8 leading-relaxed px-2">
          {language === "id"
            ? type === "guest"
              ? `Guest dibatasi ${guestDailyLimit}x pemindaian per hari. Silakan mendaftar dengan akun Google Anda untuk mendapatkan akses lebih banyak pemindaian!`
              : `Anda telah mencapai batas ${userDailyLimit}x pemindaian per hari. Silakan coba kembali besok atau hubungi administrator untuk peningkatan paket.`
            : type === "guest"
              ? `Guests are limited to ${guestDailyLimit} scan(s) per day. Please log in with your Google account to get more scans!`
              : `You have reached your limit of ${userDailyLimit} scans per day. Please try again tomorrow or contact an administrator to upgrade.`}
        </p>

        <div className="flex flex-col gap-3">
          {type === "guest" && (
            <button
              onClick={onLogin}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs tracking-widest uppercase hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              {language === "id"
                ? "Registrasi dengan Google"
                : "Register with Google"}
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs tracking-widest uppercase hover:bg-slate-100 transition-colors border border-slate-200 ${type !== "guest" ? "bg-slate-900 text-white hover:bg-slate-800 border-none shadow-md" : ""}`}
          >
            {language === "id" ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
