import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Award, 
  Save, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

const ECE_DEPARTMENTS = [
  'Electronics & Communication Engineering (ECE)',
  'Very Large Scale Integration (VLSI)',
  'Advanced Circuit Technology (ACT)',
  'Electronics & Telecommunication (ETC)',
  'Embedded Systems & IoT',
  'Electrical & Electronics (EEE)',
];

const COLLEGE_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year / Final Year', 'M.Tech / Postgrad', 'Recent Graduate'];

export const ProfilePage: React.FC = () => {
  const { user, profile, isAdmin, updateUserProfile, logout, login } = useAuth();
  const { studentSkills, badges } = useData();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [department, setDepartment] = useState(profile?.department || ECE_DEPARTMENTS[0]);
  const [year, setYear] = useState(profile?.year || COLLEGE_YEARS[2]);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-pcb-grid flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white border border-orange-200 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="flex justify-center">
            <img 
              src="/ece-logo.png" 
              alt="ECE Hub Logo" 
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-xs" 
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 font-mono">Student Account Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to your student account to track internships, lab projects, certificates & skills.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Go to Student Login</span>
            </Link>
            <button
              onClick={() => login()}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        displayName,
        college,
        department,
        year,
        phone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-mono font-bold text-lg shadow-2xs">
            {(profile?.displayName || user.displayName || 'E')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-mono">
              {profile?.displayName || 'Engineer Profile'}
            </h1>
            <p className="text-xs text-slate-500">{profile?.email || user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateUserProfile({ onboarded: false })}
            className="px-3.5 py-1.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Re-open the student setup form"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Redo Student Setup</span>
            <span className="sm:hidden">Setup</span>
          </button>

          <button
            onClick={() => logout()}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-wider">
            Academic & Contact Details
          </h2>
          {savedSuccess && (
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Google Email (Fixed)</label>
            <input
              type="email"
              disabled
              value={profile?.email || user.email || ''}
              className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Engineering College / Institute</label>
          <input
            type="text"
            required
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 outline-none focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Branch / Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 outline-none focus:border-orange-500"
            >
              {ECE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Current Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 outline-none focus:border-orange-500"
            >
              {COLLEGE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Phone / WhatsApp</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 outline-none focus:border-orange-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs shadow-orange-500/25 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Account Info Security Note */}
      <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 text-slate-600 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" />
        <span>Your data is governed under role-based ABAC rules and never shared with unverified recruiters.</span>
      </div>

    </div>
  );
};
