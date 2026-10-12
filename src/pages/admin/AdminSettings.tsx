import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Database
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { purgeAllMockData } = useData();

  const [purging, setPurging] = useState(false);
  const [purgeDone, setPurgeDone] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handlePurgeMock = async () => {
    if (!window.confirm('Delete all test/mock data from Firestore to ensure only genuine client records remain?')) return;
    setPurging(true);
    try {
      await purgeAllMockData();
      setPurgeDone(true);
      setRequestError(null);
      setTimeout(() => setPurgeDone(false), 3000);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Could not purge mock data.');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 max-w-4xl">
      {requestError && <div role="alert" className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">{requestError}</div>}
      
      <div>
        <h1 className="text-xl font-bold font-mono text-slate-950">System Config & Administration</h1>
        <p className="text-xs text-slate-500">Review administrator access and manage platform data.</p>
      </div>

      {/* 2. ADMIN ACCESS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 space-y-3 text-xs shadow-xs">
        <h2 className="text-sm font-mono font-bold text-slate-950 flex items-center gap-2 border-b border-stone-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          Firebase administrator access
        </h2>
        <p className="text-slate-600">
          Signed in as <strong className="font-mono text-slate-900">{user?.email || 'Administrator'}</strong>. Admin access is granted only by a trusted Firebase administrator membership record and enforced by Firestore Security Rules.
        </p>
      </div>

      {/* 3. DATABASE PURGE & CLIENT PREPARATION */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 text-xs shadow-xs">
        <h2 className="text-sm font-mono font-bold text-slate-950 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Database className="w-4 h-4 text-orange-600" />
          Client Data Integrity & Mock Data Purge
        </h2>

        <p className="text-slate-500">
          Removes all sample mock internships, placeholder resources, and test partner companies from Firestore, ensuring only genuine data and the 42 official lab project packages remain.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePurgeMock}
            disabled={purging}
            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-orange-600 ${purging ? 'animate-spin' : ''}`} />
            <span>{purging ? 'Purging mock data from Firestore...' : 'Purge All Mock Data'}</span>
          </button>

          {purgeDone && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> All mock data purged successfully!
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
