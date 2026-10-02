import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CursorType =
  | 'default'
  | 'camera'
  | 'slate'
  | 'batman-bat'
  | 'revolver'
  | 'batarang'
  | 'endurance'
  | 'crysknife'
  | 'sacred-spore'
  | 'laser-crosshair';
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
  | 'netflix'
  | 'amazon-prime'
  | 'custom';

export type UILayoutType =
  | 'top-bar'         // Classic Top Bar (Default: standard top nav with responsive sub-bar)
  | 'dropdown'        // Dropdown Menu Type (Compact header with elegant cinema tools dropdown)
  | 'popup'           // Popup / Command Center HUD (Floating launcher & Command Deck modal)
  | 'sidebar'         // Left Sidebar Navigation Dock (Vertical filmstrip dock + mobile drawer)
  | 'bottom-nav'      // Bottom Navigation Bar (Mobile-first thumb dock with slide-up sheet)
  | 'floating-island' // Floating Dynamic Island (Floating capsule dock above content)
  | 'netflix'         // Netflix 1:1 Streaming UI (Billboard hero, red accents, horizontal rails, Bebas Neue)
  | 'amazon-prime';   // Amazon Prime 1:1 Streaming UI (Prime navy, electric blue, X-Ray tags, Prime carousel)

export type ActionPositionType = 'right' | 'left' | 'center' | 'split';
export type AssistantPositionType = 'bottom-right' | 'bottom-left' | 'header-only';

export type UIStyleType =
  | 'default'        // Celluloid Classic (Current: 35mm film grain, courier typography, amber clapperboard, vintage tape)
  | 'netflix'        // Netflix 1:1 Cinema: Pitch black #141414, Bebas Neue bold typography, Netflix red #e50914, white play buttons
  | 'amazon-prime'   // Amazon Prime 1:1 Cinema: Deep navy #0f172a, Prime electric blue #00a8e1, smile accent, X-Ray badges
  | 'godfather'      // The Godfather: Gothic Victorian Mafia Noir (Red/White text, blood creeping up hero, ornate frames, pistol cursor)
  | 'batman'         // The Batman: Dark Knight Gotham (League Gothic, red/orange/white, animated bats, rain, batarang cursor)
  | 'interstellar'   // Interstellar (Endurance space font, warping starfield & Gargantua accretion glow, endurance cursor)
  | 'train-to-busan' // Train to Busan (Biohazard muted horror, foggy railyard backdrop, distressed stencil, KTX cursor)
  | 'obsession'      // Obsession (Psychological thriller noir, analog TV static backdrop, vertigo surveillance reticle cursor)
  | 'matrix-code'    // The Matrix: Phosphor Terminal (Animated glitchy text, digital rain code, green monospace, prompt cursor)
  | 'dune'           // Dune: Arrakis Desert (Ancient Syne glyph typography, sandstone chamfered buttons, crysknife cursor, spice dust storm)
  | 'avatar'         // Avatar: Pandora Bioluminescence (Exo alien typography, organic glowing aura, woodsprite floating spore cursor & particles)
  | 'resident-evil'  // Resident Evil: Biohazard Umbrella Corp (Distressed stencil, hazard tape, biohazard reticle cursor, emergency alarm)
  | 'backrooms'      // The Backrooms: Liminal Level 0 (Yellowed wallpaper grid, fluorescent hum/flicker, VHS camcorder [REC] cursor)
  | 'hollywood-1969' // Once Upon a Time in Hollywood (1969 Sunset Strip, groovy retro 70s display, marquee drive-in borders, sun flare)
  | 'blade-runner'   // Blade Runner 2049: Cyber Brutalism (Orbitron Japanese display, spinner blaster laser reticle, neon smog haze)
  | 'apple-glass'    // Cupertino Studio Glass (Ultra-sleek frosted glassmorphism, SF typography, minimalist translucent materials)
  | 'grand-budapest' // Wes Anderson Editorial (Maximalist pastel symmetry, elegant editorial serif, double hairline borders)
  | 'kubrick-space'; // 2001 Monolith Minimalist (Ultra-austere Swiss space minimalism, glowing HAL-9000 eye indicator)

