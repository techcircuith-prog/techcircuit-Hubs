import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ComponentSearchResponse } from '../types';
import { 
  Search, 
  Cpu, 
  ExternalLink, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Zap,
  Info
} from 'lucide-react';
import { OscilloscopeLoader } from '../components/common/LoadingSkeleton';

const QUICK_PARTS = ['ESP32', 'STM32', 'LM358', 'ATmega328P', 'NE555', 'INA219'];

export const ComponentsPage: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComponentSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/components/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, userId: user?.uid }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to query component supply');
      }

      const data: ComponentSearchResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Supply search error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
            <Cpu className="w-4 h-4" /> Nexar Semiconductor Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Component Supply & Price Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live multi-distributor pricing for ICs, discrete components, and dev boards across Mouser, DigiKey, Robu, and Element14.
          </p>
        </div>

        {/* Note: Components are NOT sold here banner */}
        <div className="px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[11px] font-mono text-orange-800 flex items-center gap-2 shadow-2xs">
          <Info className="w-4 h-4 text-orange-600" />
          <span>Price discovery only · Buy directly from authorized vendors</span>
        </div>
      </div>

      {/* Search Input Box (Explicit Search Button, NO search-as-you-type) */}
      <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter MPN or keyword (e.g. ESP32-WROOM-32, STM32F401, LM358, MAX232)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Supply</span>
          </button>
        </form>

        {/* Quick Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-mono text-[11px] font-semibold">Popular ECE Parts:</span>
          {QUICK_PARTS.map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => {
                setQuery(part);
                handleSearch(part);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-[11px] font-mono text-orange-700 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer font-medium"
            >
              {part}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <OscilloscopeLoader message="Querying global distributor inventory via Nexar GraphQL..." />
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Part Overview Header */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
                  MPN: {result.partNumber}
                </span>
                <span className="text-xs text-slate-500">Manufacturer: <strong className="text-slate-800">{result.manufacturer}</strong></span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{result.description}</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              {result.cached && (
                <span className="flex items-center gap-1 text-orange-600 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> 24h Cache Hit
                </span>
              )}
              {result.quotaRemaining !== undefined && (
                <span>Quota: {result.quotaRemaining} searches left today</span>
              )}
            </div>
          </div>

          {/* Offers Comparison Table (Cards on mobile, table on desktop) */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-wider">
                Distributor Offers & Price Breaks ({result.offers.length})
              </h2>
              <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Lowest price highlighted
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-100/60 text-[11px] font-mono uppercase text-slate-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Distributor</th>
                    <th className="py-3 px-4">SKU / Part</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">In Stock</th>
                    <th className="py-3 px-4">MOQ</th>
                    <th className="py-3 px-4">Price Breaks</th>
                    <th className="py-3 px-4 text-right">Vendor Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {result.offers.map((offer, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-stone-50 transition-colors ${
                        offer.isLowestPrice ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        {offer.isLowestPrice && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[9px] font-mono font-bold border border-orange-300">
                            LOWEST
                          </span>
                        )}
                        <span>{offer.distributor}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{offer.sku}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                        {offer.currency === 'INR' ? '₹' : '$'}{offer.unitPrice}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {offer.stock > 0 ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {offer.stock.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">Backorder</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{offer.moq}</td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="flex gap-2">
                          {offer.priceBreaks?.slice(0, 3).map((pb, pidx) => (
                            <span key={pidx} className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] font-mono text-slate-600">
                              {pb.quantity}+: {offer.currency === 'INR' ? '₹' : '$'}{pb.price}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={offer.clickUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-semibold transition-colors"
                        >
                          <span>View Offer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (360px optimized) */}
            <div className="md:hidden divide-y divide-stone-100">
              {result.offers.map((offer, idx) => (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {offer.isLowestPrice && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[9px] font-mono font-bold border border-orange-300">
                          LOWEST
                        </span>
                      )}
                      <span className="font-bold text-slate-900 text-xs">{offer.distributor}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-orange-600">
                      {offer.currency === 'INR' ? '₹' : '$'}{offer.unitPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Stock: {offer.stock.toLocaleString()}</span>
                    <span>MOQ: {offer.moq}</span>
                  </div>

                  <a
                    href={offer.clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>View on {offer.distributor}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
