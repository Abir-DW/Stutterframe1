import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  PenTool,
  Bookmark,
  ChevronRight,
  IndianRupee,
  Users,
  Award,
  ShieldCheck,
  Minus,
  Plus,
  Clapperboard,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Smile,
} from 'lucide-react';
import { ScriptCritiqueResult, ScriptCowriteResult, CritiqueTier } from '../types';
import { ResearchingIndicator, ErrorState } from './ResearchingIndicator';

export const ScriptLab: React.FC = () => {
  const [mode, setMode] = useState<'critique' | 'cowrite'>('critique');
  const [tier, setTier] = useState<CritiqueTier>('constructive');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('Psychological Thriller');
  const [logline, setLogline] = useState('');

  // 4 Critique Tiers for Script Rater
  const CRITIQUE_TIERS: {
    id: CritiqueTier;
    label: string;
    badge: string;
    desc: string;
    scoreRange: string;
    icon: any;
    badgeClass: string;
    activeBorderClass: string;
    activeBgClass: string;
  }[] = [
    {
      id: 'friendly',
      label: 'Friendly',
      badge: 'Supportive & Generous',
      desc: 'Encouraging coverage highlighting character sparks, emotional voice, and creative potential with soft guidance.',
      scoreRange: '7.8 – 9.6',
      icon: Smile,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      activeBorderClass: 'border-emerald-500',
      activeBgClass: 'bg-emerald-950/30 text-emerald-300',
    },
    {
      id: 'constructive',
      label: 'Constructive',
      badge: 'Film School Mentor',
      desc: 'Balanced, craft-driven script doctoring analyzing objectives, subtext, dramatic tension, and line rewrites.',
      scoreRange: '6.5 – 8.6',
      icon: Scale,
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      activeBorderClass: 'border-sky-500',
      activeBgClass: 'bg-sky-950/30 text-sky-300',
    },
    {
      id: 'moderate',
      label: 'Moderate',
      badge: 'Studio Coverage Reader',
      desc: 'Objective, realistic benchmark evaluating script viability and execution without hyperbole.',
      scoreRange: '5.5 – 7.8',
      icon: SlidersHorizontal,
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      activeBorderClass: 'border-amber-500',
      activeBgClass: 'bg-amber-950/30 text-amber-300',
    },
    {
      id: 'brutal',
      label: 'Brutal',
      badge: 'Ruthless Studio Head',
      desc: 'Uncompromising, acid-tongued assessment. Tears apart on-the-nose dialogue, clichés, and flabby pacing.',
      scoreRange: '3.0 – 6.5',
      icon: Flame,
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      activeBorderClass: 'border-rose-500',
      activeBgClass: 'bg-rose-950/30 text-rose-300',
    },
  ];

  // Writer Limitations & Production Constraints (Rupees ₹)
  const [budget, setBudget] = useState('Micro-Budget (Under ₹1.5 Lakh / DIY)');
  const [customBudget, setCustomBudget] = useState('');
  const [isCustomBudget, setIsCustomBudget] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState('Independent Film Director');

  const [crewSize, setCrewSize] = useState('Skeleton Crew (2–4 people: Director, DP, Sound)');
  const [customCrewCount, setCustomCrewCount] = useState(3);
  const [isCustomCrew, setIsCustomCrew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState<number | null>(null);
  const [critiqueResult, setCritiqueResult] = useState<ScriptCritiqueResult | null>(null);
  const [cowriteResult, setCowriteResult] = useState<ScriptCowriteResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Budget Options in Indian Rupees (₹)
  const budgetOptions = [
    'Micro-Budget (Under ₹1.5 Lakh / DIY)',
    'Ultra-Low Budget (₹1.5 Lakh - ₹10 Lakh)',
    'Low-Budget Indie (₹10 Lakh - ₹75 Lakh)',
    'Mid-Tier Independent (₹75 Lakh - ₹5 Crore)',
    'Studio / Commercial (₹5 Crore+)',
    'Custom Budget Amount (in ₹)...',
  ];

  // Experience / Production Level Options
  const levelOptions = [
    'Student / First-Time Filmmaker',
    'Guerilla / Run-and-Gun Solo',
    'Independent Film Director',
    'Festival Semi-Pro / Boutique Team',
    'Studio / Commercial Veteran',
  ];

  // Crew Size Presets
  const crewPresets = [
    { label: 'Solo (1 Person)', count: 1, text: 'Solo Filmmaker (1 person - All-in-one)' },
    { label: 'Skeleton (2–4)', count: 3, text: 'Skeleton Crew (2–4 people: Director, DP, Sound)' },
    { label: 'Indie Team (5–10)', count: 7, text: 'Small Indie Crew (5–10 people)' },
    { label: 'Mid-Scale (12–25)', count: 15, text: 'Mid-Scale Production (12–25 people)' },
    { label: 'Studio (30+)', count: 35, text: 'Full Studio Crew (30+ people)' },
  ];

  // Preset script excerpts / prompts for quick evaluation
  const presets = [
    {
      label: 'Noir Interrogation',
      genre: 'Film Noir',
      logline: 'A disgraced detective confronts a witness who knows too much about the chief of police.',
      text: `INT. INTERROGATION ROOM - NIGHT

Rain lashes the wire-reinforced glass. A single tungsten bulb hums on a frayed cord.

DETECTIVE RAYMOND (40s, crumpled trench coat, tired eyes) slides a manila envelope across the steel table.

RAYMOND
You signed the manifest, Vince. Ten tons of unrefined pitchblende out of Bayonne.

VINCE (50s, scarred knuckles, unbothered) taps an unlit cigarette against the tabletop. Tap. Tap.

VINCE
Ink fades in the rain, Raymond. Just like memory.

RAYMOND
Not this ink. And not my memory.`,
    },
    {
      label: 'Sci-Fi Airlock Standoff',
      genre: 'Sci-Fi Thriller',
      logline: 'An engineer refuses to open the decontamination hatch after an expedition brings back anomalous samples.',
      text: `INT. ORBITAL RESEARCH STATION - AIRLOCK - ZERO G

Red emergency beacons rotate in dead silence.

DR. VERA CHEN (30s) presses her gloved hand against the reinforced polycarbonate viewport. Inside, COMMANDER MORROW floats in a pressurized EVA suit. The visor is frosted with black geometric crystals.

MORROW (O.S.)
(through coms, static-heavy)
Chen. Cycle the pressure. My primary oxygen valve is freezing over.

VERA
Look at your visor, Arthur.

MORROW
It's condensation. Cycle the hatch!

VERA
Condensation doesn't multiply against the glass.`,
    },
    {
      label: 'Indie Diner Reunion',
      genre: 'Indie Drama',
      logline: 'Two estranged sisters meet at 2 AM after seven years apart.',
      text: `INT. ROUTE 9 DINER - 2:00 AM

Fluorescent flicker. A coffee pot sizzles on a burnt hotplate.

CLARA (28, wool sweater, clutching a lukewarm mug) stares out at the empty interstate. Across the booth, MAYA (32, leather jacket, duffle bag at her boots) picks at a tear in the vinyl seat.

CLARA
You still smell like train smoke.

MAYA
Cheaper than cologne.

CLARA
Seven years, Maya. You could've sent a postcard. A blank one. Just to prove you had thumbs.

Maya smiles, but her eyes stay anchored to the table.`,
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setGenre(p.genre);
    setLogline(p.logline);
    setContent(p.text);
    setCritiqueResult(null);
    setCowriteResult(null);
  };

  const handleExecute = async () => {
    if (!content.trim() && !logline.trim()) {
      setError('Please provide script text, a scene beat, or a logline.');
      return;
    }

    setLoading(true);
    setError(null);
    setRetryDelaySeconds(null);
    setCritiqueResult(null);
    setCowriteResult(null);

    const effectiveBudget = isCustomBudget && customBudget.trim()
      ? customBudget.trim()
      : budget;

    const effectiveCrew = isCustomCrew
      ? `${customCrewCount} crew members`
      : `${customCrewCount} crew members (${crewSize})`;

    try {
      const payload: any = {
        mode,
        content,
        genre,
        logline,
      };

      if (mode === 'critique') {
        payload.tier = tier;
      } else {
        payload.budget = effectiveBudget;
        payload.experienceLevel = experienceLevel;
        payload.crewSize = effectiveCrew;
        payload.customCrewCount = customCrewCount;
      }

      const res = await fetch('/api/script-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMessage = '';
        try {
          const errData = await res.json();
          const delay = errData.retryDelaySeconds || (res.status === 429 ? 15 : null);
          setRetryDelaySeconds(delay);
          errMessage = errData.error || errData.message;
        } catch {
          const raw = await res.text().catch(() => '');
          errMessage = raw ? `Server returned: ${raw.slice(0, 180)}` : `Request failed with HTTP status ${res.status}`;
        }
        throw new Error(errMessage || `Failed to process script in Script Lab (${res.status}).`);
      }

      const data = await res.json();
      if (mode === 'critique') {
        setCritiqueResult(data.result);
      } else {
        setCowriteResult(data.result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error occurred while processing script.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    const textToCopy = cowriteResult?.storyAndOutline || cowriteResult?.screenplayText || content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-2">
          <FileText className="w-4 h-4" />
          Screenplay Craft & Dramatic Architecture
        </div>
        <h2 className="font-courier text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          THE SCRIPT LAB
        </h2>
        <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-mono">
          Screenplay doctoring and narrative co-writing. Toggle between rigorous industry critique (structure, dialogue subtext, action beats) or co-write an engaging, context-aware story and structured beat outline tailored to your budget (in ₹).
        </p>
      </div>

      {/* Mode Switcher Pill */}
      <div className="flex items-center justify-center mb-8">
        <div className="p-1 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setMode('critique')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'critique'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Script Rater &amp; Critique
          </button>
          <button
            onClick={() => setMode('cowrite')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'cowrite'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Story &amp; Events Co-Write
          </button>
        </div>
      </div>

      {/* Editor & Input Workspace */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 mb-8 space-y-4 shadow-xl backdrop-blur-sm">
        {/* Preset Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-3">
          <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-amber-400" />
            Load Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Inputs Grid: Genre & Logline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Psychological Thriller"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs font-mono text-white outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
              Logline / Central Dramatic Question
            </label>
            <input
              type="text"
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="e.g. A whistleblower must decide whether to betray her mentor during a live press conference."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs font-mono text-white outline-none"
            />
          </div>
        </div>

        {/* SCRIPT RATER EVALUATION TIERS (Critique Mode Only) */}
        {mode === 'critique' && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#0e0e12] border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="font-courier text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Script Rater Evaluation Tier
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Persona: <span className="text-white font-semibold capitalize">{tier}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {CRITIQUE_TIERS.map((t) => {
                const Icon = t.icon;
                const isSelected = tier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? `${t.activeBorderClass} ${t.activeBgClass} shadow-md`
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-courier font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {t.label}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${t.badgeClass}`}>
                          {t.scoreRange}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        {t.badge}
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-400 font-sans line-clamp-2">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* WRITER LIMITATIONS & PRODUCTION CONSTRAINTS (Co-Write Mode Only) */}
        {mode === 'cowrite' && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#0e0e12] border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="font-courier text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Writer Production Limitations &amp; Resource Ceiling (in ₹)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Guarantees Real-World Filmability
              </span>
            </div>

            <p className="text-[11px] font-mono text-zinc-400">
              Tell the AI your exact real-world constraints. The Co-Writer will restrict locations, cast size, lighting setups, and action beats so you can physically shoot the narrative within your budget (in ₹).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Production Budget in Rupees */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                    Budget Tier (₹)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomBudget(!isCustomBudget)}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {isCustomBudget ? 'Use Presets' : 'Custom Amount'}
                  </button>
                </div>

                {!isCustomBudget ? (
                  <select
                    value={budget}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Custom Budget Amount (in ₹)...') {
                        setIsCustomBudget(true);
                      } else {
                        setBudget(val);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs font-mono text-white outline-none cursor-pointer"
                  >
                    {budgetOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="e.g. ₹50,000, ₹5 Lakhs, ₹1.5 Crore..."
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-amber-400/60 focus:border-amber-400 text-xs font-mono text-amber-300 outline-none"
                      autoFocus
                    />
                  </div>
                )}
                <span className="text-[10px] font-mono text-zinc-500 block">
                  Limits locations and avoids costly prop/VFX traps.
                </span>
              </div>

              {/* 2. Experience / Production Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Production Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs font-mono text-white outline-none cursor-pointer"
                >
                  {levelOptions.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] font-mono text-zinc-500 block">
                  Shapes camera movement complexity &amp; staging speed.
                </span>
              </div>

              {/* 3. Customizable Crew Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Customizable Crew
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {customCrewCount} {customCrewCount === 1 ? 'person' : 'crew'}
                  </span>
                </div>

                {/* Headcount Stepper & Numeric Input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, customCrewCount - 1);
                      setCustomCrewCount(next);
                      setIsCustomCrew(true);
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Decrease crew size"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customCrewCount}
                      onChange={(e) => {
                        setCustomCrewCount(Math.max(1, parseInt(e.target.value) || 1));
                        setIsCustomCrew(true);
                      }}
                      className="w-full text-center px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs font-mono font-bold text-white outline-none"
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-mono text-zinc-500 pointer-events-none">
                      people
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = customCrewCount + 1;
                      setCustomCrewCount(next);
                      setIsCustomCrew(true);
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Increase crew size"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Preset Pills for Crew Formations */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {crewPresets.map((cp) => (
                    <button
                      key={cp.count}
                      type="button"
                      onClick={() => {
                        setCustomCrewCount(cp.count);
                        setCrewSize(cp.text);
                        setIsCustomCrew(false);
                      }}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                        customCrewCount === cp.count
                          ? 'bg-amber-500 text-black border-amber-500 font-bold'
                          : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Constraints Summary Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80 text-[11px] font-mono">
              <span className="text-zinc-500">Active Blueprint:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800">
                {isCustomBudget && customBudget.trim() ? customBudget.trim() : budget}
              </span>
              <span className="text-zinc-600">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                {experienceLevel}
              </span>
              <span className="text-zinc-600">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-zinc-800">
                {customCrewCount} Crew Headcount
              </span>
              {customCrewCount <= 3 && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1 ml-auto">
                  <CheckCircle2 className="w-3 h-3" />
                  AI will lock scene to 1 room, max 2-3 characters &amp; natural/practical lighting.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              {mode === 'critique'
                ? 'Screenplay Excerpt (Scene text, sluglines, dialogue)'
                : 'Story Premise / Characters / Starting Incident'}
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {content.length} characters &bull; {mode === 'critique' ? `Tier: ${tier}` : 'Event-Driven Story'}
            </span>
          </div>

          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              mode === 'critique'
                ? 'INT. COFFEE SHOP - DAY\n\nJOHN (30s) sits with cold tea...'
                : 'Describe your characters, their urgent goals, and the starting situation. The Co-Writer will craft a propulsive, event-driven story detailing exactly what happens to whom, advancing incidents, and a structured narrative beat outline tailored to your budget (in ₹)...'
            }
            className="w-full p-4 rounded-xl bg-[#0d0d10] border border-zinc-800 focus:border-amber-400 text-zinc-200 font-courier text-xs sm:text-sm leading-relaxed outline-none shadow-inner resize-y"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold font-mono tracking-wider text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer disabled:opacity-50 transition-all"
        >
          <Sparkles className="w-4 h-4 text-black" />
          {loading
            ? mode === 'critique'
              ? `Evaluating Screenplay (${tier.toUpperCase()} Tier)...`
              : `Drafting Event-Driven Story (${customCrewCount} Crew • ${isCustomBudget && customBudget ? customBudget : budget})...`
            : mode === 'critique'
            ? `Submit for Script Rating (${tier.toUpperCase()} Tier)`
            : `Co-Write Event-Driven Story & Outlines (Within Budget in ₹)`}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <ResearchingIndicator
          toolName={mode === 'critique' ? `Script Rater (${tier} tier)` : 'Story & Events Co-Writer'}
          customMessages={
            mode === 'critique'
              ? [
                  `Applying ${tier} evaluation standards to dramatic tension curve...`,
                  'Auditing dialogue subtext, character voice, and pacing...',
                  'Checking industry screenplay slugline & action formatting...',
                  'Drafting line-by-line actionable polish suggestions...',
                ]
              : [
                  'Establishing character objectives & inciting action incident...',
                  'Advancing cause-and-effect events & escalating obstacles...',
                  'Drafting decisive confrontation & plot turning point...',
                  'Structuring 5-part chronological event progression outline...',
                ]
          }
        />
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={handleExecute}
          toolName="Script Lab"
          title={mode === 'critique' ? 'Script Evaluation Notice' : 'Story Co-Writer Notice'}
          retryButtonText={mode === 'critique' ? 'Retry Script Evaluation' : 'Retry Story Generation'}
          retryDelaySeconds={retryDelaySeconds}
        />
      )}

      {/* CRITIQUE MODE RESULTS */}
      {critiqueResult && !loading && !error && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Summary Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400 text-xs font-mono uppercase tracking-widest">
                    Script Doctor Coverage
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider font-bold ${
                      (critiqueResult.tier || tier) === 'brutal'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : (critiqueResult.tier || tier) === 'friendly'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : (critiqueResult.tier || tier) === 'moderate'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    Tier: {critiqueResult.tier || tier}
                  </span>
                </div>
                <h3 className="font-courier text-2xl font-bold text-white">
                  Script Critique & Polish Pass
                </h3>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] font-mono text-amber-400 uppercase block">
                  Overall Score
                </span>
                <span className="font-courier text-2xl font-bold text-white">
                  {critiqueResult.score?.overall?.toFixed(1) || '8.0'}
                  <span className="text-xs text-amber-400">/10</span>
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-200 mt-4 leading-relaxed font-sans">
              {critiqueResult.executiveSummary}
            </p>

            {/* Sub-scores */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Dialogue
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {critiqueResult.score?.dialogue?.toFixed(1) || '8.0'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Pacing
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {critiqueResult.score?.pacing?.toFixed(1) || '7.5'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Formatting
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {critiqueResult.score?.formatting?.toFixed(1) || '8.5'}
                </span>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="font-courier text-sm font-bold text-emerald-400 uppercase tracking-wider">
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {critiqueResult.keyStrengths?.map((s, i) => (
                  <li key={i} className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="font-courier text-sm font-bold text-amber-400 uppercase tracking-wider">
                Critical Weaknesses & Pacing Hurdles
              </h4>
              <ul className="space-y-2">
                {critiqueResult.criticalWeaknesses?.map((w, i) => (
                  <li key={i} className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Screenplay Formatting & Subtext Analysis */}
          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div>
              <h4 className="font-courier text-sm font-bold text-white uppercase tracking-wider mb-1">
                Dialogue Naturalism & Subtext Critique
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {critiqueResult.subtextAndDialogueCritique}
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800">
              <h4 className="font-courier text-sm font-bold text-white uppercase tracking-wider mb-1">
                Industry Screenplay Formatting Notes
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {critiqueResult.formattingNotes}
              </p>
            </div>
          </div>

          {/* Actionable Line-by-Line Revisions */}
          {critiqueResult.actionableRevisions &&
            critiqueResult.actionableRevisions.length > 0 && (
              <div className="p-6 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-4">
                <h4 className="font-courier text-base font-bold text-amber-400 uppercase tracking-wider">
                  Script Doctor Revisions: Line-by-Line Polish
                </h4>

                <div className="space-y-3">
                  {critiqueResult.actionableRevisions.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                    >
                      <div className="text-xs font-mono text-zinc-400">
                        <span className="text-amber-400 font-bold">ORIGINAL BEAT:</span>{' '}
                        <span className="italic font-courier">"{rev.originalBeat}"</span>
                      </div>
                      <div className="text-xs font-mono text-zinc-400">
                        <span className="text-zinc-500">WHY IT FALTERS:</span> {rev.critique}
                      </div>
                      <div className="p-3 rounded-lg bg-black/60 border border-amber-500/20 text-xs font-courier text-amber-200">
                        <span className="text-amber-400 font-bold block mb-1">
                          SUGGESTED REWRITE:
                        </span>
                        {rev.suggestedRewrite}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* CO-WRITE MODE RESULTS */}
      {cowriteResult && !loading && !error && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-1">
                Event-Driven Story &amp; Action Progression
              </span>
              <h3 className="font-courier text-xl sm:text-2xl font-bold text-white">
                {cowriteResult.sceneTitle || 'Cinematic Narrative & Beat Outline'}
              </h3>
              {cowriteResult.loglineRefinement && (
                <p className="text-xs font-mono text-zinc-400 mt-1 italic">
                  "{cowriteResult.loglineRefinement}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Story & Outline'}
              </button>
              <button
                onClick={handleExecute}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>

          {/* Formatted Story & Beat Outlines Display */}
          <div className="rounded-2xl bg-[#0c0c0f] border-2 border-zinc-800 p-6 sm:p-10 shadow-2xl overflow-x-auto relative">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Event-Driven Story &amp; Beat Outline
            </div>

            <pre className="font-sans text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-w-3xl mx-auto selection:bg-amber-500/30">
              {cowriteResult.storyAndOutline || cowriteResult.screenplayText}
            </pre>
          </div>

          {/* PRODUCTION FEASIBILITY & EXECUTION BLUEPRINT */}
          {cowriteResult.productionConstraintsMet && (
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-courier text-base font-bold text-white uppercase tracking-wider">
                  Production Feasibility &amp; Execution Blueprint (in ₹)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Budget Assessment */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold uppercase">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Budget Compliance (in ₹)
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {cowriteResult.productionConstraintsMet.budgetAssessment}
                  </p>
                </div>

                {/* Crew Logistics Plan */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold uppercase">
                    <Users className="w-3.5 h-3.5" />
                    {customCrewCount}-Person Crew Plan
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {cowriteResult.productionConstraintsMet.crewLogisticsPlan}
                  </p>
                </div>

                {/* Location & Cast Containment */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase">
                    <Clapperboard className="w-3.5 h-3.5" />
                    Cast &amp; Location Scope
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {cowriteResult.productionConstraintsMet.castAndLocationFeasibility}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dramatic Analysis & Director's Technical Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-courier text-sm font-bold text-amber-400 uppercase tracking-wider">
                Dramaturgical Breakdown
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {cowriteResult.dramaticAnalysis}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-courier text-sm font-bold text-amber-400 uppercase tracking-wider">
                Director's Camera & Audio Notes
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {cowriteResult.directorNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
