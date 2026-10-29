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
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  deleteField,
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

// Clean and strip any undefined keys before writing to Firestore
export function sanitizeDocData<T extends object>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        clean[key] = sanitizeDocData(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

// Synchronize and initialize baseline database state with complete 68 workshops without any mock demo data
export async function initializeDatabaseSeed(): Promise<void> {
  try {
    // Check if workshops collection has documents
    const workshopsSnap = await getDocs(collection(db, 'workshops'));

    if (workshopsSnap.empty) {
      console.log('Seeding initial 68 clean workshops to Firestore...');
      const batch = writeBatch(db);
      for (const w of INITIAL_WORKSHOPS) {
        batch.set(doc(db, 'workshops', w.id), sanitizeDocData({
          ...w,
          updatedAt: new Date().toISOString(),
        }));
      }

      // Seed default role permission
      batch.set(doc(db, 'rolePermissions', DEFAULT_SUPERVISOR_ROLE.roleId), sanitizeDocData(DEFAULT_SUPERVISOR_ROLE));

      // Seed connection test doc
      batch.set(doc(db, 'systemSettings', 'connection'), sanitizeDocData({
        status: 'online',
        databaseId: firebaseConfig.firestoreDatabaseId,
        projectId: firebaseConfig.projectId,
        lastSynced: new Date().toISOString(),
      }));

      await batch.commit();
      console.log('Firebase Firestore initialized successfully with clean workshops.');
    } else {
      // Check for any missing workshops in Firestore and clean any legacy mock demo instructors
      const existingDocsMap = new Map(workshopsSnap.docs.map((d) => [d.id, d.data()]));
      const batch = writeBatch(db);
      let updatesCount = 0;

      for (const w of INITIAL_WORKSHOPS) {
        const existingData = existingDocsMap.get(w.id);
        if (!existingData) {
          // Add missing workshop
          batch.set(doc(db, 'workshops', w.id), sanitizeDocData({
            ...w,
            updatedAt: new Date().toISOString(),
          }));
          updatesCount++;
        } else {
          // If the workshop was holding legacy demo seed names, remove them to keep genuine data only
          const instructorName = existingData.instructor?.doctorName;
          if (instructorName === 'د. عبد العزيز بن سعد الغامدي' || instructorName === 'د. نورة بنت فهد التميمي') {
            batch.update(doc(db, 'workshops', w.id), {
              instructor: deleteField(),
              updatedAt: new Date().toISOString(),
            });
            updatesCount++;
          }
        }
      }

      if (updatesCount > 0) {
        console.log(`Syncing ${updatesCount} workshop baseline updates to Firestore...`);
        await batch.commit();
      }

      // Remove legacy mock proposal if still present
      try {
        const mockPropRef = doc(db, 'proposals', 'prop-sample-1');
        const mockPropSnap = await getDoc(mockPropRef);
        if (mockPropSnap.exists()) {
          await deleteDoc(mockPropRef);
        }
      } catch {}

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
    await setDoc(doc(db, 'workshops', workshop.id), sanitizeDocData({
      ...workshop,
      updatedAt: new Date().toISOString(),
    }));
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
