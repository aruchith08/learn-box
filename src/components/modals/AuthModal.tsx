import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X } from '../common/icons';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(cleanEmail, password);
      } else {
        await signUpWithEmail(cleanEmail, password, name.trim() || undefined);
      }
    } catch {
      // Error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md border-2 border-black bg-white shadow-[8px_8px_0px_#000000] transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Black Brand Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-5 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/arh-logo.png"
              alt="ARH"
              className="h-6 w-auto object-contain brightness-200 contrast-200"
            />
            <div className="text-[11px] font-mono font-bold tracking-widest text-[#CCCCCC] uppercase">
              <span>ARH AUTHENTICATION</span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="flex h-7 w-7 items-center justify-center border border-white/40 bg-black text-white hover:bg-[#FF5E1E] hover:text-black hover:border-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          {/* Slogan Banner */}
          <div className="mb-5 border-2 border-black bg-[#ECECEC] p-3 shadow-[2px_2px_0px_#000000]">
            <h3 className="text-base font-black uppercase text-black tracking-tight leading-tight">
              {mode === 'signin' ? 'Sign In to Your Account' : 'Create New ARH Account'}
            </h3>
            <p className="text-xs font-medium text-[#555555] mt-1">
              Synchronize your solved problems, revision bookmarks, and notes to Cloud Firestore in real-time.
            </p>
          </div>

          {/* Quick Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 border-2 border-black bg-white px-4 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] hover:bg-[#F5F5F5] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black/15" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-mono font-bold uppercase text-black/60">
              OR USE EMAIL
            </span>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_#000000] mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                clearAuthError();
              }}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearAuthError();
              }}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-l-2 border-black transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="mb-4 border-2 border-black bg-red-50 p-2.5 text-xs font-bold text-red-600 shadow-[2px_2px_0px_#000000]">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aruchith"
                  className="w-full border-2 border-black bg-[#F5F5F5] px-3 py-2 text-xs font-mono text-black outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000000]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-black bg-[#F5F5F5] px-3 py-2 text-xs font-mono text-black outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-black bg-[#F5F5F5] px-3 py-2 text-xs font-mono text-black outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000000]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 border-2 border-black bg-[#FF5E1E] px-4 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting
                ? 'PROCESSING...'
                : mode === 'signin'
                ? 'SIGN IN TO ARH DSA'
                : 'CREATE ARH ACCOUNT'}
            </button>
          </form>

          {/* Footer Motto */}
          <div className="mt-5 text-center text-[10px] font-mono font-semibold text-black/50">
            KEEP SOLVING. KEEP BUILDING. — ARH
          </div>
        </div>
      </div>
    </div>
  );
};
