import React, { useState, useMemo } from 'react';
import { Workshop, AcademicProgramId, Semester, DeliveryMode } from '../types';
import { ACADEMIC_PROGRAMS } from '../data/programsAndWorkshops';
import {
  Search,
  Filter,
  RotateCcw,
  Clock,
  MapPin,
  GraduationCap,
  Calendar,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Lock,
} from 'lucide-react';

interface WorkshopsCatalogProps {
  workshops: Workshop[];
  selectedProgram: AcademicProgramId | 'all';
  onSelectProgram: (id: AcademicProgramId | 'all') => void;
  onOpenRegisterModal: (workshop: Workshop) => void;
}

export const WorkshopsCatalog: React.FC<WorkshopsCatalogProps> = ({
  workshops,
  selectedProgram,
  onSelectProgram,
  onOpenRegisterModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<Semester | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<DeliveryMode | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'registered'>('all');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopics = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        w.title.toLowerCase().includes(q) ||
        w.programName.toLowerCase().includes(q) ||
        w.topics.some((t) => t.toLowerCase().includes(q));

      const matchesProgram =
        selectedProgram === 'all' ||
        w.programId === selectedProgram ||
        (selectedProgram === 'marketing-tourism' && (w.programId === 'marketing' || w.programId === 'tourism-hosp')) ||
        (selectedProgram === 'hr-admin' && w.programId === 'hr');
      const matchesSemester = selectedSemester === 'all' || w.semester === selectedSemester;
      const effectiveMode = w.instructor?.deliveryMode || w.mode;
      const matchesMode = selectedMode === 'all' || effectiveMode === selectedMode;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && !w.instructor) ||
        (statusFilter === 'registered' && !!w.instructor);

      return matchesSearch && matchesProgram && matchesSemester && matchesMode && matchesStatus;
    });
  }, [workshops, searchQuery, selectedProgram, selectedSemester, selectedMode, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    onSelectProgram('all');
    setSelectedSemester('all');
    setSelectedMode('all');
    setStatusFilter('all');
  };

  return (
    <section id="workshops-catalog" className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 w-fit mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>دليل الورش المعتمدة للتنفيذ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ورش العمل والبرامج الإرشادية المتاحة للتسجيل
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              اختر الورشة التدريبية التي تود قيادتها وتقديمها للطلبة، وسيتم توثيق بياناتكم فوراً وإغلاق الورشة.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 font-mono tabular-nums">
              إجمالي النتائج: <strong className="text-slate-900">{filteredWorkshops.length}</strong> ورشة
            </span>
            <button
              onClick={handleResetFilters}
              className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                البحث السريع (الاسم، المحاور)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم الورشة أو التخصص..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Academic Program Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">القسم / البرنامج الأكاديمي</label>
              <select
                value={selectedProgram}
                onChange={(e) => onSelectProgram(e.target.value as AcademicProgramId | 'all')}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="all">كافة البرامج الأكاديمية (10 برامج)</option>
                {ACADEMIC_PROGRAMS.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">الفصل الدراسي</label>
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedSemester('all')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedSemester === 'all'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('الفصل الأول')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedSemester === 'الفصل الأول'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الأول
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester('الفصل الثاني')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedSemester === 'الفصل الثاني'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الثاني
                </button>
              </div>
            </div>

            {/* Delivery Mode Filter: (الكل / حضوري / عن بعد / مدمج) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">نمط التنفيذ</label>
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedMode('all')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedMode === 'all'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('حضوري')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedMode === 'حضوري'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  حضوري
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('عن بعد')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedMode === 'عن بعد'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  عن بعد
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('مدمج')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedMode === 'مدمج'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  مدمج
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">حالة التسجيل</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'registered')}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="all">كافة الورش</option>
                <option value="available">متاحة للتسجيل</option>
                <option value="registered">مغلقة (تم حجزها)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workshops Cards Grid */}
        {filteredWorkshops.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">لا توجد ورش مطابقة للمعايير المحددة</h3>
            <p className="text-xs text-slate-500 mb-4">
              يرجى تجربة معايير بحث أخرى أو إعادة ضبط الفلاتر لاستعراض الدليل كاملاً.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((w) => {
              const isRegistered = !!w.instructor;
              const isExpanded = !!expandedTopics[w.id];

              return (
                <div
                  key={w.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                    isRegistered
                      ? 'border-red-200 bg-red-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-600 hover:shadow-md'
                  }`}
                >
                  {/* Closed / Booked Workshop Banner Banner */}
                  {isRegistered && (
                    <div className="bg-red-600 text-white text-center py-1.5 px-4 text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-xs">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مغلقة - تم حجز هذه الورشة</span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Unboxed Metadata Line with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
                      <span className="font-semibold text-emerald-800">{w.programName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{w.semester}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{w.code}</span>
                    </div>

                    {/* Workshop Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-3">
                      {w.title}
                    </h3>

                    {/* Metadata Specs: Date, Duration, and Execution Mode strictly set by doctor upon registration */}
                    <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">الموعد والمدة: </strong>
                          {isRegistered && w.instructor ? (
                            <span className="font-bold text-emerald-900">
                              {w.instructor.executionDay ? `${w.instructor.executionDay} - ` : ''}
                              {w.instructor.confirmedDate}
                              {w.instructor.executionTime ? ` (${w.instructor.executionTime})` : ''}
                              {w.instructor.durationHours ? ` · المدة: ${w.instructor.durationHours}` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">غير محدد</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">نمط التنفيذ: </strong>
                          {isRegistered && w.instructor ? (
                            <span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  w.instructor.deliveryMode === 'حضوري'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : w.instructor.deliveryMode === 'عن بعد'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {w.instructor.deliveryMode}
                              </span>
                              {w.instructor.locationOrLink && (
                                <span className="text-slate-700 font-semibold mr-1.5">
                                  ({w.instructor.locationOrLink})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">غير محدد</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-700">المستهدفون: </strong>
                          <span>{w.targetAudience}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Topics List */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">المحاور الرئيسية للورشة:</span>
                        <button
                          type="button"
                          onClick={() => toggleTopics(w.id)}
                          className="text-[11px] text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'طي المحاور' : 'عرض المحاور كاملة'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      <ul className="text-xs text-slate-600 space-y-1.5 pr-4 list-disc marker:text-emerald-600">
                        {(isExpanded ? w.topics : w.topics.slice(0, 2)).map((topic, i) => (
                          <li key={i} className="leading-relaxed">
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className={`p-4 border-t flex items-center justify-between gap-3 ${
                    isRegistered ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {isRegistered ? (
                      <>
                        <div className="text-xs text-slate-700 truncate">
                          <span className="block text-[11px] text-red-700 font-bold">
                            محجوزة لتنفيذ:
                          </span>
                          <span className="font-semibold text-slate-900 truncate block">
                            {w.instructor?.doctorName}
                          </span>
                        </div>

                        {/* Registration button is completely CANCELLED/DISABLED */}
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                          title="هذه الورشة محجوزة ولا يمكن التسجيل فيها"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>مغلقة للتسجيل</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>متاحة لتسجيل التنفيذ</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenRegisterModal(w)}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>تسجيل لتنفيذ هذه الورشة</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
