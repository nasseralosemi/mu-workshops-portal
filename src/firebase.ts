/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Workshop, CustomWorkshopProposal } from './types';
import { INITIAL_WORKSHOPS } from './data/programsAndWorkshops';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase Integration Skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Attempt non-blocking anonymous sign-in to populate auth state if permitted
signInAnonymously(auth).catch(() => {
  // Silent fallback - security rules support authenticated & guest operations
});

// Error Handling according to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot according to skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'systemSettings', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or connecting...');
    }
    return false;
  }
}

// Role permission interface
export interface RolePermissionDoc {
  roleId: string;
  roleName: string;
  permissions: string[];
  description: string;
  passcodeHash?: string;
  updatedAt: string;
}

const DEFAULT_SUPERVISOR_ROLE: RolePermissionDoc = {
  roleId: 'coordinator_supervisor',
  roleName: 'مشرف وحدة الإرشاد المهني والتوظيف',
  permissions: [
    'view_all_registrations',
    'approve_custom_proposals',
    'cancel_registrations',
    'export_reports',
    'manage_semester_schedule',
    'view_confidential_faculty_contacts',
  ],
  description: 'صلاحية كاملة لإدارة توثيق الورش واعتماد مقترحات أعضاء هيئة التدريس وتصدير البيانات.',
  updatedAt: new Date().toISOString(),
};

// Seed initial database state if collections are completely empty
export async function initializeDatabaseSeed(): Promise<void> {
  try {
    // Check if workshops collection has documents
    const workshopsSnap = await getDocs(collection(db, 'workshops'));
    if (workshopsSnap.empty) {
      console.log('Seeding initial workshops to Firestore...');
      const batch = writeBatch(db);

      const seededWorkshops: Workshop[] = INITIAL_WORKSHOPS.map((w, index) => {
        if (index === 0) {
          return {
            ...w,
            instructor: {
              doctorName: 'د. عبد العزيز بن سعد الغامدي',
              academicRank: 'أستاذ مشارك',
              department: 'البرمجة وعلوم الحاسب',
              email: 'a.alghamdi@mu.edu.sa',
              phone: '0555123456',
              confirmedDate: w.defaultSchedule,
              deliveryMode: 'حضوري',
              notes: 'تم حجز معمل 102 وتجهيز بيئات الحوسبة السحابية',
              registeredAt: '19 أكتوبر 2026',
              registrationCode: 'MU-WRK-4819',
            },
          };
        }
        if (index === 6) {
          return {
            ...w,
            instructor: {
              doctorName: 'د. نورة بنت فهد التميمي',
              academicRank: 'أستاذ مساعد',
              department: 'التسويق',
              email: 'n.altamimi@mu.edu.sa',
              phone: '0501239876',
              confirmedDate: w.defaultSchedule,
              deliveryMode: 'حضوري',
              notes: 'قاعة الابتكار والتسويق مع شاشات تفاعلية',
              registeredAt: '18 أكتوبر 2026',
              registrationCode: 'MU-WRK-9204',
            },
          };
        }
        return w;
      });

      for (const w of seededWorkshops) {
        batch.set(doc(db, 'workshops', w.id), {
          ...w,
          updatedAt: new Date().toISOString(),
        });
      }

      // Seed default proposal
      const sampleProposal: CustomWorkshopProposal = {
        id: 'prop-sample-1',
        proposalCode: 'MU-PROP-8371',
        facultyName: 'د. خالد بن محمد السعيد',
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
      };
      batch.set(doc(db, 'proposals', sampleProposal.id), {
        ...sampleProposal,
        status: 'pending',
      });

      // Seed default role permission
      batch.set(doc(db, 'rolePermissions', DEFAULT_SUPERVISOR_ROLE.roleId), DEFAULT_SUPERVISOR_ROLE);

      // Seed connection test doc
      batch.set(doc(db, 'systemSettings', 'connection'), {
        status: 'online',
        databaseId: firebaseConfig.firestoreDatabaseId,
        projectId: firebaseConfig.projectId,
        lastSynced: new Date().toISOString(),
      });

      await batch.commit();
      console.log('Firebase Firestore initialized successfully with online records.');
    } else {
      // Ensure role permission document exists
      try {
        await setDoc(doc(db, 'rolePermissions', DEFAULT_SUPERVISOR_ROLE.roleId), DEFAULT_SUPERVISOR_ROLE, { merge: true });
        await setDoc(doc(db, 'systemSettings', 'connection'), {
          status: 'online',
          databaseId: firebaseConfig.firestoreDatabaseId,
          projectId: firebaseConfig.projectId,
          lastSynced: new Date().toISOString(),
        }, { merge: true });
      } catch (e) {
        console.warn('Silent role check:', e);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'workshops');
  }
}

// Real-time synchronization subscription for workshops
export function subscribeToWorkshops(
  onUpdate: (workshops: Workshop[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'workshops';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Workshop[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Workshop);
      });
      // Sort by semester & code for consistent catalog view
      list.sort((a, b) => a.code.localeCompare(b.code));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

// Real-time synchronization subscription for proposals
export function subscribeToProposals(
  onUpdate: (proposals: CustomWorkshopProposal[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'proposals';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CustomWorkshopProposal[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CustomWorkshopProposal);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

// Real-time synchronization for role permissions
export function subscribeToRolePermissions(
  onUpdate: (roles: RolePermissionDoc[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'rolePermissions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: RolePermissionDoc[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RolePermissionDoc);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

// Save or update workshop registration
export async function saveWorkshopToFirestore(workshop: Workshop): Promise<void> {
  const path = `workshops/${workshop.id}`;
  try {
    await setDoc(doc(db, 'workshops', workshop.id), {
      ...workshop,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Save new custom proposal to Firestore
export async function saveProposalToFirestore(proposal: CustomWorkshopProposal): Promise<void> {
  const path = `proposals/${proposal.id}`;
  try {
    await setDoc(doc(db, 'proposals', proposal.id), {
      ...proposal,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Delete proposal from Firestore (e.g., when approved or removed)
export async function deleteProposalFromFirestore(proposalId: string): Promise<void> {
  const path = `proposals/${proposalId}`;
  try {
    await deleteDoc(doc(db, 'proposals', proposalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}
