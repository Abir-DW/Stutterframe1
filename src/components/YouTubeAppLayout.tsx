import React, { useState } from 'react';
import {
  Menu,
  Search,
  Mic,
  Plus,
  Bell,
  Settings,
  Sparkles,
  Home,
  Flame,
  Camera,
  FileText,
  Package,
  Scissors,
  HelpCircle,
  Film,
  User,
  Sliders,
  X,
  Compass,
  SunMedium,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface YouTubeAppLayoutProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAssistant: () => void;
  openAbout: () => void;
  children: React.ReactNode;
}

const YOUTUBE_CHIPS = [
  { id: 'all', label: 'All', route: 'home' },
  { id: 'shot-rater', label: 'Shot Rater & Vision AI', route: 'shot-rater' },
  { id: 'lens-compression', label: 'Lens Compression Lab', route: 'lens-compression' },
  { id: 'lighting-lut-lab', label: 'Lighting & LUT Lab', route: 'lighting-lut-lab' },
  { id: 'script-lab', label: 'Script Lab & Screenwriting', route: 'script-lab' },
  { id: 'gear-suggestor', label: 'Budget Gear Index (₹ INR / $)', route: 'gear-suggestor' },
  { id: 'movie-picker', label: 'Trending Movies & Vault', route: 'movie-picker' },
  { id: 'editor-advisor', label: 'Editor & Pacing Cut Advisor', route: 'editor-advisor' },
  { id: 'faq', label: 'Director FAQ', route: 'faq' },
];

