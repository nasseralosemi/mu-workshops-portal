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
export type DeliveryMode = 'حضوري' | 'عن بعد';
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
  confirmedDate: string;
  deliveryMode: DeliveryMode;
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
  duration: string;
  defaultSchedule: string;
  mode: DeliveryMode;
  location: string;
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
