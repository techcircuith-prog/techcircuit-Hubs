import React from 'react';

export const OscilloscopeLoader: React.FC<{ message?: string }> = ({ message = 'Synthesizing circuit traces...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      {/* High-tech waveform box (White & Orange) */}
      <div className="relative w-48 h-16 bg-white rounded-xl border border-orange-200 overflow-hidden flex items-center justify-center shadow-md shadow-orange-500/10">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f9731615_1px,transparent_1px),linear-gradient(to_bottom,#f9731615_1px,transparent_1px)] bg-[size:12px_12px]" />
        
        {/* Animated wave SVG in vibrant orange */}
        <svg className="w-full h-12 text-orange-500 stroke-current fill-none stroke-[2.5] drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" viewBox="0 0 200 40">
          <path d="M0,20 Q25,5 50,20 T100,20 T150,20 T200,20">
            <animate attributeName="d" 
              dur="1.2s" 
              repeatCount="indefinite" 
              values="
                M0,20 Q25,5 50,20 T100,20 T150,20 T200,20;
                M0,20 Q25,35 50,20 T100,20 T150,20 T200,20;
                M0,20 Q25,5 50,20 T100,20 T150,20 T200,20
              "
            />
          </path>
        </svg>

        {/* Scan line */}
        <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent animate-signal-scan" />
      </div>

      <p className="text-xs font-mono text-orange-600 font-semibold tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping inline-block" />
        {message}
      </p>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-5 border border-orange-100 animate-pulse space-y-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-orange-100" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-orange-100 rounded-full" />
        <div className="h-6 w-16 bg-orange-100 rounded-full" />
      </div>
    </div>
  );
};
