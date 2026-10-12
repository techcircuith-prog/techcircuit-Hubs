import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Cpu, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  Eye, 
  MousePointerClick 
} from 'lucide-react';
import { OscilloscopeLoader } from '../../components/common/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    totalStudents: number;
    totalApplications: number;
    totalOrders: number;
    totalRevenue: number;
    activeOpportunities: number;
    funnel?: { views: number; applyClicks: number; applicationsSubmitted: number };
    nexarSearchesToday?: number;
    nexarQuotaLimit?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadRealData() {
      try {
        const [users, applications, orders, opportunities] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'applications')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'opportunities')),
        ]);
        const totalRevenue = orders.docs.reduce((total, order) => {
          const data = order.data();
          return ['paid', 'delivered'].includes(data.status) ? total + (Number(data.amount) || 0) : total;
        }, 0);
        if (active) {
          setStats({
            totalStudents: users.size,
            totalApplications: applications.size,
            totalOrders: orders.size,
            totalRevenue,
            activeOpportunities: opportunities.docs.filter((opportunity) => opportunity.data().status === 'published').length,
          });
        }
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : 'Admin dashboard data failed to load.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRealData();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <OscilloscopeLoader message="Aggregating platform telemetry..." />;
  }

  // Real computed values
  const realStudents = stats?.totalStudents || 0;
  const realApplications = stats?.totalApplications || 0;
  const realOrders = stats?.totalOrders || 0;
  const realRevenue = stats?.totalRevenue || 0;

  const hasNexarTelemetry = typeof stats?.nexarSearchesToday === 'number';
  const nexarUsage = stats?.nexarSearchesToday ?? 0;
  const nexarLimit = stats?.nexarQuotaLimit ?? 0;
  const nexarPercent = Math.round((nexarUsage / nexarLimit) * 100);

  const views = stats?.funnel?.views;
  const applyClicks = stats?.funnel?.applyClicks;
  const clickPercent = views && views > 0 && applyClicks !== undefined
    ? Math.round((applyClicks / views) * 100)
    : 0;
  const applyPercent = applyClicks && applyClicks > 0
    ? Math.round((realApplications / applyClicks) * 100)
    : 0;

  return (
    <div className="space-y-8 text-slate-900">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-orange-600 text-xs font-mono mb-1 font-semibold">
          <Activity className="w-4 h-4" /> Real-time Platform Telemetry
        </div>
        <h1 className="text-2xl font-bold font-mono text-slate-950">System Command Center</h1>
      </div>
      {loadError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {loadError}
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Total Students</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-slate-950">
              {stats ? realStudents : '—'}
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-semibold flex items-center">
              Verified Accounts
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Total Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-orange-600">
              {stats ? realApplications : '—'}
            </span>
            <span className="text-[11px] font-mono text-orange-600 font-semibold">
              {stats ? stats.activeOpportunities : '—'} Active Drives
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Project Store Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-amber-600">
              {stats ? `₹${realRevenue.toLocaleString('en-IN')}` : '—'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{stats ? realOrders : '—'} Orders</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Verified Lab Projects</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              42
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">Hardware Ready</span>
          </div>
        </div>

      </div>

      {/* Component Quota Counter & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Funnel: Views -> Apply Click -> Applied */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-950 font-mono flex items-center justify-between">
            <span>Opportunity Conversion Funnel</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </h2>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> Opportunity Views
                </span>
                <span className="font-mono font-bold text-slate-950">{views ?? 'Not available'}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full" 
                  style={{ width: `${views && views > 0 ? 100 : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <MousePointerClick className="w-3.5 h-3.5 text-orange-500" /> Apply Clicks (External Portal)
                </span>
                <span className="font-mono font-bold text-orange-600">
                  {applyClicks ?? 'Not available'} {views && views > 0 && `(${clickPercent}%)`}
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full" 
                  style={{ width: `${views ? Math.min(clickPercent, 100) : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Confirmed Applied
                </span>
                <span className="font-mono font-bold text-orange-700">
                  {realApplications} {applyClicks && applyClicks > 0 && `(${applyPercent}% of clicks)`}
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-600 rounded-full" 
                  style={{ width: `${Math.min(applyPercent, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nexar Supply API Quota Monitor */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-950 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-600" />
              Nexar Quota Monitor
            </h2>
            {nexarPercent > 80 && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3" /> Near Limit
              </span>
            )}
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500">Today's Supply Searches:</span>
              <span className="font-mono font-bold text-orange-700">
                {hasNexarTelemetry ? `${nexarUsage} / ${nexarLimit}` : 'Not available'}
              </span>
            </div>

            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  nexarPercent > 80 ? 'bg-rose-500' : 'bg-orange-500'
                }`}
                style={{ width: `${hasNexarTelemetry ? nexarPercent : 0}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              24-hour result caching protects queries. When live distributor search is performed, telemetry is recorded.
            </p>
          </div>

          {/* Department Hardware Overview */}
          <div>
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Department Hardware Inventory:
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-700">Official Lab Projects Catalog</span>
                <span className="text-orange-600 font-bold">42 Projects</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-700">Physical Projects in Stock</span>
                <span className="text-emerald-600 font-bold">1,000+ Units</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-700">PCB Gerber & Firmware Packages</span>
                <span className="text-slate-900 font-bold">Ready for Delivery</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
