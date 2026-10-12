import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  PackageCheck,
  Plus,
  Sparkles,
  Upload,
} from 'lucide-react';
import { CertificateUploadModal } from '../components/modals/CertificateUploadModal';

export const StudentDashboardPage: React.FC = () => {
  const {
    applications,
    orders,
    learningPaths,
    updateApplicationStatus,
  } = useData();
  const { user, profile, loading } = useAuth();
  const [activeCertAppId, setActiveCertAppId] = useState<string | null>(null);

  const appliedCount = applications.filter((application) => application.status === 'applied').length;
  const shortlistedCount = applications.filter((application) => application.status === 'shortlisted').length;
  const completedCount = applications.filter((application) => application.status === 'completed').length;
  const firstName = profile?.displayName?.trim().split(/\s+/)[0] || 'Student';

  const summaryCards = [
    { label: 'Applications', value: applications.length, icon: BriefcaseBusiness, note: 'Roles you are tracking' },
    { label: 'In progress', value: appliedCount + shortlistedCount, icon: Clock3, note: 'Applications underway' },
    { label: 'Completed', value: completedCount, icon: Award, note: 'Learning milestones' },
    { label: 'Project orders', value: orders.length, icon: PackageCheck, note: 'Your purchases' },
  ];

  const stages = ['saved', 'applied', 'shortlisted', 'completed'];
  const stageLabels = ['Saved', 'Applied', 'Shortlisted', 'Completed'];

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#fffaf5]">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
          Loading your student workspace…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#fffaf5] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm sm:p-8 lg:p-10 animate-enter-soft">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-56 w-56 rounded-full bg-amber-50 blur-3xl" />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800">
                <Sparkles className="h-3.5 w-3.5" />
                Your student workspace
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back, <span className="text-orange-600">{firstName}.</span>
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Your learning, applications, and project activity — together in one place.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">
                {profile?.college && (
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-orange-600" /> {profile.college}
                  </span>
                )}
                {(profile?.department || profile?.year) && (
                  <span>{[profile.department, profile.year].filter(Boolean).join(' · ')}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/profile" className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50">
                <CircleUserRound className="h-4 w-4 text-orange-600" />
                Edit student profile
              </Link>
              <Link to="/explore" className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700">
                Find opportunities <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-label="Student activity overview" className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4">
          {summaryCards.map(({ label, value, icon: Icon, note }, index) => (
            <article key={label} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 sm:text-sm">{label}</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
              <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{note}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 border-b border-orange-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">Keep moving forward</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Application activity</h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">Follow each opportunity from saved to completed.</p>
              </div>
              <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-800">
                Browse roles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="my-5 rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-5 py-9 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-orange-600 shadow-sm">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">Your first opportunity is waiting</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">Explore internships, training programs, and hackathons, then add your applications here.</p>
                <Link to="/explore" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">
                  Explore opportunities <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-orange-50">
                {applications.map((application) => {
                  const currentStep = stages.indexOf(application.status);
                  return (
                    <article key={application.id} className="py-5 first:pt-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">
                            {application.opportunity?.type || 'Opportunity'}{application.opportunity?.companyName ? ` · ${application.opportunity.companyName}` : ''}
                          </p>
                          <h3 className="mt-1 text-base font-bold text-slate-950">{application.opportunity?.title || 'Engineering opportunity'}</h3>
                          <p className="mt-1 text-xs text-slate-500">{application.opportunity?.location || 'Location not specified'}</p>
                        </div>
                        <span className="inline-flex w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-800">
                          {application.status}
                        </span>
                      </div>

                      <ol aria-label="Application progress" className="mt-4 grid grid-cols-4 gap-2">
                        {stageLabels.map((stage, index) => (
                          <li key={stage} className="min-w-0">
                            <div className={`h-1.5 rounded-full ${index <= currentStep ? 'bg-orange-500' : 'bg-orange-100'}`} />
                            <span className={`mt-1.5 block truncate text-[10px] sm:text-xs ${index <= currentStep ? 'font-semibold text-orange-800' : 'text-slate-400'}`}>{stage}</span>
                          </li>
                        ))}
                      </ol>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {application.status === 'saved' && (
                          <button onClick={() => updateApplicationStatus(application.id, 'applied')} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700">
                            <Check className="h-3.5 w-3.5" /> Mark as applied
                          </button>
                        )}
                        {application.status === 'applied' && (
                          <button onClick={() => updateApplicationStatus(application.id, 'shortlisted')} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-800 hover:bg-orange-50">
                            <Check className="h-3.5 w-3.5" /> Mark shortlisted
                          </button>
                        )}
                        {(application.status === 'shortlisted' || application.status === 'applied') && (
                          <button onClick={() => updateApplicationStatus(application.id, 'completed')} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-800 hover:bg-orange-50">
                            <Check className="h-3.5 w-3.5" /> Mark completed
                          </button>
                        )}
                        {application.status === 'completed' && !application.certificateUrl && (
                          <button onClick={() => setActiveCertAppId(application.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800 hover:bg-orange-100">
                            <Upload className="h-3.5 w-3.5" /> Upload certificate
                          </button>
                        )}
                        {application.certificateUrl && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-800"><Check className="h-4 w-4" /> Certificate submitted</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-700"><Layers3 className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Your learning</p>
                  <h2 className="text-lg font-bold text-slate-950">Learning paths</h2>
                </div>
              </div>
              {learningPaths.length === 0 ? (
                <div className="mt-4 rounded-xl bg-[#fffaf5] p-4">
                  <p className="text-sm font-semibold text-slate-800">Choose a topic to get started</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Find curated notes, guides, and learning tracks in the resource hub.</p>
                  <Link to="/explore?tab=resources" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-700">Explore resources <ChevronRight className="h-4 w-4" /></Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {learningPaths.slice(0, 3).map((path) => (
                    <Link key={path.id} to="/explore?tab=resources" className="group flex items-start justify-between gap-3 rounded-xl border border-orange-100 p-3 transition hover:bg-orange-50/60">
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-700">{path.level} track</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-900">{path.title}</span>
                        <span className="mt-1 block text-xs text-slate-500">{path.resourceIds.length} learning resources</span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-orange-600 transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              )}
              <Link to="/explore?tab=resources" className="mt-4 flex items-center justify-between rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" /> Browse learning resources</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-700"><PackageCheck className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Project store</p>
                  <h2 className="text-lg font-bold text-slate-950">Recent orders</h2>
                </div>
              </div>
              {orders.length === 0 ? (
                <p className="mt-4 rounded-xl bg-[#fffaf5] p-4 text-sm leading-relaxed text-slate-600">Your project orders will appear here after checkout.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="rounded-xl border border-orange-100 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{order.items.map((item) => item.title).join(', ')}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{order.status} · {order.id}</p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-orange-700">₹{order.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={`/payment/return?order_id=${order.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-700">View receipt <ChevronRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/projects" className="mt-4 flex items-center justify-between rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-800 transition hover:bg-orange-50">
                <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Browse ready-made projects</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700"><FileText className="h-5 w-5" /></span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your profile helps us personalize your workspace</h2>
              <p className="mt-0.5 text-xs text-slate-500">Update your academic details and interests whenever they change.</p>
            </div>
          </div>
          <Link to="/profile" className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-800">
            Update details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <CertificateUploadModal
        applicationId={activeCertAppId}
        isOpen={!!activeCertAppId}
        onClose={() => setActiveCertAppId(null)}
      />
    </div>
  );
};
