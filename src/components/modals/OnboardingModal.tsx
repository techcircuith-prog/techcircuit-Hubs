import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  LoaderCircle,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

const steps = [
  { title: 'About you', description: 'Tell us how to address you.', icon: UserRound },
  { title: 'Your studies', description: 'Add your current academic details.', icon: GraduationCap },
  { title: 'Your interests', description: 'Personalize your learning suggestions.', icon: Sparkles },
];

export const OnboardingModal: React.FC = () => {
  const { profile, isAdmin, updateUserProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [year, setYear] = useState(profile?.year || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || '');
    setCollege(profile.college || '');
    setYear(profile.year || '');
    setDepartment(profile.department || '');
    setPhone(profile.phone || '');
    setSelectedInterests(profile.interests || []);
  }, [profile]);

  const needsSetup = Boolean(
    profile &&
    profile.role !== 'admin' &&
    (
      !profile.onboarded ||
      !profile.displayName.trim() ||
      !profile.college?.trim() ||
      !profile.department?.trim() ||
      !profile.year?.trim()
    )
  );

  if (!needsSetup) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const nextStep = () => {
    setSaveError(null);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < steps.length - 1) {
      nextStep();
      return;
    }

    setSubmitting(true);
    setSaveError(null);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        college: college.trim(),
        year,
        department,
        phone: phone.trim(),
        interests: selectedInterests,
        onboarded: true,
      });
    } catch (error) {
      console.error('Failed to save student setup:', error);
      setSaveError('We could not save your student details. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStep = steps[step];
  const ActiveIcon = activeStep.icon;
  const stepValid = step === 0
    ? displayName.trim().length > 1
    : step === 1
      ? Boolean(college.trim() && department && year)
      : selectedInterests.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-setup-title"
    >
      <div className="relative my-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-2xl shadow-orange-950/20 animate-enter-soft">
        <div className="grid min-h-[min(760px,calc(100dvh-1.5rem))] lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full border-[36px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[36px] border-white/10" />
            <div className="relative">
              <Link to="/" aria-label="Return to home" className="inline-flex rounded-2xl bg-white/95 p-3">
                <img src="/ece-logo.png" alt="ECE Hub" className="h-12 w-auto object-contain" />
              </Link>
              <p className="mt-12 text-xs font-bold uppercase tracking-[0.22em] text-orange-50">Your next chapter starts here</p>
              <h2 className="mt-3 max-w-sm text-4xl font-bold leading-tight tracking-tight">
                Make your student space yours.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
                Set your academic profile once. We’ll use it to tailor projects, learning resources, and opportunities to you.
              </p>
            </div>
            <div className="relative space-y-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-white/85">
                <span>STUDENT SETUP</span>
                <span>{String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
              </div>
              <div className="space-y-3">
                {steps.map((item, index) => {
                  const StepIcon = item.icon;
                  const isCurrent = step === index;
                  const isComplete = step > index;
                  return (
                    <div key={item.title} className={`flex items-center gap-3 rounded-xl p-3 transition ${isCurrent ? 'bg-white/20' : 'bg-white/5'}`}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isComplete ? 'bg-white text-orange-600' : 'bg-white/15 text-white'}`}>
                        {isComplete ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-0.5 text-xs text-white/75">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Step {step + 1} of {steps.length}</p>
                  <h2 id="student-setup-title" className="text-lg font-bold text-slate-950">Student setup</h2>
                </div>
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Let’s get you started</p>
                <h2 id="student-setup-title" className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{activeStep.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{activeStep.description}</p>
              </div>
              <span className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-800">
                Required
              </span>
            </div>

            <div className="mt-5 lg:hidden">
              <div className="h-1.5 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{activeStep.description}</p>
            </div>

            {saveError && (
              <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {saveError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-7 flex flex-1 flex-col">
              {step === 0 && (
                <div className="space-y-5 animate-enter-soft">
                  <div>
                    <label htmlFor="student-full-name" className="mb-2 block text-sm font-semibold text-slate-800">Full name</label>
                    <input
                      id="student-full-name"
                      autoComplete="name"
                      autoFocus
                      required
                      minLength={2}
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="student-email" className="mb-2 block text-sm font-semibold text-slate-800">Account email</label>
                    <input
                      id="student-email"
                      readOnly
                      value={profile?.email || ''}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="student-phone" className="mb-2 block text-sm font-semibold text-slate-800">
                      Phone or WhatsApp <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="student-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5 animate-enter-soft">
                  <div>
                    <label htmlFor="student-college" className="mb-2 block text-sm font-semibold text-slate-800">College or institute</label>
                    <input
                      id="student-college"
                      autoFocus
                      required
                      value={college}
                      onChange={(event) => setCollege(event.target.value)}
                      placeholder="Enter your college or institute"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="student-department" className="mb-2 block text-sm font-semibold text-slate-800">Branch or department</label>
                    <select
                      id="student-department"
                      required
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="" disabled>Select your branch</option>
                      {ECE_DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="student-year" className="mb-2 block text-sm font-semibold text-slate-800">Current study year</label>
                    <select
                      id="student-year"
                      required
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="" disabled>Select your current year</option>
                      {COLLEGE_YEARS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-enter-soft">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Pick at least one topic so your workspace can highlight relevant projects and learning resources.
                  </p>
                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SKILL_INTERESTS.map((interest) => {
                      const selected = selectedInterests.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          aria-pressed={selected}
                          onClick={() => toggleInterest(interest)}
                          className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition ${
                            selected
                              ? 'border-orange-300 bg-orange-50 text-orange-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/50'
                          }`}
                        >
                          {interest}
                          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 text-transparent'}`}>
                            <Check className="h-3 w-3" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">{selectedInterests.length} selected</p>
                </div>
              )}

              <div className="mt-auto flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => { setSaveError(null); setStep((current) => current - 1); }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <span className="hidden text-xs text-slate-400 sm:block">You can update these details later in your profile.</span>
                )}
                <button
                  type="submit"
                  disabled={!stepValid || submitting}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-w-44"
                >
                  {submitting ? (
                    <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving details…</>
                  ) : step === steps.length - 1 ? (
                    <>Finish setup <Check className="h-4 w-4" /></>
                  ) : (
                    <>Continue <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
                Your profile details help personalize your student experience. See our{' '}
                <Link to="/policies/privacy" target="_blank" className="font-semibold text-orange-700 underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
