import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Opportunity, Company } from '../../types';
import { 
  Briefcase, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Upload, 
  Check, 
  X, 
  Search, 
  ExternalLink 
} from 'lucide-react';

export const AdminOpportunities: React.FC = () => {
  const { opportunities, companies, skills, saveOpportunity, deleteOpportunity, saveCompany } = useData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Partial<Opportunity> | null>(null);
  const [search, setSearch] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');

  const filtered = opportunities.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.title.toLowerCase().includes(q) || o.companyName.toLowerCase().includes(q);
  });

  const handleCreateNew = () => {
    setEditingOpp({
      type: 'internship',
      title: '',
      companyId: companies[0]?.id || '',
      companyName: companies[0]?.name || '',
      description: '',
      skillIds: ['Embedded C', 'VLSI'],
      location: '',
      mode: 'On-site',
      stipendOrFee: '',
      deadline: '',
      applyLink: 'https://',
      status: 'published',
    });
    setIsFormOpen(true);
  };

  const handleDuplicate = async (opp: Opportunity) => {
    const clone: Partial<Opportunity> = {
      ...opp,
      id: undefined,
      title: `${opp.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    await saveOpportunity(clone);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;
    await saveOpportunity(editingOpp);
    setIsFormOpen(false);
    setEditingOpp(null);
  };

  const handleAddNewCompanyInline = async () => {
    if (!newCompanyName.trim()) return;
    const id = newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await saveCompany({
      id,
      name: newCompanyName.trim(),
      website: 'https://',
    });
    if (editingOpp) {
      setEditingOpp({
        ...editingOpp,
        companyId: id,
        companyName: newCompanyName.trim(),
      });
    }
    setNewCompanyName('');
  };

  const handleCsvBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 4) {
          await saveOpportunity({
            type: (parts[0]?.trim() as any) || 'internship',
            title: parts[1]?.trim() || 'Role Title',
            companyName: parts[2]?.trim() || 'Company',
            stipendOrFee: parts[3]?.trim() || 'Competitive',
            skillIds: ['Embedded C', 'VLSI'],
            location: 'India',
            mode: 'Remote',
            deadline: '2026-12-31',
            applyLink: 'https://',
            status: 'published',
            description: 'Imported via CSV bulk runner.',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-950">Opportunities Directory</h1>
          <p className="text-xs text-slate-500">Manage internships, industrial trainings, and hackathons.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Bulk Import</span>
            <input type="file" accept=".csv" onChange={handleCsvBulkImport} className="hidden" />
          </label>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter opportunities by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 outline-none focus:border-orange-500 shadow-2xs"
        />
      </div>

      {/* Opportunity List (Mobile cards, desktop table) */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-stone-100">
          {filtered.map((opp) => (
            <div key={opp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    opp.type === 'internship' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {opp.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    opp.status === 'published' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-600 bg-stone-100'
                  }`}>
                    {opp.status}
                  </span>
                  <span className="text-xs text-slate-500">Deadline: {opp.deadline}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-950">{opp.title}</h3>
                <p className="text-xs text-slate-500">{opp.companyName} · {opp.location} ({opp.mode}) · {opp.stipendOrFee}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleDuplicate(opp)}
                  className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-slate-600 border border-stone-200 transition-colors"
                  title="Duplicate as draft"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingOpp(opp);
                    setIsFormOpen(true);
                  }}
                  className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteOpportunity(opp.id)}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Modal Form */}
      {isFormOpen && editingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-orange-200 rounded-2xl p-6 shadow-2xl my-8 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-mono font-bold text-slate-950">
                {editingOpp.id ? 'Edit Opportunity' : 'New Opportunity'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Type *</label>
                  <select
                    value={editingOpp.type}
                    onChange={(e) => setEditingOpp({ ...editingOpp, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="internship">Internship</option>
                    <option value="training">Training</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status *</label>
                  <select
                    value={editingOpp.status}
                    onChange={(e) => setEditingOpp({ ...editingOpp, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingOpp.title}
                  onChange={(e) => setEditingOpp({ ...editingOpp, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              {/* Company Picker + Inline Create */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Company *</label>
                <div className="flex gap-2">
                  <select
                    value={editingOpp.companyName}
                    onChange={(e) => {
                      const c = companies.find((comp) => comp.name === e.target.value);
                      setEditingOpp({
                        ...editingOpp,
                        companyName: e.target.value,
                        companyId: c?.id || 'ti',
                      });
                    }}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Inline new company */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Or type new company name..."
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-slate-800 text-xs outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCompanyInline}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Add Company
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={editingOpp.location}
                    onChange={(e) => setEditingOpp({ ...editingOpp, location: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mode</label>
                  <select
                    value={editingOpp.mode}
                    onChange={(e) => setEditingOpp({ ...editingOpp, mode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={editingOpp.deadline}
                    onChange={(e) => setEditingOpp({ ...editingOpp, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Stipend or Fee</label>
                <input
                  type="text"
                  value={editingOpp.stipendOrFee}
                  onChange={(e) => setEditingOpp({ ...editingOpp, stipendOrFee: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Apply Link (External)</label>
                <input
                  type="url"
                  required
                  value={editingOpp.applyLink}
                  onChange={(e) => setEditingOpp({ ...editingOpp, applyLink: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingOpp.description}
                  onChange={(e) => setEditingOpp({ ...editingOpp, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
              >
                Save Opportunity
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
