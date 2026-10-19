import React from 'react';
import { Compass, Target, Users, BookOpenCheck, Laptop } from 'lucide-react';

interface HeroSectionProps {
  totalWorkshops: number;
  registeredCount: number;
  proposalsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalWorkshops,
  registeredCount,
  proposalsCount,
}) => {
  return (
    <section id="strategic-plan" className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white overflow-hidden py-14 lg:py-16">
      {/* Decorative ambient background accents */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-400 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Right-aligned Header Text Block - Starts flush vertically above Box 1 (الجدارات وسوق العمل) */}
        <div className="w-full text-right mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>الخطة الاستراتيجية لجامعة المجمعة 2025-2030 · برنامج تنمية القدرات البشرية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-2.5">
            بوابة التسجيل الفصلي وتنسيق الورش التدريبية والإرشادية
          </h1>

          <p className="text-amber-300 font-bold text-sm sm:text-base mb-3">
            وحدة الإرشاد المهني والتوظيف بالكلية التطبيقية بجامعة المجمعة
          </p>

          <p className="text-emerald-100/95 text-xs sm:text-sm md:text-base leading-relaxed max-w-4xl font-normal">
            بوابة أكاديمية مخصصة لأصحاب السعادة أعضاء هيئة التدريس والمدربين المعتمدين لتسجيل وتنسيق تقديم الورش التدريبية والإرشادية للفصل الدراسي الحالي، بما يعزز جدارات طلبة برامج الكلية العشرة ويسهم في جاهزيتهم لسوق العمل التنافسي وفق مستهدفات رؤية المملكة 2030.
          </p>
        </div>

        {/* 4 Strategic Pillars - Balanced Full-Width Grid starting with "الجدارات وسوق العمل" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 w-full">
          {/* Pillar 1: الجدارات وسوق العمل */}
          <div className="bg-emerald-900/40 border border-emerald-600/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">الجدارات وسوق العمل</h3>
              <p className="text-emerald-200/85 text-xs leading-relaxed">
                مواءمة تدريبية مباشرة مع احتياجات القطاعات الواعدة ومستهدفات رؤية المملكة 2030.
              </p>
            </div>
          </div>

          {/* Pillar 2: المهارات الناعمة والجاهزية */}
          <div className="bg-emerald-900/40 border border-emerald-600/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">المهارات الناعمة والجاهزية</h3>
              <p className="text-emerald-200/85 text-xs leading-relaxed">
                صقل مهارات التواصل، المقابلات الشخصية، السيرة الذاتية، والعمل الجماعي للطلبة.
              </p>
            </div>
          </div>

          {/* Pillar 3: التنفيذ (حضوري / عن بعد) */}
          <div className="bg-emerald-900/40 border border-emerald-600/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">التنفيذ (حضوري / عن بعد)</h3>
              <p className="text-emerald-200/85 text-xs leading-relaxed">
                مرونة كاملة في تقديم الورش بالقاعات الذكية بالكلية أو عن بعد عبر المنصات المعتمدة.
              </p>
            </div>
          </div>

          {/* Pillar 4: توثيق وساعات معتمدة */}
          <div className="bg-emerald-900/40 border border-emerald-600/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">توثيق وساعات معتمدة</h3>
              <p className="text-emerald-200/85 text-xs leading-relaxed">
                إصدار خطابات شكر وتكليف رسمية معتمدة لعضو هيئة التدريس المنفذ للورشة.
              </p>
            </div>
          </div>
        </div>

        {/* Live Metrics Ribbon - Tabular Numerals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-emerald-800/60 w-full">
          <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">10</span>
            <span className="text-xs text-emerald-200 mt-1 block">برامج وتخصصات تطبيقية مستهدفة</span>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {totalWorkshops}
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">ورشة إرشادية وتدريبية معتمدة</span>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
              {registeredCount}
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">ورش تم تسجيل كادر لتنفيذها</span>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {proposalsCount}
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">مقترحات جديدة قيد المراجعة</span>
          </div>
        </div>
      </div>
    </section>
  );
};
