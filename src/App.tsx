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
import {
  testFirestoreConnection,
  initializeDatabaseSeed,
  subscribeToWorkshops,
  subscribeToProposals,
  subscribeToRolePermissions,
  saveWorkshopToFirestore,
  saveProposalToFirestore,
  deleteProposalFromFirestore,
  RolePermissionDoc,
} from './firebase';

export default function App() {
  // Workshops state with local storage fallback
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const saved = localStorage.getItem('mu_workshops_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedMap = new Map(parsed.map((w: Workshop) => [w.id, w]));
          const merged = INITIAL_WORKSHOPS.map((w) => {
            const savedItem = savedMap.get(w.id);
            if (savedItem && savedItem.instructor) {
              return { ...w, ...savedItem };
            }
            return w;
          });
          const initIds = new Set(INITIAL_WORKSHOPS.map((w) => w.id));
          const extraUser = parsed.filter((w: Workshop) => !initIds.has(w.id));
          return [...merged, ...extraUser];
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_WORKSHOPS;
  });

  // Proposals state with local storage fallback
  const [proposals, setProposals] = useState<CustomWorkshopProposal[]>(() => {
    try {
      const saved = localStorage.getItem('mu_proposals_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read proposals from localStorage', e);
    }
    return [];
  });

  // Firebase Real-time and Cloud connection state
  const [cloudStatus, setCloudStatus] = useState<'online' | 'syncing' | 'offline'>('syncing');
  const [rolePermissions, setRolePermissions] = useState<RolePermissionDoc[]>([]);

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

  // Initialize and synchronize with Firebase Firestore
  useEffect(() => {
    let unsubscribeWorkshops: (() => void) | undefined;
    let unsubscribeProposals: (() => void) | undefined;
    let unsubscribeRoles: (() => void) | undefined;

    async function initFirebaseSync() {
      try {
        setCloudStatus('syncing');
        // Validate connection per skill guidelines
        await testFirestoreConnection();
        // Initialize initial seed if database is new
        await initializeDatabaseSeed();

        // Subscribe to real-time updates for workshops
        unsubscribeWorkshops = subscribeToWorkshops(
          (cloudWorkshops) => {
            if (cloudWorkshops && cloudWorkshops.length > 0) {
              const cloudMap = new Map(cloudWorkshops.map((w) => [w.id, w]));
              const merged = INITIAL_WORKSHOPS.map((initW) => {
                const cloudItem = cloudMap.get(initW.id);
                if (cloudItem && cloudItem.instructor) {
                  return { ...initW, ...cloudItem };
                }
                return initW;
              });
              const initIds = new Set(INITIAL_WORKSHOPS.map((w) => w.id));
              const extraCloud = cloudWorkshops.filter((w) => !initIds.has(w.id));
              const allCombined = [...merged, ...extraCloud];
              setWorkshops(allCombined);
              try {
                localStorage.setItem('mu_workshops_data', JSON.stringify(allCombined));
              } catch {}
            }
            setCloudStatus('online');
          },
          (err) => {
            console.warn('Real-time workshops sync error:', err);
            setCloudStatus('online');
          }
        );

        // Subscribe to real-time updates for proposals
        unsubscribeProposals = subscribeToProposals(
          (cloudProposals) => {
            if (cloudProposals) {
              setProposals(cloudProposals);
              try {
                localStorage.setItem('mu_proposals_data', JSON.stringify(cloudProposals));
              } catch {}
            }
          },
          (err) => {
            console.warn('Real-time proposals sync error:', err);
          }
        );

        // Subscribe to real-time role permissions
        unsubscribeRoles = subscribeToRolePermissions(
          (roles) => {
            if (roles) {
              setRolePermissions(roles);
            }
          },
          (err) => {
            console.warn('Real-time role permissions sync error:', err);
          }
        );

        setCloudStatus('online');
      } catch (err) {
        console.warn('Error connecting to Firebase Firestore:', err);
        setCloudStatus('offline');
      }
    }

    initFirebaseSync();

    return () => {
      if (unsubscribeWorkshops) unsubscribeWorkshops();
      if (unsubscribeProposals) unsubscribeProposals();
      if (unsubscribeRoles) unsubscribeRoles();
    };
  }, []);

  // Sync to localStorage as offline safety layer
  useEffect(() => {
    try {
      localStorage.setItem('mu_workshops_data', JSON.stringify(workshops));
    } catch (e) {
      console.warn('Failed to save workshops to localStorage', e);
    }
  }, [workshops]);

  useEffect(() => {
    try {
      localStorage.setItem('mu_proposals_data', JSON.stringify(proposals));
    } catch (e) {
      console.warn('Failed to save proposals to localStorage', e);
    }
  }, [proposals]);

  // Workshop counts by program
  const workshopsCountByProgram = useMemo(() => {
    const counts: Record<string, number> = {};
    workshops.forEach((w) => {
      let pId = w.programId;
      if (pId === 'marketing' || pId === 'tourism-hosp') pId = 'marketing-tourism';
      if (pId === 'hr') pId = 'hr-admin';
      counts[pId] = (counts[pId] || 0) + 1;
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

  // Registration handler with Firestore Cloud sync
  const handleRegistrationSuccess = async (
    workshopId: string,
    instructorData: any,
    toastData: { title: string; message: string; code: string }
  ) => {
    const targetWorkshop = workshops.find((w) => w.id === workshopId);
    if (!targetWorkshop) return;

    const updatedWorkshop: Workshop = {
      ...targetWorkshop,
      instructor: instructorData,
      mode: instructorData.deliveryMode,
      location: instructorData.locationOrLink || targetWorkshop.location,
      duration: instructorData.durationHours || targetWorkshop.duration,
      defaultSchedule: `${instructorData.executionDay ? instructorData.executionDay + ' ' : ''}${instructorData.confirmedDate} (${instructorData.executionTime})`,
    };

    // Optimistic UI update
    setWorkshops((prev) =>
      prev.map((w) => (w.id === workshopId ? updatedWorkshop : w))
    );
    setRegisteringWorkshop(null);

    // Asynchronously commit to Firebase Firestore
    try {
      await saveWorkshopToFirestore(updatedWorkshop);
    } catch (err) {
      console.warn('Failed saving registration to cloud:', err);
    }

    addToast({
      title: toastData.title,
      description: toastData.message,
      type: 'success',
      registrationCode: toastData.code,
    });
  };

  // Proposal submit handler with Firestore Cloud sync
  const handleProposalSubmit = async (
    proposal: CustomWorkshopProposal,
    toastData: { title: string; message: string; code: string }
  ) => {
    // Optimistic UI update
    setProposals((prev) => [proposal, ...prev]);

    // Save permanently to Firebase Firestore
    try {
      await saveProposalToFirestore(proposal);
    } catch (err) {
      console.warn('Failed saving proposal to cloud:', err);
    }

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
      description: 'تم التحقق من رمز المرور بنجاح. يمكنك الآن الاطلاع على كشوفات التسجيل والاعتماد والتصدير المخزنة سحابياً.',
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

  // Cancel instructor registration (Admin action) with Firestore sync
  const handleCancelRegistration = async (workshopId: string) => {
    const target = workshops.find((w) => w.id === workshopId);
    if (!target) return;

    const { instructor, ...rest } = target;
    const clearedWorkshop: Workshop = { ...rest };

    // Optimistic update
    setWorkshops((prev) =>
      prev.map((w) => (w.id === workshopId ? clearedWorkshop : w))
    );

    // Save to Firestore
    try {
      await saveWorkshopToFirestore(clearedWorkshop);
    } catch (err) {
      console.warn('Failed updating workshop in cloud:', err);
    }

    addToast({
      title: 'تم إلغاء التسجيل',
      description: 'تم تحرير الورشة وإعادتها لقائمة الورش المتاحة وتحديث السحابة بنجاح.',
      type: 'warning',
    });
  };

  // Approve proposal into official workshop list (Admin action) with Firestore sync
  const handleApproveProposal = async (proposalId: string) => {
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

    // Optimistic UI updates
    setWorkshops((prev) => [newWorkshop, ...prev]);
    setProposals((prev) => prev.filter((p) => p.id !== proposalId));

    // Save to Firestore and remove proposal
    try {
      await saveWorkshopToFirestore(newWorkshop);
      await deleteProposalFromFirestore(proposalId);
    } catch (err) {
      console.warn('Failed to commit approved proposal to cloud:', err);
    }

    addToast({
      title: 'تم اعتماد المقترح كورشة رسمية',
      description: `تمت إضافة ورشة (${prop.workshopTitle}) رسمياً وحفظها سحابياً باسم د. ${prop.facultyName}.`,
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
        cloudStatus={cloudStatus}
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
            rolePermissions={rolePermissions}
            cloudStatus={cloudStatus}
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
