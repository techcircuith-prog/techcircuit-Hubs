import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ProjectImage } from '../components/common/ProjectImage';
import { 
  Cpu, 
  Zap, 
  Briefcase, 
  BookOpen, 
  Search, 
  ArrowRight, 
  Award, 
  CheckCircle2,
  Wrench,
  ExternalLink,
  GraduationCap,
  MoveUpRight,
  Radio,
  TrendingUp,
  Play,
  Clock3,
  BookmarkCheck,
  CirclePlay,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { opportunities, projects, learningPaths, resources } = useData();

  const featuredOpps = opportunities.slice(0, 4);
  const featuredProjs = projects.slice(0, 3);
  const featuredLearningPath = learningPaths.find((path) => path.status === 'published');
  const opportunityCards = [
    {
      title: 'Internships',
      description: 'Get real industry experience.',
      image: '/home-cards/internships.png',
      alt: 'Students exploring engineering internship opportunities',
      href: '/explore?tab=internships',
      tag: 'Career start',
    },
    {
      title: 'Training',
      description: 'Build practical, job-ready skills.',
      image: '/home-cards/real-time-projects.png',
      alt: 'Students learning engineering skills through training',
      href: '/explore?tab=trainings',
      tag: 'Learn by doing',
    },
    {
      title: 'Hackathons',
      description: 'Create solutions with a team.',
      image: '/home-cards/hackathons.png',
      alt: 'Students collaborating on a hackathon project',
      href: '/explore?tab=hackathons',
      tag: 'Build together',
    },
    {
      title: 'Resources',
      description: 'Find guides, notes, and tutorials.',
      image: '/home-cards/resources.png',
      alt: 'Learning resources for electronics and communication students',
      href: '/explore?tab=resources',
      tag: 'Keep learning',
    },
    {
      title: 'Real-time Projects',
      description: 'Explore hands-on project ideas.',
      image: '/home-cards/training.png',
      alt: 'Student working on an embedded real-time project',
      href: '/projects',
      tag: 'Hands-on',
    },
    {
      title: 'Components',
      description: 'Explore parts for your next build.',
      image: '/home-cards/components.png',
      alt: 'Electronic components used to build circuits',
      href: '/components',
      tag: 'Explore hardware',
    },
  ];
  const learningPathResources = featuredLearningPath
    ? resources.filter((resource) => featuredLearningPath.resourceIds.includes(resource.id) && resource.status === 'published').slice(0, 3)
    : resources.filter((resource) => resource.status === 'published').slice(0, 3);
  const opportunityCardsRef = useRef<HTMLDivElement>(null);

  const scrollOpportunityCards = (direction: 'left' | 'right') => {
    opportunityCardsRef.current?.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#fff8f1]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_30%,rgba(251,146,60,0.17),transparent_32%),linear-gradient(135deg,#fffaf5_0%,#fff7ed_55%,#fff_100%)]" />
        <div className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full border border-orange-200/60 sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -left-16 top-32 -z-10 h-56 w-56 rounded-full border border-orange-200/40 sm:h-80 sm:w-80" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-2xl animate-enter-soft">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-orange-800 shadow-sm sm:text-xs">
              <Radio className="h-3.5 w-3.5 text-orange-600" />
              Built for curious engineering students
            </div>
            <h1 className="mt-5 max-w-2xl text-[2.65rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:mt-6 sm:text-6xl lg:text-[4.35rem]">
              Learn skills that move your future{' '}
              <span className="relative inline-block text-orange-600">
                forward.
                <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-1 rounded-full bg-orange-200/70 sm:h-4" />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              Grow your engineering skills with guided learning, practical resources, and opportunities designed for students.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link
                to="/explore?tab=resources"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/25"
              >
                Start learning <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/explore?tab=internships"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
              >
                <Search className="h-4 w-4 text-orange-600" /> Find opportunities
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-orange-200/70 pt-5 text-xs font-semibold text-slate-600 sm:mt-10 sm:gap-x-7 sm:pt-6">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Learn at your own pace</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Turn knowledge into opportunity</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] animate-enter-soft [animation-delay:100ms]">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-orange-200/45 blur-2xl sm:-inset-8" />
            <div className="absolute -right-2 top-8 z-10 hidden rotate-6 rounded-2xl bg-orange-500 px-4 py-3 text-white shadow-lg shadow-orange-500/25 sm:block">
              <p className="text-[9px] font-bold uppercase tracking-wider text-orange-100">Keep growing</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold"><TrendingUp className="h-4 w-4" /> One skill at a time</p>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white p-4 shadow-[0_30px_90px_-40px_rgba(124,45,18,0.38)] sm:rounded-[2rem] sm:p-6">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-100/70 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-orange-800 sm:text-[10px]">
                      <BookOpen className="h-3 w-3" /> Learning pathway
                    </span>
                    <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                      {featuredLearningPath?.title || 'Build your engineering foundation'}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Follow a clear path from fundamentals to hands-on skills.
                    </p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20 sm:h-12 sm:w-12">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-orange-100 bg-[#fffaf5] p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-orange-700">Your learning route</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{featuredLearningPath?.level || 'Beginner'} · self-paced</p>
                    </div>
                    <span className="rounded-full border border-orange-100 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                      {learningPaths.filter((path) => path.status === 'published').length} learning paths
                    </span>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {(learningPathResources.length > 0 ? learningPathResources : [
                      { id: 'basics', title: 'Circuit fundamentals', type: 'guide' },
                      { id: 'digital', title: 'Digital design essentials', type: 'video' },
                      { id: 'tools', title: 'Tools & practical workflows', type: 'guide' },
                    ]).map((resource, index) => (
                      <div key={resource.id} className="flex items-center gap-3 rounded-xl border border-white bg-white px-3 py-2.5 shadow-sm">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${index === 0 ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700'}`}>
                          {index === 0 ? <Play className="h-3.5 w-3.5 fill-current" /> : <CirclePlay className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800 sm:text-sm">{resource.title}</span>
                        <span className="shrink-0 text-[9px] font-semibold capitalize text-slate-400">{resource.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 sm:text-xs">
                    <BookmarkCheck className="h-4 w-4 text-orange-600" />
                    <span>{resources.filter((resource) => resource.status === 'published').length} learning resources to explore</span>
                  </div>
                  <Link
                    to="/explore?tab=resources"
                    aria-label="Explore learning resources"
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-700 sm:px-4"
                  >
                    Explore <MoveUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-2 z-10 flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2.5 shadow-xl shadow-orange-950/10 sm:-bottom-5 sm:-left-5 sm:gap-3 sm:px-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-700">
                <Clock3 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-orange-700">Learn at your pace</p>
                <p className="text-[11px] font-bold text-slate-900 sm:text-xs">Start where you are</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT OPPORTUNITY PATHWAYS */}
      <section className="mx-auto w-full max-w-7xl border-b border-orange-100 bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 sm:text-xs">
              <Zap className="h-4 w-4" /> Learn · Build · Grow
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Find your next opportunity
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Choose a path to learn new skills, gain experience, and bring your ideas to life.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end">
            <span className="mr-1 hidden text-xs font-medium text-slate-400 sm:inline">Swipe to explore</span>
            <button
              type="button"
              aria-label="Scroll opportunity cards left"
              onClick={() => scrollOpportunityCards('left')}
              className="grid h-10 w-10 place-items-center rounded-full border border-orange-200 bg-white text-orange-700 transition hover:bg-orange-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll opportunity cards right"
              onClick={() => scrollOpportunityCards('right')}
              className="grid h-10 w-10 place-items-center rounded-full border border-orange-200 bg-white text-orange-700 transition hover:bg-orange-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={opportunityCardsRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Explore student learning and career paths"
        >
          {opportunityCards.map((card, index) => (
            <Link
              key={card.title}
              to={card.href}
              className="relative flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm sm:w-[calc((100%-1rem)/2)] sm:max-w-none lg:w-[calc((100%-2rem)/3)]"
              aria-label={`Explore ${card.title}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-white">
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-800 shadow-sm backdrop-blur sm:left-4 sm:top-4">
                  {card.tag}
                </span>
                <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white shadow-md transition group-hover:translate-x-0.5 group-hover:bg-orange-400 sm:bottom-4 sm:right-4">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-950 sm:text-lg">{card.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{card.description}</p>
                </div>
                <MoveUpRight className="h-4 w-4 shrink-0 text-orange-600" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-4 mt-5 flex items-center justify-between gap-3 border-t border-orange-100 pt-5">
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">Latest student openings</h3>
          <Link
            to="/explore?tab=internships"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800"
          >
            Browse openings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredOpps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredOpps.map((opp) => (
              <div
                key={opp.id}
                className="group flex flex-col justify-between rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-[#fffaf5] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-950/5 sm:p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider truncate ${
                      opp.type === 'internship' 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : opp.type === 'hackathon'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {opp.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 truncate">{opp.mode}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="mb-2 truncate text-xs font-semibold text-orange-700">{opp.companyName}</p>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {opp.skillIds.slice(0, 2).map((skill) => (
                      <span key={skill} className="max-w-full truncate rounded-full border border-orange-100 bg-white px-2 py-1 font-mono text-[10px] font-medium text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-orange-100 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-mono font-medium">Stipend</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">{opp.stipendOrFee}</span>
                  </div>
                  <Link
                    to={`/opportunity/${opp.id}`}
                    className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-50"
                  >
                    Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-[#fffaf5] p-8 text-center sm:p-12">
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
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 sm:text-xs">
              <Cpu className="w-4 h-4" /> 42 Verified Lab Projects
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Make something that matters
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

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {featuredProjs.map((proj) => {
            return (
              <div
                key={proj.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-950/5 sm:rounded-2xl"
              >
                <ProjectImage project={proj} className="aspect-[4/3] w-full shrink-0 bg-orange-50" imageClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-4">
                  <h3 className="mb-1 line-clamp-2 text-[11px] font-bold leading-snug text-slate-950 transition-colors group-hover:text-orange-700 sm:mb-2 sm:text-base">
                    {proj.title}
                  </h3>
                  <p className="mb-2 line-clamp-2 text-[9px] leading-relaxed text-slate-600 sm:mb-3 sm:text-xs">
                    {proj.description}
                  </p>
                  <div className="mb-2 hidden flex-wrap gap-1 sm:mb-3 sm:flex">
                    {proj.skillIds.slice(0, 2).map((s) => (
                      <span key={s} className="max-w-full truncate rounded border border-orange-100 bg-orange-50 px-1.5 py-0.5 font-mono text-[10px] text-orange-700">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto border-t border-orange-100 pt-2">
                    <span className="block truncate font-mono text-xs font-bold text-orange-600 sm:text-lg">
                      ₹{proj.price.toLocaleString('en-IN')}
                    </span>
                    <Link
                      to={`/project/${proj.id}`}
                      className="mt-2 flex w-full items-center justify-center rounded-lg bg-orange-600 px-2 py-2 text-center text-[10px] font-semibold text-white shadow-2xs transition-colors hover:bg-orange-700 sm:mt-3 sm:rounded-xl sm:py-2.5 sm:text-xs"
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
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
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
              className="flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-orange-50"
            >
              <span>View Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4-STEP HARDWARE ACCELERATOR PATHWAY */}
      <section className="mx-auto w-full max-w-7xl border-t border-orange-100 bg-[#fffaf5] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 sm:text-xs">One hub, more momentum</p>
          <h2 className="mb-2 text-xl font-extrabold text-slate-950 sm:text-3xl">
            A clear path from learning to doing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            From transistor fundamentals to landing Tier-1 VLSI & embedded systems engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
            <span className="absolute right-4 top-3 font-mono text-xl font-bold text-orange-200 transition-colors group-hover:text-orange-400">01</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Apply to Roles</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted openings for ASIC design, firmware, and PCB engineers with clear stipends.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
            <span className="absolute right-4 top-3 font-mono text-xl font-bold text-orange-200 transition-colors group-hover:text-orange-400">02</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Student Activity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keep track of applications, completed learning, and certificates in one place.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
            <span className="absolute right-4 top-3 font-mono text-xl font-bold text-orange-200 transition-colors group-hover:text-orange-400">03</span>
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Component Prices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find distributor prices and stock across Mouser, DigiKey, and Robu for student budgets.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
            <span className="absolute right-4 top-3 font-mono text-xl font-bold text-orange-200 transition-colors group-hover:text-orange-400">04</span>
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

      {/* EXPLORE THE CIRCUIT HUB */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-5 py-8 shadow-sm sm:rounded-[2rem] sm:px-12 sm:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 sm:text-xs">
              <Radio className="h-3.5 w-3.5" />
              Your next step starts here
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-4xl">
              Learn a skill. Build a project. Find your path.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Explore practical resources, hands-on ECE projects, and opportunities to grow your engineering career.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-orange-500 sm:text-sm"
              >
                Explore learning & opportunities
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-orange-50 sm:text-sm"
              >
                Browse project packages
                <ArrowRight className="h-4 w-4 text-orange-600" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
