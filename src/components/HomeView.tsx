import React from 'react';
import {
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Video,
  HelpCircle,
} from 'lucide-react';
import { TypewriterHero } from './TypewriterHero';
import { useSettings } from '../context/SettingsContext';

interface HomeViewProps {
  navigate: (route: string) => void;
}

// Subtle VHS celluloid background effect (rollback safeguard: set to false to instantly disable)
const ENABLE_VHS_BACKDROP = true;

export const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const { triggerPageChangeEffect } = useSettings();
  const tools = [
    {
      id: 'movie-picker',
      title: 'THE MOVIE PICKER',
      category: 'LIVE SEARCH-GROUNDED RESEARCH',
      icon: Film,
      description:
        'Specify genre, era, language, and emotional mood. Gemini scans live search indexes to retrieve one real, verified, currently existing film with researched IMDb ratings, casting, and authentic poster art.',
      badge: 'Google Search Grounding',
      highlight: 'Real verified films only &bull; Zero synthetic hallucinations',
    },
    {
      id: 'shot-rater',
      title: 'THE SHOT RATER',
      category: 'MULTIMODAL VISION CRITIC',
      icon: Camera,
      description:
        'Upload any still frame from your camera or grade. Choose from 4 evaluation tiers (Friendly, Constructive, Moderate, Brutal) to scrutinize framing geometry, key-to-fill lighting, skin tones, sensor noise, and VFX authenticity.',
      badge: '4 Evaluation Tiers • Vision',
      highlight: 'Friendly to Brutal tiers &bull; Lighting ratios & actionable fixes',
    },
    {
      id: 'script-lab',
      title: 'THE SCRIPT LAB',
      category: 'SCREENPLAY DOCTOR & CO-WRITER',
      icon: FileText,
      description:
        'Evaluate screenplays across 4 critique tiers (Friendly, Constructive, Moderate, Brutal) or co-write a propulsive, event-driven story detailing what happens to whom within strict Rupee budgets (₹) and crew limits.',
      badge: '4 Critique Tiers & ₹ Budgets',
      highlight: 'Event-driven story &bull; 4 rating tiers &bull; Real Rupee budgets',
    },
    {
      id: 'gear-suggestor',
      title: 'THE GEAR SUGGESTOR',
      category: 'INDIAN MARKET LOGISTICS',
      icon: ShoppingBag,
      description:
        'Set your budget in INR and pick gear type (cameras, gimbals, mics, lighting). Searches live Amazon.in and Flipkart listings to find 3-4 real, available filmmaker products with genuine pricing.',
      badge: 'Amazon.in & Flipkart Grounded',
      highlight: 'Real INR market prices &bull; Direct verified buy links',
    },
    {
      id: 'editor-advisor',
      title: 'THE EDITING HELP LAB',
      category: 'HARDWARE BENCHMARK & SUITE MATCHER',
      icon: Scissors,
      description:
        'Auto-detect your device specs or input your CPU, RAM, and GPU. Matches you with the ideal editor (Free, Pay Once, or Subscription), showing official logos, install sizes, proxy requirements, and direct download links.',
      badge: 'Auto Hardware Detection & Grounded',
      highlight: 'Device spec benchmark &bull; Logos & official downloads',
    },
    {
      id: 'faq',
      title: 'THE FAQ & ASSET VAULT',
      category: 'KNOWLEDGE BASE & ASSET DIRECTORY',
      icon: HelpCircle,
      description:
        'Abundant pre-compiled field answers on camera optics, lighting ratios, mobile iPhone/Android filmmaking, audio recording, and editing pipelines — paired with a curated directory of stock footage, music, and VFX sites with verified India pricing (₹).',
      badge: 'Sections & India Pricing ₹',
      highlight: 'Offline pre-typed &bull; 6 sections &bull; Real India subscription rates',
    },
  ];

  return (
    <>
      {/* Subtle VHS vintage background stripes & analog noise (rollback safeguard: set ENABLE_VHS_BACKDROP = false) */}
      {ENABLE_VHS_BACKDROP && (
        <div
          className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* 1. Visible horizontal CRT / VHS scanlines */}
          <div className="vhs-scanlines absolute inset-0 opacity-30 mix-blend-overlay" />

          {/* 2. Slow rolling tape tracking artifact band */}
          <div className="vhs-tracking-band absolute left-0 right-0 h-28" />

          {/* 3. Micro tape noise & horizontal static fringe */}
          <div className="vhs-static-noise vhs-flicker absolute inset-0 opacity-20 mix-blend-screen" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-12">
      {/* Hero Section with Stuttering Typewriter */}
      <section className="pt-4 sm:pt-8 pb-4">
        <TypewriterHero
          text="A CINEMATIC TOOLKIT FOR FILMMAKERS & MOVIE LOVERS."
          subtext="SEARCH-GROUNDED MOVIE CURATION &bull; COMPUTER VISION SHOT ANALYSIS &bull; SCRIPT DOCTORING &bull; REAL INDIAN GEAR LOGISTICS"
        />
      </section>

      {/* Tool Cards Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400" />
            <h2 className="font-courier text-sm sm:text-base font-bold text-white uppercase tracking-widest">
              PRIMARY CINEMATIC INSTRUMENTS
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={(e) => {
                  triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
                  navigate(tool.id);
                }}
                className="group p-6 sm:p-7 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer relative overflow-hidden backdrop-blur-xs hover:shadow-2xl hover:shadow-amber-500/5"
              >
                {/* Cinema tape amber accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent group-hover:via-amber-400 transition-all"></div>

                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
                      {tool.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-amber-300 transition-colors">
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-courier text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {tool.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans line-clamp-3">
                    {tool.description}
                  </p>

                  {/* Highlight pill */}
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: tool.highlight }}></span>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-amber-400 transition-colors">
                  <span>Enter Studio</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </>
  );
};
