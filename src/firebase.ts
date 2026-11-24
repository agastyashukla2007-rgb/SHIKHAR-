import { initializeApp } from 'firebase/app';
import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User,
  getAuth,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ExamCategory, QuizAttemptRecord } from './types/exam';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
    phoneNumber?: string | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
      phoneNumber?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      phoneNumber: auth.currentUser?.phoneNumber,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
          phoneNumber: provider.phoneNumber,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

export const ALLOWED_TARGET_EXAMS = [
  'SSC',
  'Railway',
  'Banking',
  'Defence',
  'Police',
  'Teaching',
  'State PCS',
  'All',
] as const;

export type TargetExamChoice = (typeof ALLOWED_TARGET_EXAMS)[number];

export interface UserPublicProfileDoc {
  uid: string;
  displayName: string;
  targetExam: TargetExamChoice;
  xp: number;
  streakDays: number;
  accuracyPercent: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface UserPrivateInfoDoc {
  uid: string;
  email?: string;
  phoneNumber?: string;
  authProvider: 'google' | 'phone';
  whatsappOptIn: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface SavedStudyItemDoc {
  id: string;
  uid: string;
  itemType: 'bookmark' | 'mistake' | 'vocab';
  refId: string;
  title: string;
  subject: string;
  createdAt?: Timestamp | null;
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `id_${Date.now()}`;
}

export function clampString(val: string, fallback: string, maxLen: number): string {
  const trimmed = (val || '').trim();
  const safe = trimmed.length > 0 ? trimmed : fallback;
  return safe.slice(0, maxLen);
}

export function clampNumber(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function resolveAuthProvider(user: User): 'google' | 'phone' {
  const hasPhone =
    Boolean(user.phoneNumber) ||
    user.providerData.some((p) => p.providerId === 'phone');
  if (hasPhone && !user.email) return 'phone';
  const hasGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  return hasGoogle ? 'google' : hasPhone ? 'phone' : 'google';
}

export async function ensureUserDocuments(
  user: User,
  preferredExam: TargetExamChoice = 'SSC'
): Promise<void> {
  const uid = sanitizeId(user.uid);
  const userPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;
  const userRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'info');

  const safeDisplayName = clampString(
    user.displayName || (user.phoneNumber ? `Aspirant ${user.phoneNumber.slice(-4)}` : user.email?.split('@')[0] || 'Aspirant'),
    'Aspirant',
    100
  );

  let userSnap;
  try {
    userSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!userSnap.exists()) {
    try {
      await setDoc(userRef, {
        uid,
        displayName: safeDisplayName,
        targetExam: preferredExam,
        xp: 120,
        streakDays: 1,
        accuracyPercent: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  }

  let privateSnap;
  try {
    privateSnap = await getDoc(privateRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath);
  }

  const provider = resolveAuthProvider(user);
  const cleanEmail = user.email ? clampString(user.email, '', 200) : undefined;
  const cleanPhone = user.phoneNumber ? clampString(user.phoneNumber, '', 32) : undefined;

  if (!privateSnap.exists()) {
    const privatePayload: Record<string, unknown> = {
      uid,
      authProvider: provider,
      whatsappOptIn: Boolean(cleanPhone),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (cleanEmail) privatePayload.email = cleanEmail;
    if (cleanPhone) privatePayload.phoneNumber = cleanPhone;

    try {
      await setDoc(privateRef, privatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, privatePath);
    }
  }
}

export async function updateUserPublicProfile(
  uid: string,
  patch: Partial<Pick<UserPublicProfileDoc, 'displayName' | 'targetExam' | 'xp' | 'streakDays' | 'accuracyPercent'>>
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.displayName !== undefined) {
    payload.displayName = clampString(patch.displayName, 'Aspirant', 100);
  }
  if (patch.targetExam !== undefined && ALLOWED_TARGET_EXAMS.includes(patch.targetExam)) {
    payload.targetExam = patch.targetExam;
  }
  if (patch.xp !== undefined) {
    payload.xp = Math.round(clampNumber(patch.xp, 0, 10000000));
  }
  if (patch.streakDays !== undefined) {
    payload.streakDays = Math.round(clampNumber(patch.streakDays, 0, 3650));
  }
  if (patch.accuracyPercent !== undefined) {
    payload.accuracyPercent = Number(clampNumber(patch.accuracyPercent, 0, 100).toFixed(2));
  }

  try {
    await updateDoc(doc(db, 'users', safeUid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserPrivateInfo(
  uid: string,
  patch: { whatsappOptIn?: boolean; phoneNumber?: string }
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}/private/info`;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (patch.whatsappOptIn !== undefined) {
    payload.whatsappOptIn = Boolean(patch.whatsappOptIn);
  }
  if (patch.phoneNumber !== undefined && patch.phoneNumber.trim().length > 0) {
    payload.phoneNumber = clampString(patch.phoneNumber, '', 32);
  }

  try {
    await updateDoc(doc(db, 'users', safeUid, 'private', 'info'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveQuizAttemptToFirestore(
  uid: string,
  record: QuizAttemptRecord
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const attemptId = sanitizeId(record.id || `att_${Date.now()}`);
  const path = `users/${safeUid}/attempts/${attemptId}`;

  const payload = {
    uid: safeUid,
    quizId: clampString(record.quizId || record.title, 'quiz', 160),
    title: clampString(record.title, 'Practice Quiz', 240),
    subject: clampString(record.subject, 'General Studies', 120),
    exam: clampString(record.exam, 'SSC', 40),
    score: Number(clampNumber(record.score, -1000, 10000).toFixed(2)),
    maxScore: Number(clampNumber(record.maxScore, 0, 10000).toFixed(2)),
    correctCount: Math.round(clampNumber(record.correctCount, 0, 500)),
    incorrectCount: Math.round(clampNumber(record.incorrectCount, 0, 500)),
    unansweredCount: Math.round(clampNumber(record.unansweredCount, 0, 500)),
    accuracyPercent: Number(clampNumber(record.accuracyPercent, 0, 100).toFixed(2)),
    avgTimePerQuestionSec: Number(clampNumber(record.avgTimePerQuestionSec, 0, 3600).toFixed(2)),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', safeUid, 'attempts', attemptId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function upsertSavedStudyItemInFirestore(
  uid: string,
  item: {
    itemType: 'bookmark' | 'mistake' | 'vocab';
    refId: string;
    title: string;
    subject: string;
  }
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const docId = sanitizeId(`${item.itemType}_${item.refId}`);
  const path = `users/${safeUid}/savedItems/${docId}`;
  const ref = doc(db, 'users', safeUid, 'savedItems', docId);

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) return;
    await setDoc(ref, {
      uid: safeUid,
      itemType: item.itemType,
      refId: clampString(item.refId, docId, 160),
      title: clampString(item.title, 'Saved Item', 300),
      subject: clampString(item.subject, 'General Studies', 120),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteSavedStudyItemFromFirestore(
  uid: string,
  itemType: 'bookmark' | 'mistake' | 'vocab',
  refId: string
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const docId = sanitizeId(`${itemType}_${refId}`);
  const path = `users/${safeUid}/savedItems/${docId}`;
  try {
    await deleteDoc(doc(db, 'users', safeUid, 'savedItems', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserPublicProfileDoc | null) => void
): () => void {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  return onSnapshot(
    doc(db, 'users', safeUid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserPublicProfileDoc) : null);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeUserPrivateInfo(
  uid: string,
  onData: (info: UserPrivateInfoDoc | null) => void
): () => void {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}/private/info`;
  return onSnapshot(
    doc(db, 'users', safeUid, 'private', 'info'),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserPrivateInfoDoc) : null);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeUserAttempts(
  uid: string,
  onData: (attempts: QuizAttemptRecord[]) => void
): () => void {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}/attempts`;
  const q = query(
    collection(db, 'users', safeUid, 'attempts'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: QuizAttemptRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const createdAtTs = data.createdAt as Timestamp | undefined;
        return {
          id: d.id,
          quizId: String(data.quizId || d.id),
          title: String(data.title || 'Quiz Attempt'),
          subject: String(data.subject || 'General Studies'),
          exam: (String(data.exam || 'SSC') as ExamCategory),
          score: Number(data.score || 0),
          maxScore: Number(data.maxScore || 0),
          correctCount: Number(data.correctCount || 0),
          incorrectCount: Number(data.incorrectCount || 0),
          unansweredCount: Number(data.unansweredCount || 0),
          accuracyPercent: Number(data.accuracyPercent || 0),
          avgTimePerQuestionSec: Number(data.avgTimePerQuestionSec || 0),
          completedAt: createdAtTs ? createdAtTs.toDate().toISOString() : new Date().toISOString(),
          weakTopics: [],
          synced: true,
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeSavedStudyItems(
  uid: string,
  onData: (items: SavedStudyItemDoc[]) => void
): () => void {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}/savedItems`;
  const q = query(
    collection(db, 'users', safeUid, 'savedItems'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: SavedStudyItemDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SavedStudyItemDoc, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
};