export interface CursorColors {
  default: string;
  camera: string;
  slate: string;
  'batman-bat'?: string;
  revolver?: string;
  batarang?: string;
  endurance?: string;
  crysknife?: string;
  'sacred-spore'?: string;
  'laser-crosshair'?: string;
  [key: string]: string | undefined;
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
  uiStyle: UIStyleType;
  setUIStyle: (style: UIStyleType) => void;
  uiLayout: UILayoutType;
  setUILayout: (layout: UILayoutType) => void;
  actionPosition: ActionPositionType;
  setActionPosition: (pos: ActionPositionType) => void;
  assistantPosition: AssistantPositionType;
  setAssistantPosition: (pos: AssistantPositionType) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  isCommandPopupOpen: boolean;
  setIsCommandPopupOpen: (open: boolean) => void;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  resetLayoutSettings: () => void;
  isSettingsOpen: boolean;
  settingsTab: 'ui-style' | 'layout' | 'cursor' | 'theme' | 'credits';
  openSettings: (tab?: 'ui-style' | 'layout' | 'cursor' | 'theme' | 'credits') => void;
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
  'batman-bat': '#f97316', // Gotham Amber/Orange
  revolver: '#ef4444',     // Crimson Muzzle
  batarang: '#eab308',     // Wayne Yellow
  endurance: '#38bdf8',    // Gargantua Cyan
  crysknife: '#d97706',    // Arrakis Spice
  'sacred-spore': '#38bdf8',// Eywa Cyan
  'laser-crosshair': '#10b981', // Phosphor Green
};

export const DEFAULT_FLASH_COLOR = '#ffffff';

export const DEFAULT_CUSTOM_PALETTE: CustomThemePalette = {
  primary: '#f59e0b', // Kodak Warm Amber
  bg: '#09090b',      // Obsidian Black
  card: '#141419',    // Film Slate Dark
  accent: '#fbbf24',  // Golden Highlight
};

