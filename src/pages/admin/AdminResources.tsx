import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Resource } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Upload, 
  Link as LinkIcon, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Play, 
  Search 
} from 'lucide-react';

const CATEGORIES = [
  'Analog Electronics',
  'Digital Electronics',
  'Embedded Systems',
  'Microcontrollers',
  'VLSI',
  'Communication Systems',
  'DSP',
  'PCB Design',
  'IoT',
  'Programming',
  'Placement/Aptitude'
];

export const AdminResources: React.FC = () => {
  const { resources, saveResource, deleteResource } = useData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Partial<Resource> | null>(null);
  const [canImportYt, setCanImportYt] = useState(false);
  const [ytPlaylistUrl, setYtPlaylistUrl] = useState('');
  const [importingYt, setImportingYt] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [brokenLinksReport, setBrokenLinksReport] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/resources/can-import-youtube')
      .then((r) => r.json())
      .then((d) => setCanImportYt(d.available))
      .catch(() => {});
  }, []);

  const handleFetchPreview = async () => {
    if (!editingRes?.url) return;
    setFetchingPreview(true);
    try {
      const res = await fetch('/api/resources/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editingRes.url }),
      });
      if (res.ok) {
        const meta = await res.json();
        setEditingRes((prev) => ({
          ...prev,
          title: meta.title || prev?.title,
          thumbnailUrl: meta.thumbnailUrl || prev?.thumbnailUrl,
          source: meta.source || prev?.source,
          durationMin: meta.durationMin || prev?.durationMin || 20,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleCheckLinks = async () => {
    setCheckingLinks(true);
    try {
      const urls = resources.map((r) => r.url);
      const res = await fetch('/api/resources/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      if (res.ok) {
        const data = await res.json();
        setBrokenLinksReport(data.results.filter((r: any) => r.broken));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingLinks(false);
    }
  };

  const handleImportYtPlaylist = async () => {
    if (!ytPlaylistUrl) return;
    setImportingYt(true);
    try {
      const res = await fetch('/api/resources/import-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl: ytPlaylistUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        for (const item of data.items || []) {
          await saveResource(item);
        }
        setYtPlaylistUrl('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImportingYt(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRes({
      type: 'video',
      title: '',
      url: '',
      thumbnailUrl: '',
      source: '',
      durationMin: 20,
      category: 'VLSI',
      skillIds: ['VLSI', 'Verilog'],
      level: 'intermediate',
      language: 'English',
      isFree: true,
      status: 'published',
    });
    setIsFormOpen(true);
  };

  const handleDuplicate = async (res: Resource) => {
    const clone: Partial<Resource> = {
      ...res,
      id: undefined,
      title: `${res.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    await saveResource(clone);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;
    await saveResource(editingRes);
    setIsFormOpen(false);
    setEditingRes(null);
  };

  const filtered = resources.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Header & Global Tools */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-950">Curated Resources Engine</h1>
          <p className="text-xs text-slate-500">Manage video lectures, datasheets, simulation tools, and articles.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCheckLinks}
            disabled={checkingLinks}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{checkingLinks ? 'Scanning Links...' : 'Check Links Health'}</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Broken Links Alert Panel if any */}
      {brokenLinksReport.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <span>Found {brokenLinksReport.length} dead or unreachable link(s):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono text-[11px]">
            {brokenLinksReport.map((item, idx) => (
              <li key={idx} className="truncate">{item.url} (Code: {item.statusCode || 'ERR'})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional YouTube Playlist Import (Cleanly conditional on secret) */}
      {canImportYt && (
        <div className="p-4 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xs">
          <Play className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <input
            type="url"
            placeholder="Paste YouTube Playlist URL (imports all videos as draft resources)..."
            value={ytPlaylistUrl}
            onChange={(e) => setYtPlaylistUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500"
          />
          <button
            onClick={handleImportYtPlaylist}
            disabled={importingYt || !ytPlaylistUrl}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {importingYt ? 'Importing Videos...' : 'Import Playlist'}
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter resources by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-900 outline-none focus:border-orange-500 shadow-2xs"
        />
      </div>

      {/* Resource Table / Cards */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-stone-100">
          {filtered.map((res) => (
            <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-orange-50 text-orange-700 border border-orange-200">
                    {res.type}
                  </span>
                  <span className="text-xs text-orange-700 font-semibold">{res.category}</span>
                  <span className="text-xs text-slate-500">· {res.level} · {res.language}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    res.status === 'published' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-600 bg-stone-100'
                  }`}>
                    {res.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-950">{res.title}</h3>
                <p className="text-xs text-slate-500 font-mono truncate max-w-lg">{res.url}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleDuplicate(res)}
                  className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-slate-600 border border-stone-200"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingRes(res);
                    setIsFormOpen(true);
                  }}
                  className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteResource(res.id)}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Editor Modal with Auto-Fill Preview */}
      {isFormOpen && editingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-orange-200 rounded-2xl p-6 shadow-2xl my-8 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-mono font-bold text-slate-950">
                {editingRes.id ? 'Edit Learning Resource' : 'Add Learning Resource'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              
              {/* URL with Auto-fill Button */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Resource URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={editingRes.url}
                    onChange={(e) => setEditingRes({ ...editingRes, url: e.target.value })}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchPreview}
                    disabled={fetchingPreview || !editingRes.url}
                    className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{fetchingPreview ? 'Extracting...' : 'Auto-Fill'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingRes.title}
                  onChange={(e) => setEditingRes({ ...editingRes, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Source (e.g. NPTEL, IEEE)</label>
                  <input
                    type="text"
                    value={editingRes.source}
                    onChange={(e) => setEditingRes({ ...editingRes, source: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingRes.durationMin}
                    onChange={(e) => setEditingRes({ ...editingRes, durationMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={editingRes.category}
                    onChange={(e) => setEditingRes({ ...editingRes, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Level</label>
                  <select
                    value={editingRes.level}
                    onChange={(e) => setEditingRes({ ...editingRes, level: e.target.value as any })}
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
                    value={editingRes.status}
                    onChange={(e) => setEditingRes({ ...editingRes, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={editingRes.thumbnailUrl}
                  onChange={(e) => setEditingRes({ ...editingRes, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs shadow-orange-500/25"
              >
                Save Resource
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
