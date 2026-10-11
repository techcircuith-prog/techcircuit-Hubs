import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Clock
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Pre-fill email if typed on login page
  const initialEmail = (location.state as any)?.email || searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // 60-second countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmailFormat = (emailStr: string): boolean => {
    const trimmed = emailStr.trim();
    // Standard RFC-compliant email regex pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (countdown > 0) {
      return;
    }

    setIsSubmitting(true);

    const GENERIC_SUCCESS = 'If an account exists for this email, a reset link has been sent. Please check your spam folder too.';

    try {
      // Continue URL points to the student login page of this app
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);

      // Always show generic success message on success
      setSuccessMessage(GENERIC_SUCCESS);
      setCountdown(60);
    } catch (err: any) {
      const code = err?.code || '';

      // Security requirement: ALWAYS show generic success message whether or not account exists
      // Prevent user enumeration: treat user-not-found, invalid-credential, or missing password as generic success
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/account-exists-with-different-credential'
      ) {
        setSuccessMessage(GENERIC_SUCCESS);
        setCountdown(60);
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('Too many requests. Please wait a few moments before trying again.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMessage('Network connection issue. Please check your internet connection and try again.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        // Friendly fallback message - never show raw Firebase codes
        setErrorMessage('Unable to process password reset at this time. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[88vh] bg-pcb-grid flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-5">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/login"
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1.5 transition-colors font-mono group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to login</span>
          </Link>
        </div>

        {/* Main Card Frame */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 relative">
          
          {/* ECE Logo Inside Card Layout */}
          <div className="flex justify-center mb-6">
            <Link to="/" aria-label="ECE Hub Home" className="inline-block select-none">
              <img
                src="/ece-logo.png"
                alt="ECE Hub Logo"
                className="h-20 sm:h-24 w-auto max-w-[280px] object-contain drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Title and Help Text */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-950 tracking-tight">
              Reset your password
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Enter your student email address and we will send you a secure link to reset your password.
            </p>
          </div>

          {/* Success Message Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Password Reset Form */}
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="student@college.edu"
                  autoComplete="email"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Submit / Resend Button */}
            <button
              type="submit"
              disabled={isSubmitting || countdown > 0}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-orange-200" />
                  <span>Sending reset link...</span>
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Resend in {countdown}s</span>
                </>
              ) : successMessage ? (
                <>
                  <span>Resend reset link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Send reset link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
