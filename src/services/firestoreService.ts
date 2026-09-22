import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserCloudData {
  completed: Record<number, boolean>;
  timestamps: Record<number, string>;
  revisions: Record<number, boolean>;
  notes: Record<number, string>;
  updatedAt?: any;
}

const DEFAULT_CLOUD_DATA: UserCloudData = {
  completed: {},
  timestamps: {},
  revisions: {},
  notes: {},
};

/**
 * Fetch a user's DSA progress from Firestore
 */
export async function getUserData(userId: string): Promise<UserCloudData | null> {
  try {
    if (!db) return null;
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        completed: data.completed || {},
        timestamps: data.timestamps || {},
        revisions: data.revisions || {},
        notes: data.notes || {},
        updatedAt: data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data from Firestore:', error);
    return null;
  }
}

let syncErrorListener: ((err: any) => void) | null = null;

export function setSyncErrorListener(cb: ((err: any) => void) | null) {
  syncErrorListener = cb;
}

/**
 * Save user data to Firestore (merges fields)
 */
export async function saveUserData(
  userId: string,
  data: Partial<UserCloudData>
): Promise<boolean> {
  try {
    if (!db) return false;
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error: any) {
    console.error('🔥 FIRESTORE WRITE ERROR:', error);
    if (syncErrorListener) syncErrorListener(error);
    return false;
  }
}

/**
 * Merge local guest progress with existing cloud progress upon login
 */
export async function mergeLocalWithCloud(
  userId: string,
  localData: UserCloudData
): Promise<UserCloudData> {
  try {
    const existing = await getUserData(userId);

    const merged: UserCloudData = {
      completed: { ...(existing?.completed || {}), ...localData.completed },
      timestamps: { ...(existing?.timestamps || {}), ...localData.timestamps },
      revisions: { ...(existing?.revisions || {}), ...localData.revisions },
      notes: { ...(existing?.notes || {}), ...localData.notes },
    };

    await saveUserData(userId, merged);
    return merged;
  } catch (error) {
    console.error('Error merging local with cloud:', error);
    return localData;
  }
}

/**
 * Real-time listener for user document changes
 */
export function subscribeToUserData(
  userId: string,
  onUpdate: (data: UserCloudData) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    return () => {};
  }
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate({
          completed: data.completed || {},
          timestamps: data.timestamps || {},
          revisions: data.revisions || {},
          notes: data.notes || {},
          updatedAt: data.updatedAt,
        });
      } else {
        onUpdate(DEFAULT_CLOUD_DATA);
      }
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}
