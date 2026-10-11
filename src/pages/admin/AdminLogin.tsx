import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowLeft 
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { user, isAdmin, adminLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clear any existing admin session when arriving at login page so manual authentication is required
  useEffect(() => {
    localStorage.removeItem('techcircuithub_admin_session');
    sessionStorage.removeItem('techcircuithub_admin_session');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await adminLogin(username, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 400);
    } catch (err: any) {
      setError(err?.message || 'Access Denied: Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambient Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.15), transparent 45%),
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Subtle Glowing Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Status bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img 
            src="/ece-logo.png" 
            alt="ECE Hub Logo" 
            className="h-14 sm:h-16 w-auto object-contain" 
          />
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-mono font-normal">
            SYS_ADMIN
          </span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-mono px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Student Site</span>
        </button>
      </header>

      {/* Main Login Form Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
            
            {/* Top Security Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Zero-Trust Gate Active
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>ROOT_AUTH</span>
              </div>
            </div>

            {/* Logo Display */}
            <div className="flex justify-center mb-6">
              <img 
                src="/ece-logo.png" 
                alt="ECE Hub Logo" 
                className="h-20 sm:h-24 w-auto object-contain drop-shadow-md" 
              />
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                Administrator Login
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Enter your administrator email and password to access the console.
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 font-mono">{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Verification granted. Initializing Admin Console...</span>
              </div>
            )}

            {/* Pure Manual Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Field */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  ADMIN IDENTIFIER / EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm font-mono focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  SECURITY PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm font-mono focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-3"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying & Logging In...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Log In to Admin Console</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Bottom Security Note */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Strict Role-Based Access Control</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Session is encrypted & protected with client & server-side authorization guards.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
        <div>
          &copy; {new Date().getFullYear()} techcircuithub Internal Administration Portal
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>HOST: 0.0.0.0:3000</span>
          <span>·</span>
          <span>ROLE: SUPER_ADMIN</span>
        </div>
      </footer>
    </div>
  );
};
