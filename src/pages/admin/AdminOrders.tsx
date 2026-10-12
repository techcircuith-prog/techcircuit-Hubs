import React, { useCallback, useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users')),
      ]);
      const users = new Map(usersSnapshot.docs.map((document) => [document.id, document.data()]));
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
      setError(loadError instanceof Error ? loadError.message : 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const updateOrderStatus = async (order: Order, status: 'shipped' | 'delivered') => {
    setUpdatingOrderId(order.id);
    setError(null);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update order fulfillment status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold font-mono text-slate-950">Orders & Fulfillment</h1>
          <p className="text-xs text-slate-500">Track project payments and dispatch lab project packages.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-xl shadow-2xs">
            {['all', 'paid', 'shipped', 'delivered', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                  filterStatus === st ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">Loading student orders…</div>
      ) : error ? null : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-xs text-slate-500 shadow-xs">
          No orders matching current filter criteria.
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-stone-100">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-950">{ord.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ord.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ord.status === 'shipped' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      ord.status === 'delivered' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ord.status}
                    </span>
                    <span className="text-xs text-orange-600 font-mono font-bold">
                      ₹{ord.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    Buyer: <strong className="text-slate-950">{ord.userName || ord.userEmail}</strong> ({ord.userPhone || 'No phone'})
                  </p>

                  <div className="text-[11px] text-slate-500">
                    Items: {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                  </div>

                  {ord.shippingAddress && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Ship to: {ord.shippingAddress.street}, {ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                  {ord.status === 'paid' && (
                    <button
                      type="button"
                      disabled={updatingOrderId === ord.id}
                      onClick={() => void updateOrderStatus(ord, 'shipped')}
                      className="rounded-lg bg-orange-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                      Mark shipped
                    </button>
                  )}
                  {ord.status === 'shipped' && (
                    <button
                      type="button"
                      disabled={updatingOrderId === ord.id}
                      onClick={() => void updateOrderStatus(ord, 'delivered')}
                      className="rounded-lg bg-orange-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                      Mark delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
