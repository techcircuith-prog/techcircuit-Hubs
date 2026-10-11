import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

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

export const ResourceSuggestModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { suggestResource } = useData();
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await suggestResource({ url, category, note });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setUrl('');
        setNote('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-orange-200 rounded-2xl p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <h3 className="font-mono font-bold text-base text-slate-950">Suggest ECE Resource</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 text-orange-600 font-medium text-sm">
            Thank you! Your suggested resource is queued for admin review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Resource URL *</label>
              <input
                type="url"
                required
                placeholder="https://youtube.com/watch?... or https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Brief Note / What makes it useful</label>
              <textarea
                rows={3}
                placeholder="Explains pipelining clearly, includes verilog testbenches..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Send Recommendation'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
