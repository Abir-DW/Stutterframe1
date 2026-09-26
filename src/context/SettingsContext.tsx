import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CursorType = 'default' | 'camera' | 'slate';
export type CursorDefaultMode = 'precision' | 'native';
export type ColorTheme =
  | 'default'
  | 'cyberpunk'
  | 'emerald'
  | 'noir'
  | 'wes-anderson'
  | 'blade-runner'
  | 'technicolor'
  | 'midnight'
  | 'custom';

export interface CursorColors {
  default: string;
  camera: string;
  slate: string;
}

export interface CustomThemePalette {
  primary: string;
  bg: string;
  card: string;
  accent: string;
}

export interface SettingsContextType {
  cursorType: CursorType;
  cursorColor: string;
  cursorColors: CursorColors;
  cursorDefaultMode: CursorDefaultMode;
  flashColor: string;
  theme: ColorTheme;
  customPalette: CustomThemePalette;
  isSettingsOpen: boolean;
  settingsTab: 'cursor' | 'theme' | 'credits' | 'key';
  openSettings: (tab?: 'cursor' | 'theme' | 'credits' | 'key') => void;
  closeSettings: () => void;
  setCursorType: (type: CursorType) => void;
  setCursorColor: (color: string, forType?: CursorType) => void;
  setCursorDefaultMode: (mode: CursorDefaultMode) => void;
  setFlashColor: (color: string) => void;
  setTheme: (theme: ColorTheme) => void;
  setCustomPalette: (palette: Partial<CustomThemePalette>) => void;
  resetCustomPalette: () => void;
  resetAllSettings: () => void;
  pageChangeEventId: number;
  lastClickPos: { x: number; y: number } | null;
  triggerPageChangeEffect: (pos?: { x: number; y: number }) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const DEFAULT_CURSOR_COLORS: CursorColors = {
  default: '#f4f4f5', // Pure Silver / White
  camera: '#f59e0b',  // Amber Gold
  slate: '#06b6d4',   // Neon Cyan
};

export const DEFAULT_FLASH_COLOR = '#ffffff';

export const DEFAULT_CUSTOM_PALETTE: CustomThemePalette = {
  primary: '#f59e0b', // Kodak Warm Amber
  bg: '#09090b',      // Obsidian Black
  card: '#141419',    // Film Slate Dark
  accent: '#fbbf24',  // Golden Highlight
};

const DEFAULT_THEME: ColorTheme = 'default';
const DEFAULT_CURSOR_TYPE: CursorType = 'default';
// Default to native OS pointer so standard OS physics are respected out-of-the-box
const DEFAULT_CURSOR_DEFAULT_MODE: CursorDefaultMode = 'native';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorType, setCursorTypeState] = useState<CursorType>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-cursor-type') as CursorType;
      return saved === 'camera' || saved === 'slate' || saved === 'default' ? saved : DEFAULT_CURSOR_TYPE;
    } catch {
      return DEFAULT_CURSOR_TYPE;
    }
  });

  const [cursorDefaultMode, setCursorDefaultModeState] = useState<CursorDefaultMode>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-cursor-default-mode') as CursorDefaultMode;
      return saved === 'precision' || saved === 'native' ? saved : DEFAULT_CURSOR_DEFAULT_MODE;
    } catch {
      return DEFAULT_CURSOR_DEFAULT_MODE;
    }
  });

  const [cursorColors, setCursorColorsState] = useState<CursorColors>(() => {
    try {
      const savedJson = localStorage.getItem('stutterframe-cursor-colors');
      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        return {
          default: parsed.default || DEFAULT_CURSOR_COLORS.default,
          camera: parsed.camera || DEFAULT_CURSOR_COLORS.camera,
          slate: parsed.slate || DEFAULT_CURSOR_COLORS.slate,
        };
      }
      return DEFAULT_CURSOR_COLORS;
    } catch {
      return DEFAULT_CURSOR_COLORS;
    }
  });

  const [flashColor, setFlashColorState] = useState<string>(() => {
    try {
      return localStorage.getItem('stutterframe-flash-color') || DEFAULT_FLASH_COLOR;
    } catch {
      return DEFAULT_FLASH_COLOR;
    }
  });

  const [theme, setThemeState] = useState<ColorTheme>(() => {
    try {
      return (localStorage.getItem('stutterframe-theme') as ColorTheme) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const [customPalette, setCustomPaletteState] = useState<CustomThemePalette>(() => {
    try {
      const savedJson = localStorage.getItem('stutterframe-custom-palette');
      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        return {
          primary: parsed.primary || DEFAULT_CUSTOM_PALETTE.primary,
          bg: parsed.bg || DEFAULT_CUSTOM_PALETTE.bg,
          card: parsed.card || DEFAULT_CUSTOM_PALETTE.card,
          accent: parsed.accent || DEFAULT_CUSTOM_PALETTE.accent,
        };
      }
      return DEFAULT_CUSTOM_PALETTE;
    } catch {
      return DEFAULT_CUSTOM_PALETTE;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'cursor' | 'theme' | 'credits' | 'key'>('cursor');
  const [pageChangeEventId, setPageChangeEventId] = useState(0);
  const [lastClickPos, setLastClickPos] = useState<{ x: number; y: number } | null>(null);

  // Apply theme and custom CSS variables to DOM
  const applyThemeToDom = useCallback((currentTheme: ColorTheme, palette: CustomThemePalette) => {
    const root = document.documentElement;
    const body = document.body;

    if (currentTheme === 'default') {
      root.removeAttribute('data-theme');
      body.removeAttribute('data-theme');
      root.style.removeProperty('--bg-main');
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--custom-card');
      root.style.removeProperty('--custom-accent');
    } else if (currentTheme === 'custom') {
      root.setAttribute('data-theme', 'custom');
      body.setAttribute('data-theme', 'custom');
      root.style.setProperty('--bg-main', palette.bg);
      root.style.setProperty('--accent-primary', palette.primary);
      root.style.setProperty('--custom-card', palette.card);
      root.style.setProperty('--custom-accent', palette.accent);
    } else {
      root.setAttribute('data-theme', currentTheme);
      body.setAttribute('data-theme', currentTheme);
      root.style.removeProperty('--bg-main');
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--custom-card');
      root.style.removeProperty('--custom-accent');
    }
  }, []);

  // Sync theme changes to DOM
  useEffect(() => {
    applyThemeToDom(theme, customPalette);
  }, [theme, customPalette, applyThemeToDom]);

  const setTheme = useCallback(
    (newTheme: ColorTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem('stutterframe-theme', newTheme);
      } catch (err) {
        console.warn('Storage error', err);
      }
      applyThemeToDom(newTheme, customPalette);
    },
    [customPalette, applyThemeToDom]
  );

  const setCustomPalette = useCallback(
    (paletteUpdate: Partial<CustomThemePalette>) => {
      setCustomPaletteState((prev) => {
        const updated = { ...prev, ...paletteUpdate };
        try {
          localStorage.setItem('stutterframe-custom-palette', JSON.stringify(updated));
        } catch (err) {
          console.warn('Storage error', err);
        }
        applyThemeToDom(theme, updated);
        return updated;
      });
    },
    [theme, applyThemeToDom]
  );

  const resetCustomPalette = useCallback(() => {
    setCustomPaletteState(DEFAULT_CUSTOM_PALETTE);
    try {
      localStorage.removeItem('stutterframe-custom-palette');
    } catch (err) {
      console.warn('Storage error', err);
    }
    applyThemeToDom(theme, DEFAULT_CUSTOM_PALETTE);
  }, [theme, applyThemeToDom]);

  const setCursorType = useCallback((type: CursorType) => {
    setCursorTypeState(type);
    try {
      localStorage.setItem('stutterframe-cursor-type', type);
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const setCursorColor = useCallback((color: string, forType?: CursorType) => {
    setCursorColorsState((prev) => {
      const targetType = forType || cursorType;
      const updated = {
        ...prev,
        [targetType]: color,
      };
      try {
        localStorage.setItem('stutterframe-cursor-colors', JSON.stringify(updated));
      } catch (err) {
        console.warn('Storage error', err);
      }
      return updated;
    });
  }, [cursorType]);

  const setCursorDefaultMode = useCallback((mode: CursorDefaultMode) => {
    setCursorDefaultModeState(mode);
    try {
      localStorage.setItem('stutterframe-cursor-default-mode', mode);
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const setFlashColor = useCallback((color: string) => {
    setFlashColorState(color);
    try {
      localStorage.setItem('stutterframe-flash-color', color);
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const openSettings = useCallback((tab: 'cursor' | 'theme' | 'credits' | 'key' = 'cursor') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // OVERALL RESET TO DEFAULT
  // Explicitly resets cursor to System default Native OS pointer & themes to default
  const resetAllSettings = useCallback(() => {
    setCursorTypeState(DEFAULT_CURSOR_TYPE);
    setCursorDefaultModeState('native'); // System default Native OS pointer
    setCursorColorsState(DEFAULT_CURSOR_COLORS);
    setFlashColorState(DEFAULT_FLASH_COLOR);
    setThemeState(DEFAULT_THEME);
    setCustomPaletteState(DEFAULT_CUSTOM_PALETTE);

    try {
      localStorage.removeItem('stutterframe-cursor-type');
      localStorage.removeItem('stutterframe-cursor-default-mode');
      localStorage.removeItem('stutterframe-cursor-colors');
      localStorage.removeItem('stutterframe-cursor-color');
      localStorage.removeItem('stutterframe-flash-color');
      localStorage.removeItem('stutterframe-theme');
      localStorage.removeItem('stutterframe-custom-palette');
    } catch (err) {
      console.warn('Storage clear error', err);
    }

    applyThemeToDom(DEFAULT_THEME, DEFAULT_CUSTOM_PALETTE);
  }, [applyThemeToDom]);

  // Active cursor color resolved from cursorColors
  const activeCursorColor = cursorColors[cursorType] || DEFAULT_CURSOR_COLORS[cursorType] || '#f59e0b';

  // Triggered EXCLUSIVELY when a page changing button is clicked
  const triggerPageChangeEffect = useCallback((pos?: { x: number; y: number }) => {
    if (pos) {
      setLastClickPos(pos);
    } else {
      setLastClickPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    setPageChangeEventId((prev) => prev + 1);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        cursorType,
        cursorColor: activeCursorColor,
        cursorColors,
        cursorDefaultMode,
        flashColor,
        theme,
        customPalette,
        isSettingsOpen,
        settingsTab,
        openSettings,
        closeSettings,
        setCursorType,
        setCursorColor,
        setCursorDefaultMode,
        setFlashColor,
        setTheme,
        setCustomPalette,
        resetCustomPalette,
        resetAllSettings,
        pageChangeEventId,
        lastClickPos,
        triggerPageChangeEffect,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
