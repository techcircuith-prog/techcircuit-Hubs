import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ScoringConfig } from '../../types';
import { 
  Settings, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Save, 
  Database, 
  Sparkles 
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { scoringConfig, updateScoringConfig, purgeAllMockData } = useData();

  const [config, setConfig] = useState<ScoringConfig>(scoringConfig);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeDone, setPurgeDone] = useState(false);

  useEffect(() => {
    fetch('/api/admin/list', {
      headers: { 'x-user-email': user?.email || '' },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.adminEmails) setAdminEmails(d.adminEmails);
      })
      .catch(() => {});
  }, [user?.email]);

  const handleSaveScoring = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateScoringConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    try {
      const res = await fetch('/api/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({ email: newAdminEmail }),
      });
      const data = await res.json();
      if (data.adminEmails) setAdminEmails(data.adminEmails);
      setNewAdminEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    try {
      const res = await fetch('/api/admin/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.adminEmails) setAdminEmails(data.adminEmails);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurgeMock = async () => {
    if (!window.confirm('Delete all test/mock data from Firestore to ensure only genuine client records remain?')) return;
    setPurging(true);
    try {
      await purgeAllMockData();
      setPurgeDone(true);
      setTimeout(() => setPurgeDone(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 max-w-4xl">
      
      <div>
        <h1 className="text-xl font-bold font-mono text-slate-950">System Config & Administration</h1>
        <p className="text-xs text-slate-500">Configure skill rules, manage operator emails, and sync databases.</p>
      </div>

      {/* 1. SCORING CONFIG EDITOR */}
      <form onSubmit={handleSaveScoring} className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-mono font-bold text-slate-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Skill XP Scoring Configuration
          </h2>
          {saveSuccess && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Config Updated
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Applied to Role (XP)</label>
            <input
              type="number"
              value={config.applied}
              onChange={(e) => setConfig({ ...config, applied: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Shortlisted (XP)</label>
            <input
              type="number"
              value={config.shortlisted}
              onChange={(e) => setConfig({ ...config, shortlisted: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Completed Lab/Role (XP)</label>
            <input
              type="number"
              value={config.completed}
              onChange={(e) => setConfig({ ...config, completed: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Certificate Uploaded (XP)</label>
            <input
              type="number"
              value={config.certificateUploaded}
              onChange={(e) => setConfig({ ...config, certificateUploaded: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Resource Finished (XP)</label>
            <input
              type="number"
              value={config.resourceCompleted}
              onChange={(e) => setConfig({ ...config, resourceCompleted: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Daily Resource Cap</label>
            <input
              type="number"
              value={config.dailyResourceCap}
              onChange={(e) => setConfig({ ...config, dailyResourceCap: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
        >
          <Save className="w-4 h-4" />
          <span>Save Scoring Rules</span>
        </button>
      </form>

      {/* 2. ADMIN ROSTER MANAGEMENT */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 text-xs shadow-xs">
        <h2 className="text-sm font-mono font-bold text-slate-950 flex items-center gap-2 border-b border-stone-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          Administrator Accounts Access
        </h2>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="operator@techcircuithub.com"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleAddAdmin}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant Admin</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {adminEmails.map((email) => (
            <div key={email} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200">
              <span className="font-mono text-slate-700">{email}</span>
              {email !== 'rock86367@gmail.com' ? (
                <button
                  type="button"
                  onClick={() => handleRemoveAdmin(email)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-[10px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase font-bold">Root Admin</span>
              )}
            </div>
          ))}
        </div>
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
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-rose-600 ${purging ? 'animate-spin' : ''}`} />
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
