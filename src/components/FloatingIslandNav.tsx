import React, { useState } from 'react';
import {
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  HelpCircle,
  Home,
  ChevronDown,
  Layers,
  Palette,
  Settings,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FloatingIslandNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAssistant: () => void;
}

export const FloatingIslandNav: React.FC<FloatingIslandNavProps> = ({
  currentRoute,
  navigate,
  openAssistant,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openSettings, triggerPageChangeEffect } = useSettings();

  const navItems = [
    { id: 'movie-picker', label: 'Picker', icon: Film },
    { id: 'shot-rater', label: 'Shot Rater', icon: Camera },
    { id: 'script-lab', label: 'Script', icon: FileText },
    { id: 'gear-suggestor', label: 'Gear', icon: ShoppingBag },
    { id: 'editor-advisor', label: 'Editing', icon: Scissors },
    { id: 'faq', label: 'Vault', icon: HelpCircle },
  ];

  const handleNavClick = (route: string, e: React.MouseEvent) => {
    if (currentRoute !== route) {
      triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    }
    navigate(route);
  };

  const isHomeActive = currentRoute === 'home';

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-2xl animate-fadeIn">
      {/* Floating Island Main Capsule Dock */}
      <nav
        aria-label="Floating Island Navigation"
        className="bg-zinc-950/92 backdrop-blur-xl border border-amber-500/40 rounded-full shadow-2xl pl-3 sm:pl-3.5 pr-2 sm:pr-2.5 py-1.5 flex items-center gap-1 sm:gap-1.5 transition-all"
      >
        {/* Dedicated Home Anchor (Ample clearance from curved capsule border, never collides) */}
        <button
          onClick={(e) => handleNavClick('home', e)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer flex-shrink-0 active:scale-95 touch-manipulation min-h-[36px] ${
            isHomeActive
              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-400/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 font-medium'
          }`}
          title="Home (Cinema Overview)"
          aria-label="Go to Home"
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <Home className={`w-3.5 h-3.5 flex-shrink-0 ${isHomeActive ? 'text-black' : 'text-zinc-400'}`} />
          <span className={`whitespace-nowrap ${isHomeActive ? 'inline font-bold' : 'hidden sm:inline'}`}>
            Home
          </span>
        </button>

        {/* Vertical Divider separating Home from Cinema Tools */}
        <div className="w-px h-4 bg-zinc-800/80 flex-shrink-0 mx-0.5" />

        {/* Core Nav Destinations (Unified dynamic morphing pill: active item expands without duplicates) */}
        <div className="min-w-0 flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5 overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            if (isActive) {
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-black font-mono font-bold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer flex-shrink-0 active:scale-95 touch-manipulation min-h-[36px]"
                  title={`Current: ${item.label}`}
                  aria-current="page"
                >
                  <Icon className="w-3.5 h-3.5 text-black flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(item.id, e)}
                title={item.label}
                aria-label={item.label}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0 active:scale-95"
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-zinc-800 flex-shrink-0 mx-0.5" />

        {/* Action Controls Cluster */}
        <div className="flex items-center gap-1 flex-shrink-0 pr-0.5">
          {/* Ask AI Assistant Button */}
          <button
            onClick={openAssistant}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-800/80 transition-all cursor-pointer flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 touch-manipulation shadow-xs"
            title="Ask StutterFrame AI Assistant"
            aria-label="Ask AI Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Quick HUD Menu / Themes Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-full border transition-all cursor-pointer flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 touch-manipulation shadow-xs ${
              isExpanded
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-amber-500/10'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800/80'
            }`}
            title={isExpanded ? 'Close Quick Menu' : 'Quick Menu (Themes & Styles)'}
            aria-label="Quick Island Menu"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {/* Settings & Layouts Launcher */}
          <button
            onClick={() => openSettings('layout')}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 transition-all cursor-pointer flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 touch-manipulation shadow-xs"
            title="Layout Preferences & Settings"
            aria-label="Open Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Expanded Quick Deck */}
      {isExpanded && (
        <div className="mt-2 p-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl grid grid-cols-3 gap-2 text-center text-xs font-mono animate-fadeIn">
          <button
            onClick={() => {
              setIsExpanded(false);
              openSettings('ui-style');
            }}
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer border border-zinc-800/60"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-[10px]">Themes</span>
          </button>
          <button
            onClick={() => {
              setIsExpanded(false);
              openSettings('theme');
            }}
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer border border-zinc-800/60"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="text-[10px]">Palette</span>
          </button>
          <button
            onClick={() => {
              setIsExpanded(false);
              openSettings('layout');
            }}
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer border border-zinc-800/60"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="text-[10px]">Layouts</span>
          </button>
        </div>
      )}
    </div>
  );
};
