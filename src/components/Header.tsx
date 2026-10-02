import React, { useState } from 'react';
import {
  Film,
  Clapperboard,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  MessageSquare,
  Info,
  Settings,
  HelpCircle,
  Layers,
  ChevronDown,
  Command,
  Menu,
  Check,
  Play,
  Bell,
  Plus,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LayoutSwitcher } from './LayoutSwitcher';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAssistant: () => void;
  openAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  navigate,
  openAssistant,
  openAbout,
}) => {
  const {
    openSettings,
    uiStyle,
    uiLayout,
    actionPosition,
    setIsCommandPopupOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    triggerPageChangeEffect,
  } = useSettings();

  const [isDropdownNavOpen, setIsDropdownNavOpen] = useState(false);

  const navItems = [
    { id: 'movie-picker', label: 'Movie Picker', desc: 'AI film curation & verified watch options', icon: Film, cat: 'Creation' },
    { id: 'shot-rater', label: 'Shot Rater', desc: 'Director of Photography vision feedback', icon: Camera, cat: 'Craft' },
    { id: 'script-lab', label: 'Script Lab', desc: 'Screenplay co-writing & beat critique', icon: FileText, cat: 'Creation' },
    { id: 'gear-suggestor', label: 'Gear Suggestor', desc: 'Amazon & Flipkart India camera equipment', icon: ShoppingBag, cat: 'Logistics' },
    { id: 'editor-advisor', label: 'Editing Help', desc: 'Hardware-matched NLE advisor', icon: Scissors, cat: 'Logistics' },
    { id: 'faq', label: 'FAQ & Vault', desc: 'Director knowledge base & mechanics', icon: HelpCircle, cat: 'Reference' },
  ];

  const handleNavClick = (route: string, e: React.MouseEvent) => {
    setIsDropdownNavOpen(false);
    if (currentRoute !== route) {
      triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    }
    navigate(route);
  };

  const activeNavItem = navItems.find((n) => n.id === currentRoute);

  return (
    <header
      className="sticky top-0 z-30 w-full backdrop-blur-md border-b bg-[#09090b]/95 border-zinc-800/80"
    >
      <div
        className={`max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 ${
          actionPosition === 'center' ? 'sm:justify-around' : ''
        }`}
      >
        {/* Left: Mobile Sidebar Burger or Brand / Home link */}
        <div className="flex items-center gap-2">
          {uiLayout === 'sidebar' && (
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => handleNavClick('home', e)}
            className="flex items-center gap-2 sm:gap-2.5 text-left group transition-all cursor-pointer flex-shrink-0"
            title="Go to Home"
            aria-label="StutterFrame Home"
          >
            {uiLayout === 'netflix' || uiStyle === 'netflix' ? (
              <div className="flex items-center">
                <span className="text-[#e50914] font-black text-2xl sm:text-3xl tracking-wider font-['Bebas_Neue',sans-serif] leading-none drop-shadow">
                  STUTTERFRAME
                </span>
              </div>
            ) : uiLayout === 'amazon-prime' || uiStyle === 'amazon-prime' ? (
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-tight leading-none flex items-center">
                  STUTTER<span className="text-[#00a8e1] ml-0.5 font-light">FRAME</span>
                </span>
                <span className="h-0.5 w-full bg-gradient-to-r from-[#00a8e1] via-[#00a8e1] to-transparent rounded-full mt-1" />
              </div>
            ) : uiStyle === 'godfather' ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-red-950 border border-red-600 flex items-center justify-center text-red-500 shadow-sm">
                  <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                </div>
                <span className="godfather-blood-text font-bold tracking-wider text-sm sm:text-base text-white group-hover:text-red-500 transition-colors">
                  STUTTER<span className="text-red-500">FRAME</span>
                </span>
              </div>
            ) : uiStyle === 'batman' ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-zinc-900 border border-orange-500/50 flex items-center justify-center text-orange-500 shadow-sm">
                  <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                </div>
                <span className="batman-hero-text font-bold tracking-wider text-sm sm:text-base text-white group-hover:text-orange-400 transition-colors">
                  STUTTER<span className="text-orange-500">FRAME</span>
                </span>
              </div>
            ) : uiStyle === 'matrix-code' ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <span className="matrix-glitch-text font-mono font-bold tracking-wider text-sm sm:text-base text-emerald-400 transition-colors">
                  STUTTERFRAME
                </span>
              </div>
            ) : uiStyle === 'interstellar' ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-sky-950 border border-sky-400 flex items-center justify-center text-sky-400 shadow-sm">
                  <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                </div>
                <span className="interstellar-hero-text font-bold tracking-wider text-sm sm:text-base text-white transition-colors">
                  STUTTER<span className="text-sky-400">FRAME</span>
                </span>
              </div>
            ) : (
              <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-sm group-hover:scale-105 transition-transform">
                  <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                </div>
                <div className="flex items-baseline">
                  <span className="font-courier font-bold tracking-wider text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                    STUTTER<span className="text-amber-400">FRAME</span>
                  </span>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Center / Navigation Zone based on uiLayout */}
        {/* LAYOUT: Netflix 1:1 Clean Desktop Links */}
        {uiLayout === 'netflix' && (
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={(e) => handleNavClick('home', e)}
              className={`transition-colors cursor-pointer ${
                currentRoute === 'home' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Home
            </button>
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`transition-colors cursor-pointer whitespace-nowrap ${
                    isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* LAYOUT: Amazon Prime 1:1 Desktop Links */}
        {uiLayout === 'amazon-prime' && (
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs sm:text-sm font-semibold">
            <button
              onClick={(e) => handleNavClick('home', e)}
              className={`pb-1 transition-colors cursor-pointer border-b-2 ${
                currentRoute === 'home'
                  ? 'text-white font-bold border-[#00a8e1]'
                  : 'text-zinc-400 hover:text-white border-transparent'
              }`}
            >
              Home
            </button>
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`pb-1 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'text-white font-bold border-[#00a8e1]'
                      : 'text-zinc-400 hover:text-white border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* LAYOUT 1: Classic Top Bar (horizontal links on desktop) */}
        {uiLayout === 'top-bar' && (
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* LAYOUT 2: Dropdown Menu Type */}
        {uiLayout === 'dropdown' && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownNavOpen(!isDropdownNavOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700 hover:border-amber-400 text-xs font-mono text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Open Cinema Tools Menu"
            >
              {activeNavItem ? (
                <>
                  <activeNavItem.icon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{activeNavItem.label}</span>
                </>
              ) : (
                <>
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cinema Tools</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {isDropdownNavOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
                  onClick={() => setIsDropdownNavOpen(false)}
                />
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:w-80 max-w-[calc(100vw-1.5rem)] p-2 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl z-50 animate-fadeIn backdrop-blur-md max-h-[80vh] overflow-y-auto">
                  <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Select Cinema Tool
                  </div>
                  <div className="space-y-1 mt-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentRoute === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={(e) => handleNavClick(item.id, e)}
                          className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 touch-manipulation active:scale-[0.99] ${
                            isActive
                              ? 'bg-amber-500/15 border border-amber-400/80 text-white font-bold'
                              : 'hover:bg-zinc-900 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isActive ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-mono font-bold truncate text-white">{item.label}</span>
                              <span className="text-[11px] text-zinc-400 font-sans truncate block">{item.desc}</span>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* LAYOUT 3: Popup Command Center Trigger */}
        {uiLayout === 'popup' && (
          <button
            onClick={() => setIsCommandPopupOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-amber-500/40 hover:border-amber-400 text-xs font-mono text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 group"
            title="Open Cinematic Command Deck (or press ⌘K)"
          >
            <Command className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Command Deck</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-black/60 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {/* LAYOUT 4/5/6: Active view indicator for sidebar, bottom-nav, or floating-island */}
        {(uiLayout === 'sidebar' || uiLayout === 'bottom-nav' || uiLayout === 'floating-island') && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/70 border border-zinc-800/80 text-xs font-mono text-zinc-400">
            <span className="text-[10px] uppercase text-zinc-500">Active View:</span>
            <span className="text-amber-400 font-bold capitalize">
              {currentRoute.replace('-', ' ')}
            </span>
          </div>
        )}

        {/* Right Action: Layout Switcher, Theme Switcher, Settings, About & Assistant */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* UI Layout Switcher Button */}
          <LayoutSwitcher />

          {/* Theme Palette Switcher */}
          <ThemeSwitcher />

          {/* UI Architecture Switcher Quick Trigger (Visible on sm and up; on mobile, accessible via Settings) */}
          <button
            onClick={() => openSettings('ui-style')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Switch UI Architecture (Apple Glass, Blade Runner, Budapest, 2001, Matrix, Classic)"
            aria-label="UI Architecture Style"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden 2xl:inline text-[11px] font-mono text-zinc-300 capitalize">
              {uiStyle === 'default'
                ? 'Classic UI'
                : uiStyle === 'netflix'
                ? 'Netflix'
                : uiStyle === 'amazon-prime'
                ? 'Amazon Prime'
                : uiStyle === 'godfather'
                ? 'Godfather'
                : uiStyle === 'batman'
                ? 'Batman'
                : uiStyle === 'interstellar'
                ? 'Interstellar'
                : uiStyle === 'train-to-busan'
                ? 'Train to Busan'
                : uiStyle === 'obsession'
                ? 'Obsession'
                : uiStyle === 'dune'
                ? 'Dune'
                : uiStyle === 'avatar'
                ? 'Avatar'
                : uiStyle === 'resident-evil'
                ? 'Resident Evil'
                : uiStyle === 'backrooms'
                ? 'Backrooms'
                : uiStyle === 'hollywood-1969'
                ? 'Hollywood 1969'
                : uiStyle === 'blade-runner'
                ? 'Blade Runner'
                : uiStyle === 'apple-glass'
                ? 'Apple Glass'
                : uiStyle === 'grand-budapest'
                ? 'Budapest'
                : uiStyle === 'kubrick-space'
                ? '2001 Space'
                : 'Matrix Code'}
            </span>
          </button>

          {/* Settings & Customization Button (Layouts, Cursor, Theme, Credits) */}
          <button
            onClick={() => openSettings('layout')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Settings & Customization (Layouts, PC Cursor, Theme, Credits)"
            aria-label="Preferences and Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* About / Credits Button (Visible on sm and up; on mobile, accessible via Settings -> Credits) */}
          <button
            onClick={openAbout}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Director Credits & Information"
            aria-label="About StutterFrame"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Assistant Trigger in Header (Visible on md and up; on mobile, floating button is present) */}
          <button
            onClick={openAssistant}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-mono font-bold text-black shadow-sm transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Open StutterFrame Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <span className="hidden lg:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Bar:
          Displayed when uiLayout is 'top-bar', 'dropdown', 'netflix', or 'amazon-prime' on mobile screens.
          Hidden in 'sidebar', 'bottom-nav', or 'floating-island' because those have their own navigation docks! */}
      {(uiLayout === 'top-bar' || uiLayout === 'dropdown' || uiLayout === 'netflix' || uiLayout === 'amazon-prime') && (
        <div className="lg:hidden overflow-x-auto border-t border-zinc-900 bg-[#0b0b0e] px-2.5 py-2 flex items-center gap-1.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all active:scale-95 touch-manipulation min-h-[38px] ${
                  isActive
                    ? uiLayout === 'netflix'
                      ? 'bg-[#e50914] text-white font-bold shadow-xs'
                      : uiLayout === 'amazon-prime'
                      ? 'bg-[#00a8e1] text-black font-bold shadow-xs'
                      : 'bg-amber-500 text-black font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (uiLayout === 'netflix' ? 'text-white' : 'text-black') : 'text-zinc-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

