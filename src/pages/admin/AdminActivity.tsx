import React, { useCallback, useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Application, Opportunity, Order } from '../../types';
import { AlertCircle, Briefcase, RefreshCw, ShoppingBag, UserRound } from 'lucide-react';

interface AdminApplication extends Application {
  studentName: string;
  studentEmail: string;
}

export const AdminActivity: React.FC = () => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [applicationsSnapshot, ordersSnapshot, usersSnapshot, opportunitiesSnapshot] = await Promise.all([
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'opportunities')),
      ]);
      const users = new Map(usersSnapshot.docs.map((document) => [document.id, document.data()]));
      const opportunities = new Map(opportunitiesSnapshot.docs.map((document) => [document.id, document.data()]));
      setApplications(applicationsSnapshot.docs.map((document) => {
        const application = document.data() as Application;
        const student = users.get(application.userId);
        return {
          ...application,
          id: document.id,
          studentName: student?.displayName || student?.name || 'Student',
          studentEmail: student?.email || '',
          opportunity: (opportunities.get(application.opportunityId) || application.opportunity || undefined) as Opportunity | undefined,
        };
      }));
      setOrders(ordersSnapshot.docs.map((document) => {
        const order = document.data() as Order;
        const student = users.get(order.userId);
        return {
          ...order,
          id: document.id,
          userName: order.userName || student?.displayName || student?.name || 'Student',
          userEmail: order.userEmail || student?.email || '',
          userPhone: order.userPhone || student?.phone || '',
        };
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load student activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const updateStatus = async (application: AdminApplication, status: AdminApplication['status']) => {
    setUpdatingId(application.id);
    setError(null);
    try {
      await updateDoc(doc(db, 'applications', application.id), {
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'shortlisted' ? { shortlistedAt: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
      });
      setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700">
            <UserRound className="h-4 w-4" /> Student records
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Applications & purchases</h1>
          <p className="mt-1 text-sm text-slate-500">Review opportunity applications and project orders across all students.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadActivity()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-orange-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-orange-100 px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 font-bold text-slate-950">
            <Briefcase className="h-4 w-4 text-orange-600" /> Applications
          </h2>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{error ? '—' : applications.length}</span>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading applications…</p>
        ) : error ? (
          <p className="p-5 text-sm text-orange-800">Applications are unavailable until Firebase server access is configured.</p>
        ) : applications.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No student applications yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {applications.map((application) => (
              <article key={application.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {application.opportunity?.title || `Opportunity ${application.opportunityId}`}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-600">
                    {application.studentName}{application.studentEmail ? ` · ${application.studentEmail}` : ''}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {application.appliedAt ? new Date(application.appliedAt).toLocaleString() : 'Application date unavailable'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-[11px] font-semibold capitalize text-slate-600">
                    {application.status}
                  </span>
                  <select
                    aria-label={`Update status for ${application.studentName}'s application`}
                    value={application.status}
                    disabled={updatingId === application.id}
                    onChange={(event) => void updateStatus(application, event.target.value as AdminApplication['status'])}
                    className="min-w-32 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-orange-400 disabled:opacity-60"
                  >
                    {(['saved', 'applied', 'shortlisted', 'completed'] as const).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-orange-100 px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 font-bold text-slate-950">
            <ShoppingBag className="h-4 w-4 text-orange-600" /> Project orders
          </h2>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{error ? '—' : orders.length}</span>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading orders…</p>
        ) : error ? (
          <p className="p-5 text-sm text-orange-800">Orders are unavailable until Firebase server access is configured.</p>
        ) : orders.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No project orders yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.map((order) => (
              <article key={order.id} className="flex flex-col gap-2 p-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">{order.id}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    order.status === 'paid' || order.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.status === 'failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}>{order.status}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {order.userName || 'Student'}{order.userEmail ? ` · ${order.userEmail}` : ''}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {(order.items || []).map((item) => `${item.title} × ${item.quantity}`).join(', ') || 'Order items unavailable'}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Order date unavailable'}</span>
                  <strong className="font-mono text-orange-700">₹{Number(order.amount || 0).toLocaleString('en-IN')}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
