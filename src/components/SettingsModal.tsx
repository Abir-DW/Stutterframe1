import React, { useState } from 'react';
import {
  Settings,
  X,
  MousePointer,
  Camera,
  Clapperboard,
  Palette,
  Award,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Instagram,
  Youtube,
  Linkedin,
  Check,
  Zap,
  Sliders,
  Smartphone,
} from 'lucide-react';
import { useSettings, CursorType, ColorTheme } from '../context/SettingsContext';

const PRESET_CURSOR_COLORS = [
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Cyan Neon', hex: '#06b6d4' },
  { name: 'Ruby Crimson', hex: '#f43f5e' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Violet Glow', hex: '#a855f7' },
  { name: 'Pure Silver', hex: '#ffffff' },
];

const PRESET_FLASH_COLORS = [
  { name: 'Soft White', hex: '#ffffff' },
  { name: 'Warm Tungsten', hex: '#fef3c7' },
  { name: 'Golden Sun', hex: '#f59e0b' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Rose Mist', hex: '#fda4af' },
  { name: 'Lavender', hex: '#e9d5ff' },
];

const THEME_OPTIONS: { id: ColorTheme; name: string; badge: string; color: string; desc: string }[] = [
  {
    id: 'default',
    name: 'Celluloid 35mm',
    badge: 'Warm Amber Gold',
    color: '#f59e0b',
    desc: 'Classic Kodak 35mm warmth, golden film reels, and warm amber contrast.',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    badge: 'Electric Cyan & Violet',
    color: '#00f2fe',
    desc: 'Neo-Tokyo high-contrast illumination, vivid cyan accents, and neon glows.',
  },
  {
    id: 'emerald',
    name: 'Emerald 16mm',
    badge: 'Kodak & Fuji Green',
    color: '#10b981',
    desc: 'Rich photographic greens inspired by 16mm daylight film stock.',
  },
  {
    id: 'noir',
    name: 'Monochrome Noir',
    badge: 'High-Contrast B&W',
    color: '#ffffff',
    desc: 'Chiaroscuro shadows, stark silver highlights, and deep charcoal blacks.',
  },
  {
    id: 'wes-anderson',
    name: 'Pastel Symphony',
    badge: 'Wes Anderson Pastel',
    color: '#fbbf24',
    desc: 'Symmetrical warmth, pastel mustard gold, and dusty blush coral palette.',
  },
  {
    id: 'blade-runner',
    name: 'Blade Runner 2049',
    badge: 'Dystopian Smog & Neon',
    color: '#f97316',
    desc: 'Atmospheric amber haze, smog orange accents, and industrial cyan glow.',
  },
  {
    id: 'technicolor',
    name: 'Technicolor 3-Strip',
    badge: '1950s Saturated Film',
    color: '#f43f5e',
    desc: 'Rich saturated ruby red, warm goldenrod highlights, and vintage luster.',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    badge: 'Deep Arctic Cobalt',
    color: '#38bdf8',
    desc: 'Deep oceanic abyss, vivid electric sky blue, and sapphire luminescence.',
  },
  {
    id: 'custom',
    name: 'Custom Director Palette',
    badge: 'Fully Customizable',
    color: '#eab308',
    desc: 'Design your own signature film grade with custom background & accent colors.',
  },
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    settingsTab,
    cursorType,
    setCursorType,
    cursorColors,
    setCursorColor,
    cursorDefaultMode,
    setCursorDefaultMode,
    flashColor,
    setFlashColor,
    theme,
    setTheme,
    customPalette,
    setCustomPalette,
    resetCustomPalette,
    resetAllSettings,
    triggerPageChangeEffect,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'cursor' | 'theme' | 'credits'>(settingsTab);
  const [editingColorFor, setEditingColorFor] = useState<CursorType>(cursorType);
  const [testClapCount, setTestClapCount] = useState(0);

  // Sync activeTab when modal opens with specific tab
  React.useEffect(() => {
    setActiveTab(settingsTab);
  }, [settingsTab, isSettingsOpen]);

  // Keep editingColorFor in sync with cursorType
  React.useEffect(() => {
    setEditingColorFor(cursorType);
  }, [cursorType]);

  if (!isSettingsOpen) return null;

  const handleTestNavigationClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerPageChangeEffect({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setTestClapCount((prev) => prev + 1);
  };

  const currentColorBeingEdited = cursorColors[editingColorFor] || '#f59e0b';

  return (
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={closeSettings}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Film Strip Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 flex-shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-800/90 flex items-center justify-between bg-[#0e0e12] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-courier text-sm sm:text-base font-bold text-white leading-none">
                PREFERENCES &amp; CREDITS
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mt-0.5">
                StutterFrame Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAllSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer active:scale-95"
              title="Reset all settings to System default Native OS pointer & Celluloid theme"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">Reset Defaults</span>
            </button>
            <button
              onClick={closeSettings}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="px-3 sm:px-6 pt-2.5 pb-2 border-b border-zinc-800/80 bg-zinc-950 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            onClick={() => setActiveTab('cursor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'cursor'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>PC Cursor</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'theme'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Grading</span>
          </button>

          <button
            onClick={() => setActiveTab('credits')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'credits'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Credits &amp; Director</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm font-sans flex-1">
          {/* TAB 1: CURSOR CUSTOMIZATION (PC USERS) */}
          {activeTab === 'cursor' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Phone/Mobile Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-zinc-300 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-400">Mobile &amp; Phone UI Optimized:</strong> Custom cursors are strictly active for desktop mouse/trackpad users. On phone and tablet touchscreens, native touch controls and fluid physics are automatically preserved.
                </p>
              </div>

              {/* 1. Cursor Type Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                  Select Cursor Style
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Option 1: Default */}
                  <button
                    type="button"
                    onClick={() => {
                      setCursorType('default');
                      setEditingColorFor('default');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] ${
                      cursorType === 'default'
                        ? 'border-amber-400 bg-amber-500/15 text-white shadow-md'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-colors"
                        style={{ color: cursorColors.default }}
                      >
                        <MousePointer className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: cursorColors.default }}
                        />
                        {cursorType === 'default' && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                    </div>
                    <div className="font-courier font-bold text-sm text-white mb-0.5">
                      System Default
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {cursorDefaultMode === 'native'
                        ? 'Native operating system pointer (clean & standard).'
                        : 'Colored cinema precision pointer arrow.'}
                    </p>
                  </button>

                  {/* Option 2: Camera Viewfinder */}
                  <button
                    type="button"
                    onClick={() => {
                      setCursorType('camera');
                      setEditingColorFor('camera');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] ${
                      cursorType === 'camera'
                        ? 'border-amber-400 bg-amber-500/15 text-white shadow-md'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-colors"
                        style={{ color: cursorColors.camera }}
                      >
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: cursorColors.camera }}
                        />
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                          Soft Flash
                        </span>
                      </div>
                    </div>
                    <div className="font-courier font-bold text-sm text-white mb-0.5">
                      Cinema Camera
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Viewfinder that triggers a gentle shutter flash <strong className="text-white">only on page changes</strong>.
                    </p>
                  </button>

                  {/* Option 3: Movie Slate */}
                  <button
                    type="button"
                    onClick={() => {
                      setCursorType('slate');
                      setEditingColorFor('slate');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] ${
                      cursorType === 'slate'
                        ? 'border-amber-400 bg-amber-500/15 text-white shadow-md'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-colors"
                        style={{ color: cursorColors.slate }}
                      >
                        <Clapperboard className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: cursorColors.slate }}
                        />
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                          Stick Snap
                        </span>
                      </div>
                    </div>
                    <div className="font-courier font-bold text-sm text-white mb-0.5">
                      Movie Slate
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Clapper stick snaps shut cleanly <strong className="text-white">only on page changes</strong> (concentric rings removed).
                    </p>
                  </button>
                </div>

                {/* Sub-toggle for Default Cursor Style */}
                {cursorType === 'default' && (
                  <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-zinc-300">
                      Default Pointer Display Mode:
                    </span>
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setCursorDefaultMode('native')}
                        className={`px-3 py-1.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                          cursorDefaultMode === 'native'
                            ? 'bg-amber-500 text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        System Native OS Pointer
                      </button>
                      <button
                        type="button"
                        onClick={() => setCursorDefaultMode('precision')}
                        className={`px-3 py-1.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                          cursorDefaultMode === 'precision'
                            ? 'bg-amber-500 text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Colored Precision Arrow
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Camera Flash Flare Customization (Only when camera cursor selected) */}
              {cursorType === 'camera' && (
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-amber-500/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Customizable Camera Flash Color
                      </span>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Calibrated soft, subtle aperture flare (gentle on eyes, triggers only on page change).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: flashColor }}
                      />
                      <code className="text-xs font-mono text-amber-400">{flashColor}</code>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {PRESET_FLASH_COLORS.map((preset) => {
                      const isSelected = flashColor.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setFlashColor(preset.hex)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-zinc-800 border-amber-400 text-white font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-amber-400 ml-1" />}
                        </button>
                      );
                    })}

                    {/* Custom Hex Picker for Flash */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono">
                      <input
                        type="color"
                        value={flashColor}
                        onChange={(e) => setFlashColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        title="Pick custom flash flare color"
                      />
                      <span className="text-[10px] text-zinc-400">Custom Flash Hex</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Customizable Colors for Each of the Three Cursors */}
              <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    Customize Accent Color for Each Cursor
                  </label>
                  <span className="text-[11px] font-mono uppercase text-zinc-400">
                    Active: <code className="text-amber-400">{currentColorBeingEdited}</code>
                  </span>
                </div>

                {/* Cursor selector tabs for coloring */}
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
                  <button
                    type="button"
                    onClick={() => setEditingColorFor('default')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      editingColorFor === 'default'
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: cursorColors.default }}
                    />
                    <span>Default</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingColorFor('camera')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      editingColorFor === 'camera'
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: cursorColors.camera }}
                    />
                    <span>Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingColorFor('slate')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      editingColorFor === 'slate'
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: cursorColors.slate }}
                    />
                    <span>Slate</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_CURSOR_COLORS.map((preset) => {
                    const isSelected = currentColorBeingEdited.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setCursorColor(preset.hex, editingColorFor)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-400 text-white font-semibold shadow-xs'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-400 ml-auto" />}
                      </button>
                    );
                  })}

                  {/* Custom Hex Color Input */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
                    <input
                      type="color"
                      value={currentColorBeingEdited}
                      onChange={(e) => setCursorColor(e.target.value, editingColorFor)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      title="Pick any custom hex color"
                    />
                    <span className="text-[10px] text-zinc-400">Custom Hex</span>
                  </div>
                </div>
              </div>

              {/* 4. Interactive Sandbox to Test Page Change Effects */}
              <div className="p-4 rounded-xl bg-[#09090c] border border-zinc-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Interactive Sandbox &bull; Test Page Change Effect
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Triggered: {testClapCount}x
                  </span>
                </div>

                <p className="text-xs text-zinc-400">
                  Click the test button below to preview your cursor's page-change animation in real time:
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTestNavigationClick}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    Simulate Page Change Click
                  </button>

                  <span className="text-[11px] font-mono text-zinc-400">
                    {cursorType === 'camera'
                      ? '⚡ Triggers gentle, soft aperture flash'
                      : cursorType === 'slate'
                      ? '🎬 Triggers tactile slate stick snap'
                      : 'Standard Pointer (No extra FX)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGE THEME COLOR GRADING */}
          {activeTab === 'theme' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-courier text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Cinematic Color Grading
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Select a curated cinematic stock grade or customize your own director palette.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetCustomPalette}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer self-start sm:self-auto active:scale-95"
                  title="Reset custom palette to Celluloid Default"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Reset Palette to Default</span>
                </button>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {THEME_OPTIONS.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between active:scale-[0.99] ${
                        isSelected
                          ? 'border-amber-400 bg-zinc-900/90 shadow-lg ring-1 ring-amber-400/40'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-courier font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-black/50 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="truncate">{t.name}</span>
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono uppercase font-bold flex-shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                          {t.badge}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans line-clamp-2">
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* CUSTOM PALETTE BUILDER (Live CSS Variables) */}
              {theme === 'custom' && (
                <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-amber-500/30 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <h5 className="font-courier text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        Director Palette Studio
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={resetCustomPalette}
                      className="text-xs font-mono text-amber-400 hover:underline cursor-pointer"
                    >
                      Reset to Celluloid
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 font-mono">
                    Fine-tune the foundational colors of the site in real time. Changes apply instantly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Primary Accent Color */}
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                        Primary Accent
                      </span>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={customPalette.primary}
                          onChange={(e) => setCustomPalette({ primary: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <code className="text-xs font-mono text-white">{customPalette.primary}</code>
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        Buttons, glowing borders &amp; ratings
                      </span>
                    </div>

                    {/* 2. Main Background Color */}
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                        Main Canvas Tint
                      </span>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={customPalette.bg}
                          onChange={(e) => setCustomPalette({ bg: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <code className="text-xs font-mono text-white">{customPalette.bg}</code>
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        Underlying canvas &amp; deep backdrop
                      </span>
                    </div>

                    {/* 3. Surface Card Tint */}
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 block uppercase">
                        Card / Surface Tint
                      </span>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={customPalette.card}
                          onChange={(e) => setCustomPalette({ card: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <code className="text-xs font-mono text-white">{customPalette.card}</code>
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        Containers, modals &amp; tool panels
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREDITS DISPLAY & PRODUCTION ATTRIBUTION */}
          {activeTab === 'credits' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Creator Profile Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 font-courier text-xl sm:text-2xl font-bold flex-shrink-0 shadow-lg">
                  AD
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h4 className="font-courier text-lg sm:text-xl font-bold text-white">Abir D.W</h4>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] uppercase font-semibold">
                      Creator &amp; Director
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs font-mono leading-relaxed mb-4">
                    Filmmaker, screenwriter, and director exploring the frontier between celluloid storytelling traditions and next-generation computational cinema tools.
                  </p>

                  {/* Verified Director Socials */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <a
                      href="https://www.instagram.com/not_abir_at_all"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-pink-950/40 text-zinc-300 hover:text-pink-400 border border-zinc-700 hover:border-pink-500/50 text-xs font-mono transition-all cursor-pointer"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span>@not_abir_at_all</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>

                    <a
                      href="https://www.youtube.com/@StutterFrameProductions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 text-xs font-mono transition-all cursor-pointer"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-400" />
                      <span>@StutterFrameProductions</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>

                    <a
                      href="https://www.linkedin.com/in/abir-wahab-6b714930b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-sky-950/40 text-zinc-300 hover:text-sky-400 border border-zinc-700 hover:border-sky-500/50 text-xs font-mono transition-all cursor-pointer"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Technological & Film Architecture Credits */}
              <div className="space-y-3">
                <h5 className="font-courier text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Production Infrastructure &bull; Attribution
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-500 block mb-0.5">Core Vision &amp; Language AI:</span>
                    <span className="text-white font-semibold">Google Gemini 3.8 Flash &bull; Multimodal</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-500 block mb-0.5">Live Grounding Index:</span>
                    <span className="text-white font-semibold">Google Search Grounding Engine</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-500 block mb-0.5">Cinema Stills &amp; Art Archive:</span>
                    <span className="text-white font-semibold">Wikimedia Commons, Wikipedia REST, Unsplash Film</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-zinc-500 block mb-0.5">Verified Streaming Indexes:</span>
                    <span className="text-white font-semibold">Letterboxd, JustWatch, Rotten Tomatoes, IMDb</span>
                  </div>
                </div>
              </div>

              {/* Overall Rollback / Default Reset Safeguard */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-courier text-xs font-bold text-white uppercase">
                    System Default Rollback Safeguard
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Resets the cursor to the System default Native OS pointer and restores the Celluloid 35mm theme.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAllSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
