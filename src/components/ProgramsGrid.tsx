import React from 'react';
import { ACADEMIC_PROGRAMS } from '../data/programsAndWorkshops';
import { AcademicProgramId } from '../types';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';

interface ProgramsGridProps {
  selectedProgram: AcademicProgramId | 'all';
  onSelectProgram: (id: AcademicProgramId | 'all') => void;
  workshopsCountByProgram: Record<AcademicProgramId, number>;
}

export const ProgramsGrid: React.FC<ProgramsGridProps> = ({
  selectedProgram,
  onSelectProgram,
  workshopsCountByProgram,
}) => {
  return (
    <section id="academic-programs" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 w-fit mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>الربط والتكامل الأكاديمي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            البرامج الأكاديمية العشرة للكلية التطبيقية
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            تغطي الخطة التدريبية والإرشادية تخصصات الكلية التطبيقية العشرة لربط مخرجات التعلم بجدارات التوظيف والشهادات الاحترافية. اضغط على أي برنامج لتصفية ورشه التدريبية.
          </p>
        </div>

        {selectedProgram !== 'all' && (
          <button
            onClick={() => onSelectProgram('all')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>عرض كافة البرامج (إلغاء التحديد)</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ACADEMIC_PROGRAMS.map((program) => {
          const isSelected = selectedProgram === program.id;
          const count = workshopsCountByProgram[program.id] || 0;

          return (
            <div
              key={program.id}
              onClick={() => {
                onSelectProgram(isSelected ? 'all' : program.id);
                const el = document.getElementById('workshops-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md bg-emerald-50/20'
                  : 'border-slate-200 hover:border-emerald-600 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg group-hover:bg-emerald-800 group-hover:text-amber-300 transition-colors">
                    <i className={program.icon}></i>
                  </div>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {count} ورش
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                  {program.name}
                </h3>

                <p className="text-slate-500 text-[11px] mt-2 line-clamp-2 leading-relaxed">
                  {program.shortDesc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-800 font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{isSelected ? 'محدد حالياً' : 'استعراض الورش'}</span>
                </span>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800 group-hover:-translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
