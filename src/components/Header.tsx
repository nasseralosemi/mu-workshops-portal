import React from 'react';
import { Building2, Lock, ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  activeTab: 'catalog' | 'dashboard';
  setActiveTab: (tab: 'catalog' | 'dashboard') => void;
  cloudStatus?: 'online' | 'syncing' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  isAdminLoggedIn,
  onAdminLogout,
  activeTab,
  setActiveTab,
  cloudStatus = 'online',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 min-h-[4.75rem] flex items-center justify-between gap-3 sm:gap-4">
        {/* Right Zone: Official University Wordmark - Vertical 3-line Stack */}
        <div
          onClick={() => {
            setActiveTab('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          title="بوابة حجز ورش العمل - وحدة الإرشاد المهني والتوظيف"
        >
          {/* Faculty / University Emblem */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-amber-300 flex items-center justify-center shadow-xs ring-1 ring-emerald-900/10 shrink-0 group-hover:scale-102 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>

          {/* Vertical Stack: University -> College -> Unit */}
          <div className="flex flex-col justify-center text-right select-none space-y-0.5">
            {/* Line 1: University */}
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
              جامعة المجمعة
            </span>
            {/* Line 2: Applied College */}
            <span className="text-xs sm:text-[13px] font-bold text-emerald-800 leading-tight whitespace-nowrap">
              الكلية التطبيقية
            </span>
            {/* Line 3: Unit */}
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-tight whitespace-nowrap">
              وحدة الإرشاد المهني والتوظيف
            </span>
          </div>
        </div>

        {/* Center / Cloud Sync Indicator (Visible on desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/70 border border-emerald-100 rounded-full text-xs text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-medium text-[11px]">
            {cloudStatus === 'online'
              ? 'متصل بسحابة Firebase (Firestore)'
              : cloudStatus === 'syncing'
              ? 'جاري المزامنة السحابية...'
              : 'جاري التحقق من الاتصال السحابي'}
          </span>
        </div>

        {/* Left Zone: Supervisor Portal Action Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isAdminLoggedIn ? (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 rounded-lg sm:rounded-xl shadow-xs hover:shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer border border-emerald-700/50"
              title="دخول المشرف لوحدة الإرشاد المهني والتوظيف"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span>دخول المشرف</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'dashboard' ? 'catalog' : 'dashboard')}
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{activeTab === 'dashboard' ? 'البوابة الرئيسية' : 'لوحة المشرف'}</span>
              </button>
              <button
                onClick={onAdminLogout}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                title="تسجيل الخروج من جلسة الإشراف"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
