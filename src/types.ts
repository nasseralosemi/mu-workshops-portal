export type AcademicProgramId =
  | 'cs-prog'
  | 'data-ai'
  | 'mobile-app'
  | 'marketing'
  | 'tourism-hosp'
  | 'graphic-digital'
  | 'logistics-sc'
  | 'hr'
  | 'accounting-tax'
  | 'ecom-realestate';

export type Semester = 'الفصل الأول' | 'الفصل الثاني';
export type DeliveryMode = 'حضوري' | 'عن بعد' | 'مدمج';
export type AcademicRank = 'أستاذ دكتور (Professor)' | 'أستاذ مشارك' | 'أستاذ مساعد' | 'محاضر' | 'مدرب / خبير معتمد';

export interface AcademicProgram {
  id: AcademicProgramId;
  name: string;
  shortDesc: string;
  icon: string; // FontAwesome icon class
  color: string; // Tailwind color theme
  careerPaths: string[];
  certifications: string[];
  workshopCount?: number;
}

export interface WorkshopInstructor {
  doctorName: string;
  academicRank: AcademicRank;
  department: string;
  email: string;
  phone: string;
  confirmedDate: string; // e.g. "2026-11-05"
  executionDay?: string; // e.g. "الأربعاء"
  executionTime?: string; // e.g. "10:00 صباحاً - 12:00 ظهراً"
  durationHours?: string; // e.g. "3 ساعات تدريبية"
  deliveryMode: DeliveryMode; // 'حضوري' | 'عن بعد' | 'مدمج'
  locationOrLink?: string; // e.g. "معمل الحاسب 102" or "رابط منصة تيمز"
  notes?: string;
  registeredAt: string;
  registrationCode: string;
}

export interface Workshop {
  id: string;
  code: string;
  title: string;
  programId: AcademicProgramId;
  programName: string;
  semester: Semester;
  targetAudience: string;
  duration?: string;
  defaultSchedule?: string;
  mode?: DeliveryMode;
  location?: string;
  topics: string[];
  outcomes: string[];
  professionalCert?: string;
  instructor?: WorkshopInstructor;
}

export interface CustomWorkshopProposal {
  id: string;
  proposalCode: string;
  facultyName: string;
  academicRank: AcademicRank;
  department: string;
  email: string;
  phone: string;
  workshopTitle: string;
  semester: Semester;
  deliveryMode: DeliveryMode;
  targetAudience: string;
  topics: string;
  expectedOutcomes: string;
  specialRequirements?: string;
  submittedAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'error';
  registrationCode?: string;
}
