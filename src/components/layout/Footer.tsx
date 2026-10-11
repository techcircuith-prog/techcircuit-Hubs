import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-orange-100 text-slate-600 text-xs py-10 pb-24 md:pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-3 select-none">
              <img 
                src="/ece-logo.png" 
                alt="ECE Hub Logo" 
                className="h-16 sm:h-20 w-auto object-contain" 
              />
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              The premier technical acceleration platform for Electronics & Communication, VLSI, and ACT engineers across India.
            </p>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="flex items-center gap-1 font-mono text-[11px] text-orange-600 font-semibold">
                <Zap className="w-3.5 h-3.5" /> Silicon-Grade Ready
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-mono uppercase font-bold text-slate-800 text-[11px] tracking-wider mb-3">
              Explore Tracks
            </h4>
            <ul className="space-y-2">
              <li><Link to="/explore?tab=internships" className="hover:text-orange-600 transition-colors">VLSI Internships</Link></li>
              <li><Link to="/explore?tab=trainings" className="hover:text-orange-600 transition-colors">Embedded Trainings</Link></li>
              <li><Link to="/explore?tab=hackathons" className="hover:text-orange-600 transition-colors">Silicon Hackathons</Link></li>
              <li><Link to="/explore?tab=resources" className="hover:text-orange-600 transition-colors">Learning Resources</Link></li>
              <li><Link to="/components" className="hover:text-orange-600 transition-colors">Component Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono uppercase font-bold text-slate-800 text-[11px] tracking-wider mb-3">
              Lab & Projects
            </h4>
            <ul className="space-y-2">
              <li><Link to="/projects" className="hover:text-orange-600 transition-colors">42 ECE Lab Projects</Link></li>
              <li><Link to="/projects" className="hover:text-orange-600 transition-colors">Project Source & Docs</Link></li>
              <li><Link to="/skills" className="hover:text-orange-600 transition-colors">Skill Radar Chart</Link></li>
              <li><Link to="/dashboard" className="hover:text-orange-600 transition-colors">Application Tracker</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono uppercase font-bold text-slate-800 text-[11px] tracking-wider mb-3">
              Policies & Support
            </h4>
            <ul className="space-y-2">
              <li><Link to="/policies/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" className="hover:text-orange-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/policies/refund" className="hover:text-orange-600 transition-colors">Refund & Cancellation</Link></li>
              <li><Link to="/policies/shipping" className="hover:text-orange-600 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/policies/contact" className="hover:text-orange-600 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} techcircuithub. Designed for Indian engineering universities.
          </div>
          <div className="flex items-center gap-2 font-medium text-slate-600">
            <span>Precision engineering for ECE & VLSI minds.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
