import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ABDUL_BARI_PROBLEMS } from '../data/abdulBariData';
import { useAuth } from '../context/AuthContext';
import {
  saveUserData,
  mergeLocalWithCloud,
  subscribeToUserData,
  setSyncErrorListener,
  UserCloudData,
} from '../services/firestoreService';

const PROGRESS_KEY = 'arh-dsa-progress';
const REVISIONS_KEY = 'arh-dsa-revisions';
const NOTES_KEY = 'arh-dsa-notes';
const TIMESTAMPS_KEY = 'arh-dsa-timestamps';

export function useDSAProgress() {
  const { currentUser, loading: authLoading } = useAuth();

  const [completed, setCompleted] = useLocalStorage<Record<number, boolean>>(PROGRESS_KEY, {});
  const [timestamps, setTimestamps] = useLocalStorage<Record<number, string>>(TIMESTAMPS_KEY, {});
  const [revisions, setRevisions] = useLocalStorage<Record<number, boolean>>(REVISIONS_KEY, {});
  const [notes, setNotes] = useLocalStorage<Record<number, string>>(NOTES_KEY, {});

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Ref to track if current state change came from cloud subscription (prevent echo loops)
  const isCloudUpdateRef = useRef(false);

  // Listen to Firestore write errors
  useEffect(() => {
    setSyncErrorListener((err) => {
      setSyncStatus('offline');
      if (err?.code === 'permission-denied') {
        setCloudError('Missing permissions: Update Firestore Security Rules in Firebase Console.');
      } else {
        setCloudError(err?.message || 'Failed to sync with Firestore.');
      }
    });

    return () => setSyncErrorListener(null);
  }, []);

  // When user logs in or out, handle cloud synchronization
  useEffect(() => {
    // If authentication is still being initialized on page reload, wait to prevent offline flicker
    if (authLoading && !currentUser) {
      return;
    }

    if (!currentUser) {
      setSyncStatus('offline');
      setCloudError(null);
      return;
    }

    setSyncStatus('saving');
    setCloudError(null);

    // 1. Initial merge: upload any guest local progress to Firestore
    const localSnapshot: UserCloudData = {
      completed,
      timestamps,
      revisions,
      notes,
    };

    mergeLocalWithCloud(currentUser.uid, localSnapshot).then((merged) => {
      isCloudUpdateRef.current = true;
      setCompleted(merged.completed);
      setTimestamps(merged.timestamps);
      setRevisions(merged.revisions);
      setNotes(merged.notes);
      setSyncStatus('synced');
    });

    // 2. Real-time subscription to cloud document
    const unsubscribe = subscribeToUserData(
      currentUser.uid,
      (cloudData) => {
        isCloudUpdateRef.current = true;
        setCompleted(cloudData.completed);
        setTimestamps(cloudData.timestamps);
        setRevisions(cloudData.revisions);
        setNotes(cloudData.notes);
        setSyncStatus('synced');
      },
      (err: any) => {
        console.warn('Subscription error:', err);
        setSyncStatus('offline');
        if (err?.code === 'permission-denied') {
          setCloudError('Firestore rules blocked sync. Update Security Rules in Firebase Console.');
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, authLoading]);

  const totalCount = ABDUL_BARI_PROBLEMS.length;

  const completedCount = useMemo(() => {
    return Object.values(completed).filter(Boolean).length;
  }, [completed]);

  const remainingCount = Math.max(0, totalCount - completedCount);

  const revisionCount = useMemo(() => {
    return Object.values(revisions).filter(Boolean).length;
  }, [revisions]);

  const progressPercentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((completedCount / totalCount) * 1000) / 10;
  }, [completedCount, totalCount]);

  // Today completed count based on ISO timestamp
  const todayCompletedCount = useMemo(() => {
    const today = new Date().toDateString();
    let count = 0;
    for (const [idStr, isDone] of Object.entries(completed)) {
      if (isDone) {
        const id = Number(idStr);
        const timeStr = timestamps[id];
        if (timeStr && new Date(timeStr).toDateString() === today) {
          count++;
        }
      }
    }
    return count;
  }, [completed, timestamps]);

  const toggleCompleted = useCallback(
    (id: number) => {
      const nextDone = !completed[id];
      const nextCompleted = { ...completed, [id]: nextDone };
      if (!nextDone) {
        delete nextCompleted[id];
      }

      const nextTimestamps = { ...timestamps };
      if (nextDone) {
        nextTimestamps[id] = new Date().toISOString();
      } else {
        delete nextTimestamps[id];
      }

      setCompleted(nextCompleted);
      setTimestamps(nextTimestamps);

      if (currentUser) {
        setSyncStatus('saving');
        saveUserData(currentUser.uid, {
          completed: nextCompleted,
          timestamps: nextTimestamps,
        }).then((ok) => setSyncStatus(ok ? 'synced' : 'offline'));
      }
    },
    [completed, timestamps, currentUser, setCompleted, setTimestamps]
  );

  const toggleRevision = useCallback(
    (id: number) => {
      const nextRev = !revisions[id];
      const nextRevisions = { ...revisions, [id]: nextRev };
      if (!nextRev) {
        delete nextRevisions[id];
      }

      setRevisions(nextRevisions);

      if (currentUser) {
        setSyncStatus('saving');
        saveUserData(currentUser.uid, {
          revisions: nextRevisions,
        }).then((ok) => setSyncStatus(ok ? 'synced' : 'offline'));
      }
    },
    [revisions, currentUser, setRevisions]
  );

  const saveNote = useCallback(
    (id: number, text: string) => {
      const trimmed = text.trim();
      const nextNotes = { ...notes };
      if (trimmed) {
        nextNotes[id] = trimmed;
      } else {
        delete nextNotes[id];
      }

      setNotes(nextNotes);

      if (currentUser) {
        setSyncStatus('saving');
        saveUserData(currentUser.uid, {
          notes: nextNotes,
        }).then((ok) => setSyncStatus(ok ? 'synced' : 'offline'));
      }
    },
    [notes, currentUser, setNotes]
  );

  const resetProgress = useCallback(
    (keepNotes: boolean = true) => {
      setCompleted({});
      setTimestamps({});
      setRevisions({});
      const nextNotes = keepNotes ? notes : {};
      if (!keepNotes) {
        setNotes({});
      }

      if (currentUser) {
        setSyncStatus('saving');
        saveUserData(currentUser.uid, {
          completed: {},
          timestamps: {},
          revisions: {},
          notes: nextNotes,
        }).then((ok) => setSyncStatus(ok ? 'synced' : 'offline'));
      }
    },
    [notes, currentUser, setCompleted, setTimestamps, setRevisions, setNotes]
  );

  return {
    completed,
    revisions,
    notes,
    totalCount,
    completedCount,
    remainingCount,
    revisionCount,
    progressPercentage,
    todayCompletedCount,
    syncStatus,
    cloudError,
    toggleCompleted,
    toggleRevision,
    saveNote,
    resetProgress,
  };
}
