/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProgramsGrid } from './components/ProgramsGrid';
import { WorkshopsCatalog } from './components/WorkshopsCatalog';
import { RegistrationModal } from './components/RegistrationModal';
import { ProposalSection } from './components/ProposalSection';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ToastNotification } from './components/ToastNotification';
import { Footer } from './components/Footer';
import { INITIAL_WORKSHOPS, ACADEMIC_PROGRAMS } from './data/programsAndWorkshops';
import { Workshop, CustomWorkshopProposal, AcademicProgramId, ToastMessage } from './types';
import { playNotificationChime } from './utils/notificationService';

export default function App() {
  // Workshops state with local storage persistence
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const saved = localStorage.getItem('mu_workshops_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    // Seed with initial certified instructors
    const seeded = [...INITIAL_WORKSHOPS];
    seeded[0] = {
      ...seeded[0],
      instructor: {
        doctorName: 'سعادة د. عبد العزيز بن سعد الغامدي',
        academicRank: 'أستاذ مشارك',
        department: 'البرمجة وعلوم الحاسب',
        email: 'a.alghamdi@mu.edu.sa',
        phone: '0555123456',
        confirmedDate: seeded[0].defaultSchedule,
        deliveryMode: 'حضوري',
        notes: 'تم حجز معمل 102 وتجهيز بيئات الحوسبة السحابية',
        registeredAt: '19 أكتوبر 2026',
        registrationCode: 'MU-WRK-4819',
      },
    };
    seeded[6] = {
      ...seeded[6],
      instructor: {
        doctorName: 'سعادة د. نورة بنت فهد التميمي',
        academicRank: 'أستاذ مساعد',
        department: 'التسويق',
        email: 'n.altamimi@mu.edu.sa',
        phone: '0501239876',
        confirmedDate: seeded[6].defaultSchedule,
        deliveryMode: 'حضوري',
        notes: 'قاعة الابتكار والتسويق مع شاشات تفاعلية',
        registeredAt: '18 أكتوبر 2026',
        registrationCode: 'MU-WRK-9204',
      },
    };
    return seeded;
  });

  // Proposals state with local storage persistence
  const [proposals, setProposals] = useState<CustomWorkshopProposal[]>(() => {
    try {
      const saved = localStorage.getItem('mu_proposals_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read proposals from localStorage', e);
    }
    return [
      {
        id: 'prop-sample-1',
        proposalCode: 'MU-PROP-8371',
        facultyName: 'سعادة د. خالد بن محمد السعيد',
        academicRank: 'أستاذ مساعد',
        department: 'تحليل البيانات والذكاء الاصطناعي',
        email: 'k.alsaeed@mu.edu.sa',
        phone: '0544882211',
        workshopTitle: 'أتمتة العمليات التجارية باستخدام وكلاء الذكاء الاصطناعي AI Agents',
        semester: 'الفصل الثاني',
        deliveryMode: 'حضوري',
        targetAudience: 'طلاب تحليل البيانات وعلوم الحاسب',
        topics: 'مقدمة عن وكلاء الذكاء الاصطناعي المستقلين، بناء وكيل باستخدام LangChain، وربطه بقواعد البيانات والبريد.',
        expectedOutcomes: 'إتقان برمجة وكيل ذكي ينجز مهام مكتبية معقدة بصورة ذاتية.',
        specialRequirements: 'معمل أجهزة حاسوب متصلة بالإنترنت السريع.',
        submittedAt: '17 أكتوبر 2026',
      },
    ];
  });

  const [selectedProgram, setSelectedProgram] = useState<AcademicProgramId | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'dashboard'>('catalog');
  const [registeringWorkshop, setRegisteringWorkshop] = useState<Workshop | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Secret Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('mu_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mu_workshops_data', JSON.stringify(workshops));
    } catch (e) {
      console.warn('Failed to save workshops', e);
    }
  }, [workshops]);

  useEffect(() => {
    try {
      localStorage.setItem('mu_proposals_data', JSON.stringify(proposals));
    } catch (e) {
      console.warn('Failed to save proposals', e);
    }
  }, [proposals]);

  // Workshop counts by program
  const workshopsCountByProgram = useMemo(() => {
    const counts: Record<string, number> = {};
    workshops.forEach((w) => {
      counts[w.programId] = (counts[w.programId] || 0) + 1;
    });
    return counts as Record<AcademicProgramId, number>;
  }, [workshops]);

  const registeredCount = useMemo(() => {
    return workshops.filter((w) => !!w.instructor).length;
  }, [workshops]);

  // Toast dispatch helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 7000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Registration handler
  const handleRegistrationSuccess = (
    workshopId: string,
    instructorData: any,
    toastData: { title: string; message: string; code: string }
  ) => {
    setWorkshops((prev) =>
      prev.map((w) => {
        if (w.id === workshopId) {
          return {
            ...w,
            instructor: instructorData,
          };
        }
        return w;
      })
    );
    setRegisteringWorkshop(null);
    addToast({
      title: toastData.title,
      description: toastData.message,
      type: 'success',
      registrationCode: toastData.code,
    });
  };

  // Proposal submit handler
  const handleProposalSubmit = (
    proposal: CustomWorkshopProposal,
    toastData: { title: string; message: string; code: string }
  ) => {
    setProposals((prev) => [proposal, ...prev]);
    addToast({
      title: toastData.title,
      description: toastData.message,
      type: 'success',
      registrationCode: toastData.code,
    });
  };

  // Admin login handler
  const handleAdminLoginSuccess = () => {
    try {
      sessionStorage.setItem('mu_admin_auth', 'true');
    } catch {}
    setIsAdminLoggedIn(true);
    setIsAdminModalOpen(false);
    setActiveTab('dashboard');
    playNotificationChime();
    addToast({
      title: 'مرحباً بك في لوحة المشرف',
      description: 'تم التحقق من رمز المرور بنجاح. يمكنك الآن الاطلاع على كشوفات التكليفات والاعتماد والتصدير.',
      type: 'success',
    });
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('mu_admin_auth');
    } catch {}
    setIsAdminLoggedIn(false);
    setActiveTab('catalog');
    addToast({
      title: 'تم قفل جلسة المشرف',
      description: 'تم تسجيل الخروج بنجاح والعودة للبوابة الرئيسية.',
      type: 'info',
    });
  };

  // Cancel instructor registration (Admin action)
  const handleCancelRegistration = (workshopId: string) => {
    setWorkshops((prev) =>
      prev.map((w) => {
        if (w.id === workshopId) {
          const { instructor, ...rest } = w;
          return rest;
        }
        return w;
      })
    );
    addToast({
      title: 'تم إلغاء التكليف',
      description: 'تم تحرير الورشة وإعادتها لقائمة الورش المتاحة للتسجيل بنجاح.',
      type: 'warning',
    });
  };

  // Approve proposal into official workshop list (Admin action)
  const handleApproveProposal = (proposalId: string) => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return;

    // Find program ID by department name
    const progMatch = ACADEMIC_PROGRAMS.find((p) => p.name === prop.department) || ACADEMIC_PROGRAMS[0];

    const newWorkshop: Workshop = {
      id: 'wrk-appr-' + Date.now(),
      code: 'PROP-' + Math.floor(100 + Math.random() * 900),
      title: prop.workshopTitle,
      programId: progMatch.id,
      programName: progMatch.name,
      semester: prop.semester,
      targetAudience: prop.targetAudience,
      duration: '3 ساعات تدريبية',
      defaultSchedule: `${prop.semester} - الموعد يحدد لاحقاً`,
      mode: prop.deliveryMode,
      location: 'الكلية التطبيقية',
      topics: [prop.topics],
      outcomes: [prop.expectedOutcomes || 'اكتساب جدارات متقدمة في مجال التخصص'],
      instructor: {
        doctorName: prop.facultyName,
        academicRank: prop.academicRank,
        department: prop.department,
        email: prop.email,
        phone: prop.phone,
        confirmedDate: `${prop.semester} - معتمد`,
        deliveryMode: prop.deliveryMode,
        notes: prop.specialRequirements,
        registeredAt: new Date().toLocaleDateString('ar-SA'),
        registrationCode: prop.proposalCode,
      },
    };

    setWorkshops((prev) => [newWorkshop, ...prev]);
    setProposals((prev) => prev.filter((p) => p.id !== proposalId));

    addToast({
      title: 'تم اعتماد المقترح كورشة رسمية',
      description: `تمت إضافة ورشة (${prop.workshopTitle}) رسمياً لكشف الورش المسجلة باسم د. ${prop.facultyName}.`,
      type: 'success',
      registrationCode: prop.proposalCode,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800" dir="rtl">
      {/* Top Bar Navigation with direct Supervisor Portal access button on the left */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'catalog' ? (
          <>
            {/* Hero Section & Strategic Plan Overview */}
            <HeroSection
              totalWorkshops={workshops.length}
              registeredCount={registeredCount}
              proposalsCount={proposals.length}
            />

            {/* The 10 Academic Programs Grid */}
            <ProgramsGrid
              selectedProgram={selectedProgram}
              onSelectProgram={setSelectedProgram}
              workshopsCountByProgram={workshopsCountByProgram}
            />

            {/* Interactive Course Catalog with Filter & Modal Trigger */}
            <WorkshopsCatalog
              workshops={workshops}
              selectedProgram={selectedProgram}
              onSelectProgram={setSelectedProgram}
              onOpenRegisterModal={(w) => setRegisteringWorkshop(w)}
            />

            {/* Custom Workshop Proposal Submission Form */}
            <ProposalSection onSubmitProposal={handleProposalSubmit} />
          </>
        ) : (
          /* Internal Supervisor Dashboard (Unlocked only via Secret Passcode) */
          <CoordinatorDashboard
            workshops={workshops}
            proposals={proposals}
            onOpenWorkshopRegister={(w) => setRegisteringWorkshop(w)}
            onReturnToCatalog={() => setActiveTab('catalog')}
            onLogout={handleAdminLogout}
            onCancelRegistration={handleCancelRegistration}
            onApproveProposal={handleApproveProposal}
          />
        )}
      </main>

      {/* Registration Modal Pop-up */}
      <RegistrationModal
        workshop={registeringWorkshop}
        onClose={() => setRegisteringWorkshop(null)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Secret Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
