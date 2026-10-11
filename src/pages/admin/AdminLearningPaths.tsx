import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { LearningPath } from '../../types';
import { 
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  BookOpen 
} from 'lucide-react';

export const AdminLearningPaths: React.FC = () => {
  const { learningPaths, resources, saveLearningPath, deleteLearningPath } = useData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<Partial<LearningPath> | null>(null);

  const handleCreateNew = () => {
    setEditingPath({
      title: '',
      level: 'beginner',
      description: '',
      resourceIds: resources.slice(0, 3).map((r) => r.id),
      status: 'published',
    });
    setIsFormOpen(true);
  };

  const moveResource = (idx: number, direction: 'up' | 'down') => {
    if (!editingPath?.resourceIds) return;
    const ids = [...editingPath.resourceIds];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    const temp = ids[idx];
    ids[idx] = ids[targetIdx];
    ids[targetIdx] = temp;
    setEditingPath({ ...editingPath, resourceIds: ids });
  };

  const removeResourceFromPath = (id: string) => {
    if (!editingPath?.resourceIds) return;
    setEditingPath({
      ...editingPath,
      resourceIds: editingPath.resourceIds.filter((rid) => rid !== id),
    });
  };

  const addResourceToPath = (id: string) => {
    if (!editingPath?.resourceIds) return;
    if (editingPath.resourceIds.includes(id)) return;
    setEditingPath({
      ...editingPath,
      resourceIds: [...editingPath.resourceIds, id],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPath) return;
    await saveLearningPath(editingPath);
    setIsFormOpen(false);
    setEditingPath(null);
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-950">Curriculum Learning Paths</h1>
          <p className="text-xs text-slate-500">Assemble structured sequential syllabi for ECE & VLSI tracks.</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Learning Path</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 sm:gap-5">
        {learningPaths.map((path) => (
          <div key={path.id} className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-stone-200 space-y-3 sm:space-y-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase bg-orange-50 text-orange-700 border border-orange-200 truncate inline-block">
                  {path.level}
                </span>
                <h3 className="text-xs sm:text-base font-bold text-slate-950 mt-1 sm:mt-1.5 line-clamp-1">{path.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 line-clamp-2 hidden sm:block">{path.description}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingPath(path);
                    setIsFormOpen(true);
                  }}
                  className="p-1 sm:p-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                  title="Edit"
                >
                  <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={() => deleteLearningPath(path.id)}
                  className="p-1 sm:p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 block font-semibold truncate">
                Modules ({path.resourceIds.length}):
              </span>
              <div className="space-y-1">
                {path.resourceIds.slice(0, 3).map((rid, idx) => {
                  const r = resources.find((res) => res.id === rid);
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-700 bg-stone-50 p-1.5 sm:p-2 rounded-lg font-mono border border-stone-100">
                      <span className="text-orange-600 font-bold">{idx + 1}.</span>
                      <span className="truncate">{r?.title || `Module ${rid}`}</span>
                    </div>
                  );
                })}
                {path.resourceIds.length > 3 && (
                  <span className="text-[9px] font-mono text-slate-400 block pl-1">+{path.resourceIds.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Path Editor Modal */}
      {isFormOpen && editingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-orange-200 rounded-2xl p-6 shadow-2xl my-8 text-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-mono font-bold text-slate-950">
                {editingPath.id ? 'Edit Learning Path' : 'New Learning Path'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingPath.title}
                  onChange={(e) => setEditingPath({ ...editingPath, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Level *</label>
                  <select
                    value={editingPath.level}
                    onChange={(e) => setEditingPath({ ...editingPath, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status</label>
                  <select
                    value={editingPath.status}
                    onChange={(e) => setEditingPath({ ...editingPath, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPath.description}
                  onChange={(e) => setEditingPath({ ...editingPath, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              {/* Orderable Resource Sequence */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Ordered Sequence (Use arrows to re-sequence):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {(editingPath.resourceIds || []).map((rid, idx) => {
                    const r = resources.find((res) => res.id === rid);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200 shadow-2xs">
                        <span className="truncate max-w-xs text-slate-800">{idx + 1}. {r?.title || rid}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveResource(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveResource(idx, 'down')}
                            disabled={idx === (editingPath.resourceIds?.length || 0) - 1}
                            className="p-1 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeResourceFromPath(rid)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add resource selector */}
              <div>
                <label className="block text-slate-500 mb-1">Add Resource to Roadmap:</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) addResourceToPath(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                >
                  <option value="">+ Select from published resources...</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
              >
                Save Learning Path
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
