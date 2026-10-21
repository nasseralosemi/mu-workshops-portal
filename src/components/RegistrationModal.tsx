import React, { useState, useEffect, useMemo } from 'react';
import { Workshop, AcademicRank, DeliveryMode, WorkshopInstructor } from '../types';
import { ACADEMIC_PROGRAMS } from '../data/programsAndWorkshops';
import {
  X,
  Check,
  Loader2,
  Calendar,
  MapPin,
  ShieldCheck,
  Mail,
  Phone,
  User,
  Award,
  AlertCircle,
  Clock,
  Info,
  Laptop,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { dispatchFormSubmission, playNotificationChime } from '../utils/notificationService';

interface RegistrationModalProps {
  workshop: Workshop | null;
  onClose: () => void;
  onSuccess: (workshopId: string, instructorData: WorkshopInstructor, toastData: { title: string; message: string; code: string }) => void;
}

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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

  // Doctor-specified execution parameters (mandatory)
  const [executionDate, setExecutionDate] = useState('');
  const [executionDay, setExecutionDay] = useState('الأحد');
  const [executionTime, setExecutionTime] = useState('10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)');
  const [customTime, setCustomTime] = useState('');
  const [durationHours, setDurationHours] = useState('3 ساعات تدريبية');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('حضوري');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Dynamic Minimum Date: 11 days from today (blocks first 10 days)
  // e.g., if today is the 10th, earliest selectable date is the 21st (10 + 11 = 21)
  const minAllowedDateString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 11);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Compute Arabic weekday from YYYY-MM-DD
  const getDayNameFromDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        const obj = new Date(y, m - 1, d);
        const dayIndex = obj.getDay();
        return ARABIC_DAYS[dayIndex] || '';
      }
    } catch {}
    return '';
  };

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
      setDateError(null);
      setValidationError(null);

      // Pre-fill existing data if already registered or opening for edit
      if (workshop.instructor) {
        setDoctorName(workshop.instructor.doctorName);
        setAcademicRank(workshop.instructor.academicRank);
        setDepartment(workshop.instructor.department);
        setEmail(workshop.instructor.email);
        setPhone(workshop.instructor.phone);
        setDeliveryMode(workshop.instructor.deliveryMode || 'حضوري');
        setLocationOrLink(workshop.instructor.locationOrLink || '');
        setNotes(workshop.instructor.notes || '');

        if (workshop.instructor.durationHours) {
          setDurationHours(workshop.instructor.durationHours);
        }
        if (workshop.instructor.executionTime) {
          setExecutionTime(workshop.instructor.executionTime);
        }
        if (workshop.instructor.executionDay) {
          setExecutionDay(workshop.instructor.executionDay);
        }

        const existingDateMatch = workshop.instructor.confirmedDate?.match(/\d{4}-\d{2}-\d{2}/);
        if (existingDateMatch) {
          const extracted = existingDateMatch[0];
          setExecutionDate(extracted);
          const dayName = getDayNameFromDate(extracted);
          if (dayName) setExecutionDay(dayName);
        } else {
          setExecutionDate(minAllowedDateString);
          const dayName = getDayNameFromDate(minAllowedDateString);
          if (dayName) setExecutionDay(dayName);
        }
      } else {
        // Initial fresh state - completely clean
        setDoctorName('');
        setEmail('');
        setPhone('');
        setNotes('');
        setLocationOrLink('');
        setDeliveryMode('حضوري');
        setDurationHours('3 ساعات تدريبية');
        setExecutionTime('10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)');
        setCustomTime('');
        // Initialize date to earliest eligible date
        setExecutionDate(minAllowedDateString);
        const dayName = getDayNameFromDate(minAllowedDateString);
        if (dayName) setExecutionDay(dayName);
      }
    }
  }, [workshop, minAllowedDateString]);

  if (!workshop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate personal info
    if (!doctorName.trim()) {
      setValidationError('يرجى إدخال اسم عضو هيئة التدريس / المدرب.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('يرجى إدخال بريد إلكتروني جامعي صالح.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('يرجى إدخال رقم الجوال للتنسيق.');
      return;
    }

    // 2. Strict validation check for the 10-day notice requirement
    const isDateValid = validateExecutionDate(executionDate);
    if (!isDateValid) {
      return;
    }

    // 3. Validate day and duration
    if (!executionDay.trim()) {
      setValidationError('يرجى تحديد يوم تنفيذ الورشة.');
      return;
    }
    if (!durationHours.trim()) {
      setValidationError('يرجى تحديد مدة الورشة بالساعات.');
      return;
    }

    const effectiveTime = executionTime === 'مخصص' ? customTime.trim() : executionTime;
    if (!effectiveTime) {
      setValidationError('يرجى تحديد توقيت تنفيذ الورشة بالساعات.');
      return;
    }

    // 4. Validate mandatory location / link
    if (!locationOrLink.trim()) {
      const modeLabel =
        deliveryMode === 'حضوري'
          ? 'القاعة أو المعمل بالكلية'
          : deliveryMode === 'عن بعد'
          ? 'رابط المنصة الافتراضية (تيمز / زوم / بلاك بورد)'
          : 'القاعة ورابط البث المتزامن';
      setValidationError(`حقل إجباري: يرجى تحديد ${modeLabel} لإكمال الاعتماد.`);
      return;
    }

    setIsSubmitting(true);
    const regCode = 'MU-WRK-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const instructorRecord: WorkshopInstructor = {
      doctorName: doctorName.trim(),
      academicRank,
      department,
      email: email.trim(),
      phone: phone.trim(),
      confirmedDate: executionDate,
      executionDay,
      executionTime: effectiveTime,
      durationHours,
      deliveryMode,
      locationOrLink: locationOrLink.trim(),
      notes: notes.trim(),
      registeredAt: nowIso,
      registrationCode: regCode,
    };

    // Dispatch notification
    await dispatchFormSubmission({
      type: 'workshop_registration',
      registrationCode: regCode,
      name: doctorName.trim(),
      academicRank,
      department,
      email: email.trim(),
      phone: phone.trim(),
      title: workshop.title,
      semester: workshop.semester,
      deliveryMode: `${deliveryMode} (${locationOrLink.trim()})`,
      confirmedDate: `${executionDay} ${executionDate} | ${effectiveTime} | المدة: ${durationHours}`,
      topics: workshop.topics,
      outcomes: workshop.outcomes,
      notes: notes.trim(),
      submittedAt: nowIso,
    });

    playNotificationChime();
    setIsSubmitting(false);

    onSuccess(
      workshop.id,
      instructorRecord,
      {
        title: 'تم تأكيد تسجيل وتنفيذ الورشة بنجاح',
        message: `سعادة د. ${doctorName}، تم توثيق رغبتكم في قيادة ورشة (${workshop.title}) بنمط [${deliveryMode}] يوم ${executionDay} الموافق ${executionDate} لمدة (${durationHours}).`,
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
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">تسجيل لتنفيذ ورشة تدريبية</h3>
              <p className="text-xs text-emerald-200">
                يقوم الدكتور بتحديد الموعد، اليوم، الوقت، المدة، ونمط ومقر التنفيذ
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

        {/* Selected Workshop Context Strip (Clean of any presets) */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
            <span>{workshop.programName}</span>
            <span aria-hidden="true">·</span>
            <span>{workshop.semester}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{workshop.code}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">{workshop.title}</h4>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
            <span className="flex items-center gap-1.5 text-emerald-900 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>الموعد والمدة ونمط التنفيذ: يحددها سعادة الدكتور في النموذج أدناه</span>
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>المستهدفون: {workshop.targetAudience}</span>
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Section 1: Doctor Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 pb-1 border-b border-slate-200">
              <User className="w-4 h-4 text-emerald-700" />
              <span>أولاً: بيانات عضو هيئة التدريس / المدرب</span>
            </div>

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
          </div>

          {/* Section 2: Compulsory Scheduling Fields (Date, Day, Time, Duration) */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>ثانياً: تحديد الموعد واليوم والوقت والمدة بالساعات (إجباري)</span>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                متاح بدءاً من اليوم الـ 11
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Execution Date (Min 10-day notice) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>تاريخ التنفيذ (التقويم) *</span>
                  </span>
                </label>
                <input
                  type="date"
                  required
                  min={minAllowedDateString}
                  value={executionDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExecutionDate(val);
                    const autoDay = getDayNameFromDate(val);
                    if (autoDay) setExecutionDay(autoDay);
                    validateExecutionDate(val);
                  }}
                  className={`w-full bg-white border ${
                    dateError ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300'
                  } rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all`}
                />
              </div>

              {/* Field 2: Execution Day */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>اليوم المحدد للتنفيذ *</span>
                </label>
                <select
                  value={executionDay}
                  onChange={(e) => setExecutionDay(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {ARABIC_DAYS.map((d) => (
                    <option key={d} value={d}>
                      يوم {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 3: Execution Time */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>وقت وتوقيت تنفيذ الورشة *</span>
                </label>
                <select
                  value={executionTime}
                  onChange={(e) => setExecutionTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none mb-1.5"
                >
                  <option value="09:00 صباحاً - 11:00 صباحاً (الفترة الصباحية الأولى)">
                    09:00 صباحاً - 11:00 صباحاً (الفترة الصباحية الأولى)
                  </option>
                  <option value="10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)">
                    10:00 صباحاً - 12:00 ظهراً (الفترة الصباحية)
                  </option>
                  <option value="11:30 صباحاً - 01:30 ظهراً (فترة الظهيرة)">
                    11:30 صباحاً - 01:30 ظهراً (فترة الظهيرة)
                  </option>
                  <option value="12:30 ظهراً - 02:30 ظهراً (الفترة الثانية)">
                    12:30 ظهراً - 02:30 ظهراً (الفترة الثانية)
                  </option>
                  <option value="05:00 مساءً - 07:00 مساءً (الفترة المسائية)">
                    05:00 مساءً - 07:00 مساءً (الفترة المسائية)
                  </option>
                  <option value="07:30 مساءً - 09:30 مساءً (المسائية المتأخرة)">
                    07:30 مساءً - 09:30 مساءً (المسائية المتأخرة)
                  </option>
                  <option value="مخصص">تحديد توقيت كتابي مخصص...</option>
                </select>

                {executionTime === 'مخصص' && (
                  <input
                    type="text"
                    required
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder="مثال: من الساعة 01:00 م إلى 04:00 م"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                )}
              </div>

              {/* Field 4: Duration in Hours (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>المدة بالساعات التدريبية *</span>
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="ساعة تدريبية واحدة (1 ساعة)">ساعة تدريبية واحدة (1 ساعة)</option>
                  <option value="ساعتان تدريبيتان (2 ساعة)">ساعتان تدريبيتان (2 ساعة)</option>
                  <option value="3 ساعات تدريبية (مكثف يوم واحد)">3 ساعات تدريبية (مكثف يوم واحد)</option>
                  <option value="4 ساعات تدريبية (يومان)">4 ساعات تدريبية (يومان)</option>
                  <option value="5 ساعات تدريبية">5 ساعات تدريبية</option>
                  <option value="6 ساعات تدريبية (يومان)">6 ساعات تدريبية (يومان)</option>
                  <option value="8 ساعات تدريبية (برنامج متكامل)">8 ساعات تدريبية (برنامج متكامل)</option>
                </select>
              </div>
            </div>

            {/* Date Summary Helper */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 gap-1.5 pt-1 border-t border-emerald-200/60">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  أول موعد متاح للاختيار: <strong className="text-emerald-800">{formatArabicFriendlyDate(minAllowedDateString)}</strong>
                </span>
              </span>
              {executionDate && !dateError && (
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    المعتمد: يوم {executionDay} الموافق {formatArabicFriendlyDate(executionDate)}
                  </span>
                </span>
              )}
            </div>

            {/* Validation Error Banner for Date */}
            {dateError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{dateError}</span>
              </div>
            )}
          </div>

          {/* Section 3: Delivery Mode & Location / Link (Compulsory) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-200">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>ثالثاً: نمط التنفيذ وتحديد القاعة أو الرابط (إجباري)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Mode: حضوري / عن بعد / مدمج */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  نمط التنفيذ المعتمد *
                </label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="حضوري">حضوري (بقاعات ومعامل الكلية)</option>
                  <option value="عن بعد">عن بعد (عبر منصة افتراضية / Teams / Blackboard)</option>
                  <option value="مدمج">مدمج (حضوري + بث مباشر متزامن)</option>
                </select>
              </div>

              {/* Location or Electronic Link (Strictly Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {deliveryMode === 'حضوري' ? (
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5 text-blue-700" />
                    )}
                    <span>
                      {deliveryMode === 'حضوري'
                        ? 'تحديد القاعة أو المعمل بالكلية *'
                        : deliveryMode === 'عن بعد'
                        ? 'رابط المنصة الافتراضية / الاجتماع *'
                        : 'تحديد القاعة ورابط البث المتزامن *'}
                    </span>
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-1.5 py-0.2 rounded-md">
                    إجباري
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder={
                    deliveryMode === 'حضوري'
                      ? 'مثال: معمل الحاسب 102، المدرج الرئيسي، قاعة الابتكار...'
                      : deliveryMode === 'عن بعد'
                      ? 'مثال: رابط مايكروسوفت تيمز، منصة بلاك بورد، أو Zoom...'
                      : 'مثال: معمل 204 + رابط البث المباشر تيمز'
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Special notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                متطلبات برمجية أو لوجستية خاصة (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: توفير أجهزة بمعالج i7، شاشة عرض ذكية، برمجيات بايثون..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Validation Alert Banner */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{validationError}</span>
            </div>
          )}

          {/* Official University Policy Notice */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              عند التأكيد، يُسجل الطلب رسمياً في وحدة الإرشاد المهني والتوظيف بالكلية التطبيقية، ويتم تحديث بطاقة الورشة فوراً بالموعد والمدة ونمط التنفيذ الذي حددتموه، مع إصدار خطاب تكليف وشهادة مدرب معتمدة.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
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
                  <span>تأكيد تسجيل وتنفيذ الورشة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
