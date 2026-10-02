import React, { useState } from 'react';
import {
  Layout,
  Check,
  RotateCcw,
  Sliders,
  PanelLeft,
  ChevronDown,
  Compass,
  CreditCard,
  Maximize2,
  Tv,
} from 'lucide-react';
import { useSettings, UILayoutType } from '../context/SettingsContext';

interface LayoutOption {
  id: UILayoutType;
  name: string;
  badge: string;
  desc: string;
  icon: any;
}

export const LayoutSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { uiLayout, setUILayout, openSettings, resetLayoutSettings } = useSettings();

  const layouts: LayoutOption[] = [
    {
      id: 'netflix',
      name: 'Netflix 1:1 Streaming',
      badge: '1:1 Integration',
      desc: 'Billboard hero, Bebas display, red accents, 3D Top 10, horizontal rails',
      icon: Tv,
    },
    {
      id: 'amazon-prime',
      name: 'Amazon Prime Video',
      badge: '1:1 Integration',
      desc: 'Prime dark navy, electric blue, X-Ray tags, Prime carousel swimlanes',
      icon: Tv,
    },
    {
      id: 'top-bar',
      name: 'Classic Top Bar',
      badge: 'Default',
      desc: 'Standard top navigation with horizontal links & responsive sub-bar',
      icon: Layout,
    },
    {
      id: 'dropdown',
      name: 'Dropdown Menu',
      badge: 'Compact',
      desc: 'Clean top bar with categorized tools dropdown menu',
      icon: ChevronDown,
    },
    {
      id: 'popup',
      name: 'Popup Command Deck',
      badge: 'HUD / ⌘K',
      desc: 'Header launcher & full-screen command center modal',
      icon: Compass,
    },
    {
      id: 'sidebar',
      name: 'Left Sidebar Dock',
      badge: 'Film Strip',
      desc: 'Vertical collapsible left dock for desktop & slide drawer on mobile',
      icon: PanelLeft,
    },
    {
      id: 'bottom-nav',
      name: 'Bottom Navigation',
      badge: 'Mobile App',
      desc: 'Thumb-reachable bottom dock with slide-up tools sheet',
      icon: CreditCard,
    },
    {
      id: 'floating-island',
      name: 'Floating Island',
      badge: 'Capsule HUD',
      desc: 'Dynamic floating capsule dock anchored above content',
      icon: Maximize2,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 touch-manipulation"
        title="Switch UI Layout & Button Positions (Netflix, Amazon Prime, Dropdown, Popup, Sidebar, Bottom Nav, Top Bar, Island)"
        aria-label="UI Layout Position Switcher"
      >
        <Layout className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden xl:inline text-[11px] capitalize">
          {uiLayout === 'netflix'
            ? 'Netflix'
            : uiLayout === 'amazon-prime'
            ? 'Prime Video'
            : uiLayout === 'top-bar'
            ? 'Top Bar'
            : uiLayout === 'dropdown'
            ? 'Dropdown'
            : uiLayout === 'popup'
            ? 'Popup HUD'
            : uiLayout === 'sidebar'
            ? 'Sidebar'
            : uiLayout === 'bottom-nav'
            ? 'Bottom Nav'
            : 'Island'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop on mobile for touch outside */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown Container: Fixed & Full Width on mobile screens, Absolute right-0 on desktop */}
          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-84 max-w-[calc(100vw-1.5rem)] p-2.5 rounded-2xl bg-zinc-950 border border-amber-500/40 sm:border-zinc-800 shadow-2xl z-50 animate-fadeIn backdrop-blur-md max-h-[80vh] overflow-y-auto">
            <div className="px-2.5 py-1.5 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Menu &amp; Button Positions
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  openSettings('layout');
                }}
                className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-2.5 h-2.5" />
                Customize
              </button>
            </div>

            <div className="space-y-1">
              {layouts.map((l) => {
                const Icon = l.icon;
                const isSelected = uiLayout === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setUILayout(l.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-mono transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                      isSelected
                        ? 'bg-zinc-800/90 text-white font-semibold ring-1 ring-amber-400/40'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="block text-xs font-bold truncate text-white">{l.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-mono">
                            {l.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-sans line-clamp-1 block mt-0.5">
                          {l.desc}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Rollback */}
            <div className="mt-2 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-1.5 px-1">
              <button
                onClick={() => {
                  resetLayoutSettings();
                  setIsOpen(false);
                }}
                className="text-[10px] font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer py-1"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                Rollback to Classic Top Bar
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  openSettings('layout');
                }}
                className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer py-1"
              >
                More Layout Options &rarr;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
