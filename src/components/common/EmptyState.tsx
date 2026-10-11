import React from 'react';
import { Cpu, Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'cpu' | 'search' | 'sparkles';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Circuit Data Found',
  description = 'No signals matching your current filter criteria.',
  actionText,
  onAction,
  icon = 'cpu',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-orange-200 my-6 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-4 text-orange-600 shadow-inner">
        {icon === 'cpu' && <Cpu className="w-8 h-8 text-orange-600" />}
        {icon === 'search' && <Search className="w-8 h-8 text-orange-500" />}
        {icon === 'sparkles' && <Sparkles className="w-8 h-8 text-amber-500" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 rounded-lg text-sm font-semibold transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
