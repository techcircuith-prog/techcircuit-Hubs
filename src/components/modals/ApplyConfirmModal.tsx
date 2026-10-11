import React from 'react';
import { Opportunity } from '../../types';
import { CheckCircle2, X, ExternalLink, Zap } from 'lucide-react';

interface ApplyConfirmModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApplied: () => void;
}

export const ApplyConfirmModal: React.FC<ApplyConfirmModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onConfirmApplied,
}) => {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white border border-orange-200 rounded-2xl shadow-2xl p-6 text-slate-900">
        
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-950 mb-1 font-mono">Application In Progress</h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          You were redirected to apply for <span className="font-semibold text-orange-600">{opportunity.title}</span> at {opportunity.companyName}.
        </p>

        <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-100 text-xs mb-5">
          <span className="font-semibold text-orange-800 block mb-0.5">Did you submit your application?</span>
          <p className="text-slate-600 text-[11px]">
            Confirming will add this to your Application Tracker and award you <span className="text-orange-600 font-bold">+10 points</span> per relevant skill.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            Not yet
          </button>
          <button
            onClick={() => {
              onConfirmApplied();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes, Applied!</span>
          </button>
        </div>

      </div>
    </div>
  );
};
