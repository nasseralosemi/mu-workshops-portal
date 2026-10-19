import React, { useState, useEffect } from 'react';
import { Workshop, AcademicRank, DeliveryMode } from '../types';
import { ACADEMIC_PROGRAMS } from '../data/programsAndWorkshops';
import { X, Check, Loader2, Calendar, MapPin, Building, ShieldCheck, Mail, Phone, User, Award } from 'lucide-react';
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
  const [confirmedDate, setConfirmedDate] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('حضوري');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workshop) {
      setDepartment(workshop.programName);
      setConfirmedDate(workshop.defaultSchedule);
      setDeliveryMode(workshop.mode);

      // Pre-fill existing data if already registered
      if (workshop.instructor) {
        setDoctorName(workshop.instructor.doctorName);
        setAcademicRank(workshop.instructor.academicRank);
        setDepartment(workshop.instructor.department);
        setEmail(workshop.instructor.email);
        setPhone(workshop.instructor.phone);
        setConfirmedDate(workshop.instructor.confirmedDate);
        setDeliveryMode(workshop.instructor.deliveryMode);
        setNotes(workshop.instructor.notes || '');
      } else {
        setDoctorName('');
        setEmail('');
        setPhone('');
        setNotes('');
      }
    }
  }, [workshop]);

  if (!workshop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !email || !phone || !confirmedDate) return;

    setIsSubmitting(true);
    const regCode = 'MU-WRK-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const instructorRecord = {
      doctorName,
      academicRank,
      department,
      email,
      phone,
      confirmedDate,
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
      confirmedDate,
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
        message: `سعادة د. ${doctorName}، تم توثيق رغبتكم في تقديم ورشة (${workshop.title}) وإرسال إشعار لمنسق الوحدة بالكلية التطبيقية.`,
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
                توثيق رغبة سعادة عضو هيئة التدريس / المدرب في تولي تقديم الورشة
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
              <span>الموعد المقترح: {workshop.defaultSchedule}</span>
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
                  placeholder="سعادة د. / أ. (الاسم الرباعي)"
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

          {/* Row 3: Preferred Date & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                تأكيد الموعد والتوقيت *
              </label>
              <input
                type="text"
                required
                value={confirmedDate}
                onChange={(e) => setConfirmedDate(e.target.value)}
                placeholder="تأكيد الموعد المقترح أو تحديد موعد بديل"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نمط التنفيذ المفضل *
              </label>
              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="حضوري">حضوري</option>
                <option value="عن بعد">عن بعد</option>
              </select>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              متطلبات برمجية أو لوجستية خاصة (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تجهيز معمل 102 ببرمجيات معينة، عدد مقاعد محدد..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Notice Box */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              عند التأكيد، يُسجل الطلب رسمياً في وحدة الإرشاد المهني والتوظيف، وتُصدر الكلية التطبيقية خطاب شكر وتقدير رسمي وشهادة مدرب معتمدة فور إتمام التنفيذ.
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
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
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
