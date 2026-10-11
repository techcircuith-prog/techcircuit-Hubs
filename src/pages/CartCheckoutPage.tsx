import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Lock 
} from 'lucide-react';

export const CartCheckoutPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, cartTotal, user, profile, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.displayName || user?.displayName || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPhysical = cart.some((i) => i.type === 'physical');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await login();
      return;
    }

    if (cart.length === 0) return;

    if (hasPhysical && (!street || !city || !state || !pincode)) {
      setError('Please provide a complete shipping address for project packages.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId: user.uid,
        userEmail: email,
        userName: name,
        userPhone: phone,
        items: cart,
        shippingAddress: hasPhysical ? { street, city, state, pincode } : undefined,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to initialize payment session');
      }

      const orderData = await res.json();

      // Clear the local cart
      clearCart();

      // If live Cashfree session or sandbox simulation, forward to return/receipt page
      navigate(`/payment/return?order_id=${orderData.orderId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-pcb-grid flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mb-4 shadow-2xs">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-950 mb-2 font-mono">Your Lab Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">Explore our 42 verified ECE lab projects to get started.</p>
        <Link
          to="/projects"
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs shadow-orange-500/25"
        >
          Browse Lab Projects Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-5xl mx-auto space-y-8">
      
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-orange-600" />
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">
          Lab Cart & Secure Checkout
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cart Item Cards */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
              Selected Packages ({cart.length})
            </h2>

            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.projectId} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-slate-950 line-clamp-1">{item.title}</h3>
                      <span className="text-[10px] font-mono text-orange-600 uppercase font-semibold">
                        {item.type} {item.quantity > 1 ? `x${item.quantity}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold font-mono text-orange-600">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.projectId)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Info Form */}
          <form id="checkout-form" onSubmit={handleCheckout} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 text-xs shadow-sm">
            <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
              Student Contact & Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email (For receipts & licenses) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
              />
            </div>

            {/* Address fields for physical kits */}
            {hasPhysical && (
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
                  <MapPin className="w-4 h-4" />
                  <span>Physical Kit Shipping Address</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Street Address / Hostel / Room *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hostel 4, Room 210, Campus Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="Karnataka"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="560001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

        </div>

        {/* Right: Summary & Pay CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-mono font-bold text-slate-950 flex items-center justify-between">
              <span>Order Summary</span>
              <Lock className="w-4 h-4 text-orange-600" />
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600 border-b border-stone-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping & Handling</span>
                <span className="text-orange-600 font-mono font-semibold">FREE (Student Subsidy)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST / Taxes</span>
                <span className="font-mono">Included</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-slate-950">Total Amount</span>
              <span className="text-xl font-extrabold font-mono text-orange-600">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Connecting Cashfree PG...' : 'Pay via Cashfree (UPI / Cards)'}</span>
            </button>

            <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 text-center">
              <p className="flex items-center justify-center gap-1.5 text-orange-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cashfree Payments (PG v2023-08-01) 256-bit SSL</span>
              </p>
              <p>UPI first on mobile · Immediate digital unlock · No COD</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
