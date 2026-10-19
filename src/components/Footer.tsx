import React from 'react';
import { Building2, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300 font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-white font-bold block text-sm">جامعة المجمعة · الكلية التطبيقية</span>
                <span className="text-emerald-400 text-xs">وحدة الإرشاد المهني والتوظيف</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              بوابة التسجيل الفصلي وتنسيق الورش التدريبية والإرشادية تهدف إلى ربط برامج الكلية التطبيقية العشرة بسوق العمل وتمكين الطلاب من المهارات التنافسية والجدارات المهنية وفق الخطة الاستراتيجية للجامعة 2025-2030 ورؤية المملكة 2030.
            </p>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              التواصل والتنسيق الأكاديمي
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">alarshadalmhani@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>المبنى الرئيسي - الكلية التطبيقية - جامعة المجمعة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar without any admin login link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            <p>جميع الحقوق محفوظة © جامعة المجمعة - الكلية التطبيقية 1447هـ / 2026م</p>
            <p className="mt-0.5 text-slate-500">متوافق مع مستهدفات الخطة الاستراتيجية للجامعة 2025-2030 ورؤية المملكة 2030</p>
          </div>
          <div className="text-slate-500 text-[11px]">
            <span>بوابة التنسيق والتسجيل الفصلي المباشر</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
