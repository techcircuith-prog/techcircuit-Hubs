import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Opportunity } from '../types';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { ApplyConfirmModal } from '../components/modals/ApplyConfirmModal';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportunities, savedItemIds, toggleSaveItem, recordApplyClick, confirmApplied } = useData();
  const { user, login } = useAuth();

  const opp = useMemo(() => opportunities.find((o) => o.id === id) || null, [id, opportunities]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const daysRemaining = useMemo(() => {
    if (!opp) return 0;
    const diff = new Date(opp.deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [opp]);

  if (!opp) {
    return (
      <div className="min-h-screen bg-pcb-grid flex flex-col items-center justify-center p-6 text-slate-800">
        <p className="text-sm text-slate-500 mb-4">Opportunity not found or expired.</p>
        <Link to="/explore" className="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors">
          Return to Explore
        </Link>
      </div>
    );
  }

  const isSaved = savedItemIds.includes(opp.id);

  const handleApplyClick = async () => {
    if (!user) {
      await login();
      return;
    }

    // 1. Record apply click
    await recordApplyClick(opp);

    // 2. Open external apply link
    window.open(opp.applyLink, '_blank', 'noopener,noreferrer');

    // 3. Prompt return modal
    setShowApplyModal(true);
  };

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-4xl mx-auto">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </button>

      {/* Main Opportunity Card */}
      <div className="chip-border bg-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm border border-orange-100">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
              {opp.companyLogo ? (
                <img src={opp.companyLogo} alt={opp.companyName} className="w-full h-full object-cover" />
              ) : (
                <Briefcase className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-wider ${
                  opp.type === 'internship' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {opp.type}
                </span>
                <span className="text-xs font-mono text-slate-500">📍 {opp.location} ({opp.mode})</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">
                {opp.title}
              </h1>
              <p className="text-sm font-semibold text-orange-600">{opp.companyName}</p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => toggleSaveItem(opp.id, 'opportunity')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-orange-100 text-orange-600 border-orange-300'
                : 'bg-stone-50 text-slate-400 border-stone-200 hover:text-orange-600 hover:border-orange-200'
            }`}
            title="Save to bookmarks"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Stipend / Prize</span>
            <span className="font-bold text-orange-600 text-sm">{opp.stipendOrFee}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Application Deadline</span>
            <span className="font-semibold text-slate-800">{opp.deadline}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Status</span>
            <span className="inline-flex items-center gap-1 font-mono text-amber-600 font-semibold text-xs">
              <Clock className="w-3.5 h-3.5" /> {daysRemaining} days remaining
            </span>
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider mb-2.5">
            Tagged ECE / VLSI Competencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {opp.skillIds.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-orange-700 flex items-center gap-1.5 font-medium"
              >
                <Zap className="w-3 h-3 text-orange-500" />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
            Role Overview & Requirements
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {opp.description}
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>Verified employer listing · Direct official portal redirect</span>
          </div>

          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>Apply on Company Portal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ApplyConfirmModal
        opportunity={opp}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onConfirmApplied={() => confirmApplied(opp.id)}
      />

    </div>
  );
};
