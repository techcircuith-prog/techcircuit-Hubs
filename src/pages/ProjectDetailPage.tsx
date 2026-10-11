import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { 
  Cpu, 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Package, 
  Download, 
  Zap, 
  FileText 
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useData();
  const { addToCart } = useAuth();

  const proj = useMemo(() => projects.find((p) => p.id === id) || null, [id, projects]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!proj) {
    return (
      <div className="min-h-screen bg-pcb-grid flex flex-col items-center justify-center p-6 text-slate-800">
        <p className="text-sm text-slate-500 mb-4">Project package not found.</p>
        <Link to="/projects" className="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors">
          Return to Lab Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      projectId: proj.id,
      title: proj.title,
      price: proj.price,
      type: proj.type,
      image: proj.images[0],
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      projectId: proj.id,
      title: proj.title,
      price: proj.price,
      type: proj.type,
      image: proj.images[0],
    });
    navigate('/cart');
  };

  // Sanitize project images - exclude any external random/unsplash images
  const cleanImages = (proj?.images || [])
    .filter((img) => !img.includes('unsplash.com') && !img.includes('random'));
  
  const idNum = proj ? parseInt(proj.id.replace(/\D/g, '') || '1', 10) : 1;
  const safeNum = Math.min(Math.max(idNum, 1), 42);
  const primaryImage = cleanImages[0] || `/projects/ece${safeNum}.png`;
  const displayImages = [primaryImage];

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-6xl mx-auto space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to projects catalog</span>
      </button>

      {/* Main product showcase */}
      <div className="chip-border bg-white rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 shadow-sm border border-orange-100">
        
        {/* Left: Images */}
        <div className="md:col-span-6 space-y-3">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
            <img
              src={displayImages[selectedImageIdx] || primaryImage}
              alt={proj.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                const fallback = `/projects/ece${safeNum}.png`;
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/90 text-orange-700 border border-orange-200 shadow-xs">
              ECE-{String(safeNum).padStart(2, '0')} • Verified Lab Project
            </span>
          </div>

          {/* Thumbnail strip if multiple genuine images */}
          {displayImages.length > 1 && (
            <div className="flex gap-2">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-orange-500 scale-105' : 'border-stone-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust assurances */}
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2 text-orange-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>100% Tested & Verified Project Package</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Complete project package including circuit schematics, source code, Gerber PCB design files, simulation testbenches, and comprehensive technical documentation.
            </p>
          </div>
        </div>

        {/* Right: Info & Pricing */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mb-2 leading-tight font-mono">
              {proj.title}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-extrabold font-mono text-orange-600">
                ₹{proj.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500">Inclusive of all taxes</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 whitespace-pre-line">
              {proj.description}
            </p>

            {/* Skills learned */}
            <div className="mb-6">
              <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider mb-2">
                Target Competencies
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {proj.skillIds.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-stone-50 border border-stone-200 text-xs text-orange-700 font-mono font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Included files preview for digital */}
            {proj.type === 'digital' && proj.files && (
              <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-800 block">Included Digital Assets:</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {proj.files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <FileText className="w-3.5 h-3.5 text-orange-500" /> {f.name}
                      </span>
                      <span className="text-slate-500">{f.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={handleAddToCart}
              className="py-3 px-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now (UPI)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
