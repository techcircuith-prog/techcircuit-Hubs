import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ECE_DEPARTMENTS = [
  'Electronics & Communication Engineering (ECE)',
  'Very Large Scale Integration (VLSI)',
  'Advanced Circuit Technology (ACT)',
  'Electronics & Telecommunication (ETC)',
  'Embedded Systems & IoT',
  'Electrical & Electronics (EEE)',
];

const COLLEGE_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year / Final Year', 'M.Tech / Postgrad', 'Recent Graduate'];

const SKILL_INTERESTS = [
  'Embedded C',
  'VLSI & Verilog',
  'PCB Design',
  'Analog Circuits',
  'ARM Cortex & RTOS',
  'FPGA & Digital Design',
  'IoT & Wireless',
  'DSP & MATLAB',
  'Python for Hardware',
  'Semiconductor Fabrication',
];

export const OnboardingModal: React.FC = () => {
  const { profile, updateUserProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [year, setYear] = useState(profile?.year || '3rd Year');
  const [department, setDepartment] = useState(profile?.department || ECE_DEPARTMENTS[0]);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || ['Embedded C', 'VLSI & Verilog']);
  const [agreedConsent, setAgreedConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // If user is already onboarded, don't show
  if (!profile || profile.onboarded) return null;

  const toggleInterest = (skill: string) => {
    setSelectedInterests((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedConsent) return;
    setSubmitting(true);
    try {
      await updateUserProfile({
        displayName,
        college,
        year,
        department,
        phone,
        interests: selectedInterests,
        onboarded: true,
      });
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-orange-200 rounded-2xl shadow-2xl p-6 my-8 text-slate-900">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-orange-100">
          <div>
            <img 
              src="/ece-logo.png" 
              alt="ECE Hub Logo" 
              className="h-16 w-auto object-contain mb-2" 
            />
            <p className="text-xs text-slate-500">Set up your engineer profile to personalize internships & skills.</p>
          </div>
          <span className="self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
            STUDENT_SETUP
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aditi Sharma"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Engineering College / Institute *</label>
            <input
              type="text"
              required
              placeholder="e.g. NIT Trichy, IIT Madras, PSG Tech, Anna University..."
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Current Year *</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:border-orange-500 text-slate-900 text-xs outline-none"
              >
                {COLLEGE_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:border-orange-500 text-slate-900 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Branch / Department *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:border-orange-500 text-slate-900 text-xs outline-none"
            >
              {ECE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Select Primary Interests (Recommendations will adapt):
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-stone-50 rounded-lg border border-stone-200">
              {SKILL_INTERESTS.map((skill) => {
                const active = selectedInterests.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleInterest(skill)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-orange-100 text-orange-700 border border-orange-300 font-semibold'
                        : 'bg-white text-slate-600 border border-stone-200 hover:border-orange-200'
                    }`}
                  >
                    {skill} {active ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Consent Notice (Section 9) */}
          <div className="pt-2 border-t border-stone-200">
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-500">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={(e) => setAgreedConsent(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-orange-500 focus:ring-0"
              />
              <span>
                I agree to the telemetry and data processing terms outlined in the{' '}
                <Link to="/policies/privacy" target="_blank" className="text-orange-600 underline font-semibold">
                  Privacy Policy
                </Link>
                . Your information is encrypted and never sold.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !displayName || !college || !agreedConsent}
            className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Initializing Circuit Profile...' : 'Complete Registration & Start Exploring'}
          </button>
        </form>
      </div>
    </div>
  );
};
