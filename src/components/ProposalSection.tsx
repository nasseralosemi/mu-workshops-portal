import React, { useState } from 'react';
import { AcademicRank, Semester, DeliveryMode, CustomWorkshopProposal } from '../types';
import { ACADEMIC_PROGRAMS } from '../data/programsAndWorkshops';
import { Sparkles, Send, Loader2, CheckCircle2, ShieldCheck, Mail, Phone, BookOpen, Layers } from 'lucide-react';
import { dispatchFormSubmission, playNotificationChime } from '../utils/notificationService';

interface ProposalSectionProps {
  onSubmitProposal: (proposal: CustomWorkshopProposal, toastData: { title: string; message: string; code: string }) => void;
}

export const ProposalSection: React.FC<ProposalSectionProps> = ({ onSubmitProposal }) => {
  const [facultyName, setFacultyName] = useState('');
  const [academicRank, setAcademicRank] = useState<AcademicRank>('أستاذ مساعد');
  const [department, setDepartment] = useState(ACADEMIC_PROGRAMS[0].name);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [workshopTitle, setWorkshopTitle] = useState('');
  const [semester, setSemester] = useState<Semester>('الفصل الأول');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('حضوري');
  const [targetAudience, setTargetAudience] = useState('');
  const [topics, setTopics] = useState('');
  const [expectedOutcomes, setExpectedOutcomes] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyName || !email || !phone || !workshopTitle || !topics) return;

    setIsSubmitting(true);
    const code = 'MU-PROP-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const newProposal: CustomWorkshopProposal = {
      id: 'prop-' + Date.now(),
      proposalCode: code,
      facultyName,
      academicRank,
      department,
      email,
      phone,
      workshopTitle,
      semester,
      deliveryMode,
      targetAudience,
      topics,
      expectedOutcomes,
      specialRequirements,
      submittedAt: nowIso,
    };

    // Dispatch notification
    await dispatchFormSubmission({
      type: 'custom_proposal',
      registrationCode: code,
      name: facultyName,
      academicRank,
      department,
      email,
      phone,
      title: workshopTitle,
      semester,
      deliveryMode,
      topics,
      outcomes: expectedOutcomes,
      notes: specialRequirements,
      submittedAt: nowIso,
    });

    playNotificationChime();
    setIsSubmitting(false);

    // Reset Form
    setFacultyName('');
    setEmail('');
    setPhone('');
    setWorkshopTitle('');
    setTargetAudience('');
    setTopics('');
    setExpectedOutcomes('');
    setSpecialRequirements('');

    onSubmitProposal(newProposal, {
      title: 'تم استلام مقترح الورشة التدريبية بنجاح',
      message: `د. ${facultyName}، تم توجيه مقترح ورشة (${workshopTitle}) إلى منسق وحدة الإرشاد المهني بالكلية التطبيقية لاعتمادها وجدولتها.`,
      code,
    });
  };

  return (
    <section id="custom-proposal" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl text-white shadow-xl overflow-hidden border border-emerald-700/40">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left / Info Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 p-8 sm:p-10 bg-emerald-950/60 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-emerald-800/40">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مبادرة أعضاء هيئة التدريس</span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight mb-3">
                اقترح ورشة عمل تدريبية جديدة
              </h3>

              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                تسعد وحدة الإرشاد المهني والتوظيف باستقبال مبادرات أعضاء هيئة التدريس والمدربين المعتمدين لتقديم ورش تدريبية نوعية وتخصصية غير مدرجة في الدليل، تتوافق مع خبراتهم البحثية ومجالاتهم المهنية المتقدمة.
              </p>

              <div className="space-y-3.5 text-xs text-emerald-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>اعتماد أكاديمي رسمي وساعات تدريبية موثقة من الكلية</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>تأمين القاعات الذكية والمختبرات والدعم اللوجستي</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>تنسيق حضور الطلبة وإصدار شهادات الحضور والتدريب</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-800/60 text-xs text-emerald-300">
              <span className="block text-slate-400">منسق وحدة الإرشاد المهني والتوظيف:</span>
              <span className="font-mono text-amber-300 text-xs block mt-1">alarshadalmhani@gmail.com</span>
            </div>
          </div>

          {/* Right: Form (8 cols on lg) */}
          <div className="lg:col-span-8 p-8 sm:p-10 bg-slate-900/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name and Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    اسم عضو هيئة التدريس / المدرب *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="د. / أ. (الاسم الرباعي)"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    الرتبة الأكاديمية *
                  </label>
                  <select
                    value={academicRank}
                    onChange={(e) => setAcademicRank(e.target.value as AcademicRank)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="أستاذ دكتور (Professor)">أستاذ دكتور (Professor)</option>
                    <option value="أستاذ مشارك">أستاذ مشارك</option>
                    <option value="أستاذ مساعد">أستاذ مساعد</option>
                    <option value="محاضر">محاضر</option>
                    <option value="مدرب / خبير معتمد">مدرب / خبير مهني معتمد</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Department, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    القسم الأكاديمي المستهدف *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ACADEMIC_PROGRAMS.map((prog) => (
                      <option key={prog.id} value={prog.name}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    البريد الإلكتروني الجامعي *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mu.edu.sa"
                    dir="ltr"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    رقم الجوال للتنسيق *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left"
                  />
                </div>
              </div>

              {/* Row 3: Title & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    عنوان الورشة التدريبية المقترحة *
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopTitle}
                    onChange={(e) => setWorkshopTitle(e.target.value)}
                    placeholder="مثال: تطبيقات النماذج اللغوية في أتمتة الأعمال الإدارية..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    الفصل الدراسي المقترح *
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as Semester)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="الفصل الأول">الفصل الدراسي الأول</option>
                    <option value="الفصل الثاني">الفصل الدراسي الثاني</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Mode & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    نمط التنفيذ المفضل *
                  </label>
                  <select
                    value={deliveryMode}
                    onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="حضوري">حضوري</option>
                    <option value="عن بعد">عن بعد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    الجمهور المستهدف ومستوى الجدارات *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="مثال: طلاب الدبلوم، المتوقع تخرجهم، الخريجون..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Topics & Learning Outcomes */}
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                  المحاور الرئيسية ومخرجات التعلم المتوقعة للورشة *
                </label>
                <textarea
                  required
                  rows={3}
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="أوجز أهم 3 إلى 5 محاور معرفية وتطبيقية سيتعلمها الطالب خلال الورشة..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Special Logistics */}
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                  متطلبات لوجستية أو برمجيات خاصة (اختياري)
                </label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="مثال: ترخيص برمجي محدد، أجهزة معملية، سعة القاعة المقترحة..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-emerald-300/80 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>يتم إشعار وحدة الإرشاد المهني فورياً بالبيانات كاملة</span>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري إرسال المقترح...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>إرسال مقترح الورشة واعتماده</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
