import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ResourceReportModal: React.FC<{
  resourceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ resourceId, isOpen, onClose }) => {
  const { reportResource } = useData();
  const [reason, setReason] = useState('Video is private or deleted');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !resourceId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportResource(resourceId, `${reason}: ${details}`);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
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
      <div className="w-full max-w-sm bg-white border border-rose-200 rounded-2xl p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-mono font-bold text-sm text-slate-950">Report Broken Resource</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4 text-orange-600 text-xs font-semibold">
            Report logged. Our team will verify and update this link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Issue Type</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-rose-500"
              >
                <option value="Video is private or deleted">Video is private or deleted</option>
                <option value="404 Page Not Found">404 Page Not Found</option>
                <option value="Outdated content or incorrect skill">Outdated or incorrect skill tag</option>
                <option value="Paywall / Not Free">Paywalled / Requires subscription</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Additional details (Optional)</label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Broken since last week..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
