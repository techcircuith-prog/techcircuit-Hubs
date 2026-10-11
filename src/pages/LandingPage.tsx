import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Zap, 
  Briefcase, 
  BookOpen, 
  Search, 
  ArrowRight, 
  Award, 
  Wrench,
  Sparkles,
  Layers,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { opportunities, projects } = useData();
  const { user, login } = useAuth();

  const featuredOpps = opportunities.slice(0, 4);
  const featuredProjs = projects.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col font-sans">
      
      {/* HERO SECTION WITH DEDICATED ECE BACKGROUND IMAGE */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 w-full border-b bg-slate-950 border-slate-800 text-white transition-colors duration-300">
        
        {/* Full Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url('/ece-home-bg.svg')`,
            opacity: 0.85
          }}
          aria-hidden="true"
        />

        {/* Ambient Dark Overlay to ensure maximum text contrast and legibility */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/85 to-slate-950/98 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top Badge indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-md backdrop-blur-md bg-slate-900/90 border border-orange-500/40 text-orange-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-orange-950/60 text-orange-200 border border-orange-500/40">
                <Cpu className="w-3.5 h-3.5 text-orange-400" />
                <span>ECE & VLSI HUB</span>
              </span>
              <span className="text-slate-300">Electronics & Communication Engineering Portal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Bridge the Gap from <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Lab Schematics to Silicon Industry
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Curated hardware kits, live department recruitment drives, 
              interactive skill radar tracking, and component pricing intelligence for ECE & VLSI engineers.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/projects"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Browse 42 Lab Projects</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              
              <Link
                to="/explore"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 shadow-md backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-orange-400" />
                <span>Explore Opportunities</span>
              </Link>
            </div>

            {/* Real Stats Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-4">
              <div className="p-4 rounded-xl border backdrop-blur-md bg-slate-900/80 border-slate-800/90 text-white shadow-lg">
                <span className="text-2xl font-bold font-mono text-orange-400 block">42</span>
                <span className="text-xs font-medium text-slate-400">Verified Lab Projects</span>
              </div>
              
              <div className="p-4 rounded-xl border backdrop-blur-md bg-slate-900/80 border-slate-800/90 text-white shadow-lg">
                <span className="text-2xl font-bold font-mono text-amber-400 block">21</span>
                <span className="text-xs font-medium text-slate-400">ECE Specializations</span>
              </div>
              
              <div className="p-4 rounded-xl border backdrop-blur-md bg-slate-900/80 border-slate-800/90 text-white shadow-lg">
                <span className="text-2xl font-bold font-mono text-orange-400 block">100%</span>
                <span className="text-xs font-medium text-slate-400">Hardware Kits & Schematics</span>
              </div>
              
              <div className="p-4 rounded-xl border backdrop-blur-md bg-slate-900/80 border-slate-800/90 text-white shadow-lg">
                <span className="text-2xl font-bold font-mono text-amber-400 block">24/7</span>
                <span className="text-xs font-medium text-slate-400">Digital Access & Tracking</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES */}
      <section className="py-12 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-mono uppercase tracking-wider mb-1 font-bold">
              <Zap className="w-4 h-4" /> Live Roles
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Silicon & Firmware Openings
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredOpps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredOpps.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-orange-300 shadow-xs transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider truncate ${
                      opp.type === 'internship' 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : opp.type === 'hackathon'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {opp.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 truncate">{opp.mode}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-orange-600 mb-2 truncate">{opp.companyName}</p>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {opp.skillIds.slice(0, 2).map((skill) => (
                      <span key={skill} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-mono font-medium truncate max-w-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-mono font-medium">Stipend</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">{opp.stipendOrFee}</span>
                  </div>
                  <Link
                    to={`/opportunity/${opp.id}`}
                    className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 transition-colors"
                  >
                    Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center bg-stone-50/70 border border-dashed border-stone-300 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Department Opportunities Portal</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
              Verified internship and industrial training drives will appear here once officially published by the department or partner recruiters.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
            >
              <span>Explore 42 Lab Projects Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* 42 VERIFIED LAB PROJECTS CATALOG */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-mono uppercase tracking-wider mb-1 font-bold">
              <Cpu className="w-4 h-4" /> 42 Verified Lab Projects
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              ECE & Lab Projects Catalog (42 Projects)
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Browse full catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {featuredProjs.map((proj) => {
            const idNum = parseInt(proj.id.replace(/\D/g, '') || '1', 10);
            const safeNum = Math.min(Math.max(idNum, 1), 42);
            const code = `ECE-${String(safeNum).padStart(2, '0')}`;

            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-orange-300 shadow-xs transition-colors flex flex-col sm:flex-row gap-4 justify-between"
              >
                <div className="w-full sm:w-44 h-28 sm:h-40 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-1 select-none pointer-events-none">
                    <Cpu className="w-7 h-7 text-orange-500/50" />
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{code}</span>
                  </div>
                  <img
                    src={proj.images[0]}
                    alt={proj.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950/90 text-orange-400 border border-orange-500/30 z-10">
                    {code}
                  </span>
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 leading-snug line-clamp-2">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {proj.skillIds.slice(0, 2).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-[10px] text-orange-700 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-base sm:text-lg font-bold font-mono text-orange-600">
                      ₹{proj.price.toLocaleString('en-IN')}
                    </span>
                    <Link
                      to={`/project/${proj.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                    >
                      View Package
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customization Callout */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 border border-orange-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Need a Custom Project Built for Your College?
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                We design custom schematics, double-sided PCBs, write firmware & deliver working hardware with full IEEE reports & viva preparation.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="https://forms.gle/ztamMziNJYu7KEb29"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Request Custom Project (Google Form)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/projects?tab=custom"
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <span>View Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4-STEP HARDWARE ACCELERATOR PATHWAY */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Engineered for High-Placement Yield
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            From transistor fundamentals to landing Tier-1 VLSI & embedded systems engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
            <span className="text-xl font-mono font-bold text-slate-300 absolute top-3 right-4">01</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Apply to Roles</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted openings for ASIC design, firmware, and PCB engineers with clear stipends.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
            <span className="text-xl font-mono font-bold text-slate-300 absolute top-3 right-4">02</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Skill Radar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track skill radar points for applied roles, completed labs, and verified certificates.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
            <span className="text-xl font-mono font-bold text-slate-300 absolute top-3 right-4">03</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Component Prices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find distributor prices and stock across Mouser, DigiKey, and Robu for student budgets.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
            <span className="text-xl font-mono font-bold text-slate-300 absolute top-3 right-4">04</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Free Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated syllabus tracks for Verilog, ARM, KiCad, and DSP with verified guides and datasheets.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center w-full">
        <div 
          className="p-8 sm:p-12 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('/ece-home-bg.svg')` }}
        >
          {/* Subtle overlay for CTA */}
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Power Up Your Circuit Career?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Join Indian engineering students learning real silicon skills and tracking industrial internships.
            </p>
            <div className="pt-2">
              {user ? (
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-md transition-all"
                >
                  <span>Go to Circuit Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => login()}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  <span>Sign in with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
