import React, { useState, useRef } from 'react';
import {
  Play,
  Info,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  ThumbsUp,
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  HelpCircle,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface NetflixHomeProps {
  navigate: (route: string) => void;
}

interface NetflixToolCard {
  id: string;
  title: string;
  category: string;
  match: string;
  age: string;
  duration: string;
  tags: string[];
  desc: string;
  icon: any;
  heroImg: string;
  accent: string;
}

export const NetflixHome: React.FC<NetflixHomeProps> = ({ navigate }) => {
  const { triggerPageChangeEffect } = useSettings();
  const [isMuted, setIsMuted] = useState(true);
  const [myList, setMyList] = useState<string[]>(['movie-picker', 'shot-rater']);
  const [likedTools, setLikedTools] = useState<string[]>(['script-lab']);
  const [selectedToolModal, setSelectedToolModal] = useState<NetflixToolCard | null>(null);

  const row1Ref = useRef<HTMLDivElement | null>(null);
  const row2Ref = useRef<HTMLDivElement | null>(null);
  const row3Ref = useRef<HTMLDivElement | null>(null);

  const tools: NetflixToolCard[] = [
    {
      id: 'movie-picker',
      title: 'THE MOVIE PICKER',
      category: 'Research & Grounding',
      match: '99% Match',
      age: 'U/A 13+',
      duration: 'Live AI Curation',
      tags: ['Google Search Grounded', 'Verified Cinema', 'Authentic Posters'],
      desc: 'Specify genre, era, language, and emotional mood. Gemini scans live search indexes to retrieve one real, verified, currently existing film with researched IMDb ratings, casting, and authentic poster art.',
      icon: Film,
      heroImg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      accent: '#e50914',
    },
    {
      id: 'shot-rater',
      title: 'THE SHOT RATER',
      category: 'Multimodal Vision Critic',
      match: '98% Match',
      age: '16+',
      duration: '4 Critique Tiers',
      tags: ['Multimodal Computer Vision', 'Lighting Ratios', 'Friendly to Brutal'],
      desc: 'Upload any still frame from your camera or grade. Scrutinize framing geometry, key-to-fill lighting, skin tones, sensor noise, and VFX authenticity.',
      icon: Camera,
      heroImg: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      accent: '#e50914',
    },
    {
      id: 'script-lab',
      title: 'THE SCRIPT LAB',
      category: 'Screenplay Doctor',
      match: '97% Match',
      age: 'U/A 16+',
      duration: '₹ Budget Grounded',
      tags: ['Scene Co-Writing', 'Event-Driven Beating', 'Indian Rupee Logistics'],
      desc: 'Evaluate screenplays across 4 critique tiers or co-write a propulsive, event-driven story detailing what happens to whom within strict Rupee budgets (₹) and crew limits.',
      icon: FileText,
      heroImg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      accent: '#e50914',
    },
    {
      id: 'gear-suggestor',
      title: 'THE GEAR SUGGESTOR',
      category: 'Indian Filmmaking Logistics',
      match: '96% Match',
      age: 'All Ages',
      duration: 'Amazon & Flipkart',
      tags: ['Real INR Pricing', 'Verified Direct Links', 'Camera Equipment'],
      desc: 'Set your budget in INR and pick gear type (cameras, gimbals, mics, lighting). Searches live Amazon.in and Flipkart listings to find 3-4 real, available filmmaker products with genuine pricing.',
      icon: ShoppingBag,
      heroImg: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      accent: '#e50914',
    },
    {
      id: 'editor-advisor',
      title: 'EDITING HELP LAB',
      category: 'NLE Hardware Suite Matcher',
      match: '95% Match',
      age: 'All Ages',
      duration: 'Hardware Benchmark',
      tags: ['Hardware Detection', 'Proxy Rules', 'Direct Official Downloads'],
      desc: 'Auto-detect your device specs or input your CPU, RAM, and GPU. Matches you with the ideal editor (Free, Pay Once, or Subscription), showing official logos, install sizes, proxy requirements, and direct download links.',
      icon: Scissors,
      heroImg: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      accent: '#e50914',
    },
    {
      id: 'faq',
      title: 'FAQ & ASSET VAULT',
      category: 'Cinematography Knowledge',
      match: '94% Match',
      age: 'All Ages',
      duration: 'Offline Reference',
      tags: ['Camera Optics', 'Lighting Ratios', 'Stock Assets in ₹'],
      desc: 'Abundant pre-compiled field answers on camera optics, lighting ratios, mobile iPhone/Android filmmaking, audio recording, and editing pipelines — paired with a curated directory of stock footage, music, and VFX sites with verified India pricing (₹).',
      icon: HelpCircle,
      heroImg: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
      accent: '#e50914',
    },
  ];

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const offset = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const toggleList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMyList((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTools((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleLaunch = (id: string, e: React.MouseEvent) => {
    triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    navigate(id);
  };

  return (
    <div className="w-full bg-[#141414] text-[#e5e5e5] min-h-screen pb-20 select-none font-sans overflow-x-hidden">
      {/* 1. BILLBOARD HERO SECTION (1:1 Netflix Desktop & Mobile) */}
      <section className="relative w-full min-h-[65vh] sm:min-h-[75vh] flex items-center overflow-hidden">
        {/* Cinematic Backdrop Image with Dark Netflix Scrim Gradients */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center sm:bg-[center_top_20%] scale-105 transition-transform duration-1000"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=85)',
            }}
          />
          {/* Top Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent h-32" />
          {/* Left Vignette for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent w-full sm:w-2/3" />
          {/* Bottom Seamless Gradient Fade into Rows */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        </div>

        {/* Hero Billboard Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full pt-16 sm:pt-24 pb-12 flex flex-col justify-end space-y-4 sm:space-y-6">
          {/* StutterFrame Original Ribbon Lockup */}
          <div className="flex items-center gap-2">
            <span className="text-[#e50914] font-black text-2xl tracking-tighter drop-shadow-md font-['Bebas_Neue',sans-serif]">S</span>
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.3em] uppercase text-zinc-300">
              ORIGINAL SUITE
            </span>
          </div>

          {/* Hero Title in authentic Netflix condensed bold display */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider uppercase text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none font-['Bebas_Neue',sans-serif]">
            STUTTER<span className="text-[#e50914]">FRAME</span>
          </h1>

          {/* Metadata Badges line */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            <span className="text-[#46d369] font-bold">99% Match</span>
            <span className="px-1.5 py-0.5 rounded-xs border border-zinc-500 text-[10px] text-zinc-300">2026</span>
            <span className="px-1.5 py-0.5 rounded-xs border border-zinc-500 text-[10px] text-zinc-300">U/A 16+</span>
            <span className="text-zinc-300">6 Cine Instruments</span>
            <span className="px-1.5 py-0.2 rounded-xs border border-zinc-500 text-[9px] text-zinc-300 font-mono">
              ULTRA HD 4K
            </span>
            <span className="text-zinc-400 text-xs hidden sm:inline">Dolby Vision &bull; 5.1 Audio</span>
          </div>

          {/* Synopsis */}
          <p className="max-w-xl text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-3 sm:line-clamp-4 leading-relaxed drop-shadow-sm font-sans">
            An elite cinematic platform built for directors, cinematographers, and screenplay authors.
            Deploy live search-grounded movie curation, computer vision shot critique, India gear logistics, and NLE hardware benchmarking.
          </p>

          {/* Netflix Dual Action Buttons + Right Rating/Mute Lockup */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              {/* White "Play" Button */}
              <button
                onClick={(e) => handleLaunch('movie-picker', e)}
                className="flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded bg-white hover:bg-white/80 active:scale-95 text-black font-bold text-sm sm:text-base shadow-xl transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-black text-black" />
                <span>Play Studio</span>
              </button>

              {/* Translucent "More Info" Button */}
              <button
                onClick={() => setSelectedToolModal(tools[0])}
                className="flex items-center gap-2 px-5 sm:px-7 py-2 sm:py-3 rounded bg-zinc-600/70 hover:bg-zinc-600/50 active:scale-95 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all cursor-pointer"
              >
                <Info className="w-5 h-5" />
                <span>More Info</span>
              </button>
            </div>

            {/* Right Mute & Age Rating Lockup */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 sm:p-2.5 rounded-full border border-zinc-500/80 bg-black/40 hover:border-white text-white backdrop-blur-sm transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label="Toggle Volume"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="py-1 px-3 bg-black/60 border-l-4 border-zinc-300 text-xs font-semibold text-zinc-300">
                16+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NETFLIX HORIZONTAL CONTENT ROWS */}
      <div className="relative z-20 space-y-8 sm:space-y-12 -mt-8 sm:-mt-12 px-4 sm:px-8 lg:px-12">
        {/* ROW 1: TRENDING NOW IN CINEMATIC SUITES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Trending in Cinematic Instruments</span>
              <span className="text-[#e50914] text-xs font-mono font-normal hidden sm:inline">&bull; Explore All &rarr;</span>
            </h2>
          </div>

          <div className="relative group">
            {/* Scroll Left Button */}
            <button
              onClick={() => handleScroll(row1Ref, 'left')}
              className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs rounded-r"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Row Slider Track */}
            <div
              ref={row1Ref}
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 snap-x touch-pan-x"
            >
              {tools.map((tool) => {
                const isSaved = myList.includes(tool.id);
                const isLiked = likedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={(e) => handleLaunch(tool.id, e)}
                    className="flex-shrink-0 w-64 sm:w-72 md:w-80 group/card bg-[#181818] rounded-md overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:scale-105 hover:z-30 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-black"
                  >
                    {/* Thumbnail with Netflix Badge */}
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                      <img
                        src={tool.heroImg}
                        alt={tool.title}
                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#e50914] text-white text-[9px] font-black uppercase tracking-wider">
                        STUTTERFRAME
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-xs font-bold truncate drop-shadow">{tool.title}</span>
                        <tool.icon className="w-4 h-4 text-[#e50914] flex-shrink-0" />
                      </div>
                    </div>

                    {/* Card Content & Action Icons */}
                    <div className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunch(tool.id, e);
                            }}
                            className="w-7 h-7 rounded-full bg-white hover:bg-white/80 text-black flex items-center justify-center transition-all cursor-pointer"
                            title="Launch Tool"
                          >
                            <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                          </button>
                          <button
                            onClick={(e) => toggleList(tool.id, e)}
                            className="w-7 h-7 rounded-full border border-zinc-500 hover:border-white text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
                            title={isSaved ? 'Remove from My List' : 'Add to My List'}
                          >
                            {isSaved ? <Check className="w-3.5 h-3.5 text-[#46d369]" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => toggleLike(tool.id, e)}
                            className="w-7 h-7 rounded-full border border-zinc-500 hover:border-white text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
                            title="Rate Tool"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'text-[#e50914]' : ''}`} />
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedToolModal(tool);
                          }}
                          className="w-7 h-7 rounded-full border border-zinc-500 hover:border-white text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
                          title="Tool Details"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Tool Tags */}
                      <div className="flex items-center gap-2 text-[11px] font-semibold">
                        <span className="text-[#46d369]">{tool.match}</span>
                        <span className="border border-zinc-600 px-1 text-[9px] text-zinc-400">{tool.age}</span>
                        <span className="text-zinc-400 text-[10px]">{tool.duration}</span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => handleScroll(row1Ref, 'right')}
              className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs rounded-l"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* ROW 2: TOP 10 IN STUTTERFRAME TODAY (Iconic 3D Outlined Numerals) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white">
              Top 10 Instruments in StutterFrame Today
            </h2>
          </div>

          <div className="relative group">
            <button
              onClick={() => handleScroll(row2Ref, 'left')}
              className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs rounded-r"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              ref={row2Ref}
              className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-3 snap-x touch-pan-x"
            >
              {tools.map((tool, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={tool.id}
                    onClick={(e) => handleLaunch(tool.id, e)}
                    className="flex-shrink-0 flex items-center group/rank cursor-pointer"
                  >
                    {/* Massive 3D Netflix Outlined Rank Number */}
                    <span
                      className="text-7xl sm:text-8xl md:text-9xl font-black font-['Bebas_Neue',sans-serif] leading-none select-none tracking-tighter"
                      style={{
                        color: '#141414',
                        WebkitTextStroke: '4px #595959',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                      }}
                    >
                      {rank}
                    </span>

                    {/* Poster Card */}
                    <div className="w-36 sm:w-44 h-52 sm:h-64 rounded-md overflow-hidden bg-[#181818] border border-zinc-800 group-hover/rank:border-zinc-500 group-hover/rank:scale-105 transition-all duration-300 relative shadow-xl -ml-4 z-10 flex flex-col justify-between p-3">
                      <div className="absolute inset-0 z-0">
                        <img
                          src={tool.heroImg}
                          alt={tool.title}
                          className="w-full h-full object-cover opacity-60 group-hover/rank:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                      </div>

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#e50914] uppercase">TOP {rank}</span>
                        <tool.icon className="w-4 h-4 text-white" />
                      </div>

                      <div className="relative z-10 space-y-1">
                        <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-tight">
                          {tool.title}
                        </h3>
                        <span className="text-[10px] text-[#46d369] block font-semibold">{tool.match}</span>
                        <button
                          onClick={(e) => handleLaunch(tool.id, e)}
                          className="w-full py-1.5 rounded bg-[#e50914] hover:bg-[#b81d24] text-white text-[10px] font-bold uppercase transition-colors"
                        >
                          Launch
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleScroll(row2Ref, 'right')}
              className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs rounded-l"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* ROW 3: SCRIPT LAB & MULTIMODAL VISION SUITES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white">
              Award-Winning Screenplay &amp; Frame Critique
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.slice(1, 4).map((tool) => (
              <div
                key={tool.id}
                onClick={(e) => handleLaunch(tool.id, e)}
                className="group p-5 rounded-md bg-[#181818] border border-zinc-800 hover:border-zinc-600 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#e50914] font-bold uppercase text-[10px]">{tool.category}</span>
                    <span className="text-[#46d369] font-semibold">{tool.match}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#e50914] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300 group-hover:text-white">
                  <span>Enter Suite</span>
                  <ArrowRight className="w-4 h-4 text-[#e50914] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. NETFLIX DETAILS MODAL (when "More Info" is clicked) */}
      {selectedToolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#181818] rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
            <button
              onClick={() => setSelectedToolModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video w-full">
              <img
                src={selectedToolModal.heroImg}
                alt={selectedToolModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#e50914] uppercase tracking-wider block">
                    STUTTERFRAME CINEMA TOOL
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-['Bebas_Neue',sans-serif]">
                    {selectedToolModal.title}
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    setSelectedToolModal(null);
                    handleLaunch(selectedToolModal.id, e);
                  }}
                  className="px-6 py-2 rounded bg-white hover:bg-white/80 text-black font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>Launch Tool</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-[#46d369]">{selectedToolModal.match}</span>
                <span className="border border-zinc-600 px-1 text-zinc-400 text-xs">{selectedToolModal.age}</span>
                <span>{selectedToolModal.duration}</span>
                <span className="border border-zinc-600 px-1 text-zinc-400 text-xs">HD</span>
              </div>
              <p className="leading-relaxed text-zinc-300 font-sans">
                {selectedToolModal.desc}
              </p>
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-2">
                <span className="text-zinc-500">Tags:</span>
                {selectedToolModal.tags.map((tag, i) => (
                  <span key={i} className="text-zinc-300 text-xs">
                    {tag}
                    {i < selectedToolModal.tags.length - 1 ? ' · ' : ''}
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