export const YouTubeAppLayout: React.FC<YouTubeAppLayoutProps> = ({
  currentRoute,
  navigate,
  openAssistant,
  openAbout,
  children,
}) => {
  const { openSettings, isSidebarExpanded, setIsSidebarExpanded } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    if (q.includes('lighting') || q.includes('lut') || q.includes('kelvin') || q.includes('gaffer') || q.includes('falloff') || q.includes('color grade')) {
      navigate('lighting-lut-lab');
    } else if (q.includes('shot') || q.includes('rate') || q.includes('camera') || q.includes('vision')) {
      navigate('shot-rater');
    } else if (q.includes('lens') || q.includes('perspective') || q.includes('dolly')) {
      navigate('lens-compression');
    } else if (q.includes('script') || q.includes('scene') || q.includes('dialogue') || q.includes('screenplay')) {
      navigate('script-lab');
    } else if (q.includes('gear') || q.includes('budget') || q.includes('inr') || q.includes('buy') || q.includes('price')) {
      navigate('gear-suggestor');
    } else if (q.includes('edit') || q.includes('cut') || q.includes('montage') || q.includes('pace')) {
      navigate('editor-advisor');
    } else if (q.includes('movie') || q.includes('film') || q.includes('pick') || q.includes('watch')) {
      navigate('movie-picker');
    } else {
      openAssistant();
    }
    setIsSearchMobileOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movie-picker', label: 'Explore & Vault', icon: Flame },
    { id: 'shot-rater', label: 'Shot Rater', icon: Camera },
    { id: 'lens-compression', label: 'Lens Lab', icon: Compass },
    { id: 'lighting-lut-lab', label: 'Lighting & LUTs', icon: SunMedium },
    { id: 'script-lab', label: 'Script Lab', icon: FileText },
    { id: 'gear-suggestor', label: 'Gear Vault', icon: Package },
    { id: 'editor-advisor', label: 'Editor Advisor', icon: Scissors },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] flex flex-col font-sans select-none">
      {/* 1. AUTHENTIC YOUTUBE TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727] h-14 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger & YouTube StutterTube Brand */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-2 rounded-full hover:bg-[#272727] text-zinc-300 hover:text-white transition-colors cursor-pointer hidden md:flex items-center justify-center"
            title="Toggle YouTube Guide"
            aria-label="Toggle Guide"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer border-0 bg-transparent p-0 text-left"
          >
            {/* Authentic YouTube Red Play Badge */}
            <div className="w-8 h-6 rounded-[7px] bg-[#ff0000] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
            </div>
            <div className="flex items-baseline">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                StutterTube
              </span>
              <span className="text-[10px] font-bold text-zinc-400 ml-1 tracking-wider uppercase">
                IN
              </span>
            </div>
          </button>
        </div>

        {/* Center: Authentic YouTube Pill Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center justify-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center w-full max-w-xl group"
          >
            <div className="flex items-center flex-1 bg-[#121212] border border-[#303030] focus-within:border-[#1c62b9] rounded-l-full px-4 h-10 transition-colors">
              <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cinema tools, lighting fixes, budget gear ₹..."
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 px-6 bg-[#222222] border-y border-r border-[#303030] rounded-r-full hover:bg-[#272727] text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Voice / AI Sparkle Button */}
          <button
            onClick={openAssistant}
            className="ml-3 w-10 h-10 rounded-full bg-[#181818] hover:bg-[#272727] border border-[#272727] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Ask Director AI"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Search Toggle (when on small phone screens) */}
        {isSearchMobileOpen && (
          <div className="md:hidden absolute inset-x-0 top-0 h-14 bg-[#0f0f0f] z-50 px-3 flex items-center gap-2 border-b border-[#272727]">
            <button
              onClick={() => setIsSearchMobileOpen(false)}
              className="p-2 text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cinema tools..."
                className="w-full bg-[#181818] border border-[#303030] rounded-full px-4 py-1.5 text-sm text-white focus:outline-none"
              />
            </form>
          </div>
        )}

        {/* Right: Actions Cluster (Create, Notifications, Assistant, Preferences, Channel Avatar) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchMobileOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-[#272727] text-zinc-300 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* "+ Create" Button */}
          <button
            onClick={() => navigate('shot-rater')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#272727] hover:bg-[#3f3f3f] text-white text-xs font-semibold transition-colors cursor-pointer border border-[#383838]"
          >
            <Plus className="w-4 h-4 text-[#ff0000]" />
            <span>Create Frame</span>
          </button>

          {/* AI Director Assistant Trigger */}
          <button
            onClick={openAssistant}
            className="p-2 rounded-full hover:bg-[#272727] text-amber-400 hover:text-amber-300 transition-colors relative cursor-pointer"
            title="Open AI Director Assistant"
          >
            <Sparkles className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff0000] ring-2 ring-[#0f0f0f] animate-pulse" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="p-2 rounded-full hover:bg-[#272727] text-zinc-300 hover:text-white transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff0000] text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings Customizer Cog */}
          <button
            onClick={() => openSettings('themes')}
            className="p-2 rounded-full hover:bg-[#272727] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="YouTube & UI Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Channel / Director Profile Avatar */}
          <button
            onClick={openAbout}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff0000] to-amber-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#272727] hover:ring-[#ff0000] transition-all cursor-pointer ml-1"
            title="Director Profile & Credits"
          >
            SF
          </button>
        </div>
      </header>

      {/* 2. AUTHENTIC YOUTUBE FILTER CHIPS BAR */}
      <div className="sticky top-14 z-30 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727] py-2 px-3 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {YOUTUBE_CHIPS.map((chip) => {
            const isActive =
              (chip.route === 'home' && currentRoute === 'home') ||
              (chip.route !== 'home' && currentRoute === chip.route);

            return (
              <button
                key={chip.id}
                onClick={() => navigate(chip.route)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow'
                    : 'bg-[#272727] text-zinc-200 hover:bg-[#383838]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTIFICATION TOAST POPUP */}
      {showNotificationToast && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-[#212121] border border-[#383838] rounded-xl shadow-2xl p-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Director Alerts
            </span>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-[#333333] text-xs">
            <div className="py-2.5">
              <span className="font-semibold text-white block">Vision Rater Updated</span>
              <span className="text-zinc-400">Post-critique AI chat with budget gear suggestions is now active.</span>
            </div>
            <div className="py-2.5">
              <span className="font-semibold text-white block">YouTube Theme Live</span>
              <span className="text-zinc-400">Authentic 1:1 mobile dock and responsive layout loaded.</span>
            </div>
            <div className="py-2.5">
              <span className="font-semibold text-white block">India Gear Index</span>
              <span className="text-zinc-400">Budget lighting solutions under ₹5,000 available in Shot Rater.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE WITH DESKTOP SIDEBAR & CONTENT */}
      <div className="flex-1 flex">
        {/* DESKTOP SIDEBAR GUIDE */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#272727] bg-[#0f0f0f] transition-all duration-200 flex-shrink-0 sticky top-26 h-[calc(100vh-6.5rem)] overflow-y-auto no-scrollbar ${
            isSidebarExpanded ? 'w-56 px-3 py-2' : 'w-[72px] px-1 py-2'
          }`}
        >
          {/* Main Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex ${
                    isSidebarExpanded
                      ? 'items-center gap-4 px-3 py-2.5 rounded-xl text-left'
                      : 'flex-col items-center justify-center py-3 px-1 rounded-xl text-center'
                  } transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#272727] text-white font-semibold'
                      : 'text-zinc-300 hover:bg-[#272727]/60 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-5 h-5 mb-1'} ${
                      isActive ? 'text-[#ff0000]' : 'text-zinc-400'
                    }`}
                  />
                  <span
                    className={
                      isSidebarExpanded
                        ? 'text-sm font-medium tracking-tight'
                        : 'text-[10px] font-medium leading-tight line-clamp-1'
                    }
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded Sidebar Secondary Sections */}
          {isSidebarExpanded && (
            <>
              <hr className="my-3 border-[#272727]" />
              <div className="px-3 py-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  You &amp; Studio
                </span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={openAssistant}
                  className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-[#272727] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Director AI</span>
                </button>

                <button
                  onClick={() => openSettings('themes')}
                  className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-[#272727] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Sliders className="w-5 h-5 text-zinc-400" />
                  <span>Studio Themes</span>
                </button>

                <button
                  onClick={openAbout}
                  className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-[#272727] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <User className="w-5 h-5 text-zinc-400" />
                  <span>Director Credits</span>
                </button>

                <button
                  onClick={() => navigate('faq')}
                  className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-[#272727] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <HelpCircle className="w-5 h-5 text-zinc-400" />
                  <span>Cinema FAQ</span>
                </button>
              </div>

              <div className="mt-auto pt-6 px-3 text-[11px] text-zinc-500 space-y-1">
                <div>StutterTube Filmmaking Suite</div>
                <div>Engineered for Web &amp; Vercel</div>
                <div className="text-zinc-600">© 2026 StutterFrame Cinema</div>
              </div>
            </>
          )}
        </aside>

        {/* MAIN ROUTE CONTENT AREA */}
        <main className="flex-1 p-3 sm:p-6 pb-24 md:pb-12 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>

      {/* 4. AUTHENTIC YOUTUBE MOBILE BOTTOM DOCK (For phones, foldables, and flip devices) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0f0f0f]/98 backdrop-blur-lg border-t border-[#272727] h-14 px-2 flex items-center justify-around safe-area-bottom">
        {/* Home */}
        <button
          onClick={() => navigate('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${
            currentRoute === 'home' ? 'text-white' : 'text-zinc-400'
          }`}
        >
          <Home className={`w-5 h-5 ${currentRoute === 'home' ? 'text-white fill-white' : ''}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Explore / Movie Picker */}
        <button
          onClick={() => navigate('movie-picker')}
          className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${
            currentRoute === 'movie-picker' ? 'text-white' : 'text-zinc-400'
          }`}
        >
          <Flame className={`w-5 h-5 ${currentRoute === 'movie-picker' ? 'text-[#ff0000]' : ''}`} />
          <span className="text-[10px] mt-0.5">Explore</span>
        </button>

        {/* Center + (Shot Rater / Create Frame) */}
        <button
          onClick={() => navigate('shot-rater')}
          className="flex items-center justify-center flex-1 h-full cursor-pointer"
          title="Create Frame"
        >
          <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform bg-[#181818]">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Subscriptions / Script Lab */}
        <button
          onClick={() => navigate('script-lab')}
          className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${
            currentRoute === 'script-lab' ? 'text-white' : 'text-zinc-400'
          }`}
        >
          <FileText className={`w-5 h-5 ${currentRoute === 'script-lab' ? 'text-[#ff0000]' : ''}`} />
          <span className="text-[10px] mt-0.5">Lab</span>
        </button>

        {/* You / Settings / Assistant */}
        <button
          onClick={() => openSettings('themes')}
          className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-zinc-400 hover:text-white"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff0000] to-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
            SF
          </div>
          <span className="text-[10px] mt-0.5">You</span>
        </button>
      </nav>
    </div>
  );
};
