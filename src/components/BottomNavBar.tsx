import React, { useState } from 'react';
import {
  Home,
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  HelpCircle,
  MoreHorizontal,
  X,
  Palette,
  Layers,
  Settings,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface BottomNavBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAssistant: () => void;
  openAbout: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentRoute,
  navigate,
  openAssistant,
  openAbout,
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const { openSettings, triggerPageChangeEffect } = useSettings();

  const primaryItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movie-picker', label: 'Picker', icon: Film },
    { id: 'shot-rater', label: 'Shot Rater', icon: Camera },
    { id: 'script-lab', label: 'Script', icon: FileText },
  ];

  const secondaryItems = [
    {
      id: 'gear-suggestor',
      label: 'Gear Suggestor',
      desc: 'Indian marketplace camera & lighting equipment',
      icon: ShoppingBag,
    },
    {
      id: 'editor-advisor',
      label: 'Editing Help',
      desc: 'Hardware matching & post-production advisor',
      icon: Scissors,
    },
    {
      id: 'faq',
      label: 'FAQ & Celluloid Vault',
      desc: 'Director guides and camera mechanics',
      icon: HelpCircle,
    },
  ];

  const handleNavClick = (route: string, e: React.MouseEvent) => {
    setIsMoreSheetOpen(false);
    if (currentRoute !== route) {
      triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    }
    navigate(route);
  };

  return (
    <>
      {/* 1. Slide-up Sheet for Additional Tools & Preferences */}
      {isMoreSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            onClick={() => setIsMoreSheetOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-xl mx-auto bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-4 sm:p-6 shadow-2xl z-10 animate-slideUp space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                Cinema Suite &amp; Controls
              </span>
              <button
                onClick={() => setIsMoreSheetOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Tools */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                Filmmaking Tools:
              </span>
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleNavClick(item.id, e)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 touch-manipulation active:scale-[0.99] ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-400 text-white font-bold'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-zinc-400 font-sans truncate">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Customization Buttons */}
            <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  openSettings('ui-style');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-[10px]">Themes</span>
              </button>
              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  openSettings('layout');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="text-[10px]">Layouts</span>
              </button>
              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  openSettings('theme');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-[10px]">Palettes</span>
              </button>
              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  openAssistant();
                }}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex flex-col items-center gap-1.5 font-bold transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-black" />
                <span className="text-[10px]">Ask AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pinned Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-800/90 shadow-2xl pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-md mx-auto px-2 h-14 sm:h-16 flex items-center justify-around">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-mono transition-all cursor-pointer touch-manipulation min-h-[48px] active:scale-95 ${
                  isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-amber-500/20 scale-110' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="mt-0.5 leading-none">{item.label}</span>
              </button>
            );
          })}

          {/* More Sheet Trigger */}
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-mono transition-all cursor-pointer touch-manipulation min-h-[48px] active:scale-95 ${
              isMoreSheetOpen ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isMoreSheetOpen ? 'bg-amber-500/20 scale-110' : ''
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="mt-0.5 leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
