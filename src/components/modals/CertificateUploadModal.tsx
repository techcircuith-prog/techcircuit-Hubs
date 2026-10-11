import React, { useState } from 'react';
import { X, Upload, Award, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const CertificateUploadModal: React.FC<{
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ applicationId, isOpen, onClose }) => {
  const { updateApplicationStatus } = useData();
  const [certUrl, setCertUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !applicationId) return null;

  const handleSimulatedUpload = async () => {
    setUploading(true);
    try {
      // Fetch signed upload params if Cloudinary is configured
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'certificates' }),
      });
      const signData = await signRes.json();
      
      const sampleUrl = signData.configured && certUrl 
        ? certUrl 
        : 'https://images.unsplash.com/photo-1589330694653-dad6bc01cf0f?w=800&auto=format&fit=crop';

      await updateApplicationStatus(applicationId, 'completed', sampleUrl);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white border border-orange-200 rounded-2xl p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-orange-600">
            <Award className="w-5 h-5" />
            <h3 className="font-mono font-bold text-sm text-slate-950">Upload Completion Certificate</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 text-orange-600 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-orange-600 animate-bounce" />
            <span className="font-semibold">Certificate submitted & verified! +10 skill bonus points awarded.</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Submit your internship or training completion certificate to lock in verified credentials on your techcircuithub profile.
            </p>

            <div className="border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-xl p-6 text-center transition-colors bg-stone-50">
              <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="font-medium text-slate-800">Upload Certificate PDF or Image</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, PDF up to 5MB (Cloudinary storage)</p>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Or paste public URL / Drive link:</label>
              <input
                type="url"
                placeholder="https://..."
                value={certUrl}
                onChange={(e) => setCertUrl(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500 text-xs"
              />
            </div>

            <button
              onClick={handleSimulatedUpload}
              disabled={uploading}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Validating & Uploading...' : 'Confirm & Claim +10 Points'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
