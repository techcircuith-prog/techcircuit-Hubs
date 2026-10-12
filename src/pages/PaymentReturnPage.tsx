import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Download, 
  Package, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OscilloscopeLoader } from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const PaymentReturnPage: React.FC = () => {
  const { clearCart } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || '';

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'paid' | 'pending' | 'failed' | 'error'>('pending');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setVerificationError('The order reference is missing, so we could not verify this payment.');
      setLoading(false);
      return;
    }

    async function verifyOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}/verify`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not verify your payment. Please try again later.');
        }
        
        if (data.isPaid || data.status === 'paid') {
          setStatus('paid');
          clearCart();
          // Trigger confetti
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#f97316', '#ea580c', '#f59e0b'],
            });
          } catch {}

          // Fetch signed download token
          const tokenRes = await fetch(`/api/orders/${orderId}/download-token`);
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            setDownloadUrl(tokenData.downloadUrl);
          }
        } else {
          setStatus(data.status === 'failed' || data.status === 'cancelled' ? 'failed' : 'pending');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setVerificationError(err instanceof Error ? err.message : 'Could not verify your payment. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    verifyOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pcb-grid flex items-center justify-center">
        <OscilloscopeLoader message="Verifying your payment..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-xl mx-auto">
      
      <div className="chip-border bg-white rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm border border-orange-200">
        
        {status === 'paid' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-mono">
                Payment Confirmed & Verified!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Thank you for your order. Your project package dispatch and digital access have been processed.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="text-orange-600 font-semibold">Secure payment provider</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Skill XP Bonus:</span>
                <span className="text-orange-600 font-mono font-bold">+10 Points Awarded</span>
              </div>
            </div>

            {/* Digital Package Download */}
            {downloadUrl && (
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-orange-800 font-bold text-xs">
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Digital Project Package Ready</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  A short-lived signed download token has been generated for your project source code, schematics & documentation.
                </p>
                <a
                  href={downloadUrl}
                  className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Lab Archive (.ZIP)</span>
                </a>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard"
                className="w-full py-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-slate-800 font-bold text-xs border border-stone-200 transition-colors"
              >
                Go to Student Dashboard
              </Link>
              <Link
                to="/projects"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs shadow-orange-500/25"
              >
                Continue Browsing
              </Link>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Clock className="w-9 h-9" />
            </div>
            <h1 className="text-xl font-bold text-slate-950 font-mono">Payment Status Pending</h1>
            <p className="text-xs text-slate-500">
              We are waiting for payment confirmation. Your order status will update automatically once verified.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600"
            >
              View Orders in Dashboard
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <h1 className="text-xl font-bold text-slate-950">Payment Not Completed</h1>
            <p className="text-xs text-slate-500">Your order has not been marked as paid. You can return to the projects page and try again.</p>
            <Link to="/projects" className="inline-block px-6 py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600">
              Return to Projects
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <h1 className="text-xl font-bold text-slate-950">Payment Verification Unavailable</h1>
            <p role="alert" className="text-xs text-slate-500">
              {verificationError || 'We could not verify your payment. Please contact support before trying again.'}
            </p>
            <Link to="/dashboard" className="inline-block px-6 py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600">
              View Student Activity
            </Link>
          </>
        )}

      </div>

    </div>
  );
};
