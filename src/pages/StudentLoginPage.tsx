import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const StudentLoginPage: React.FC = () => {
  const { user, login, loginWithDemoStudent, loginWithEmail, registerWithEmail, sendPasswordReset, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // While true, suppress the auto-redirect to the dashboard. Firebase signs a
  // newly registered user in automatically, but we want them to land on the
  // Sign In page instead. A ref avoids triggering the redirect effect itself.
  const skipAutoRedirectRef = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !skipAutoRedirectRef.current) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Re-enable auto-redirect once the user is signed out again (after register).
  useEffect(() => {
    if (!user) {
      skipAutoRedirectRef.current = false;
    }
  }, [user]);

  // Clear messages on mode switch
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      setIsSubmitting(true);
      try {
        await sendPasswordReset(email.trim());
        setSuccessMessage('Password reset instructions have been sent to your email.');
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to send password reset email. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'register') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      setIsSubmitting(true);
      // Suppress the auto-redirect: Firebase signs the new user in on
      // creation, but we send them to the Sign In page instead.
      skipAutoRedirectRef.current = true;
      try {
        await registerWithEmail(email.trim(), password.trim(), displayName.trim());
        // Sign out the freshly created session, then route to Sign In.
        await logout();
        switchMode('login');
        setSuccessMessage('Account created successfully! Please sign in with your email and password.');
      } catch (err: any) {
        skipAutoRedirectRef.current = false;
        if (err?.code === 'auth/email-already-in-use') {
          switchMode('login');
          setErrorMessage(
            'This email is already registered. Please sign in with your existing password, or use "Forgot password?" to reset it. If you originally signed up with Google, use "Sign in with Google" instead.'
          );
          return;
        }

        let msg = 'Registration failed. Please try again.';
        if (err?.code === 'auth/invalid-email') {
          msg = 'Please enter a valid email address.';
        } else if (err?.code === 'auth/weak-password') {
          msg = 'Password is too weak. Please choose a stronger password.';
        } else if (err?.message) {
          msg = err.message;
        }
        setErrorMessage(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Login mode
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password.trim());
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      let msg = 'Invalid email or password.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to many failed attempts. Try again later.';
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);
    setIsGoogleLoading(true);
    try {
      const completed = await login();
      if (!completed) return;
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        if (err?.code === 'auth/unauthorized-domain') {
          setIsUnauthorizedDomain(true);
        } else {
          setErrorMessage(err?.message || 'Google Sign In was not completed. Please try again.');
        }
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] bg-pcb-grid flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-5">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1.5 transition-colors font-mono group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Card Frame */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 relative">
          
          {/* Logo Placed Inside Card Layout */}
          <div className="flex justify-center mb-6">
            <Link to="/" aria-label="ECE Hub Home" className="inline-block select-none">
              <img
                src="/ece-logo.png"
                alt="ECE Hub Logo"
                className="h-24 sm:h-28 w-auto max-w-[280px] object-contain drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Mode Switcher Tabs (Sign In / Register) */}
          {mode !== 'forgot' && (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/80">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer font-mono ${
                  mode === 'login'
                    ? 'bg-white text-orange-600 shadow-xs border border-orange-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer font-mono ${
                  mode === 'register'
                    ? 'bg-white text-orange-600 shadow-xs border border-orange-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Title Area */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-950 tracking-tight">
              {mode === 'login' && 'Student Sign In'}
              {mode === 'register' && 'New Student Registration'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {mode === 'login' && 'Enter your student email and password to access your account.'}
              {mode === 'register' && 'Create your student account to manage projects, internships & skills.'}
              {mode === 'forgot' && 'Enter your email address and we will send you a password reset link.'}
            </p>
          </div>

          {/* Alert Messages */}
          {isUnauthorizedDomain && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold font-mono text-amber-900">
                    Authorize "localhost" in Firebase Console
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Firebase project <span className="font-mono font-semibold">formal-harbor-qrtgb</span> blocked the popup because <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">localhost</code> is not yet added to Authorized Domains.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-3 border border-amber-200/60 text-[11px] space-y-1.5 font-sans">
                <p className="font-semibold text-slate-800">Quick 20-second fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Click the button below to open Firebase Console.</li>
                  <li>Scroll to <span className="font-semibold text-slate-800">Authorized domains</span> and click <span className="font-semibold text-slate-800">Add domain</span>.</li>
                  <li>Enter <code className="font-mono bg-slate-100 px-1 py-0.2 rounded font-semibold text-orange-600">localhost</code> and click <span className="font-semibold text-slate-800">Done</span>.</li>
                </ol>
              </div>

              <div className="pt-0.5 flex flex-wrap gap-2 text-[11px]">
                <a
                  href="https://console.firebase.google.com/project/formal-harbor-qrtgb/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all shadow-xs"
                >
                  <span>Open Firebase Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsUnauthorizedDomain(false);
                    setErrorMessage(null);
                    handleGoogleSignIn();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/70 text-amber-900 font-medium transition-colors cursor-pointer"
                >
                  Retry Google Sign-In
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display Name (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field (Login & Register) */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end pt-1.5">
                    <Link
                      to={`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
                      state={{ email: email.trim() }}
                      className="text-[11px] text-orange-600 hover:text-orange-700 font-medium cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Forgot password mode return link */}
            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs text-slate-500 hover:text-orange-600 transition-colors font-mono cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </form>

          {/* Divider: Or Continue With */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <span className="bg-white px-3">or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Optional 1-Click Demo Option for testing without OAuth */}
          <div className="mt-2.5 text-center">
            <button
              type="button"
              onClick={async () => {
                await loginWithDemoStudent();
                navigate('/dashboard', { replace: true });
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-orange-600 transition-colors underline decoration-dotted cursor-pointer"
            >
              Or click here for 1-Click Demo Student (Dev Mode)
            </button>
          </div>

          {/* Bottom Switch Note */}
          <div className="mt-6 text-center text-xs text-slate-500 font-sans">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-orange-600 hover:text-orange-700 font-bold cursor-pointer underline-offset-2 hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-orange-600 hover:text-orange-700 font-bold cursor-pointer underline-offset-2 hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
};
