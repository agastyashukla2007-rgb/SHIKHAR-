import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  SavedStudyItemDoc,
  TargetExamChoice,
  UserPrivateInfoDoc,
  UserPublicProfileDoc,
  auth,
  deleteSavedStudyItemFromFirestore,
  ensureUserDocuments,
  googleProvider,
  saveQuizAttemptToFirestore,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  subscribeSavedStudyItems,
  subscribeUserAttempts,
  subscribeUserPrivateInfo,
  subscribeUserProfile,
  updateUserPrivateInfo,
  updateUserPublicProfile,
  upsertSavedStudyItemInFirestore,
} from '../firebase';
import { QuizAttemptRecord, QuizQuestion } from '../types/exam';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  profile: UserPublicProfileDoc | null;
  privateInfo: UserPrivateInfoDoc | null;
  cloudAttempts: QuizAttemptRecord[];
  savedItems: SavedStudyItemDoc[];
  authLoading: boolean;
  authError: string | null;
  phoneNeedsConsoleEnable: boolean;
  pendingPhoneNumber: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<boolean>;
  sendPhoneOtp: (e164Phone: string, recaptchaContainerId: string) => Promise<boolean>;
  verifyPhoneOtp: (otpCode: string) => Promise<boolean>;
  resetPhoneFlow: () => void;
  logout: () => Promise<void>;
  updateTargetExam: (exam: TargetExamChoice) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateWhatsappOptIn: (optIn: boolean) => Promise<void>;
  syncAttemptToCloud: (record: QuizAttemptRecord) => Promise<void>;
  syncBookmarkToCloud: (question: QuizQuestion, isAdding: boolean) => Promise<void>;
  syncMistakesToCloud: (questions: QuizQuestion[]) => Promise<void>;
  syncVocabToCloud: (word: string, subject?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthErrorMessage(err: unknown): { message: string; phoneDisabled: boolean } {
  const code = (err as { code?: string })?.code || '';
  const rawMsg = err instanceof Error ? err.message : String(err);

  if (code === 'auth/popup-closed-by-user') {
    return { message: 'Sign-in popup was closed before completing login.', phoneDisabled: false };
  }
  if (code === 'auth/popup-blocked') {
    return {
      message: 'Browser blocked the Google sign-in popup. Please allow popups for this site and try again.',
      phoneDisabled: false,
    };
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/billing-not-enabled') {
    return {
      message:
        'Phone Number OTP is not enabled yet in Firebase Authentication Console for this project. Enable the Phone provider in Firebase Console or continue with Gmail below.',
      phoneDisabled: true,
    };
  }
  if (code === 'auth/invalid-phone-number') {
    return {
      message: 'Please enter a valid mobile number with country code (e.g. +919876543210).',
      phoneDisabled: false,
    };
  }
  if (code === 'auth/invalid-verification-code') {
    return { message: 'Invalid 6-digit OTP code. Please check and try again.', phoneDisabled: false };
  }
  if (code === 'auth/code-expired') {
    return { message: 'OTP expired. Please request a fresh OTP.', phoneDisabled: false };
  }
  if (code === 'auth/too-many-requests') {
    return {
      message: 'Too many OTP attempts from this device. Please wait a minute or use Gmail Login.',
      phoneDisabled: false,
    };
  }
  return { message: rawMsg || 'Authentication failed. Please try again.', phoneDisabled: false };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserPublicProfileDoc | null>(null);
  const [privateInfo, setPrivateInfo] = useState<UserPrivateInfoDoc | null>(null);
  const [cloudAttempts, setCloudAttempts] = useState<QuizAttemptRecord[]>([]);
  const [savedItems, setSavedItems] = useState<SavedStudyItemDoc[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [phoneNeedsConsoleEnable, setPhoneNeedsConsoleEnable] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(null);
  const [fatalFirestoreError, setFatalFirestoreError] = useState<Error | null>(null);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubPrivate: (() => void) | null = null;
    let unsubAttempts: (() => void) | null = null;
    let unsubSaved: (() => void) | null = null;
    let cancelled = false;

    const cleanupSubs = () => {
      unsubProfile?.();
      unsubPrivate?.();
      unsubAttempts?.();
      unsubSaved?.();
      unsubProfile = null;
      unsubPrivate = null;
      unsubAttempts = null;
      unsubSaved = null;
    };

    const unsubAuth = onAuthStateChanged(auth, async (nextUser) => {
      cleanupSubs();
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        setProfile(null);
        setPrivateInfo(null);
        setCloudAttempts([]);
        setSavedItems([]);
        return;
      }

      try {
        await ensureUserDocuments(nextUser);
        if (cancelled) return;

        unsubProfile = subscribeUserProfile(nextUser.uid, (docData) => {
          setProfile(docData);
        });
        unsubPrivate = subscribeUserPrivateInfo(nextUser.uid, (info) => {
          setPrivateInfo(info);
        });
        unsubAttempts = subscribeUserAttempts(nextUser.uid, (list) => {
          setCloudAttempts(list);
        });
        unsubSaved = subscribeSavedStudyItems(nextUser.uid, (list) => {
          setSavedItems(list);
        });
      } catch (err) {
        if (!cancelled) {
          setFatalFirestoreError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    });

    return () => {
      cancelled = true;
      cleanupSubs();
      unsubAuth();
    };
  }, []);

  if (fatalFirestoreError) {
    throw fatalFirestoreError;
  }

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    setPhoneNeedsConsoleEnable(false);
  }, []);

  const clearRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch {
        // Ignore widget already removed
      }
      recaptchaRef.current = null;
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    setPhoneNeedsConsoleEnable(false);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      const formatted = formatAuthErrorMessage(err);
      setAuthError(formatted.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const sendPhoneOtp = useCallback(
    async (e164Phone: string, recaptchaContainerId: string): Promise<boolean> => {
      setAuthLoading(true);
      setAuthError(null);
      setPhoneNeedsConsoleEnable(false);
      try {
        clearRecaptcha();
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'invisible',
        });
        recaptchaRef.current = verifier;
        const confirmation = await signInWithPhoneNumber(auth, e164Phone, verifier);
        confirmationRef.current = confirmation;
        setPendingPhoneNumber(e164Phone);
        return true;
      } catch (err) {
        clearRecaptcha();
        const formatted = formatAuthErrorMessage(err);
        setAuthError(formatted.message);
        setPhoneNeedsConsoleEnable(formatted.phoneDisabled);
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [clearRecaptcha]
  );

  const verifyPhoneOtp = useCallback(
    async (otpCode: string): Promise<boolean> => {
      if (!confirmationRef.current) {
        setAuthError('OTP session expired. Please request a new OTP.');
        return false;
      }
      setAuthLoading(true);
      setAuthError(null);
      try {
        await confirmationRef.current.confirm(otpCode.trim());
        confirmationRef.current = null;
        setPendingPhoneNumber(null);
        clearRecaptcha();
        return true;
      } catch (err) {
        const formatted = formatAuthErrorMessage(err);
        setAuthError(formatted.message);
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [clearRecaptcha]
  );

  const resetPhoneFlow = useCallback(() => {
    confirmationRef.current = null;
    setPendingPhoneNumber(null);
    setAuthError(null);
    setPhoneNeedsConsoleEnable(false);
    clearRecaptcha();
  }, [clearRecaptcha]);

  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      resetPhoneFlow();
    } finally {
      setAuthLoading(false);
    }
  }, [resetPhoneFlow]);

  const updateTargetExam = useCallback(
    async (exam: TargetExamChoice) => {
      if (!user) return;
      await updateUserPublicProfile(user.uid, { targetExam: exam });
    },
    [user]
  );

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) return;
      await updateUserPublicProfile(user.uid, { displayName: name });
    },
    [user]
  );

  const updateWhatsappOptIn = useCallback(
    async (optIn: boolean) => {
      if (!user) return;
      await updateUserPrivateInfo(user.uid, { whatsappOptIn: optIn });
    },
    [user]
  );

  const syncAttemptToCloud = useCallback(
    async (record: QuizAttemptRecord) => {
      if (!user) return;
      await saveQuizAttemptToFirestore(user.uid, record);
      const nextXp = (profile?.xp ?? 120) + Math.max(10, record.correctCount * 10);
      const totalAttempts = cloudAttempts.length + 1;
      const prevSum = cloudAttempts.reduce((acc, a) => acc + a.accuracyPercent, 0);
      const avgAccuracy = (prevSum + record.accuracyPercent) / totalAttempts;
      await updateUserPublicProfile(user.uid, {
        xp: nextXp,
        accuracyPercent: avgAccuracy,
        streakDays: Math.max(1, profile?.streakDays ?? 1),
      });
    },
    [user, profile, cloudAttempts]
  );

  const syncBookmarkToCloud = useCallback(
    async (question: QuizQuestion, isAdding: boolean) => {
      if (!user) return;
      if (isAdding) {
        await upsertSavedStudyItemInFirestore(user.uid, {
          itemType: 'bookmark',
          refId: question.id,
          title: question.questionEn,
          subject: question.subject,
        });
      } else {
        await deleteSavedStudyItemFromFirestore(user.uid, 'bookmark', question.id);
      }
    },
    [user]
  );

  const syncMistakesToCloud = useCallback(
    async (questions: QuizQuestion[]) => {
      if (!user || questions.length === 0) return;
      await Promise.all(
        questions.slice(0, 20).map((q) =>
          upsertSavedStudyItemInFirestore(user.uid, {
            itemType: 'mistake',
            refId: q.id,
            title: q.questionEn,
            subject: q.subject,
          })
        )
      );
    },
    [user]
  );

  const syncVocabToCloud = useCallback(
    async (word: string, subject = 'The Hindu Vocabulary') => {
      if (!user || !word.trim()) return;
      await upsertSavedStudyItemInFirestore(user.uid, {
        itemType: 'vocab',
        refId: `vocab_${word.toLowerCase()}`,
        title: word,
        subject,
      });
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        profile,
        privateInfo,
        cloudAttempts,
        savedItems,
        authLoading,
        authError,
        phoneNeedsConsoleEnable,
        pendingPhoneNumber,
        clearAuthError,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        resetPhoneFlow,
        logout,
        updateTargetExam,
        updateDisplayName,
        updateWhatsappOptIn,
        syncAttemptToCloud,
        syncBookmarkToCloud,
        syncMistakesToCloud,
        syncVocabToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
