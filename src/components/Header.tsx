import React from 'react';
import { Film, Clapperboard, Camera, FileText, ShoppingBag, Scissors, MessageSquare, Info, Settings, HelpCircle } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { QuotaIndicator } from './QuotaIndicator';
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
  const { openSettings, triggerPageChangeEffect } = useSettings();

  const navItems = [
    { id: 'movie-picker', label: 'Movie Picker', icon: Film },
    { id: 'shot-rater', label: 'Shot Rater', icon: Camera },
    { id: 'script-lab', label: 'Script Lab', icon: FileText },
    { id: 'gear-suggestor', label: 'Gear Suggestor', icon: ShoppingBag },
    { id: 'editor-advisor', label: 'Editing Help', icon: Scissors },
    { id: 'faq', label: 'FAQ & Vault', icon: HelpCircle },
  ];

  const handleNavClick = (route: string, e: React.MouseEvent) => {
    if (currentRoute !== route) {
      triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    }
    navigate(route);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand / Home link */}
        <button
          onClick={(e) => handleNavClick('home', e)}
          className="flex items-center gap-2 sm:gap-2.5 text-left group transition-all cursor-pointer flex-shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-sm group-hover:scale-105 transition-transform">
            <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          </div>
          <div className="flex items-baseline">
            <span className="font-courier font-bold tracking-wider text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
              STUTTER<span className="text-amber-400">FRAME</span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links - Compact, Sleek & Non-Cluttered */}
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

        {/* Right Action: Prompt Quota, Theme Switcher, Settings, About & Assistant */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Live Prompt Quota & Refresh Indicator */}
          <QuotaIndicator />

          {/* Theme Palette Switcher */}
          <ThemeSwitcher />

          {/* Settings & Customization Button (Cursor, Theme, Credits) */}
          <button
            onClick={() => openSettings('cursor')}
            className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Settings & Customization (PC Cursor, Theme, Credits)"
            aria-label="Preferences and Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* About / Credits Button */}
          <button
            onClick={openAbout}
            className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Director Credits & Information"
            aria-label="About StutterFrame"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Assistant Trigger */}
          <button
            onClick={openAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-mono font-bold text-black shadow-sm transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Open StutterFrame Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <span className="hidden md:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Bar (Touch-optimized scrollable when viewport < 1024px) */}
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
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/70 border border-zinc-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
