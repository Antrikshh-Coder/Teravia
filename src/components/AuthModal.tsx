import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    authPrompt,
    signIn,
    signUp,
    isSupabaseActive,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAuthModalOpen(false);
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  // Reset errors when modal opens or closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (authMode === 'signin') {
      const res = await signIn(cleanEmail, password);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Successfully signed in! Synchronizing your personal records...');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 500);
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      const res = await signUp(cleanEmail, password, name.trim());
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Account registered and securely authenticated!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 600);
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your information.');
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setIsAuthModalOpen(false)}
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md bg-[#151A16] border border-[#25352A] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F4F3EC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#777B70] hover:text-[#F4F3EC] hover:bg-[#1C231E] transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
          <Sparkles className="w-4 h-4 text-[#727B5A]" />
          <span>TERAVIA • Cloud Authentication</span>
        </div>

        <h2 className="text-2xl font-medium tracking-tight text-[#F4F3EC] mb-1">
          {authMode === 'signin' ? 'Welcome Back' : 'Join TERAVIA'}
        </h2>
        <p className="text-xs text-[#777B70] mb-4">
          {authMode === 'signin'
            ? 'Access your saved sanctuaries, personal nature journal, and telemetry across devices.'
            : 'Create a free account to bookmark places and record nature observations.'}
        </p>

        {/* Action Explanation Banner (Contextual Prompt) */}
        {authPrompt && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#1C231E] border border-[#727B5A]/40 flex items-start gap-2.5 text-xs text-[#F4F3EC]">
            <Sparkles className="w-4 h-4 text-[#727B5A] flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed text-[#FAF9F4]">{authPrompt}</span>
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-[#0E120F] p-1 border border-[#25352A] mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-[#25352A] text-white shadow-sm font-semibold'
                : 'text-[#AAB29A] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-[#25352A] text-white shadow-sm font-semibold'
                : 'text-[#AAB29A] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#AAB29A]">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#777B70] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Evelyn Tan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E120F] border border-[#25352A] text-xs text-[#F4F3EC] placeholder-[#777B70]/60 focus:outline-none focus:border-[#727B5A] focus:ring-1 focus:ring-[#727B5A]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#AAB29A]">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#777B70] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="observer@teravia.sg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E120F] border border-[#25352A] text-xs text-[#F4F3EC] placeholder-[#777B70]/60 focus:outline-none focus:border-[#727B5A] focus:ring-1 focus:ring-[#727B5A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#AAB29A]">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#777B70] absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0E120F] border border-[#25352A] text-xs text-[#F4F3EC] placeholder-[#777B70]/60 focus:outline-none focus:border-[#727B5A] focus:ring-1 focus:ring-[#727B5A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-[#777B70] hover:text-[#F4F3EC] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#F4F3EC] text-[#252820] hover:bg-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#727B5A]" />
            )}
            <span>{authMode === 'signin' ? 'Sign In to TERAVIA' : 'Create Free Account'}</span>
          </button>
        </form>

        {/* Demo Account Quick-Fill for instant testing */}
        {authMode === 'signin' && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#1C231E]/70 border border-[#25352A] flex items-center justify-between text-[11px]">
            <span className="text-[#AAB29A]">Demo Biologist:</span>
            <button
              type="button"
              onClick={() => {
                setEmail('observer@teravia.sg');
                setPassword('teravia2026');
              }}
              className="text-[#F4F3EC] hover:text-white underline underline-offset-2 cursor-pointer font-medium"
            >
              Fill Demo Credentials
            </button>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-5 pt-4 border-t border-[#25352A] flex items-center justify-between text-[11px] text-[#777B70]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#727B5A]" />
            <span>Row Level Security Enforced</span>
          </span>
          <span className="text-[#AAB29A] text-[10px]">
            {isSupabaseActive ? 'Supabase Auth' : 'Database JWT Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};
