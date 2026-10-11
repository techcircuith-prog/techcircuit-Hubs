import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Opportunity, Resource } from '../types';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink, 
  Play, 
  AlertTriangle, 
  PlusCircle, 
  Clock, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { OscilloscopeLoader } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ResourceSuggestModal } from '../components/modals/ResourceSuggestModal';
import { ResourceReportModal } from '../components/modals/ResourceReportModal';

const RESOURCE_CATEGORIES = [
  'All Categories',
  'Analog Electronics',
  'Digital Electronics',
  'Embedded Systems',
  'Microcontrollers',
  'VLSI',
  'Communication Systems',
  'DSP',
  'PCB Design',
  'IoT',
  'Programming',
  'Placement/Aptitude'
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'internships';

  const { 
    opportunities, 
    resources, 
    skills, 
    savedItemIds, 
    toggleSaveItem, 
    completeResource, 
    toggleBookmarkResource,
    loading 
  } = useData();

  const { user } = useAuth();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modals state
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [reportResourceId, setReportResourceId] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<Resource | null>(null);
  const [completedResourceIds, setCompletedResourceIds] = useState<string[]>([]);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    const oppType = activeTab === 'internships' ? 'internship' : activeTab === 'trainings' ? 'training' : 'hackathon';
    return opportunities.filter((opp) => {
      if (opp.type !== oppType) return false;
      if (opp.status !== 'published') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesComp = opp.companyName.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesSkill = opp.skillIds.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesComp && !matchesDesc && !matchesSkill) return false;
      }

      if (selectedSkill !== 'All' && !opp.skillIds.includes(selectedSkill)) {
        return false;
      }

      if (selectedMode !== 'All' && opp.mode !== selectedMode) {
        return false;
      }

      return true;
    });
  }, [opportunities, activeTab, searchQuery, selectedSkill, selectedMode]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (res.status !== 'published') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesSource = res.source.toLowerCase().includes(q);
        const matchesSkill = res.skillIds.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSource && !matchesSkill) return false;
      }

      if (selectedCategory !== 'All Categories' && res.category !== selectedCategory) {
        return false;
      }

      if (selectedSkill !== 'All' && !res.skillIds.includes(selectedSkill)) {
        return false;
      }

      if (selectedLevel !== 'All' && res.level !== selectedLevel.toLowerCase()) {
        return false;
      }

      if (selectedLanguage !== 'All' && res.language !== selectedLanguage) {
        return false;
      }

      if (selectedType !== 'All' && res.type !== selectedType.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [resources, searchQuery, selectedCategory, selectedSkill, selectedLevel, selectedLanguage, selectedType]);

  const handleMarkResourceComplete = async (resource: Resource) => {
    if (!user) {
      showToast('Please sign in to earn skill points');
      return;
    }
    setCompletingId(resource.id);
    try {
      const res = await completeResource(resource.id, resource.skillIds);
      setCompletedResourceIds((prev) => [...prev, resource.id]);
      showToast(res.message);
    } catch (err: any) {
      showToast('Could not complete resource: ' + (err.message || ''));
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pcb-grid flex items-center justify-center">
        <OscilloscopeLoader message="Fetching verified circuit opportunities..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 pb-24 md:pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xl animate-in fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="bg-white/95 border-b border-orange-100 sticky top-16 z-30 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setTab('internships')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'internships'
                  ? 'bg-orange-50 text-orange-600 border border-orange-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-orange-600" />
              <span>Internships</span>
            </button>

            <button
              onClick={() => setTab('trainings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'trainings'
                  ? 'bg-orange-50 text-orange-600 border border-orange-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <span>Trainings</span>
            </button>

            <button
              onClick={() => setTab('hackathons')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'hackathons'
                  ? 'bg-orange-50 text-orange-600 border border-orange-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-orange-600" />
              <span>Hackathons</span>
            </button>

            <button
              onClick={() => setTab('resources')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'resources'
                  ? 'bg-orange-50 text-orange-600 border border-orange-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span>Resources</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Search Bar & Filter Controls */}
        <div className="bg-white border border-orange-100 rounded-2xl p-4 mb-6 shadow-xs space-y-3">
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'resources' ? 'Search by title, topic, or skill (e.g. Verilog, RTOS, Falstad)...' : 'Search roles by title, company, or technology...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Quick Skill Dropdown */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 font-medium"
            >
              <option value="All">All Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Mode for Opportunities */}
            {activeTab !== 'resources' && (
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 font-medium"
              >
                <option value="All">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            )}
          </div>

          {/* Extra Filters for Resources */}
          {activeTab === 'resources' && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 outline-none focus:border-orange-500 font-medium"
                >
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 outline-none focus:border-orange-500 font-medium"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 outline-none focus:border-orange-500 font-medium"
                >
                  <option value="All">All Languages</option>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              {/* Suggest Resource Trigger */}
              <button
                onClick={() => setIsSuggestOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Suggest a Resource</span>
              </button>
            </div>
          )}

        </div>

        {/* ------------------------------------------- */}
        {/* OPPORTUNITY CARDS VIEW */}
        {/* ------------------------------------------- */}
        {activeTab !== 'resources' && (
          <div>
            {filteredOpportunities.length === 0 ? (
              <EmptyState
                title={opportunities.length === 0 ? "No department drives currently posted" : "No opportunities match your filters"}
                description={opportunities.length === 0 ? "Verified internship and industrial training programs will be listed here once announced." : "Try clearing your filters or searching for different keywords."}
                actionText={opportunities.length === 0 ? "Explore 42 Lab Projects" : "Reset filters"}
                onAction={() => {
                  if (opportunities.length === 0) {
                    window.location.href = '/projects';
                  } else {
                    setSearchQuery('');
                    setSelectedSkill('All');
                    setSelectedMode('All');
                  }
                }}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
                {filteredOpportunities.map((opp) => {
                  const isSaved = savedItemIds.includes(opp.id);
                  return (
                    <div
                      key={opp.id}
                      className="chip-border bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between hover:border-orange-400 transition-all group"
                    >
                      <div>
                        {/* Header: Company & Bookmark */}
                        <div className="flex items-start justify-between gap-1.5 sm:gap-3 mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-50 border border-orange-100 overflow-hidden flex items-center justify-center shrink-0">
                              {opp.companyLogo ? (
                                <img src={opp.companyLogo} alt={opp.companyName} className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                {opp.title}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-orange-600 font-semibold truncate">{opp.companyName}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleSaveItem(opp.id, 'opportunity')}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
                              isSaved ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            aria-label="Save opportunity"
                          >
                            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-2 mb-2 sm:mb-3 leading-relaxed hidden sm:block">
                          {opp.description}
                        </p>

                        {/* Location & Mode */}
                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] text-slate-500 mb-2 sm:mb-3 font-mono">
                          <span className="truncate">📍 {opp.location}</span>
                          <span>•</span>
                          <span className="text-orange-600 font-semibold shrink-0">{opp.mode}</span>
                        </div>

                        {/* Skill Tags */}
                        <div className="flex flex-wrap gap-1 mb-2.5 sm:mb-4">
                          {opp.skillIds.slice(0, 2).map((skill) => (
                            <span key={skill} className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-[9px] sm:text-[10px] text-orange-800 font-mono font-medium truncate">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Stipend & Detail Link */}
                      <div className="pt-2 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
                        <div>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block font-mono">Comp</span>
                          <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate block">{opp.stipendOrFee}</span>
                        </div>
                        <Link
                          to={`/opportunity/${opp.id}`}
                          className="w-full sm:w-auto text-center px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* RESOURCES CARDS VIEW */}
        {/* ------------------------------------------- */}
        {activeTab === 'resources' && (
          <div>
            {filteredResources.length === 0 ? (
              <EmptyState
                title={resources.length === 0 ? "No learning resources published yet" : "No resources match your filters"}
                description={resources.length === 0 ? "Curated lecture notes, datasheets, and video tutorials will be posted here." : "Try selecting a different category or search query."}
                actionText={resources.length === 0 ? "Suggest a Resource" : "Reset filters"}
                onAction={() => {
                  if (resources.length === 0) {
                    setIsSuggestOpen(true);
                  } else {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSelectedSkill('All');
                  }
                }}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
                {filteredResources.map((res) => {
                  const isBookmarked = savedItemIds.includes(res.id);
                  const isCompleted = completedResourceIds.includes(res.id);

                  return (
                    <div
                      key={res.id}
                      className="chip-border bg-white rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between hover:border-orange-400 transition-all group"
                    >
                      <div>
                        {/* Thumbnail or Video Cover */}
                        <div className="h-24 sm:h-40 bg-slate-100 relative overflow-hidden">
                          {res.thumbnailUrl ? (
                            <img src={res.thumbnailUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-500">
                              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 opacity-40" />
                            </div>
                          )}

                          {/* Resource Type Chip */}
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase bg-white/90 text-orange-700 border border-orange-200 shadow-2xs">
                              {res.type}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-white/90 text-slate-700 border border-slate-200 shadow-2xs font-medium hidden sm:inline">
                              {res.language}
                            </span>
                          </div>

                          {/* Play button overlay if video */}
                          {res.type === 'video' && (
                            <button
                              onClick={() => setActiveVideoModal(res)}
                              className="absolute inset-0 m-auto w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 border border-orange-300 text-orange-600 flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                              aria-label="Play video"
                            >
                              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                            </button>
                          )}
                        </div>

                        {/* Content Info */}
                        <div className="p-2.5 sm:p-4">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-[10px] sm:text-[11px] font-bold text-orange-600 truncate">{res.category}</span>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => toggleBookmarkResource(res.id)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                  isBookmarked ? 'text-orange-600' : 'text-slate-400'
                                }`}
                                title="Bookmark"
                              >
                                <Bookmark className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => setReportResourceId(res.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors hidden sm:block"
                                title="Report broken link"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2">
                            {res.title}
                          </h3>

                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 mb-2">
                            <span className="truncate">By <strong className="text-slate-700">{res.source}</strong></span>
                            {res.durationMin && (
                              <span className="flex items-center gap-0.5 font-mono shrink-0">
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" /> {res.durationMin}m
                              </span>
                            )}
                          </div>

                          {/* Skill Chips */}
                          <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
                            {res.skillIds.slice(0, 2).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-[9px] sm:text-[10px] text-orange-800 font-mono font-medium truncate">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-2.5 sm:p-4 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
                        {/* Complete button */}
                        <button
                          onClick={() => handleMarkResourceComplete(res)}
                          disabled={completingId === res.id || isCompleted}
                          className={`w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                            isCompleted
                              ? 'bg-orange-100 text-orange-800 border border-orange-300 cursor-default'
                              : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 cursor-pointer'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-orange-600" />
                          <span>{isCompleted ? 'Done (+5)' : 'Mark Done'}</span>
                        </button>

                        {/* Open external or video */}
                        {res.type === 'video' ? (
                          <button
                            onClick={() => setActiveVideoModal(res)}
                            className="w-full sm:w-auto px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>Watch</span>
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </button>
                        ) : (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* EMBEDDED YOUTUBE VIDEO MODAL (White & Orange) */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-orange-50 flex items-center justify-between border-b border-orange-100">
              <h4 className="text-xs font-mono font-bold text-slate-900 truncate max-w-md">
                {activeVideoModal.title}
              </h4>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-500 hover:text-slate-900 p-1 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={activeVideoModal.url.includes('youtube') 
                  ? activeVideoModal.url.replace('youtube.com', 'youtube-nocookie.com')
                  : activeVideoModal.url
                }
                title={activeVideoModal.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-3 bg-white flex items-center justify-between text-xs text-slate-600">
              <span>Source: <strong className="text-orange-600">{activeVideoModal.source}</strong></span>
              <button
                onClick={() => handleMarkResourceComplete(activeVideoModal)}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Mark as Completed (+5 Pts)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ResourceSuggestModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
      />

      <ResourceReportModal
        resourceId={reportResourceId}
        isOpen={!!reportResourceId}
        onClose={() => setReportResourceId(null)}
      />

    </div>
  );
};
