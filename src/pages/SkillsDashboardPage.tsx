import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Award, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const SkillsDashboardPage: React.FC = () => {
  const { studentSkills, skills, opportunities, resources, badges } = useData();
  const { profile } = useAuth();

  // Aggregate user points
  const totalPoints = useMemo(() => {
    return studentSkills.reduce((sum, s) => sum + s.points, 0);
  }, [studentSkills]);

  // Radar chart data preparation
  const radarData = useMemo(() => {
    const keySkills = [
      'Embedded C',
      'Verilog',
      'PCB Design',
      'Analog Circuits',
      'ARM Cortex',
      'DSP',
      'IoT',
      'RTOS',
    ];

    return keySkills.map((name) => {
      const userSkill = studentSkills.find(
        (s) => s.skillName.toLowerCase() === name.toLowerCase()
      );
      return {
        subject: name,
        points: userSkill ? userSkill.points : 10, // baseline visual 10
        fullMark: 300,
      };
    });
  }, [studentSkills]);

  // Profile Strength Calculation (0 - 100%)
  const profileStrength = useMemo(() => {
    let score = 30; // base profile creation
    if (profile?.college) score += 15;
    if (profile?.department) score += 15;
    if (studentSkills.length > 0) score += 20;
    if (totalPoints >= 50) score += 10;
    if (badges.length > 0) score += 10;
    return Math.min(100, score);
  }, [profile, studentSkills, totalPoints, badges]);

  // Rule-based Recommendations: matching student interests & low-scoring skills
  const recommendations = useMemo(() => {
    const lowSkillNames = skills
      .filter((s) => {
        const found = studentSkills.find((us) => us.skillName === s.name);
        return !found || found.points < 50;
      })
      .map((s) => s.name);

    return opportunities.filter((opp) => {
      return opp.skillIds.some((s) => lowSkillNames.includes(s));
    }).slice(0, 3);
  }, [skills, studentSkills, opportunities]);

  return (
    <div className="min-h-screen bg-pcb-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16 max-w-7xl mx-auto space-y-8">
      
      {/* Title & Streak Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
            <Award className="w-4 h-4" /> Hardware Competency Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Skill Radar & Mastery Levels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Points are calculated server-side based on verified applications, lab packages, and completed coursework.
          </p>
        </div>

        {/* Gamified Streak & Total Points Chip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2 text-orange-800 shadow-2xs">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <div className="text-left font-mono">
              <span className="text-[10px] uppercase text-orange-600 font-semibold block">Active Streak</span>
              <span className="text-xs font-bold text-slate-900">5 Days</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800 shadow-2xs">
            <Zap className="w-4 h-4 text-amber-500" />
            <div className="text-left font-mono">
              <span className="text-[10px] uppercase text-amber-600 font-semibold block">Circuit XP</span>
              <span className="text-xs font-bold text-slate-900">{totalPoints} Pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Radar Chart + Profile Strength */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart (Recharts) */}
        <div className="lg:col-span-7 bg-white border border-orange-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-950 font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              ECE Domain Radar
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Target: 300+ Expert</span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#fed7aa" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Fira Code' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 300]} 
                  stroke="#fdba74" 
                  tick={{ fill: '#64748b', fontSize: 9 }} 
                />
                <Radar
                  name="Skill Points"
                  dataKey="points"
                  stroke="#ea580c"
                  fill="#f97316"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
            <span>Levels: Beginner (0-49) · Intermediate (50-149) · Advanced (150-299) · Expert (300+)</span>
          </div>
        </div>

        {/* Profile Strength & Milestone Badges */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Profile Strength Card */}
          <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-950 font-mono">Profile Readiness</h3>
              <span className="text-base font-bold font-mono text-orange-600">{profileStrength}%</span>
            </div>

            {/* Glowing Progress bar */}
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700 shadow-sm shadow-orange-400"
                style={{ width: `${profileStrength}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Recruiters prioritize profiles above 80% with verified application records and course completions.
            </p>
          </div>

          {/* Badges Vault */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-950 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Earned Badges ({badges.length})
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border text-center transition-all ${
                badges.some((b) => b.badgeId === 'first_apply')
                  ? 'bg-orange-50 border-orange-300 text-orange-800'
                  : 'bg-stone-50 border-stone-200 text-slate-400 opacity-60'
              }`}>
                <div className="w-8 h-8 rounded-full bg-orange-100 mx-auto mb-1 flex items-center justify-center text-orange-600">
                  ⚡
                </div>
                <h4 className="text-xs font-bold text-slate-900">First Apply</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Applied to first role</p>
              </div>

              <div className={`p-3 rounded-xl border text-center transition-all ${
                totalPoints >= 50
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-stone-50 border-stone-200 text-slate-400 opacity-60'
              }`}>
                <div className="w-8 h-8 rounded-full bg-amber-100 mx-auto mb-1 flex items-center justify-center text-amber-600">
                  🏆
                </div>
                <h4 className="text-xs font-bold text-slate-900">Skill Collector</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">50+ points scored</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED SKILL PROGRESS BARS */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950 font-mono">
          Hardware Skill Trackers
        </h2>

        {studentSkills.length === 0 ? (
          <p className="text-xs text-slate-500">
            No skill points logged yet. Apply to opportunities or complete resources to start accumulating verifiable points!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 sm:gap-4">
            {studentSkills.map((s) => {
              const maxPoints = 300;
              const percent = Math.min(100, Math.round((s.points / maxPoints) * 100));

              return (
                <div key={s.id} className="p-2.5 sm:p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 sm:space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono truncate">{s.skillName}</span>
                    <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full truncate self-start sm:self-auto ${
                      s.level === 'Expert' ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold' :
                      s.level === 'Advanced' ? 'bg-orange-100 text-orange-800 border border-orange-300 font-semibold' :
                      s.level === 'Intermediate' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-stone-100 text-slate-500'
                    }`}>
                      {s.level} ({s.points} pts)
                    </span>
                  </div>

                  <div className="w-full h-1.5 sm:h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RULE-BASED RECOMMENDATIONS (Matching interests & low-scoring skills) */}
      <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-950 font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              Recommended Opportunities For You
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Targeted roles matched against your selected interests and growth-opportunity skills.
            </p>
          </div>
          <Link to="/explore" className="text-xs text-orange-600 hover:underline font-semibold shrink-0">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {recommendations.map((opp) => (
            <div key={opp.id} className="chip-border bg-white rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-2xs border border-orange-100">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
                  {opp.companyName}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5 sm:mb-2 line-clamp-1">{opp.title}</h3>
                <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                  {opp.skillIds.slice(0, 2).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-stone-100 text-[9px] text-slate-600 font-mono truncate">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/opportunity/${opp.id}`}
                className="text-[10px] sm:text-[11px] font-semibold text-orange-600 flex items-center gap-1 group pt-1 border-t border-slate-100"
              >
                <span>Specs</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
