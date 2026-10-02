import React, { useState } from 'react';
import { Palette, Check, SlidersHorizontal } from 'lucide-react';
import { useSettings, ColorTheme } from '../context/SettingsContext';

interface ThemeOption {
  id: ColorTheme;
  name: string;
  badge: string;
  dotColor: string;
}

export const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, openSettings } = useSettings();

  const themes: ThemeOption[] = [
    {
      id: 'netflix',
      name: 'Netflix 1:1 Crimson',
      badge: 'Pitch Black & Red',
      dotColor: 'bg-[#e50914]',
    },
    {
      id: 'amazon-prime',
      name: 'Amazon Prime Video',
      badge: 'Dark Navy & Electric Blue',
      dotColor: 'bg-[#00a8e1]',
    },
    {
      id: 'default',
      name: 'Celluloid 35mm',
      badge: 'Warm Amber Gold',
      dotColor: 'bg-amber-400',
    },
    {
      id: 'cyberpunk',
      name: 'Neon Cyberpunk',
      badge: 'Electric Cyan & Violet',
      dotColor: 'bg-cyan-400',
    },
    {
      id: 'emerald',
      name: 'Emerald 16mm',
      badge: 'Kodak & Fuji Green',
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'noir',
      name: 'Monochrome Noir',
      badge: 'High-Contrast B&W',
      dotColor: 'bg-zinc-200',
    },
    {
      id: 'wes-anderson',
      name: 'Pastel Symphony',
      badge: 'Wes Anderson Pastel',
      dotColor: 'bg-amber-300',
    },
    {
      id: 'blade-runner',
      name: 'Blade Runner 2049',
      badge: 'Smog Amber & Neon',
      dotColor: 'bg-orange-500',
    },
    {
      id: 'technicolor',
      name: 'Technicolor 3-Strip',
      badge: '1950s Saturated Film',
      dotColor: 'bg-rose-500',
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      badge: 'Arctic Cobalt Glow',
      dotColor: 'bg-sky-400',
    },
    {
      id: 'custom',
      name: 'Custom Director Palette',
      badge: 'User Customized',
      dotColor: 'bg-yellow-400',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        title="Switch Cinematic Color Palette"
      >
        <Palette className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline text-[11px]">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown Container: Fixed & full-width on mobile, absolute right-0 on desktop */}
          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-[calc(100vw-1.5rem)] p-2.5 rounded-2xl bg-zinc-950 border border-amber-500/40 sm:border-zinc-800 shadow-2xl z-50 animate-fadeIn backdrop-blur-md max-h-[80vh] overflow-y-auto">
            <div className="px-2.5 py-1.5 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Cinematic Color Grading
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  openSettings('theme');
                }}
                className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer py-0.5"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                Customize
              </button>
            </div>

            <div className="space-y-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                    if (t.id === 'custom') {
                      openSettings('theme');
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-mono transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                    theme === t.id
                      ? 'bg-zinc-800/90 text-white font-semibold ring-1 ring-amber-400/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3.5 h-3.5 rounded-full ${t.dotColor} flex-shrink-0 shadow-sm`} />
                    <div className="min-w-0">
                      <span className="block text-xs truncate text-white">{t.name}</span>
                      <span className="text-[9px] text-zinc-400 block font-mono truncate">{t.badge}</span>
                    </div>
                  </div>
                  {theme === t.id && (
                    <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
