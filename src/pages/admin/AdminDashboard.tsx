import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
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
  const { user } = useAuth();
  const { opportunities, applications, orders } = useData();

  const [stats, setStats] = useState<any>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealData() {
      try {
        // 1. Fetch real student accounts count from Firestore users collection
        try {
          const userSnap = await getDocs(collection(db, 'users'));
          setStudentCount(userSnap.size);
        } catch {
          setStudentCount(0);
        }

        // 2. Fetch server events/telemetry
        const res = await fetch('/api/admin/stats', {
          headers: { 'x-user-email': user?.email || '' },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.email) {
      loadRealData();
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  if (loading) {
    return <OscilloscopeLoader message="Aggregating platform telemetry..." />;
  }

  // Real computed values
  const realStudents = studentCount;
  const realApplications = applications.length;
  const realRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const nexarUsage = stats?.nexarSearchesToday || 0;
  const nexarLimit = stats?.nexarQuotaLimit || 1000;
  const nexarPercent = Math.round((nexarUsage / nexarLimit) * 100);

  const views = stats?.funnel?.views || 0;
  const applyClicks = stats?.funnel?.applyClicks || 0;
  const clickPercent = views > 0 ? Math.round((applyClicks / views) * 100) : 0;
  const applyPercent = applyClicks > 0 ? Math.round((realApplications / applyClicks) * 100) : 0;

  return (
    <div className="space-y-8 text-slate-900">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-orange-600 text-xs font-mono mb-1 font-semibold">
          <Activity className="w-4 h-4" /> Real-time Platform Telemetry
        </div>
        <h1 className="text-2xl font-bold font-mono text-slate-950">System Command Center</h1>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Total Students</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-slate-950">
              {realStudents}
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
              {realApplications}
            </span>
            <span className="text-[11px] font-mono text-orange-600 font-semibold">
              {opportunities.length} Active Drives
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Cashfree Store Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-amber-600">
              ₹{realRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{orders.length} Orders</span>
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
                <span className="font-mono font-bold text-slate-950">{views}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full" 
                  style={{ width: `${views > 0 ? 100 : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <MousePointerClick className="w-3.5 h-3.5 text-orange-500" /> Apply Clicks (External Portal)
                </span>
                <span className="font-mono font-bold text-orange-600">
                  {applyClicks} {views > 0 && `(${clickPercent}%)`}
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full" 
                  style={{ width: `${Math.min(clickPercent, 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Confirmed Applied
                </span>
                <span className="font-mono font-bold text-orange-700">
                  {realApplications} {applyClicks > 0 && `(${applyPercent}% of clicks)`}
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
              <span className="font-mono font-bold text-orange-700">{nexarUsage} / {nexarLimit}</span>
            </div>

            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  nexarPercent > 80 ? 'bg-rose-500' : 'bg-orange-500'
                }`}
                style={{ width: `${nexarPercent}%` }}
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
                <span className="text-slate-700">Total Hardware Kits in Stock</span>
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
