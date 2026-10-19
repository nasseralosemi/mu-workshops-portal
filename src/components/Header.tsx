import React from 'react';
import { Building2, Lock, ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  activeTab: 'catalog' | 'dashboard';
  setActiveTab: (tab: 'catalog' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  isAdminLoggedIn,
  onAdminLogout,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Right Zone: Official University Wordmark */}
        <div
          onClick={() => {
            setActiveTab('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-amber-300 flex items-center justify-center shadow-xs ring-1 ring-emerald-900/10">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap block">
              جامعة المجمعة
            </span>
            <span className="text-xs text-emerald-800 font-semibold whitespace-nowrap block">
              الكلية التطبيقية · وحدة الإرشاد المهني والتوظيف
            </span>
          </div>
        </div>

        {/* Left Zone: Green Admin Login Button (Replacing former proposal button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isAdminLoggedIn ? (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-emerald-700/50"
              title="دخول المشرفين لوحدة الإرشاد المهني والتوظيف"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>دخول المشرف</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'dashboard' ? 'catalog' : 'dashboard')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{activeTab === 'dashboard' ? 'العودة للبوابة الرئيسية' : 'لوحة المشرف'}</span>
              </button>
              <button
                onClick={onAdminLogout}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                title="تسجيل الخروج من جلسة الإشراف"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
