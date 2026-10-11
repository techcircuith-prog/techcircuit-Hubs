import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, FileText, RefreshCw, Truck, Mail, MapPin, Phone } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const activeTab = type || 'privacy';

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-10 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-4xl mx-auto space-y-8">
      
      {/* Policy Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200">
        <Link
          to="/policies/privacy"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'privacy' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Privacy Policy
        </Link>
        <Link
          to="/policies/terms"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'terms' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Terms & Conditions
        </Link>
        <Link
          to="/policies/refund"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'refund' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Refund & Cancellation
        </Link>
        <Link
          to="/policies/shipping"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'shipping' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Shipping Policy
        </Link>
        <Link
          to="/policies/contact"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'contact' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Contact Us
        </Link>
      </div>

      {/* Content Container */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed shadow-sm">
        
        {/* 1. PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-mono font-bold text-base mb-2">
              <Shield className="w-5 h-5" />
              <h1 className="text-slate-950">Privacy Policy</h1>
            </div>
            <p className="text-slate-400 text-xs">Last Updated: October 2026</p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">1. Information We Collect</h2>
            <p>
              When students sign in using Google OAuth, techcircuithub collects the student's name, email address, profile avatar, and user ID. During profile registration, we optionally collect educational institution, department, year of study, contact phone number, and technical skill interests.
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">2. Activity Telemetry & TTL Policy</h2>
            <p>
              To protect user privacy and operate within strict quota limits, we only log core engagement events (logins, opportunity views, apply clicks, search queries, component lookups, cart additions, and kit purchases). Activity logs are automatically stamped with a 90-day expiration field (<code>expireAt</code>) and pruned using Firestore TTL policies.
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">3. Data Security & Third Parties</h2>
            <p>
              We do not sell student personal data to third parties. Verified employer applications are redirected directly to official partner career portals. Component supply data is routed via Nexar APIs without exposing individual student identifiers.
            </p>
          </div>
        )}

        {/* 2. TERMS & CONDITIONS */}
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-mono font-bold text-base mb-2">
              <FileText className="w-5 h-5" />
              <h1 className="text-slate-950">Terms & Conditions</h1>
            </div>
            <p className="text-slate-400 text-xs">Effective Date: October 2026</p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">1. Platform Eligibility</h2>
            <p>
              techcircuithub is designed for undergraduate, postgraduate, and diploma engineering students in Electronics & Communication (ECE), VLSI, and Advanced Circuit Technology (ACT).
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">2. Skill Point System Integrity</h2>
            <p>
              All skill XP, levels, and milestone badges are authoritative and calculated on the server. Any programmatic attempts to manipulate points or fake completion records will result in account suspension.
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">3. Components Pricing Disclaimer</h2>
            <p>
              Electronic components listed in the price comparison section are displayed for market transparency and parametric search only. Components are never sold directly on techcircuithub; orders are placed with respective distributors (Mouser, DigiKey, Robu, etc.).
            </p>
          </div>
        )}

        {/* 3. REFUND POLICY */}
        {activeTab === 'refund' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-mono font-bold text-base mb-2">
              <RefreshCw className="w-5 h-5" />
              <h1 className="text-slate-950">Refund & Cancellation Policy</h1>
            </div>
            <p className="text-slate-400 text-xs">Effective: October 2026</p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">1. Physical Project Packages</h2>
            <p>
              Orders for physical project packages (e.g., STM32 Oscilloscope projects, ESP32 LoRa gateways) can be cancelled for a 100% refund prior to warehouse dispatch (within 24 hours of placing the order). If a package arrives with defective or missing semiconductor ICs, a free replacement or full refund is provided upon verification within 7 days of delivery.
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">2. Digital Project Files & Source Code</h2>
            <p>
              Due to the nature of digital deliverables (instant download of unencrypted Verilog, VHDL, or KiCad source files), digital project archives are non-refundable once the download token has been generated.
            </p>
          </div>
        )}

        {/* 4. SHIPPING POLICY */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-mono font-bold text-base mb-2">
              <Truck className="w-5 h-5" />
              <h1 className="text-slate-950">Shipping Policy</h1>
            </div>

            <h2 className="text-sm font-bold text-slate-950 mt-4">1. Domestic Coverage (India)</h2>
            <p>
              We ship physical lab kits to all serviceable pin codes across India via partner couriers (BlueDart, Delhivery, DTDC, and Speed Post).
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">2. Delivery Timelines</h2>
            <p>
              Orders are typically dispatched within 24 to 48 hours. Metro cities (Bengaluru, Chennai, Hyderabad, Mumbai, Delhi) receive delivery within 2-3 business days. Other academic campuses and hostel addresses typically receive shipments within 4-6 business days.
            </p>

            <h2 className="text-sm font-bold text-slate-950 mt-4">3. Shipping Fees</h2>
            <p>
              Standard surface shipping is completely free for Indian engineering students on all verified orders.
            </p>
          </div>
        )}

        {/* 5. CONTACT US */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-mono font-bold text-base mb-2">
              <Mail className="w-5 h-5" />
              <h1 className="text-slate-950">Contact & Engineering Support</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs font-mono">
                  <Mail className="w-4 h-4" /> Email Support
                </div>
                <p className="text-slate-800 text-xs">support@techcircuithub.com</p>
                <p className="text-[11px] text-slate-500">Responses within 12 hours on working days.</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs font-mono">
                  <MapPin className="w-4 h-4" /> Lab Headquarters
                </div>
                <p className="text-slate-800 text-xs">Electronic City Phase 1, Bengaluru, Karnataka 560100</p>
                <p className="text-[11px] text-slate-500">Silicon Innovation Corridor, India</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
