import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export interface CachedAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type CurrentUserType = User | CachedAuthUser;

const AUTH_CACHE_KEY = 'arh-dsa-auth-session';

function loadCachedSession(): CachedAuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.uid === 'string' && parsed.uid.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading cached auth session:', e);
  }
  return null;
}

function saveCachedSession(user: User | CachedAuthUser | null) {
  try {
    if (user) {
      const data: CachedAuthUser = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch (e) {
    console.warn('Error saving cached auth session:', e);
  }
}

interface AuthContextType {
  currentUser: CurrentUserType | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize from local storage session so page reloads never lose signed-in state
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(() => loadCachedSession());
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        saveCachedSession(user);
      } else {
        setCurrentUser(null);
        saveCachedSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const clearAuthError = () => setAuthError(null);

  function formatAuthError(error: any): string {
    if (!error) return 'An unexpected error occurred.';
    const code = error.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in your Firebase Console yet. Please enable "Email/Password" under Firebase Console > Authentication > Sign-in method.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Switch to "Sign In" above.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please try again.';
      case 'auth/argument-error':
        return 'Missing credentials or invalid input. Please enter a valid email and password.';
      case 'auth/unauthorized-domain':
        return `Domain "${typeof window !== 'undefined' ? window.location.hostname : ''}" is not authorized in Firebase. Use "http://localhost:5173" or add this domain in Firebase Console > Authentication > Settings > Authorized Domains.`;
      default:
        return error.message?.replace(/^Firebase:\s*/, '') || 'Authentication failed.';
    }
  }

  const signInWithGoogle = async () => {
    try {
      if (!auth) {
        setAuthError('Authentication service is currently unavailable.');
        return;
      }
      setAuthError(null);
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        setCurrentUser(cred.user);
        saveCachedSession(cred.user);
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(formatAuthError(error));
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      if (!auth) {
        setAuthError('Authentication service is currently unavailable.');
        return;
      }
      setAuthError(null);
      const cleanEmail = (email || '').trim();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        setCurrentUser(cred.user);
        saveCachedSession(cred.user);
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      if (!auth) {
        setAuthError('Authentication service is currently unavailable.');
        return;
      }
      setAuthError(null);
      const cleanEmail = (email || '').trim();
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (name && name.trim() && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      if (cred.user) {
        setCurrentUser(cred.user);
        saveCachedSession(cred.user);
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Email Sign-Up Error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      saveCachedSession(null);
      setCurrentUser(null);
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
