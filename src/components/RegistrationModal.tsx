import React, { useState, useEffect, useMemo } from 'react';
import { Workshop, AcademicRank, DeliveryMode } from '../types';
import { ACADEMIC_PROGRAMS } from '../data/programsAndWorkshops';
import { X, Check, Loader2, Calendar, MapPin, ShieldCheck, Mail, Phone, User, Award, AlertCircle, Clock, Info } from 'lucide-react';
import { dispatchFormSubmission, playNotificationChime } from '../utils/notificationService';

interface RegistrationModalProps {
  workshop: Workshop | null;
  onClose: () => void;
  onSuccess: (workshopId: string, instructorData: any, toastData: { title: string; message: string; code: string }) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  workshop,
  onClose,
  onSuccess,
}) => {
  const [doctorName, setDoctorName] = useState('');
  const [academicRank, setAcademicRank] = useState<AcademicRank>('أستاذ مساعد');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [executionDate, setExecutionDate] = useState('');
  const [executionTime, setExecutionTime] = useState('10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('حضوري');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Dynamic Minimum Date: 11 days from today (blocks the first 10 days)
  // e.g., if today is the 10th, the earliest selectable date is the 21st (10 + 11 = 21)
  const minAllowedDateString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 11);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Format date in Arabic for friendly UX display
  const formatArabicFriendlyDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        const obj = new Date(y, m - 1, d);
        return obj.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Validation function enforcing minimum 10-day advance notice
  const validateExecutionDate = (selectedDateStr: string): boolean => {
    if (!selectedDateStr) {
      setDateError('يرجى اختيار تاريخ تنفيذ الدورة التدريبية من التقويم.');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = selectedDateStr.split('-');
    if (parts.length !== 3) {
      setDateError('عذراً، يجب أن يكون تاريخ تنفيذ الدورة بعد 10 أيام على الأقل من تاريخ اليوم لتنسيق الدورة.');
      return false;
    }

    const [y, m, d] = parts.map(Number);
    const chosen = new Date(y, m - 1, d);
    chosen.setHours(0, 0, 0, 0);

    // Minimum allowed is today + 11 days
    const minAllowed = new Date(today);
    minAllowed.setDate(minAllowed.getDate() + 11);

    if (chosen.getTime() < minAllowed.getTime()) {
      setDateError('عذراً، يجب أن يكون تاريخ تنفيذ الدورة بعد 10 أيام على الأقل من تاريخ اليوم لتنسيق الدورة.');
      return false;
    }

    setDateError(null);
    return true;
  };

  useEffect(() => {
    if (workshop) {
      setDepartment(workshop.programName);
      setDeliveryMode(workshop.mode);
      setDateError(null);

      // Pre-fill existing data if already registered
      if (workshop.instructor) {
        setDoctorName(workshop.instructor.doctorName);
        setAcademicRank(workshop.instructor.academicRank);
        setDepartment(workshop.instructor.department);
        setEmail(workshop.instructor.email);
        setPhone(workshop.instructor.phone);
        setDeliveryMode(workshop.instructor.deliveryMode);
        setNotes(workshop.instructor.notes || '');

        // Extract date if in YYYY-MM-DD or default to minAllowedDateString
        const existingDateMatch = workshop.instructor.confirmedDate.match(/\d{4}-\d{2}-\d{2}/);
        if (existingDateMatch) {
          const extracted = existingDateMatch[0];
          // Check if valid relative to minAllowed
          if (extracted >= minAllowedDateString) {
            setExecutionDate(extracted);
          } else {
            setExecutionDate(minAllowedDateString);
          }
        } else {
          setExecutionDate(minAllowedDateString);
        }
      } else {
        setDoctorName('');
        setEmail('');
        setPhone('');
        setNotes('');
        // Initialize with earliest allowed date automatically
        setExecutionDate(minAllowedDateString);
      }
    }
  }, [workshop, minAllowedDateString]);

  if (!workshop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!doctorName || !email || !phone || !executionDate) return;

    // Strict validation check for the 10-day notice requirement
    const isValid = validateExecutionDate(executionDate);
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    const regCode = 'MU-WRK-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const combinedDateSchedule = `${executionDate} (${executionTime})`;

    const instructorRecord = {
      doctorName,
      academicRank,
      department,
      email,
      phone,
      confirmedDate: combinedDateSchedule,
      deliveryMode,
      notes,
      registeredAt: nowIso,
      registrationCode: regCode,
    };

    // Dispatch notification
    await dispatchFormSubmission({
      type: 'workshop_registration',
      registrationCode: regCode,
      name: doctorName,
      academicRank,
      department,
      email,
      phone,
      title: workshop.title,
      semester: workshop.semester,
      deliveryMode,
      confirmedDate: combinedDateSchedule,
      topics: workshop.topics,
      outcomes: workshop.outcomes,
      notes,
      submittedAt: nowIso,
    });

    playNotificationChime();
    setIsSubmitting(false);

    onSuccess(
      workshop.id,
      instructorRecord,
      {
        title: 'تم تأكيد تسجيل تنفيذ الورشة بنجاح',
        message: `د. ${doctorName}، تم توثيق رغبتكم في تقديم ورشة (${workshop.title}) في موعد ${formatArabicFriendlyDate(executionDate)} وإرسال إشعار لمنسق الوحدة بالكلية التطبيقية.`,
        code: regCode,
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">تسجيل لتنفيذ ورشة تدريبية</h3>
              <p className="text-xs text-emerald-200">
                توثيق رغبة عضو هيئة التدريس / المدرب في تولي تقديم الورشة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Workshop Context Strip */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
            <span>{workshop.programName}</span>
            <span aria-hidden="true">·</span>
            <span>{workshop.semester}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{workshop.code}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">{workshop.title}</h4>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>الجدولة الأساسية بالدليل: {workshop.defaultSchedule}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{workshop.location}</span>
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Doctor Name & Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم عضو هيئة التدريس / المدرب *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="د. / أ. (الاسم الرباعي)"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الرتبة الأكاديمية *
              </label>
              <select
                value={academicRank}
                onChange={(e) => setAcademicRank(e.target.value as AcademicRank)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="أستاذ دكتور (Professor)">أستاذ دكتور (Professor)</option>
                <option value="أستاذ مشارك">أستاذ مشارك</option>
                <option value="أستاذ مساعد">أستاذ مساعد</option>
                <option value="محاضر">محاضر</option>
                <option value="مدرب / خبير معتمد">مدرب / خبير معتمد</option>
              </select>
            </div>
          </div>

          {/* Row 2: Department, Email, Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                القسم الأكاديمي *
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {ACADEMIC_PROGRAMS.map((prog) => (
                    <option key={prog.id} value={prog.name}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                البريد الإلكتروني الجامعي *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@mu.edu.sa"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none text-left"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم الجوال للتنسيق *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none text-left"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Row 3: Dynamic Date Picker with 10-day notice guard & Delivery Mode */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>تاريخ تنفيذ الدورة *</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded-full">
                    متاح بدءاً من اليوم الـ 11
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={minAllowedDateString}
                    value={executionDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExecutionDate(val);
                      validateExecutionDate(val);
                    }}
                    className={`w-full bg-white border ${
                      dateError ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300'
                    } rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>توقيت تنفيذ الورشة *</span>
                </label>
                <select
                  value={executionTime}
                  onChange={(e) => setExecutionTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)">10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)</option>
                  <option value="12:30 ظهراً - 02:30 ظهراً (فترة الظهيرة)">12:30 ظهراً - 02:30 ظهراً (فترة الظهيرة)</option>
                  <option value="05:00 مساءً - 07:00 مساءً (الفترة المسائية)">05:00 مساءً - 07:00 مساءً (الفترة المسائية)</option>
                  <option value="07:30 مساءً - 09:30 مساءً (الفترة المسائية المتأخرة)">07:30 مساءً - 09:30 مساءً (الفترة المسائية المتأخرة)</option>
                </select>
              </div>
            </div>

            {/* Helper Notice & Friendly Date Output */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 gap-1.5 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  أول موعد متاح للاختيار: <strong className="text-emerald-800">{formatArabicFriendlyDate(minAllowedDateString)}</strong>
                </span>
              </span>
              {executionDate && !dateError && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>الموعد المختار: {formatArabicFriendlyDate(executionDate)}</span>
                </span>
              )}
            </div>

            {/* Validation Error Banner */}
            {dateError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{dateError}</span>
              </div>
            )}
          </div>

          {/* Delivery Mode & Special Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نمط التنفيذ المعتمد *
              </label>
              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="حضوري">حضوري (بقاعات ومعامل الكلية)</option>
                <option value="عن بعد">عن بعد (عبر منصة البلاك بورد / تيمز)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                متطلبات برمجية أو لوجستية خاصة (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: تجهيز معمل حاسب، برمجيات بايثون، داتا شو..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Official University Policy Notice */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              عند التأكيد، يُسجل الطلب رسمياً في وحدة الإرشاد المهني والتوظيف بالكلية التطبيقية، وتُصدر الكلية خطاب تكليف وتنسيق رسمي وشهادة مدرب معتمدة فور إتمام التنفيذ.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!dateError}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700/60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>جاري توثيق التسجيل...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>تأكيد تسجيل تنفيذ الورشة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
