import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Project } from '../../types';
import { 
  Cpu, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  Package, 
  FileText 
} from 'lucide-react';

export const AdminProjects: React.FC = () => {
  const { projects, saveProject, deleteProject } = useData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<Partial<Project> | null>(null);

  const handleCreateNew = () => {
    setEditingProj({
      title: '',
      description: '',
      images: ['/projects/ece1.jpg'],
      price: 1499,
      type: 'physical',
      stock: 20,
      skillIds: ['Embedded C', 'PCB Design'],
      status: 'published',
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj) return;
    await saveProject(editingProj);
    setIsFormOpen(false);
    setEditingProj(null);
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-950">Lab Projects Catalog (42 Projects)</h1>
          <p className="text-xs text-slate-500">Manage verified ECE lab projects, documentation, and pricing.</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Package</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
        {projects.map((proj) => (
          <div key={proj.id} className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-stone-200 space-y-2.5 sm:space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-2 sm:space-y-3">
              <div className="h-24 sm:h-40 rounded-lg sm:rounded-xl overflow-hidden bg-stone-100 relative">
                <img 
                  src={proj.images[0]} 
                  alt={proj.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    const idNum = parseInt(proj.id.replace(/\D/g, '') || '1', 10);
                    const safeNum = Math.min(Math.max(idNum, 1), 42);
                    const fallback = `/projects/ece${safeNum}.png`;
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />
                <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase bg-white/90 text-orange-700 border border-orange-200">
                  {proj.type}
                </span>
                <span className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono ${
                  proj.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-slate-600'
                }`}>
                  {proj.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-950 line-clamp-1">{proj.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5 sm:mt-1 hidden sm:block">{proj.description}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
              <span className="text-xs sm:text-base font-bold font-mono text-orange-600">
                ₹{proj.price.toLocaleString('en-IN')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingProj(proj);
                    setIsFormOpen(true);
                  }}
                  className="p-1 sm:p-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                  title="Edit"
                >
                  <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={() => deleteProject(proj.id)}
                  className="p-1 sm:p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isFormOpen && editingProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-orange-200 rounded-2xl p-6 shadow-2xl my-8 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-mono font-bold text-slate-950">
                {editingProj.id ? 'Edit Project Package' : 'New Project Package'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={editingProj.title}
                  onChange={(e) => setEditingProj({ ...editingProj, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProj.price}
                    onChange={(e) => setEditingProj({ ...editingProj, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Type *</label>
                  <select
                    value={editingProj.type}
                    onChange={(e) => setEditingProj({ ...editingProj, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="physical">Physical Kit</option>
                    <option value="digital">Digital Package</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status</label>
                  <select
                    value={editingProj.status}
                    onChange={(e) => setEditingProj({ ...editingProj, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {editingProj.type === 'physical' ? (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Units in Stock</label>
                  <input
                    type="number"
                    value={editingProj.stock}
                    onChange={(e) => setEditingProj({ ...editingProj, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Digital Download File URL</label>
                  <input
                    type="text"
                    placeholder="/api/downloads/bundle.zip"
                    value={editingProj.files?.[0]?.url || ''}
                    onChange={(e) => setEditingProj({
                      ...editingProj,
                      files: [{ name: 'bundle.zip', url: e.target.value, size: '25 MB' }]
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingProj.images?.[0] || ''}
                  onChange={(e) => setEditingProj({ ...editingProj, images: [e.target.value] })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingProj.description}
                  onChange={(e) => setEditingProj({ ...editingProj, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
              >
                Save Project Package
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
