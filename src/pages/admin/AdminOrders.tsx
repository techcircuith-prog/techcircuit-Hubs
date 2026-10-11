import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Order } from '../../types';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6 text-slate-900">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-950">Orders & Fulfillment</h1>
          <p className="text-xs text-slate-500">Track Cashfree transactions and dispatch lab project packages.</p>
        </div>

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

      {filteredOrders.length === 0 ? (
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