const DEFAULT_THEME: ColorTheme = 'default';
const DEFAULT_UI_STYLE: UIStyleType = 'default';
const DEFAULT_UI_LAYOUT: UILayoutType = 'top-bar';
const DEFAULT_ACTION_POSITION: ActionPositionType = 'right';
const DEFAULT_ASSISTANT_POSITION: AssistantPositionType = 'bottom-right';
const DEFAULT_CURSOR_TYPE: CursorType = 'default';
// Default to native OS pointer so standard OS physics are respected out-of-the-box
const DEFAULT_CURSOR_DEFAULT_MODE: CursorDefaultMode = 'native';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLayout, setUILayoutState] = useState<UILayoutType>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-ui-layout');
      // If user had previous youtube layout saved, sanitize it back to top-bar
      if (saved === 'youtube') {
        localStorage.removeItem('stutterframe-ui-layout');
        return 'top-bar';
      }
      const validLayouts: UILayoutType[] = [
        'top-bar',
        'dropdown',
        'popup',
        'sidebar',
        'bottom-nav',
        'floating-island',
        'netflix',
        'amazon-prime',
      ];
      return saved && validLayouts.includes(saved as UILayoutType)
        ? (saved as UILayoutType)
        : DEFAULT_UI_LAYOUT;
    } catch {
      return DEFAULT_UI_LAYOUT;
    }
  });

  const [actionPosition, setActionPositionState] = useState<ActionPositionType>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-action-position') as ActionPositionType;
      return saved === 'left' || saved === 'center' || saved === 'split' || saved === 'right'
        ? (saved as ActionPositionType)
        : DEFAULT_ACTION_POSITION;
    } catch {
      return DEFAULT_ACTION_POSITION;
    }
  });

  const [assistantPosition, setAssistantPositionState] = useState<AssistantPositionType>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-assistant-position') as AssistantPositionType;
      return saved === 'bottom-left' || saved === 'header-only' || saved === 'bottom-right'
        ? (saved as AssistantPositionType)
        : DEFAULT_ASSISTANT_POSITION;
    } catch {
      return DEFAULT_ASSISTANT_POSITION;
    }
  });

  const [compactMode, setCompactModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('stutterframe-compact-mode') === 'true';
    } catch {
      return false;
    }
  });

  const [isCommandPopupOpen, setIsCommandPopupOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-sidebar-expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [uiStyle, setUIStyleState] = useState<UIStyleType>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-ui-style') as UIStyleType;
      if ((saved as string) === 'youtube') {
        localStorage.removeItem('stutterframe-ui-style');
        return 'default';
      }
      const validStyles: UIStyleType[] = [
        'default',
        'netflix',
        'amazon-prime',
        'godfather',
        'batman',
        'interstellar',
        'train-to-busan',
        'obsession',
        'matrix-code',
        'dune',
        'avatar',
        'blade-runner',
        'resident-evil',
        'backrooms',
        'hollywood-1969',
        'apple-glass',
        'grand-budapest',
        'kubrick-space',
      ];
      return validStyles.includes(saved) ? saved : DEFAULT_UI_STYLE;
    } catch {
      return DEFAULT_UI_STYLE;
    }
  });

  const [cursorType, setCursorTypeState] = useState<CursorType>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-cursor-type') as CursorType;
      const validCursors: CursorType[] = [
        'default',
        'camera',
        'slate',
        'batman-bat',
        'revolver',
        'batarang',
        'endurance',
        'crysknife',
        'sacred-spore',
        'laser-crosshair',
      ];
      return validCursors.includes(saved) ? saved : DEFAULT_CURSOR_TYPE;
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
      const saved = localStorage.getItem('stutterframe-theme') as ColorTheme;
      if ((saved as string) === 'youtube') {
        localStorage.removeItem('stutterframe-theme');
        return DEFAULT_THEME;
      }
      return saved || DEFAULT_THEME;
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
  const [settingsTab, setSettingsTab] = useState<'ui-style' | 'layout' | 'cursor' | 'theme' | 'credits'>('ui-style');
  const [pageChangeEventId, setPageChangeEventId] = useState(0);
  const [lastClickPos, setLastClickPos] = useState<{ x: number; y: number } | null>(null);

  // Apply UI layout to DOM root
  const applyUILayoutToDom = useCallback((layout: UILayoutType) => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-ui-layout', layout);
    body.setAttribute('data-ui-layout', layout);
  }, []);

  // Apply UI style architecture to DOM root
  const applyUIStyleToDom = useCallback((style: UIStyleType) => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-ui-style', style);
    body.setAttribute('data-ui-style', style);
  }, []);

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

  // Sync UI layout changes to DOM
  useEffect(() => {
    applyUILayoutToDom(uiLayout);
  }, [uiLayout, applyUILayoutToDom]);

  // Sync UI style changes to DOM
  useEffect(() => {
    applyUIStyleToDom(uiStyle);
  }, [uiStyle, applyUIStyleToDom]);

  // Sync theme changes to DOM
  useEffect(() => {
    applyThemeToDom(theme, customPalette);
  }, [theme, customPalette, applyThemeToDom]);

  const setUILayout = useCallback(
    (newLayout: UILayoutType) => {
      setUILayoutState(newLayout);
      try {
        localStorage.setItem('stutterframe-ui-layout', newLayout);
      } catch (err) {
        console.warn('Storage error', err);
      }
      applyUILayoutToDom(newLayout);

      // Auto-align 1:1 streaming theme & palette when selecting Netflix, Amazon Prime, or YouTube layout
      if (newLayout === 'netflix') {
        setUIStyleState('netflix');
        setThemeState('netflix');
        try {
          localStorage.setItem('stutterframe-ui-style', 'netflix');
          localStorage.setItem('stutterframe-theme', 'netflix');
        } catch {}
        applyUIStyleToDom('netflix');
        applyThemeToDom('netflix', customPalette);
      } else if (newLayout === 'amazon-prime') {
        setUIStyleState('amazon-prime');
        setThemeState('amazon-prime');
        try {
          localStorage.setItem('stutterframe-ui-style', 'amazon-prime');
          localStorage.setItem('stutterframe-theme', 'amazon-prime');
        } catch {}
        applyUIStyleToDom('amazon-prime');
        applyThemeToDom('amazon-prime', customPalette);
      }
    },
    [applyUILayoutToDom, applyUIStyleToDom, applyThemeToDom, customPalette]
  );

  const setActionPosition = useCallback((pos: ActionPositionType) => {
    setActionPositionState(pos);
    try {
      localStorage.setItem('stutterframe-action-position', pos);
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const setAssistantPosition = useCallback((pos: AssistantPositionType) => {
    setAssistantPositionState(pos);
    try {
      localStorage.setItem('stutterframe-assistant-position', pos);
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const setCompactMode = useCallback((compact: boolean) => {
    setCompactModeState(compact);
    try {
      localStorage.setItem('stutterframe-compact-mode', compact ? 'true' : 'false');
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const handleSetIsSidebarExpanded = useCallback((expanded: boolean) => {
    setIsSidebarExpanded(expanded);
    try {
      localStorage.setItem('stutterframe-sidebar-expanded', expanded ? 'true' : 'false');
    } catch (err) {
      console.warn('Storage error', err);
    }
  }, []);

  const resetLayoutSettings = useCallback(() => {
    setUILayoutState(DEFAULT_UI_LAYOUT);
    setActionPositionState(DEFAULT_ACTION_POSITION);
    setAssistantPositionState(DEFAULT_ASSISTANT_POSITION);
    setCompactModeState(false);
    setIsSidebarExpanded(true);
    setIsCommandPopupOpen(false);
    setIsMobileSidebarOpen(false);

    // If currently on streaming theme, also restore default movie style on rollback
    setUIStyleState((prev) => {
      if (prev === 'netflix' || prev === 'amazon-prime' || (prev as string) === 'youtube') {
        try {
          localStorage.removeItem('stutterframe-ui-style');
        } catch {}
        applyUIStyleToDom(DEFAULT_UI_STYLE);
        return DEFAULT_UI_STYLE;
      }
      return prev;
    });

    setThemeState((prev) => {
      if (prev === 'netflix' || prev === 'amazon-prime' || (prev as string) === 'youtube') {
        try {
          localStorage.removeItem('stutterframe-theme');
        } catch {}
        return DEFAULT_THEME;
      }
      return prev;
    });

    try {
      localStorage.removeItem('stutterframe-ui-layout');
      localStorage.removeItem('stutterframe-action-position');
      localStorage.removeItem('stutterframe-assistant-position');
      localStorage.removeItem('stutterframe-compact-mode');
      localStorage.removeItem('stutterframe-sidebar-expanded');
    } catch (err) {
      console.warn('Storage clear error', err);
    }
    applyUILayoutToDom(DEFAULT_UI_LAYOUT);
  }, [applyUILayoutToDom, applyUIStyleToDom]);

  const setUIStyle = useCallback(
    (newStyle: UIStyleType) => {
      setUIStyleState(newStyle);
      try {
        localStorage.setItem('stutterframe-ui-style', newStyle);
      } catch (err) {
        console.warn('Storage error', err);
      }
      applyUIStyleToDom(newStyle);

      // When picking Netflix or Prime theme, align layout as well for 1:1 integration
      if (newStyle === 'netflix') {
        setUILayoutState('netflix');
        setThemeState('netflix');
        try {
          localStorage.setItem('stutterframe-ui-layout', 'netflix');
          localStorage.setItem('stutterframe-theme', 'netflix');
        } catch {}
        applyUILayoutToDom('netflix');
        applyThemeToDom('netflix', customPalette);
      } else if (newStyle === 'amazon-prime') {
        setUILayoutState('amazon-prime');
        setThemeState('amazon-prime');
        try {
          localStorage.setItem('stutterframe-ui-layout', 'amazon-prime');
          localStorage.setItem('stutterframe-theme', 'amazon-prime');
        } catch {}
        applyUILayoutToDom('amazon-prime');
        applyThemeToDom('amazon-prime', customPalette);
      }
    },
    [applyUIStyleToDom, applyUILayoutToDom, applyThemeToDom, customPalette]
  );

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

  const openSettings = useCallback((tab: 'ui-style' | 'layout' | 'cursor' | 'theme' | 'credits' = 'ui-style') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // OVERALL RESET TO DEFAULT
  // Explicitly resets cursor to System default Native OS pointer, UI style, UI layout & themes to default
  const resetAllSettings = useCallback(() => {
    setCursorTypeState(DEFAULT_CURSOR_TYPE);
    setCursorDefaultModeState('native'); // System default Native OS pointer
    setCursorColorsState(DEFAULT_CURSOR_COLORS);
    setFlashColorState(DEFAULT_FLASH_COLOR);
    setThemeState(DEFAULT_THEME);
    setCustomPaletteState(DEFAULT_CUSTOM_PALETTE);
    setUIStyleState(DEFAULT_UI_STYLE);
    resetLayoutSettings();

    try {
      localStorage.removeItem('stutterframe-cursor-type');
      localStorage.removeItem('stutterframe-cursor-default-mode');
      localStorage.removeItem('stutterframe-cursor-colors');
      localStorage.removeItem('stutterframe-cursor-color');
      localStorage.removeItem('stutterframe-flash-color');
      localStorage.removeItem('stutterframe-theme');
      localStorage.removeItem('stutterframe-custom-palette');
      localStorage.removeItem('stutterframe-ui-style');
      localStorage.removeItem('stutterframe-ui-layout');
      localStorage.removeItem('stutterframe-action-position');
      localStorage.removeItem('stutterframe-assistant-position');
      localStorage.removeItem('stutterframe-compact-mode');
      localStorage.removeItem('stutterframe-sidebar-expanded');
    } catch (err) {
      console.warn('Storage clear error', err);
    }

    applyThemeToDom(DEFAULT_THEME, DEFAULT_CUSTOM_PALETTE);
    applyUIStyleToDom(DEFAULT_UI_STYLE);
    applyUILayoutToDom(DEFAULT_UI_LAYOUT);
  }, [applyThemeToDom, applyUIStyleToDom, applyUILayoutToDom, resetLayoutSettings]);

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
        uiStyle,
        setUIStyle,
        uiLayout,
        setUILayout,
        actionPosition,
        setActionPosition,
        assistantPosition,
        setAssistantPosition,
        compactMode,
        setCompactMode,
        isCommandPopupOpen,
        setIsCommandPopupOpen,
        isSidebarExpanded,
        setIsSidebarExpanded: handleSetIsSidebarExpanded,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        resetLayoutSettings,
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
