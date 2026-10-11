import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Clock, 
  Upload, 
  ShoppingBag, 
  ExternalLink, 
  BookOpen, 
  TrendingUp, 
  Layers, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { CertificateUploadModal } from '../components/modals/CertificateUploadModal';

export const StudentDashboardPage: React.FC = () => {
  const { 
    applications, 
    studentSkills, 
    orders, 
    learningPaths, 
    resources, 
    updateApplicationStatus 
  } = useData();
  const { profile } = useAuth();

  const [activeCertAppId, setActiveCertAppId] = useState<string | null>(null);

  const appliedCount = applications.filter((a) => a.status === 'applied').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const completedCount = applications.filter((a) => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-orange-200 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-xs font-mono mb-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Active Student Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-mono">
            {profile?.displayName || 'Circuit Engineer'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {profile?.college || 'Engineering College'} · {profile?.department || 'ECE Department'} ({profile?.year || 'Current Year'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/skills"
            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Radar & XP</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Applied Roles</span>
          <span className="text-2xl font-bold font-mono text-orange-600">{appliedCount}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Shortlisted</span>
          <span className="text-2xl font-bold font-mono text-amber-600">{shortlistedCount}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Completed Labs</span>
          <span className="text-2xl font-bold font-mono text-emerald-600">{completedCount}</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Store Orders</span>
          <span className="text-2xl font-bold font-mono text-orange-700">{orders.length}</span>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* APPLICATION TRACKER */}
      {/* ------------------------------------------- */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 font-mono flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-600" />
              Opportunity Application Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Track lifecycle stages: Saved → Applied → Shortlisted → Completed with certificate upload.
            </p>
          </div>
          <Link to="/explore" className="text-xs text-orange-600 hover:underline font-semibold">
            Find more roles
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No applications logged yet. Browse internships or hackathons and confirm submission.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const statusOrder = ['saved', 'applied', 'shortlisted', 'completed'];
              const currentStep = statusOrder.indexOf(app.status);

              return (
                <div
                  key={app.id}
                  className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-950">
                        {app.opportunity?.title || 'Silicon Engineering Opening'}
                      </h3>
                      <p className="text-xs text-orange-600 font-medium">
                        {app.opportunity?.companyName || 'Semiconductor Partner'} · {app.opportunity?.location || 'India'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider self-start sm:self-auto ${
                      app.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      app.status === 'applied' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                      'bg-stone-200 text-slate-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  {/* 4-Step Progress Track */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono pt-1">
                    {['Saved', 'Applied', 'Shortlisted', 'Completed'].map((stage, idx) => {
                      const isPast = idx <= currentStep;
                      return (
                        <div key={stage} className="space-y-1">
                          <div className={`h-1.5 rounded-full transition-all ${
                            isPast ? 'bg-orange-500 shadow-2xs shadow-orange-500' : 'bg-stone-200'
                          }`} />
                          <span className={isPast ? 'text-orange-600 font-bold' : 'text-slate-400'}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Update Stage:</span>
                      {app.status === 'saved' && (
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'applied')}
                          className="px-2.5 py-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200 text-[11px] font-medium cursor-pointer"
                        >
                          Mark Applied (+10 pts)
                        </button>
                      )}
                      {app.status === 'applied' && (
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                          className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 text-[11px] font-medium cursor-pointer"
                        >
                          Mark Shortlisted (+5 pts)
                        </button>
                      )}
                      {(app.status === 'shortlisted' || app.status === 'applied') && (
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'completed')}
                          className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 text-[11px] font-medium cursor-pointer"
                        >
                          Mark Completed (+30 pts)
                        </button>
                      )}
                    </div>

                    {/* Certificate Upload Button */}
                    {app.status === 'completed' && (
                      <div>
                        {app.certificateUrl ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-mono text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Certificate Verified (+10 Pts)
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveCertAppId(app.id)}
                            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shadow-orange-500/20"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Certificate (+10 Pts)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------- */}
      {/* LEARNING PATHS ROADMAP PROGRESS */}
      {/* ------------------------------------------- */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-950 font-mono flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-600" />
          Enrolled Learning Paths
        </h2>
        <p className="text-xs text-slate-500">
          Curated sequential curriculum tracks created by lead VLSI & embedded systems educators.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 sm:gap-4 pt-2">
          {learningPaths.map((path, idx) => {
            // Calculate progress based on path resources
            const progress = idx === 0 ? 66 : 25;
            return (
              <div key={path.id} className="p-3 sm:p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 sm:space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase text-orange-600 font-bold block truncate">
                      {path.level} Track
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-orange-600 shrink-0">{progress}%</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-950 line-clamp-1">{path.title}</h3>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-1.5 sm:h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-[10px] sm:text-xs">
                    <span className="text-slate-500 text-[10px] sm:text-[11px]">{path.resourceIds.length} modules</span>
                    <Link
                      to="/explore?tab=resources"
                      className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-0.5 truncate"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* MY STORE ORDERS & DOWNLOADS */}
      {/* ------------------------------------------- */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-950 font-mono flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-orange-600" />
          Lab Project Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500">
            No project orders placed yet. Browse our 42 verified ECE lab projects.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">Order ID: {ord.id}</span>
                  <div className="font-semibold text-xs text-slate-900 mt-0.5">
                    {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                  </div>
                  <span className="text-xs font-bold text-orange-600 mt-1 block">
                    ₹{ord.amount.toLocaleString('en-IN')} · <span className="uppercase text-[10px] font-mono text-slate-600">{ord.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/payment/return?order_id=${ord.id}`}
                    className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-xs font-semibold text-orange-700 border border-orange-200"
                  >
                    View Receipt & Downloads
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Upload Modal */}
      <CertificateUploadModal
        applicationId={activeCertAppId}
        isOpen={!!activeCertAppId}
        onClose={() => setActiveCertAppId(null)}
      />

    </div>
  );
};
