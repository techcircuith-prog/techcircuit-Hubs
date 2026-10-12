import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { 
  Users, 
  Search, 
  Download, 
  ExternalLink, 
  X, 
  Award, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDocs(collection(db, 'users'));
      setStudents(result.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      } as UserProfile)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load student profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const filtered = students.filter((s) => {
    if (selectedCollege !== 'All' && s.college !== selectedCollege) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.displayName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.college && s.college.toLowerCase().includes(q))
    );
  });

  const exportToCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'College', 'Department', 'Year', 'Phone', 'Created At'];
    const rows = filtered.map((s) => [
      s.id,
      `"${s.displayName}"`,
      s.email,
      `"${s.college || ''}"`,
      `"${s.department || ''}"`,
      s.year || '',
      s.phone || '',
      s.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-950">Engineering Students Roster</h1>
          <p className="text-xs text-slate-500">Total registered profiles: {error ? 'Unavailable' : students.length}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadStudents()}
            disabled={loading}
            className="px-3 py-2 bg-white hover:bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={exportToCsv}
            disabled={Boolean(error)}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-orange-600" />
            <span>Export Students to CSV</span>
          </button>
        </div>
      </div>
      {error && <div role="alert" className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">{error}</div>}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, email, or campus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 outline-none focus:border-orange-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-stone-100">
          {loading ? <p className="p-5 text-xs text-slate-500">Loading student profiles…</p> : error ? (
            <p className="p-5 text-xs text-orange-800">Student roster is unavailable until Firebase server access is configured.</p>
          ) : filtered.length === 0 ? (
            <p className="p-5 text-xs text-slate-500">No students match this search.</p>
          ) : filtered.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedStudent(st)}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-orange-50/30 transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-950 font-mono">{st.displayName}</span>
                  <span className="text-[10px] font-mono text-slate-500">({st.email})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-50 text-orange-700 border border-orange-200">
                    {st.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {st.college || 'College Pending'} · {st.department || 'ECE'} ({st.year || 'N/A'})
                </p>
              </div>

              <div className="text-[11px] font-mono text-slate-500">
                Joined: {new Date(st.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-orange-200 rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-mono font-bold text-slate-950">Student Audit Profile</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">UID:</span>
                <span className="font-mono text-slate-700 truncate max-w-[200px]">{selectedStudent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-950">{selectedStudent.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">College:</span>
                <span className="text-orange-700 font-semibold">{selectedStudent.college || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-700">{selectedStudent.department || 'ECE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Year of Study:</span>
                <span className="text-slate-700">{selectedStudent.year || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-700">{selectedStudent.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-mono text-slate-500 block mb-1.5 font-semibold">Registered Interests:</span>
              <div className="flex flex-wrap gap-1">
                {(selectedStudent.interests || []).map((interest, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-[10px] text-orange-700 font-mono">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
