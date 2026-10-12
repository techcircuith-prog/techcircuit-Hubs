import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { ProjectImage } from '../components/common/ProjectImage';
import { 
  Cpu, 
  ShoppingCart, 
  Search, 
  Check, 
  Layers, 
  Sparkles,
  Zap,
  Radio,
  Bot,
  Activity,
  SlidersHorizontal,
  X,
  ExternalLink,
  Wrench,
  Package,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  HelpCircle,
  Code,
  CircuitBoard,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';

// Editable Google Form URL for project customization submissions
export const GOOGLE_FORM_URL = "https://forms.gle/ztamMziNJYu7KEb29";

export const ProjectsPage: React.FC = () => {
  const { projects } = useData();
  const { addToCart } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'readymade' vs 'custom'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'readymade' | 'custom'>(
    tabParam === 'custom' ? 'custom' : 'readymade'
  );

  useEffect(() => {
    if (tabParam === 'custom' && activeTab !== 'custom') {
      setActiveTab('custom');
    } else if (tabParam === 'readymade' && activeTab !== 'readymade') {
      setActiveTab('readymade');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'readymade' | 'custom') => {
    setActiveTab(tab);
    setSearchParams(tab === 'custom' ? { tab: 'custom' } : {});
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [formClickToast, setFormClickToast] = useState(false);

  // Category mapping based on project ID index or title/skills
  const getProjectCategory = (proj: Project, index: number): string => {
    const match = proj.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : index + 1;
    if (num <= 7) return 'PCB Design';
    if (num <= 14) return 'Microcontroller';
    if (num <= 21) return 'IoT Projects';
    if (num <= 28) return 'Medical IoT';
    if (num <= 35) return 'Final-Year Projects';
    return 'Mini Projects';
  };

  const getProjectCode = (proj: Project, index: number): string => {
    const match = proj.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : index + 1;
    return `ECE-${String(num).padStart(2, '0')}`;
  };

  const categories = [
    { id: 'all', label: 'All Projects', count: projects.length, icon: Layers },
    { id: 'PCB Design', label: 'PCB Design (01-07)', count: 7, icon: Zap },
    { id: 'Microcontroller', label: 'Microcontroller (08-14)', count: 7, icon: Cpu },
    { id: 'IoT Projects', label: 'IoT Systems (15-21)', count: 7, icon: Radio },
    { id: 'Medical IoT', label: 'Medical IoT (22-28)', count: 7, icon: Activity },
    { id: 'Final-Year Projects', label: 'Final-Year & AI (29-35)', count: 7, icon: Sparkles },
    { id: 'Mini Projects', label: 'Mini Projects (36-42)', count: 7, icon: Bot },
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((p, idx) => {
      if (p.status !== 'published') return false;

      const cat = getProjectCategory(p, idx);
      if (selectedCategory !== 'all' && cat !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const code = getProjectCode(p, idx).toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(query);
        const descMatch = p.description.toLowerCase().includes(query);
        const codeMatch = code.includes(query);
        const skillMatch = p.skillIds.some(s => s.toLowerCase().includes(query));
        const priceMatch = p.price.toString().includes(query);
        return titleMatch || descMatch || codeMatch || skillMatch || priceMatch;
      }

      return true;
    });
  }, [projects, selectedCategory, searchQuery]);

  const handleAddToCart = (proj: Project) => {
    addToCart({
      projectId: proj.id,
      title: proj.title,
      price: proj.price,
      type: proj.type,
      image: proj.images[0],
    });
    setAddedId(proj.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleGoogleFormClick = () => {
    setFormClickToast(true);
    setTimeout(() => setFormClickToast(false), 4500);
    // Open in new tab
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-orange-100 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600 text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
              <Cpu className="w-4 h-4" /> ECE Project Engineering Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              ECE Lab & Custom Project Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Choose from verified readymade lab project packages or get a customized hardware project built to your college specifications.
            </p>
          </div>

          {/* Quick Tab Stats or Tag */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl text-xs font-mono text-orange-800">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>
              {activeTab === 'readymade' ? (
                <>Showing <strong>{filteredProjects.length}</strong> of <strong>{projects.length}</strong> Readymade Projects</>
              ) : (
                <>Custom Projects: <strong>100% Customized to Your Requirements</strong></>
              )}
            </span>
          </div>
        </div>

        {/* Two Options Navigation Switcher: Readymade Projects vs Customization Projects */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/80">
          <button
            type="button"
            onClick={() => handleTabChange('readymade')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'readymade'
                ? 'bg-white text-orange-600 shadow-sm border border-orange-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Package className={`w-4 h-4 ${activeTab === 'readymade' ? 'text-orange-600' : 'text-slate-500'}`} />
            <span>Readymade Projects</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'readymade' 
                ? 'bg-orange-100 text-orange-700 font-bold' 
                : 'bg-stone-200 text-slate-600'
            }`}>
              42 Verified
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('custom')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-white text-orange-600 shadow-sm border border-orange-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Wrench className={`w-4 h-4 ${activeTab === 'custom' ? 'text-orange-600' : 'text-slate-500'}`} />
            <span>Customization Projects</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'custom' 
                ? 'bg-emerald-100 text-emerald-800 font-bold' 
                : 'bg-stone-200 text-slate-600'
            }`}>
              Custom Order
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: READYMADE PROJECTS (Catalog)                   */}
      {/* ======================================================== */}
      {activeTab === 'readymade' && (
        <div className="space-y-6">
          {/* Customization Callout Banner */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-950 font-mono flex items-center gap-2">
                  Need a custom topic or specific college requirements?
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  We customize ECE projects from scratch — custom PCB fabrication, custom sensors, firmware & full IEEE documentation.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-mono font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Custom Project Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleTabChange('custom')}
                className="px-3.5 py-2 bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 text-xs font-mono font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Pipeline Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code (e.g. ECE-01), project name (e.g. Power Supply), or skill..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-stone-50 text-slate-600 border border-stone-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-slate-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No project packages matched your filters</h3>
              <p className="text-xs text-slate-500">Try clearing the search query or selecting a different category.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Product Grid - 2 columns on mobile, 3 columns on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {filteredProjects.map((proj, idx) => {
              const isJustAdded = addedId === proj.id;
              const category = getProjectCategory(proj, idx);

              return (
                <div
                  key={proj.id}
                  className="chip-border bg-white rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between hover:border-orange-300 transition-all group shadow-sm border border-orange-100"
                >
                  <div>
                    {/* Image Cover */}
                    <ProjectImage
                      project={proj}
                      className="h-28 sm:h-48"
                      imageClassName="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    >

                      {/* Stock Pill on Top Right */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-white/90 text-emerald-700 border border-emerald-200 shadow-2xs hidden sm:inline">
                          {proj.stock && proj.stock > 0 ? `${proj.stock} in stock` : 'Verified Lab'}
                        </span>
                      </div>

                      {/* Category Banner on Bottom */}
                      <div className="absolute bottom-1.5 left-2 z-10">
                        <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold uppercase bg-black/60 text-stone-200 backdrop-blur-xs">
                          {category}
                        </span>
                      </div>
                    </ProjectImage>

                    {/* Content */}
                    <div className="p-3 sm:p-5">
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-orange-700 mb-1">
                        <span className="truncate">{category}</span>
                      </div>

                      <h3 className="text-xs sm:text-base font-bold text-slate-950 mb-1 sm:mb-2 leading-snug group-hover:text-orange-600 transition-colors line-clamp-1 sm:line-clamp-2">
                        {proj.title}
                      </h3>
                      
                      <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-2 mb-2 sm:mb-4 leading-relaxed hidden sm:block">
                        {proj.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2 sm:mb-4">
                        {proj.skillIds.slice(0, 2).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200 text-[9px] sm:text-[10px] text-slate-700 font-mono truncate">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="p-3 sm:p-5 pt-0 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono block">Price</span>
                      <span className="text-xs sm:text-lg font-extrabold font-mono text-orange-600">
                        ₹{proj.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Link
                        to={`/project/${proj.id}`}
                        className="flex-1 sm:flex-none text-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-stone-50 hover:bg-stone-100 text-slate-700 text-[10px] sm:text-xs font-semibold border border-stone-200 transition-colors"
                      >
                        Specs
                      </Link>
                      <button
                        onClick={() => handleAddToCart(proj)}
                        className={`flex-1 sm:flex-none px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-2xs shadow-orange-500/25 active:scale-95'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: CUSTOMIZATION PROJECTS (On-Demand Custom Lab) */}
      {/* ======================================================== */}
      {activeTab === 'custom' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Hero Banner for Custom Projects */}
          <div className="relative bg-gradient-to-br from-white via-orange-50 to-white text-slate-900 rounded-3xl p-6 sm:p-10 border border-orange-200 shadow-sm overflow-hidden">
            {/* Background PCB Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-mono font-semibold">
                <Wrench className="w-3.5 h-3.5" />
                <span>ECE HARDWARE & EMBEDDED CUSTOM LAB</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                Custom ECE Projects Built Exactly to Your Idea & College Requirements
              </h2>

              <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                Have a unique project idea, a specific problem statement, or strict university guidelines? 
                Our hardware engineers design custom double-sided PCBs, integrate microcontrollers & sensors, 
                program firmware, and provide complete documentation & viva defense preparation.
              </p>

              {/* Main "Fill the Google Form" Button */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleGoogleFormClick}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-mono font-bold text-sm shadow-lg shadow-orange-500/30 transition-all cursor-pointer group"
                >
                  <FileText className="w-4 h-4 text-orange-100 group-hover:scale-110 transition-transform" />
                  <span>Fill the Google Form</span>
                  <ExternalLink className="w-4 h-4 text-orange-200" />
                </a>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Click to submit your requirements via Google Form</span>
                </div>
              </div>

              {/* Toast Feedback */}
              {formClickToast && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Opening Google Form in a new tab... Submit your topic & requirements!</span>
                </div>
              )}
            </div>
          </div>

          {/* How Custom Projects Work (6-Step Pipeline) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-mono font-bold uppercase text-orange-600">Step-by-Step Workflow</span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5">
                How Project Customization Works
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                From your initial idea to hardware delivery and viva preparation:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  step: '01',
                  title: 'Fill Google Form with Requirements',
                  desc: 'Submit your project title, college abstract, component wish-list, or problem statement using our Google Form link.',
                  icon: FileText,
                  badge: 'Initial Step'
                },
                {
                  step: '02',
                  title: 'Technical Review & Component Selection',
                  desc: 'Our engineers review your requirements and suggest optimal MCUs (ESP32, STM32, Arduino, FPGA) and sensor modules.',
                  icon: Cpu,
                  badge: 'Architecture'
                },
                {
                  step: '03',
                  title: 'Schematic & Custom PCB Design',
                  desc: 'We design custom schematics, double-sided PCB artwork, generate Gerber files, and verify circuit simulation.',
                  icon: CircuitBoard,
                  badge: 'Hardware'
                },
                {
                  step: '04',
                  title: 'Embedded Firmware & Code Testing',
                  desc: 'We develop clean, modular C/C++, Python, or Verilog code with full inline documentation and sensor calibration.',
                  icon: Code,
                  badge: 'Software'
                },
                {
                  step: '05',
                  title: 'PCB Assembly & Rigorous Testing',
                  desc: 'We fabricate the PCB, assemble components, test working hardware, and verify all edge scenarios.',
                  icon: ShieldCheck,
                  badge: 'Fabrication'
                },
                {
                  step: '06',
                  title: 'Delivery, Report & Viva Support',
                  desc: 'Delivered to your doorstep with 60+ page IEEE format documentation, PPT slides, demo video, and 1-on-1 viva prep.',
                  icon: CheckCircle2,
                  badge: 'Success'
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5 hover:border-orange-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        STEP {item.step}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {item.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Customization Domains */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-mono font-bold uppercase text-orange-600">ECE Specializations</span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5">
                Domains We Customize
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Tell us which domain your project falls under when filling the Google Form:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  domain: 'IoT & Smart Wireless',
                  tech: 'ESP32, LoRa, Zigbee, MQTT, AWS IoT, Mobile Apps',
                  icon: Radio,
                  color: 'text-amber-600 bg-amber-50 border-amber-200'
                },
                {
                  domain: 'Custom PCB & Power Electronics',
                  tech: 'SMPS, Inverters, Battery Management BMS, Solar MPPT',
                  icon: Zap,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
                {
                  domain: 'Robotics & Automation',
                  tech: 'Autonomous rovers, LiDAR navigation, ROS, Robotic arms',
                  icon: Bot,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
                {
                  domain: 'VLSI & Digital Systems',
                  tech: 'Xilinx Vivado, Verilog / VHDL, Spartan/Artix FPGAs',
                  icon: Cpu,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
                {
                  domain: 'Biomedical Electronics',
                  tech: 'ECG/EMG telemetry, Patient vital sensors, Wearables',
                  icon: Activity,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
                {
                  domain: 'Edge AI & TinyML',
                  tech: 'Edge Impulse, OpenCV on Raspberry Pi / Jetson Nano',
                  icon: Sparkles,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
                {
                  domain: 'Electric Vehicles (EV)',
                  tech: 'BLDC motor drivers, CAN bus telemetry, Regenerative braking',
                  icon: CircuitBoard,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
                {
                  domain: 'Industrial Embedded Systems',
                  tech: 'RS-485 Modbus, PLC interfacing, High-voltage isolation',
                  icon: Layers,
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.domain} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 space-y-2 hover:bg-white hover:shadow-xs transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cat.domain}</h4>
                    <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                      {cat.tech}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What is Included in Every Custom Project Package */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-orange-700">Complete Deliverables</span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5">
                What You Receive with Your Custom Project
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Every custom project comes with a comprehensive package ready for university submission:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                '100% Tested Working Hardware Model',
                'Custom Double-Sided Fabricated PCB',
                'Complete Commented Source Code (.c, .py, .v)',
                'Full 60+ Page IEEE Format Documentation',
                'University Review PPT Presentation Slides',
                'High-Resolution Schematic & Gerber Files',
                'Circuit Demonstration & Simulation Videos',
                '1-on-1 Online Viva Defense Coaching',
                'Full Replacement Warranty on Hardware Parts'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs font-mono text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call-to-Action Bar for Google Form */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight">
                Ready to submit your custom project topic?
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
                Fill the Google Form with your project requirements, college submission deadlines, and preferences. Our engineering team will review and contact you with feasibility and budget.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGoogleFormClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-mono font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Fill the Google Form</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
