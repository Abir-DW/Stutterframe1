import React, { useState, useRef } from 'react';
import {
  Play,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  HelpCircle,
  Share2,
  Bookmark,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface PrimeHomeProps {
  navigate: (route: string) => void;
}

interface PrimeToolItem {
  id: string;
  title: string;
  category: string;
  imdb: string;
  year: string;
  runtime: string;
  badge: string;
  desc: string;
  icon: any;
  heroImg: string;
  tags: string[];
}

export const PrimeHome: React.FC<PrimeHomeProps> = ({ navigate }) => {
  const { triggerPageChangeEffect } = useSettings();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [watchlist, setWatchlist] = useState<string[]>(['movie-picker', 'gear-suggestor']);
  const [selectedTool, setSelectedTool] = useState<PrimeToolItem | null>(null);

  const lane1Ref = useRef<HTMLDivElement | null>(null);
  const lane2Ref = useRef<HTMLDivElement | null>(null);
  const lane3Ref = useRef<HTMLDivElement | null>(null);

  const primeTools: PrimeToolItem[] = [
    {
      id: 'movie-picker',
      title: 'THE MOVIE PICKER',
      category: 'Research & Grounding',
      imdb: '9.2',
      year: '2026',
      runtime: 'Real-time',
      badge: 'Included with Prime',
      desc: 'Specify genre, era, language, and emotional mood. Gemini scans live search indexes to retrieve one real, verified, currently existing film with researched IMDb ratings, casting, and authentic poster art.',
      icon: Film,
      heroImg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      tags: ['X-Ray Grounding', 'UHD', 'HDR10+', 'Official IMDb Ratings'],
    },
    {
      id: 'shot-rater',
      title: 'THE SHOT RATER',
      category: 'DP Multimodal Vision',
      imdb: '8.9',
      year: '2026',
      runtime: 'Instant Vision',
      badge: 'Prime Original',
      desc: 'Upload any still frame from your camera or grade. Choose from 4 evaluation tiers (Friendly, Constructive, Moderate, Brutal) to scrutinize framing geometry, key-to-fill lighting, skin tones, sensor noise, and VFX authenticity.',
      icon: Camera,
      heroImg: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      tags: ['4 Tiers', 'Vision AI', 'Lighting Ratios', 'Color Science'],
    },
    {
      id: 'script-lab',
      title: 'THE SCRIPT LAB',
      category: 'Screenplay Doctor & Co-Writer',
      imdb: '9.0',
      year: '2026',
      runtime: '₹ Budget Ready',
      badge: 'Included with Prime',
      desc: 'Evaluate screenplays across 4 critique tiers or co-write a propulsive, event-driven story detailing what happens to whom within strict Rupee budgets (₹) and crew limits.',
      icon: FileText,
      heroImg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      tags: ['Dialogue Doctor', 'Indian Rupee Logistics', '4 Tiers', 'Beats'],
    },
    {
      id: 'gear-suggestor',
      title: 'THE GEAR SUGGESTOR',
      category: 'Indian Filmmaking Logistics',
      imdb: '8.8',
      year: '2026',
      runtime: 'Amazon.in Live',
      badge: 'Prime Delivery',
      desc: 'Set your budget in INR and pick gear type (cameras, gimbals, mics, lighting). Searches live Amazon.in and Flipkart listings to find 3-4 real, available filmmaker products with genuine pricing.',
      icon: ShoppingBag,
      heroImg: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      tags: ['Amazon.in Listings', 'Flipkart Grounded', 'Verified ₹ Pricing', 'India Stock'],
    },
    {
      id: 'editor-advisor',
      title: 'EDITING HELP LAB',
      category: 'Hardware NLE Suite Matcher',
      imdb: '8.7',
      year: '2026',
      runtime: 'Device Benchmark',
      badge: 'Included with Prime',
      desc: 'Auto-detect your device specs or input your CPU, RAM, and GPU. Matches you with the ideal editor (Free, Pay Once, or Subscription), showing official logos, install sizes, proxy requirements, and direct download links.',
      icon: Scissors,
      heroImg: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      tags: ['Hardware Auto-Detect', 'Proxy Analysis', 'Logos & Links', 'Free & Paid'],
    },
    {
      id: 'faq',
      title: 'FAQ & ASSET VAULT',
      category: 'Cinematography Field Reference',
      imdb: '9.3',
      year: '2026',
      runtime: 'Comprehensive',
      badge: 'Prime Vault',
      desc: 'Abundant pre-compiled field answers on camera optics, lighting ratios, mobile iPhone/Android filmmaking, audio recording, and editing pipelines — paired with a curated directory of stock footage, music, and VFX sites with verified India pricing (₹).',
      icon: HelpCircle,
      heroImg: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
      tags: ['Offline Knowledge', 'India Stock Directory', 'Optics Ratios', 'Audio Physics'],
    },
  ];

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const offset = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const toggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleLaunch = (id: string, e: React.MouseEvent) => {
    triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    navigate(id);
  };

  const filteredTools = primeTools.filter((t) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'creation') return t.id === 'movie-picker' || t.id === 'script-lab';
    if (activeCategory === 'craft') return t.id === 'shot-rater';
    if (activeCategory === 'logistics') return t.id === 'gear-suggestor' || t.id === 'editor-advisor';
    return true;
  });

  return (
    <div className="w-full bg-[#0f172a] text-white min-h-screen pb-20 select-none font-sans overflow-x-hidden">
      {/* 1. AMAZON PRIME VIDEO HERO BANNER (1:1 Carousel) */}
      <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image with Prime Video Signature Deep Navy Scrim */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center sm:bg-[center_top_25%] scale-100"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=85)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-[#0f172a]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent w-full sm:w-2/3" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full pt-16 sm:pt-24 pb-8 space-y-4">
          {/* StutterFrame Prime Badge & X-Ray Tag */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#00a8e1] text-black font-black text-xs uppercase tracking-wider">
              <span>STUTTER</span>
              <span className="font-bold">FRAME</span>
            </span>
            <span className="text-xs font-semibold text-[#00a8e1] uppercase tracking-wider">
              &bull; INCLUDED WITH PRIME
            </span>
            <span className="px-1.5 py-0.5 rounded border border-zinc-600 text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
              X-RAY
            </span>
          </div>

          {/* Hero Title in Amazon Clean Bold Typography */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            StutterFrame Prime Cinematic Suite
          </h1>

          {/* Prime Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1">
              <span className="text-[#f59e0b] font-black">IMDb</span> 9.2
            </span>
            <span>&bull;</span>
            <span>2026</span>
            <span>&bull;</span>
            <span className="border border-zinc-500 px-1 py-0.2 text-[10px] rounded-xs">U/A 16+</span>
            <span>&bull;</span>
            <span className="text-[#00a8e1] font-semibold">UHD &bull; HDR10+</span>
            <span>&bull;</span>
            <span className="text-zinc-400">English [CC], Hindi [Audio]</span>
          </div>

          <p className="max-w-xl text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-3 leading-relaxed">
            The ultimate Amazon Prime Video filmmaker workspace. Co-write screenplays with real Rupee budgets, examine still frames with multimodal AI, search verified movies, and benchmark NLE editors.
          </p>

          {/* Action Buttons: Prime Electric Blue "Watch Now" + "+ Watchlist" */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={(e) => handleLaunch('shot-rater', e)}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-md bg-[#00a8e1] hover:bg-[#0092c5] active:scale-95 text-black font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black text-black" />
              <span>Watch Now &bull; Open Studio</span>
            </button>

            <button
              onClick={(e) => toggleWatchlist('shot-rater', e)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md bg-[#1a242f]/90 hover:bg-[#273746] active:scale-95 text-white font-semibold text-sm sm:text-base border border-zinc-600 transition-all cursor-pointer"
            >
              {watchlist.includes('shot-rater') ? (
                <>
                  <Check className="w-4 h-4 text-[#00a8e1]" />
                  <span>Added to Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedTool(primeTools[1])}
              className="p-3 rounded-full bg-[#1a242f]/90 hover:bg-[#273746] text-white border border-zinc-600 transition-all cursor-pointer"
              title="Tool Details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION CATEGORY FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none border-y border-zinc-800/80 bg-[#0f172a]/95 backdrop-blur-md sticky top-14 sm:top-16 z-20">
        {[
          { id: 'all', label: 'All Instruments' },
          { id: 'creation', label: 'Screenplay & Research' },
          { id: 'craft', label: 'DP Vision & Frame Rater' },
          { id: 'logistics', label: 'India Gear & Editing Lab' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-white text-black font-bold'
                : 'text-zinc-400 hover:text-white bg-[#1a242f] border border-zinc-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. PRIME VIDEO HORIZONTAL SWIMLANES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-10">
        {/* SWIMLANE 1: PRIME: RECOMMENDED FOR YOU */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00a8e1] font-black uppercase text-xs tracking-wider">Prime</span>
              <span>Recommended Instruments</span>
            </h2>
          </div>

          <div className="relative group">
            <button
              onClick={() => handleScroll(lane1Ref, 'left')}
              className="absolute left-0 top-0 bottom-0 z-30 w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs rounded-r"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              ref={lane1Ref}
              className="flex items-stretch gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 snap-x touch-pan-x"
            >
              {filteredTools.map((tool) => {
                const isSaved = watchlist.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={(e) => handleLaunch(tool.id, e)}
                    className="flex-shrink-0 w-64 sm:w-72 md:w-80 group/card bg-[#1a242f] rounded-md overflow-hidden border border-zinc-800 hover:border-[#00a8e1]/60 transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black flex flex-col justify-between"
                  >
                    {/* Thumbnail with Prime Badge in top-left */}
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                      <img
                        src={tool.heroImg}
                        alt={tool.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#00a8e1] text-black text-[9px] font-black uppercase tracking-wider shadow">
                        prime
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-bold text-amber-400">
                        IMDb {tool.imdb}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a242f] via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-xs font-bold truncate drop-shadow">{tool.title}</span>
                        <tool.icon className="w-4 h-4 text-[#00a8e1] flex-shrink-0" />
                      </div>
                    </div>

                    {/* Card Content & Action Icons */}
                    <div className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span className="text-[#00a8e1] font-semibold text-[11px]">{tool.badge}</span>
                        <span className="text-zinc-400 text-[10px]">{tool.runtime}</span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunch(tool.id, e);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#00a8e1] transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#00a8e1] text-[#00a8e1]" />
                          <span>Open Suite</span>
                        </button>
                        <button
                          onClick={(e) => toggleWatchlist(tool.id, e)}
                          className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                          title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5 text-[#00a8e1]" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleScroll(lane1Ref, 'right')}
              className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs rounded-l"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* SWIMLANE 2: INDIAN CINEMATOGRAPHY GEAR & AMAZON.IN */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#00a8e1] font-black uppercase text-xs tracking-wider">Store</span>
              <span>Amazon.in &amp; Flipkart Grounded Equipment</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {primeTools.slice(2, 5).map((tool) => (
              <div
                key={tool.id}
                onClick={(e) => handleLaunch(tool.id, e)}
                className="group p-5 rounded-md bg-[#1a242f] border border-zinc-800 hover:border-[#00a8e1]/60 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#00a8e1] font-bold uppercase text-[10px]">{tool.badge}</span>
                    <span className="text-amber-400 font-bold">IMDb {tool.imdb}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00a8e1] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300 group-hover:text-white">
                  <span className="text-[#00a8e1] font-semibold">Available Now</span>
                  <ArrowRight className="w-4 h-4 text-[#00a8e1] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. PRIME DETAILS MODAL */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#1a242f] rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
            <button
              onClick={() => setSelectedTool(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video w-full">
              <img
                src={selectedTool.heroImg}
                alt={selectedTool.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a242f] via-[#1a242f]/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#00a8e1] uppercase tracking-wider block">
                    {selectedTool.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {selectedTool.title}
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    setSelectedTool(null);
                    handleLaunch(selectedTool.id, e);
                  }}
                  className="px-6 py-2 rounded-md bg-[#00a8e1] hover:bg-[#0092c5] text-black font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>Watch Now</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-[#00a8e1] font-bold">IMDb {selectedTool.imdb}</span>
                <span>{selectedTool.year}</span>
                <span className="border border-zinc-600 px-1 text-zinc-400 text-xs">UHD</span>
                <span className="border border-zinc-600 px-1 text-zinc-400 text-xs">HDR</span>
              </div>
              <p className="leading-relaxed text-zinc-300 font-sans">
                {selectedTool.desc}
              </p>
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-2">
                <span className="text-zinc-500">Features:</span>
                {selectedTool.tags.map((tag, i) => (
                  <span key={i} className="text-zinc-300 text-xs">
                    {tag}
                    {i < selectedTool.tags.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
