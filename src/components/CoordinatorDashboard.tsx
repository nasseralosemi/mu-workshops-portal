import React, { useState, useMemo } from 'react';
import { Workshop, CustomWorkshopProposal } from '../types';
import { RolePermissionDoc } from '../firebase';
import {
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Search,
  Phone,
  Mail,
  Inbox,
  Sparkles,
  ArrowRight,
  LogOut,
  Calendar,
  Check,
  Trash2,
  Database,
  CheckCircle2,
  Cloud,
} from 'lucide-react';

interface CoordinatorDashboardProps {
  workshops: Workshop[];
  proposals: CustomWorkshopProposal[];
  onOpenWorkshopRegister: (workshop: Workshop) => void;
  onReturnToCatalog: () => void;
  onLogout: () => void;
  onCancelRegistration?: (workshopId: string) => void;
  onApproveProposal?: (proposalId: string) => void;
  rolePermissions?: RolePermissionDoc[];
  cloudStatus?: 'online' | 'syncing' | 'offline';
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  workshops,
  proposals,
  onOpenWorkshopRegister,
  onReturnToCatalog,
  onLogout,
  onCancelRegistration,
  onApproveProposal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'registered' | 'proposals'>('registered');
  const [searchQuery, setSearchQuery] = useState('');

  const registeredWorkshops = useMemo(() => {
    return workshops.filter((w) => !!w.instructor);
  }, [workshops]);

  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return registeredWorkshops;
    return registeredWorkshops.filter((w) => {
      const inst = w.instructor!;
      return (
        inst.doctorName.toLowerCase().includes(q) ||
        inst.department.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q) ||
        inst.phone.includes(q) ||
        inst.registrationCode.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q)
      );
    });
  }, [registeredWorkshops, searchQuery]);

  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter((p) => {
      return (
        p.facultyName.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.proposalCode.toLowerCase().includes(q) ||
        p.workshopTitle.toLowerCase().includes(q)
      );
    });
  }, [proposals, searchQuery]);

  const handleExportCsv = () => {
    let csv =
      'نوع السجل,رمز التوثيق,عنوان الورشة التدريبية,البرنامج الأكاديمي,اسم عضو هيئة التدريس,الرتبة الأكاديمية,القسم,البريد الإلكتروني,رقم الجوال,الموعد المعتمد,نمط التنفيذ,تاريخ القيد,الملاحظات\n';

    registeredWorkshops.forEach((w) => {
      const i = w.instructor!;
      csv += `"ورشة مسجلة","${i.registrationCode}","${w.title}","${w.programName}","${i.doctorName}","${i.academicRank}","${i.department}","${i.email}","${i.phone}","${i.confirmedDate}","${i.deliveryMode}","${i.registeredAt}","${i.notes || ''}"\n`;
    });

    proposals.forEach((p) => {
      csv += `"مقترح جديد","${p.proposalCode}","${p.workshopTitle}","${p.department}","${p.facultyName}","${p.academicRank}","${p.department}","${p.email}","${p.phone}","${p.semester}","${p.deliveryMode}","${p.submittedAt}","${p.specialRequirements || ''}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_تنسيق_الورش_جامعة_المجمعة_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Supervisor Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold mb-1">
                <span>جلسة المشرف مفعلة وموثقة</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                لوحة تحكم وتنسيق الورش والاعتماد الداخلي
              </h1>
              <p className="text-xs text-emerald-200 mt-0.5">
                وحدة الإرشاد المهني والتوظيف بالكلية التطبيقية بجامعة المجمعة
              </p>
            </div>
          </div>

          {/* Action CTAs inside banner */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onReturnToCatalog}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للدليل العام</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>قفل الجلسة (خروج)</span>
            </button>
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/60">
          <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5">
            <span className="block text-2xl font-bold text-amber-300 font-mono tabular-nums">
              {registeredWorkshops.length}
            </span>
            <span className="text-[11px] text-emerald-200 mt-0.5 block">ورش تم تسجيل كادر لها</span>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5">
            <span className="block text-2xl font-bold text-white font-mono tabular-nums">
              {proposals.length}
            </span>
            <span className="text-[11px] text-emerald-200 mt-0.5 block">مقترحات جديدة من الدكاترة</span>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5">
            <span className="block text-2xl font-bold text-amber-300 font-mono tabular-nums">
              {workshops.length - registeredWorkshops.length}
            </span>
            <span className="text-[11px] text-emerald-200 mt-0.5 block">ورش متاحة لم تُحجز بعد</span>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5">
            <span className="block text-2xl font-bold text-white font-mono tabular-nums">10</span>
            <span className="text-[11px] text-emerald-200 mt-0.5 block">برامج وتخصصات مغطاة</span>
          </div>
        </div>
      </div>

      {/* Cloud Persistence & Role Permissions Verification Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <Database className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  قاعدة البيانات السحابية الحية (Firebase Firestore)
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  نشطة ومربوطة سحابياً
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تخزين ومزامنة سحابية مستمرة لكافة سجلات تسجيل الدكاترة، المقترحات الجديدة، وصلاحيات الإشراف دون الحاجة لأي مفاتيح يدوية.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>المزامنة التلقائية: <strong>مفعلة لحظياً</strong></span>
            </div>
          </div>
        </div>

        {/* Role Permissions pill list */}
        <div className="pt-3.5">
          <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>صلاحيات دور المشرف المخزنة في السحابة:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              عرض كشوفات وتسجيلات الورش كاملة
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              اعتماد المقترحات الجديدة وتحويلها لورش معتمدة
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              إلغاء وحذف وتعديل كشوفات الكادر التدريسي
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              تصدير البيانات لملفات Excel / CSV والطباعة الرسمية
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              الاطلاع على أرقام جوال وإيميلات أعضاء هيئة التدريس
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الدكتور، الرمز، القسم، أو عنوان الورشة..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-9 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        {/* Export & Print options directly in browser */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            title="تصدير كشف شامل باللغة العربية إلى ملف Excel/CSV مباشرة من المتصفح"
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-emerald-600 rounded-xl shadow-xs hover:bg-slate-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>تصدير إلى Excel/CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            title="طباعة الكشف الرسمي للاعتماد أو الحفظ بصيغة PDF"
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-emerald-600 rounded-xl shadow-xs hover:bg-slate-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة الكشف الرسمي</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveSubTab('registered')}
          className={`pb-3 text-xs font-bold px-4 transition-colors relative cursor-pointer ${
            activeSubTab === 'registered'
              ? 'text-emerald-900 border-b-2 border-emerald-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>كشف الورش المسجلة والمعتمدة</span>
          <span className="mr-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono tabular-nums">
            {registeredWorkshops.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('proposals')}
          className={`pb-3 text-xs font-bold px-4 transition-colors relative cursor-pointer ${
            activeSubTab === 'proposals'
              ? 'text-emerald-900 border-b-2 border-emerald-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>المقترحات التدريبية الجديدة المقدمة</span>
          <span className="mr-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono tabular-nums">
            {proposals.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Registered Workshops Table */}
      {activeSubTab === 'registered' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">لا توجد سجلات مسجلة مطابقة</h4>
              <p className="text-xs text-slate-500">
                لم يتم العثور على ورش مسجلة تطابق كلمة البحث الحالية، أو لم يسجل أحد بعد.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">رمز التوثيق</th>
                    <th className="p-3.5">عنوان الورشة التدريبية</th>
                    <th className="p-3.5">عضو هيئة التدريس</th>
                    <th className="p-3.5">الرتبة والقسم</th>
                    <th className="p-3.5">وسائل الاتصال</th>
                    <th className="p-3.5">الموعد ونمط التنفيذ</th>
                    <th className="p-3.5 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((w) => {
                    const inst = w.instructor!;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-emerald-800 font-bold whitespace-nowrap">
                          {inst.registrationCode}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <span className="font-bold text-slate-900 block leading-snug">{w.title}</span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {w.programName} · {w.semester}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-900 font-bold whitespace-nowrap">
                          {inst.doctorName}
                        </td>
                        <td className="p-3.5 text-slate-600 whitespace-nowrap">
                          <span className="block text-slate-800 font-semibold">{inst.academicRank}</span>
                          <span className="text-[11px] text-slate-500">{inst.department}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 whitespace-nowrap space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{inst.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{inst.email}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 whitespace-nowrap">
                          <span className="block font-medium text-slate-800">{inst.confirmedDate}</span>
                          <span className="text-[11px] text-emerald-700 font-semibold">{inst.deliveryMode}</span>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onOpenWorkshopRegister(w)}
                              className="px-3 py-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              معاينة / تعديل
                            </button>
                            {onCancelRegistration && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من إلغاء قيد تسجيل د. ${inst.doctorName}؟`)) {
                                    onCancelRegistration(w.id);
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="إلغاء التسجيل وإعادة الورشة للمتاح"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Proposals Table */}
      {activeSubTab === 'proposals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredProposals.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">لا توجد مقترحات جديدة حالياً</h4>
              <p className="text-xs text-slate-500">
                يمكن لأعضاء هيئة التدريس تقديم مقترحاتهم عبر قسم &quot;اقترح ورشة عمل جديدة&quot;.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">رمز المقترح</th>
                    <th className="p-3.5">عنوان الورشة المقترحة</th>
                    <th className="p-3.5">مقدم المقترح</th>
                    <th className="p-3.5">الرتبة والقسم</th>
                    <th className="p-3.5">المحاور ومخرجات التعلم</th>
                    <th className="p-3.5">الفصل ونمط التنفيذ</th>
                    <th className="p-3.5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProposals.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-amber-700 font-bold whitespace-nowrap">
                        {p.proposalCode}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <span className="font-bold text-slate-900 block leading-snug">{p.workshopTitle}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          المستهدف: {p.targetAudience}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-900 font-bold whitespace-nowrap">
                        {p.facultyName}
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        <span className="block text-slate-800 font-semibold">{p.academicRank}</span>
                        <span className="text-[11px] text-slate-500">{p.department}</span>
                        <span className="font-mono text-[11px] block mt-0.5">{p.phone}</span>
                      </td>
                      <td className="p-3.5 max-w-sm text-slate-600">
                        <p className="line-clamp-2 text-[11px] leading-relaxed">{p.topics}</p>
                        {p.specialRequirements && (
                          <span className="text-[10px] text-amber-800 block mt-1">
                            تجهيزات خاصة: {p.specialRequirements}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        <span className="block font-medium text-slate-800">{p.semester}</span>
                        <span className="text-[11px] text-slate-500">{p.deliveryMode}</span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                            قيد الاعتماد
                          </span>
                          {onApproveProposal && (
                            <button
                              onClick={() => onApproveProposal(p.id)}
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="اعتماد المقترح وإدراجه ضمن الورش المعتمدة"
                            >
                              <Check className="w-3 h-3 text-amber-300" />
                              <span>اعتماد</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
