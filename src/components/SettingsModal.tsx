import React, { useState, useEffect } from 'react';
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
  Layers,
  Crosshair,
  Layout,
  ChevronDown,
  Compass,
  PanelLeft,
  CreditCard,
  Maximize2,
  HelpCircle,
  Tv,
} from 'lucide-react';
import {
  useSettings,
  CursorType,
  ColorTheme,
  UIStyleType,
  UILayoutType,
  ActionPositionType,
  AssistantPositionType,
} from '../context/SettingsContext';

interface UILayoutOption {
  id: UILayoutType;
  name: string;
  badge: string;
  description: string;
  features: string[];
  icon: any;
  bestFor: string;
}

const UI_LAYOUT_OPTIONS: UILayoutOption[] = [
  {
    id: 'netflix',
    name: 'Netflix 1:1 Streaming',
    badge: '1:1 Integration',
    description:
      'Authentic 1:1 Netflix streaming platform interface. Giant billboard hero banner, bold Bebas Neue condensed typography, signature Netflix crimson accents, white solid play buttons, and horizontal swipe rails with 3D Top 10 numerals.',
    features: ['1:1 Billboard hero section', 'Netflix red & pitch black #141414', 'Horizontal scrolling rails & 3D numerals', 'Bebas Neue display typography'],
    icon: Tv,
    bestFor: 'Streaming Experience & Cinematic Browsing',
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    badge: '1:1 Integration',
    description:
      'Authentic 1:1 Amazon Prime Video platform interface. Deep slate navy canvas (#0f172a), Prime electric blue (#00a8e1) accents, X-Ray metadata tags, curved smile branding, and horizontal Prime swimlane carousels.',
    features: ['1:1 Prime hero carousel', 'Prime electric blue & slate navy', 'X-Ray frame & metadata tags', 'Included with Prime filter chips'],
    icon: Tv,
    bestFor: 'Prime Video Fans & Sleek Dark Navy UI',
  },
  {
    id: 'top-bar',
    name: 'Celluloid Top Bar',
    badge: 'Standard Default',
    description:
      'Classic desktop horizontal navigation bar with responsive mobile horizontal track. Keeps all core tools readily visible on wide monitors.',
    features: ['Classic cinema header', 'Responsive sub-navigation bar', 'Right-aligned tool cluster', 'Balanced screen space'],
    icon: Layout,
    bestFor: 'Laptops & Desktop Workstations',
  },
  {
    id: 'dropdown',
    name: 'Dropdown Menu Header',
    badge: 'Compact Focus',
    description:
      'Compact minimalist header that organizes tools into an elegant categorized dropdown menu. Maximizes screen real estate for deep screenplay writing and video evaluation.',
    features: ['Categorized tools popover', 'Clean minimal header', 'High-focus viewport', 'No horizontal clutter'],
    icon: ChevronDown,
    bestFor: 'Concentrated Screenplay & Script Lab',
  },
  {
    id: 'popup',
    name: 'Popup Command Deck',
    badge: 'Radial HUD / ⌘K',
    description:
      'Futuristic HUD launcher button that summons a full-screen Command Deck modal with live search, tool cards, keyboard shortcuts, and instant jumps.',
    features: ['Instant ⌘K / Ctrl+K shortcut', 'Fast search-as-you-type filter', 'Large interactive tool cards', 'Director action shortcuts'],
    icon: Compass,
    bestFor: 'Power Users & Rapid Navigation',
  },
  {
    id: 'sidebar',
    name: 'Left Film Strip Sidebar',
    badge: 'Dock & Drawer',
    description:
      'Collapsible vertical filmstrip dock permanently accessible on the left of desktop screens, with smooth slide-out drawer on mobile phones.',
    features: ['Vertical tool tabs with badges', 'Expand / Collapse icon rail', 'Slide-out mobile cinema drawer', 'Dedicated bottom control dock'],
    icon: PanelLeft,
    bestFor: 'Large Monitors & Multitasking',
  },
  {
    id: 'bottom-nav',
    name: 'App Bottom Navigation',
    badge: 'Mobile Thumb Dock',
    description:
      'Mobile-native thumb dock pinned directly to the bottom edge with iOS/Android safe-area inset support and slide-up sheet for secondary tools.',
    features: ['Ergonomic thumb reachability', 'Slide-up cinema suite sheet', 'PWA / Mobile browser optimized', 'Ultra-clean top header'],
    icon: CreditCard,
    bestFor: 'Mobile Phones & Tablets',
  },
  {
    id: 'floating-island',
    name: 'Floating Dynamic Island',
    badge: 'Capsule HUD',
    description:
      'Futuristic capsule island floating gracefully above content with frosted glassmorphism, instant tool icons, and expandable settings drawer.',
    features: ['Floating glassmorphic pill', 'Subtle border glow', 'Tool quick triggers', 'Expandable quick drawer'],
    icon: Maximize2,
    bestFor: 'Immersive Shot Review & Cine Aesthetics',
  },
];

interface UIStyleOption {
  id: UIStyleType;
  name: string;
  movieInspiration: string;
  badge: string;
  description: string;
  features: string[];
  tag: string;
}

const UI_STYLE_OPTIONS: UIStyleOption[] = [
  {
    id: 'netflix',
    name: 'Netflix 1:1 Cinema',
    movieInspiration: 'Netflix Original • Global Streaming Icon',
    badge: '1:1 Streaming UI',
    description:
      'Pitch black #141414 canvas, signature Netflix Crimson #e50914, bold Bebas Neue display typography, solid white play buttons, and subtle red ambient spotlight.',
    features: ['Pitch black #141414 canvas', 'Netflix Crimson accents', 'Bebas Neue bold condensed typography', 'Solid white play action buttons'],
    tag: 'Streaming Platform',
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    movieInspiration: 'Prime Video • Amazon MGM Studios',
    badge: '1:1 Streaming UI',
    description:
      'Deep slate navy canvas (#0f172a), Prime Electric Blue #00a8e1, clean Amazon geometric sans typography, and X-Ray metadata badges.',
    features: ['Dark slate navy #0f172a', 'Prime Electric Blue accents', 'X-Ray metadata badges', 'Prime smile brand accents'],
    tag: 'Streaming Platform',
  },
  {
    id: 'default',
    name: 'Celluloid Classic',
    movieInspiration: 'Citizen Kane • 35mm Celluloid',
    badge: 'Original Default',
    description:
      'Deep cinematic 35mm darkroom aesthetic with Kodak amber accents, typewriter sluglines, vintage tape tracking, and physical film grain.',
    features: ['Courier Prime typography', 'Subtle VHS scanlines', 'Kodak amber clapperboard cues', 'Clean balanced geometry'],
    tag: 'Classic Cinema',
  },
  {
    id: 'godfather',
    name: 'The Godfather',
    movieInspiration: 'The Godfather • Francis Ford Coppola',
    badge: 'Red & White Gothic Mafia',
    description:
      'Gothic Victorian typography in high-contrast red & white, animated blood slowly creeping up the hero text, ornate beveled frames, antique snubnose revolver pistol cursor, and tobacco smoke haze.',
    features: ['Red & white textual theme', 'Animated creeping blood text', 'Vintage pistol crosshair cursor', 'Ornate gold/crimson beveled frames'],
    tag: 'Mafia Noir',
  },
  {
    id: 'batman',
    name: 'The Batman: Dark Knight',
    movieInspiration: 'The Batman • The Dark Knight',
    badge: 'League Gothic Red/Orange',
    description:
      'League Gothic typography in red, orange & stark white, animated bat swarms flying across Gotham rain, Wayne carbon-armor chamfered plates, and carbon Batarang crosshair cursor.',
    features: ['League Gothic typography', 'Animated flying bat swarm', 'Red/orange & white theme', 'Batarang targeting diamond cursor'],
    tag: 'Gotham Noir',
  },
  {
    id: 'interstellar',
    name: 'Interstellar',
    movieInspiration: 'Interstellar • Christopher Nolan',
    badge: 'Endurance Deep Space',
    description:
      'Audiowide space typography, 3D warping cosmic starfield, Gargantua black hole accretion glow, aerospace titanium bevels, and spinning Endurance modular ring cursor.',
    features: ['Audiowide space font', '3D warping cosmic starfield', 'Endurance spinning ring cursor', 'Gargantua accretion glow'],
    tag: 'Space Odyssey',
  },
  {
    id: 'train-to-busan',
    name: 'Train to Busan',
    movieInspiration: 'Train to Busan • Yeon Sang-ho',
    badge: 'Muted Biohazard Rail',
    description:
      'Distressed zombie horror typography, foggy desaturated railyard backdrop with railroad track silhouettes, blood-stained steel plates, and KTX rail biohazard reticle cursor.',
    features: ['Special Elite horror font', 'Foggy railyard track silhouettes', 'KTX rail biohazard cursor', 'Muted desaturated horror palette'],
    tag: 'Horror Survival',
  },
  {
    id: 'obsession',
    name: 'Obsession',
    movieInspiration: 'Obsession • Brian De Palma • Hitchcock Vertigo',
    badge: 'Psychological Vertigo',
    description:
      'Fractured film noir typography, real-time analog TV static noise backdrop, hypnotic vertigo concentric surveillance circles, and hypnotic vertigo surveillance iris cursor.',
    features: ['Film noir italic serif', 'Real-time analog TV static noise', 'Hypnotic vertigo iris cursor', 'Cold surveillance monochrome & red'],
    tag: 'Psychological Noir',
  },
  {
    id: 'matrix-code',
    name: 'The Matrix Terminal',
    movieInspiration: 'The Matrix • The Wachowskis',
    badge: 'Phosphor Cyber Terminal',
    description:
      'Authentic cyberpunk green phosphor terminal with animated glitchy digital distortion text, live digital rain code streaming, CRT cathode glow, and terminal prompt cursor.',
    features: ['Animated glitchy digital text', 'Real-time green digital rain canvas', 'Terminal prompt >_ cursor', 'Bracketed cyber controls'],
    tag: 'Cyberpunk',
  },
  {
    id: 'resident-evil',
    name: 'Resident Evil: Biohazard',
    movieInspiration: 'Resident Evil • Raccoon City Outbreak',
    badge: 'Umbrella Corp Biohazard',
    description:
      'Distressed horror stencil typography, diagonal hazard warning stripes, Umbrella Corp biohazard reticle cursor, and emergency crimson containment beacons.',
    features: ['Black Ops One & Special Elite fonts', 'Hazard warning tape borders', 'Umbrella biohazard reticle cursor', 'Emergency crimson quarantine pulse'],
    tag: 'Horror Survival',
  },
  {
    id: 'backrooms',
    name: 'The Backrooms: Level 0',
    movieInspiration: 'The Backrooms (Kane Pixels) • Liminal Horror',
    badge: 'Liminal Office Horror',
    description:
      'Endless repeating damp yellowed wallpaper, depressing fluorescent office partitions, flickering 60Hz tube lights, and 1990s VHS Camcorder HUD cursor with blinking [REC].',
    features: ['VT323 retro dot-matrix font', 'Damp yellow wallpaper pattern', 'VHS camcorder [REC] cursor', 'Fluorescent tube flicker & hum'],
    tag: 'Liminal Horror',
  },
  {
    id: 'hollywood-1969',
    name: 'Once Upon a Time in Hollywood',
    movieInspiration: 'Once Upon a Time in Hollywood • Tarantino',
    badge: '1969 Sunset Strip',
    description:
      'Groovy 1969 psychedelic retro typography, drive-in marquee neon golden frames, vintage 35mm film reel pointer cursor, and warm sun-drenched California flare.',
    features: ['Righteous groovy 70s display font', 'Drive-in marquee neon borders', '35mm film reel pointer cursor', 'California golden hour lens flare'],
    tag: '1969 Retro',
  },
  {
    id: 'dune',
    name: 'Dune: Arrakis',
    movieInspiration: 'Dune • Denis Villeneuve • Frank Herbert',
    badge: 'Arrakis Desert Monolith',
    description:
      'Ancient desert sci-fi glyph typography, sandstone tablet chamfered buttons, Fremen crysknife compass cursor, and a swirling golden spice storm.',
    features: ['Syne & Cinzel desert typography', 'Chamfered sandstone tablet buttons', 'Fremen crysknife blade cursor', 'Swirling golden spice dust particles'],
    tag: 'Desert Sci-Fi',
  },
  {
    id: 'avatar',
    name: 'Avatar: Pandora',
    movieInspiration: 'Avatar • James Cameron',
    badge: 'Bioluminescent Rainforest',
    description:
      'Bioluminescent cyan & ultraviolet organic aura, curved glowing glassmorphic frames, and sacred floating Woodsprites (Atokirina) drifting upward.',
    features: ['Exo 2 alien sci-fi typography', 'Curved bioluminescent glow frames', 'Sacred Woodsprite spore cursor', 'Drifting glowing spore particles'],
    tag: 'Bioluminescent',
  },
  {
    id: 'blade-runner',
    name: 'Blade Runner 2049',
    movieInspiration: 'Blade Runner 2049 • Denis Villeneuve',
    badge: 'Cyber Neo-Brutalism',
    description:
      'Monolithic industrial brutalism with Orbitron Japanese typography, chamfered HUD panels, LAPD blaster laser reticle cursor, and neon smog haze.',
    features: ['Orbitron & Chakra Petch display', 'Zero-radius chamfered panels', 'Blaster laser reticle cursor', 'Neon orange smog & telemetry HUD'],
    tag: 'Neo-Brutalism',
  },
  {
    id: 'apple-glass',
    name: 'Cupertino Studio Glass',
    movieInspiration: 'Her • Tron: Legacy • Apple Design',
    badge: 'Frosted Glassmorphism',
    description:
      'Ultra-sleek, minimalist acrylic frosted glass. Translucent layered materials, specular highlights, refined SF system typography, and floating ambient light orbs.',
    features: ['Backdrop blur acrylics', 'Clean modern sans-serif typography', 'Hairline specular glass reflections', 'Floating ethereal light orbs'],
    tag: 'Sleek Minimalist',
  },
  {
    id: 'grand-budapest',
    name: 'The Grand Budapest',
    movieInspiration: 'The Grand Budapest Hotel • Wes Anderson',
    badge: 'Editorial Maximalism',
    description:
      'Storybook maximalism with obsessive symmetry, ornate double-line frames, elegant literary serif typography, vintage stamps, and drifting golden dust motes.',
    features: ['Playfair literary serif', 'Symmetrical double-line picture frames', 'Warm floating golden dust motes', 'Dusty rose & brass palette'],
    tag: 'Storybook Maximalism',
  },
  {
    id: 'kubrick-space',
    name: '2001: A Space Odyssey',
    movieInspiration: '2001: A Space Odyssey • Stanley Kubrick',
    badge: 'Monolith Minimalist',
    description:
      'Ultra-austere Swiss space minimalism. Pure cosmic void, crisp aerospace brackets, sprawling negative space, and the iconic glowing red HAL-9000 sensor.',
    features: ['Swiss sans typography', 'Glowing crimson HAL-9000 optic sensor', 'Deep space cosmic starfield particles', 'Razor-thin precision aerospace hairlines'],
    tag: 'Space Minimalist',
  },
];

interface CursorOption {
  id: CursorType;
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
  renderIcon: (color: string) => React.ReactNode;
}

const CURSOR_OPTIONS: CursorOption[] = [
  {
    id: 'default',
    name: 'System Default',
    badge: 'Precision Pointer',
    badgeColor: 'text-zinc-300 bg-zinc-800/80 border-zinc-700',
    desc: 'Clean native operating system pointer or colored cinema precision arrow.',
    renderIcon: (c) => <MousePointer className="w-4 h-4" style={{ color: c }} />,
  },
  {
    id: 'batman-bat',
    name: 'The Gotham Bat',
    badge: 'Flapping Wings',
    badgeColor: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
    desc: 'Dark Knight nocturnal bat with fluid flapping wings and Wayne radar scan.',
    renderIcon: (c) => (
      <svg width="24" height="14" viewBox="0 0 48 24" fill="none" className="drop-shadow-sm">
        <path
          d="M24 3.5 L22 1 L20 4.5 C16 3.5 12 2.5 10 3.5 L1 8 Q4 13 8 15 Q11 17 15 16 Q18 16.5 22 15 L24 17.5 L26 15 Q30 16.5 33 16 Q37 17 40 15 Q44 13 47 8 L38 3.5 C36 2.5 32 3.5 28 4.5 L26 1 Z"
          fill="#18181b"
          stroke={c || '#f97316'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <polygon points="20.5,3.5 22,0.8 23.5,3.8" fill={c || '#f97316'} />
        <polygon points="27.5,3.5 26,0.8 24.5,3.8" fill={c || '#f97316'} />
        <circle cx="22.2" cy="5.2" r="1" fill="#ffffff" />
        <circle cx="25.8" cy="5.2" r="1" fill="#ffffff" />
        <line x1="10" y1="3.5" x2="8" y2="15" stroke={c || '#f97316'} strokeWidth="1" opacity="0.7" />
        <line x1="38" y1="3.5" x2="40" y2="15" stroke={c || '#f97316'} strokeWidth="1" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'revolver',
    name: 'Snubnose Revolver',
    badge: 'Revolving Cylinder',
    badgeColor: 'text-red-400 bg-red-500/15 border-red-500/30',
    desc: 'Mafia snubnose revolver with revolving cylinder and brass front sight pin.',
    renderIcon: (c) => (
      <svg width="22" height="18" viewBox="0 0 48 34" fill="none" className="drop-shadow-sm">
        {/* Barrel & Sight */}
        <path d="M4 5L5.5 2H7.5L7.5 5H4Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.8" />
        <circle cx="6" cy="3.5" r="1.3" fill={c || '#ef4444'} />
        <path d="M3 5H18V11H3C2.2 11 1.8 10.4 1.8 9.5V6.5C1.8 5.6 2.2 5 3 5Z" fill="#1e293b" stroke={c || '#ef4444'} strokeWidth="1" />
        <path d="M5 11H17V13.8H6C5.4 13.8 5 13.4 5 12.8V11Z" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        {/* Top strap */}
        <path d="M17 5H32V7.5H17V5Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        {/* 6-Chamber Cylinder */}
        <rect x="17.5" y="7.5" width="12" height="10" rx="1.8" fill="#0f172a" stroke={c || '#ef4444'} strokeWidth="1.2" />
        <path d="M18.5 9.2H28.5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 12.5H29" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18.5 15.6H28.5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
        {/* Hammer */}
        <path d="M33 7L37.5 2.5C38.2 2 39.2 2.6 39 3.5L38 6.5L35 8.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.9" />
        {/* Trigger guard */}
        <path d="M19 18V21C19 25 23.5 26.5 27 25C28.5 24.2 29.5 22.2 29.5 19.5" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Walnut Grip */}
        <path d="M30 18.5C31.5 19.8 33 21.5 33 24.5C33 27.5 31.5 30.5 29.5 33C28 34.5 25.5 34.5 23.8 33.5C22 32.5 21.5 30.8 22 28C22.5 25 24.2 22.5 26 20L28 18.5" fill="#78350f" stroke="#451a03" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx="27.5" cy="26.5" r="1.5" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    id: 'batarang',
    name: 'Wayne Batarang',
    badge: 'Aerodynamic Spin',
    badgeColor: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
    desc: 'High-tensile carbon aerodynamic batarang with Wayne tactical targeting diamond.',
    renderIcon: (c) => (
      <svg width="24" height="12" viewBox="0 0 48 20" fill="none" className="drop-shadow-sm">
        <path
          d="M24 3 L22 1 L20 4 C14 2 8 2 0 4.5 Q3.5 8 7 10 Q11 12 15 12 Q19 14 24 18.5 Q29 14 33 12 Q37 12 41 10 Q44.5 8 48 4.5 C40 2 34 2 28 4 L26 1 Z"
          fill="#18181b"
          stroke={c || '#eab308'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M20 4L24 7.5L28 4" stroke="#71717a" strokeWidth="1" strokeLinejoin="round" />
        <line x1="24" y1="7.5" x2="24" y2="18.5" stroke="#71717a" strokeWidth="1" />
        <line x1="9" y1="6" x2="16" y2="7" stroke={c || '#eab308'} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="39" y1="6" x2="32" y2="7" stroke={c || '#eab308'} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="24" cy="9.5" r="2.2" fill="#18181b" stroke={c || '#eab308'} strokeWidth="1" />
        <polygon points="24,8.2 25.4,9.6 24,11 22.6,9.6" fill={c || '#facc15'} />
      </svg>
    ),
  },
  {
    id: 'camera',
    name: 'Cinema Camera',
    badge: 'Viewfinder Flash',
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    desc: '35mm viewfinder camera triggering a gentle shutter flash only on navigation.',
    renderIcon: (c) => <Camera className="w-4 h-4" style={{ color: c }} />,
  },
  {
    id: 'slate',
    name: 'Movie Slate',
    badge: 'Stick Snap',
    badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    desc: 'Zebra clapperboard stick snapping shut cleanly on page change.',
    renderIcon: (c) => <Clapperboard className="w-4 h-4" style={{ color: c }} />,
  },
  {
    id: 'sacred-spore',
    name: 'Pandora Woodsprite',
    badge: 'Bioluminescent',
    badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    desc: 'Floating sacred Atokirina spore drifting with glowing bioluminescent tentacles.',
    renderIcon: (c) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-sporeDrift">
        <path d="M5 11C5 6 8 3 12 3C16 3 19 6 19 11C19 12.5 16 12.5 14 11.5C12 10.5 12 10.5 10 11.5C8 12.5 5 12.5 5 11Z" fill="rgba(56,189,248,0.4)" stroke={c || '#38bdf8'} strokeWidth="1.2" />
        <path d="M8 12C8 15 7 18 6 20" stroke="#c084fc" strokeWidth="1" strokeLinecap="round" />
        <path d="M12 12C12 16 13 18 12 21" stroke={c || '#38bdf8'} strokeWidth="1" strokeLinecap="round" />
        <path d="M16 12C16 15 17 18 18 20" stroke="#c084fc" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'crysknife',
    name: 'Fremen Crysknife',
    badge: 'Spice Dust',
    badgeColor: 'text-amber-500 bg-amber-500/15 border-amber-500/30',
    desc: 'Ancient Arrakis sandworm tooth dagger with sand compass reticle.',
    renderIcon: (c) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={c || '#d97706'} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
        <path d="M5 19L10 14L15 7C17 4.5 19 2.5 20.5 3.5C21.5 5 19.5 7 17 9L12 14L7 19H5Z" fill="#fef3c7" stroke={c || '#d97706'} strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'laser-crosshair',
    name: 'Laser Crosshair',
    badge: 'Targeting Optic',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    desc: 'Blade Runner spinner blaster crosshair with rotating targeting ring.',
    renderIcon: (c) => (
      <Crosshair className="w-4 h-4 animate-laserCrosshairPulse" style={{ color: c || '#10b981' }} />
    ),
  },
  {
    id: 'endurance',
    name: 'Endurance Ring',
    badge: 'Station Spin',
    badgeColor: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
    desc: 'Interstellar 12-pod orbital spacecraft station rotating smoothly in deep space.',
    renderIcon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="animate-enduranceStationSpin">
        <circle cx="12" cy="12" r="8" stroke={c || '#38bdf8'} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="2" fill="#0284c7" />
        <rect x="11" y="2.5" width="2" height="2" rx="0.4" fill="#e0f2fe" />
        <rect x="11" y="19.5" width="2" height="2" rx="0.4" fill="#e0f2fe" />
        <rect x="2.5" y="11" width="2" height="2" rx="0.4" fill="#e0f2fe" />
        <rect x="19.5" y="11" width="2" height="2" rx="0.4" fill="#e0f2fe" />
      </svg>
    ),
  },
];

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
    id: 'netflix',
    name: 'Netflix 1:1 Crimson',
    badge: 'Pitch Black & Red',
    color: '#e50914',
    desc: 'Pitch black #141414 background paired with signature Netflix Crimson red accents.',
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    badge: 'Dark Navy & Electric Blue',
    color: '#00a8e1',
    desc: 'Deep slate navy #0f172a background paired with Prime Electric Blue accents.',
  },
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
    resetLayoutSettings,
    resetAllSettings,
    triggerPageChangeEffect,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'ui-style' | 'layout' | 'cursor' | 'theme' | 'credits'>(settingsTab);
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
            onClick={() => setActiveTab('ui-style')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'ui-style'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>UI Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-0.5" />
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'layout'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>UI Layouts</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-0.5" />
          </button>

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
          {/* TAB 0: UI ARCHITECTURE & MOVIE-INSPIRED DESIGN SYSTEM */}
          {activeTab === 'ui-style' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Context Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="font-courier text-xs font-bold text-white uppercase tracking-wider">
                      Cinema &amp; Iconic Design Archetypes
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] uppercase font-bold border border-amber-500/30">
                    {UI_STYLE_OPTIONS.length} Architectures
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Transform the entire interface into authentic cinematic design languages. Each architecture alters typography, surface textures, border physics, geometry, and real-time atmospheric particles.
                </p>
              </div>

              {/* UI Architecture Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {UI_STYLE_OPTIONS.map((style) => {
                  const isSelected = uiStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => setUIStyle(style.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group touch-manipulation active:scale-[0.99] ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                          : 'bg-zinc-950/80 hover:bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top Meta row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                            {style.tag}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {isSelected ? 'Active UI' : style.badge}
                          </span>
                        </div>

                        {/* Title & Movie Inspiration */}
                        <div>
                          <h4 className="font-courier text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                            {style.name}
                          </h4>
                          <span className="text-[11px] font-mono text-zinc-400 block mt-0.5 italic">
                            Film Inspiration: {style.movieInspiration}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                          {style.description}
                        </p>

                        {/* Feature Badges */}
                        <div className="pt-1.5 flex flex-wrap gap-1.5">
                          {style.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 border border-zinc-800/80 text-zinc-400"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom status / selector button */}
                      <div className="pt-3 mt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                        <span className={isSelected ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                          {isSelected ? '✓ Currently Live' : 'Click to Apply Style'}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-black'
                              : 'border-zinc-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instant Rollback Button */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-courier text-xs font-bold text-white uppercase">
                    Rollback to Default Cinema UI
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Instantly reverts the interface to Celluloid Classic (current 35mm default) without altering your data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUIStyle('default')}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Default UI</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: UI LAYOUTS & BUTTON POSITIONS */}
          {activeTab === 'layout' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Context Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-amber-400" />
                    <span className="font-courier text-xs font-bold text-white uppercase tracking-wider">
                      Cinema Navigation &amp; UI Layout Systems
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] uppercase font-bold border border-amber-500/30">
                    {UI_LAYOUT_OPTIONS.length} Layout Archetypes
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Choose how menus, buttons, and navigation docks are positioned. Every layout adapts dynamically to your active Movie Theme and Color Palette, and is optimized for both desktop and mobile browsers.
                </p>
              </div>

              {/* Layout Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {UI_LAYOUT_OPTIONS.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = uiLayout === layout.id;
                  return (
                    <div
                      key={layout.id}
                      onClick={() => setUILayout(layout.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group touch-manipulation active:scale-[0.99] ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                          : 'bg-zinc-950/80 hover:bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top Meta row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected
                                  ? 'bg-amber-500 text-black font-bold'
                                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                              {layout.bestFor}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {isSelected ? 'Active Layout' : layout.badge}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-courier text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                            {layout.name}
                          </h4>
                          <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-1">
                            {layout.description}
                          </p>
                        </div>

                        {/* Feature Badges */}
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {layout.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 border border-zinc-800/80 text-zinc-400"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom status / selector button */}
                      <div className="pt-3 mt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                        <span className={isSelected ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                          {isSelected ? '✓ Currently Live' : 'Click to Apply Layout'}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-black'
                              : 'border-zinc-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Menu & Button Positioning Options */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="font-courier text-xs font-bold text-white uppercase tracking-wider">
                    Menu &amp; Button Positions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Header Actions Alignment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300 block">
                      Header Action Buttons Alignment:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
                      {(['right', 'left', 'center', 'split'] as ActionPositionType[]).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setActionPosition(pos)}
                          className={`py-2 px-2 rounded-lg text-center capitalize transition-colors cursor-pointer text-xs font-medium truncate touch-manipulation min-h-[38px] ${
                            actionPosition === pos
                              ? 'bg-amber-500 text-black font-bold shadow-xs'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Assistant Placement */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-300 block">
                      AI Assistant Button Position:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
                      {(
                        [
                          { id: 'bottom-right', label: 'Bottom Right' },
                          { id: 'bottom-left', label: 'Bottom Left' },
                          { id: 'header-only', label: 'Header Only' },
                        ] as { id: AssistantPositionType; label: string }[]
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAssistantPosition(item.id)}
                          className={`py-2 px-2 rounded-lg text-center text-xs font-medium transition-colors cursor-pointer truncate touch-manipulation min-h-[38px] ${
                            assistantPosition === item.id
                              ? 'bg-amber-500 text-black font-bold shadow-xs'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compact Interface Toggle */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
                  <div>
                    <span className="text-xs font-mono text-zinc-200 block font-semibold">
                      Compact Screen Space Mode
                    </span>
                    <span className="text-[11px] text-zinc-500 font-sans block">
                      Reduces vertical padding for dense screenplay reading &amp; editing.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompactMode(!compactMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      compactMode ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                        compactMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Instant Rollback Button */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-courier text-xs font-bold text-white uppercase">
                    Rollback to Classic Top Bar Layout
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Instantly reverts the layout, menus, and button positions to the standard Top Bar without affecting your work or themes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetLayoutSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Default Layout</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CURSOR CUSTOMIZATION (PC USERS) */}
          {activeTab === 'cursor' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 1. Cursor Type Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                  Select Cursor Style
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {CURSOR_OPTIONS.map((opt) => {
                    const isSelected = cursorType === opt.id;
                    const optColor = cursorColors[opt.id] || '#f59e0b';
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setCursorType(opt.id);
                          setEditingColorFor(opt.id);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 text-white shadow-md ring-1 ring-amber-400/40'
                            : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-colors"
                              style={{ color: optColor }}
                            >
                              {opt.renderIcon(optColor)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                                style={{ backgroundColor: optColor }}
                              />
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${opt.badgeColor}`}>
                                {opt.badge}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-courier font-bold text-sm text-white mb-0.5 flex items-center gap-1.5">
                              <span>{opt.name}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                <div className="flex flex-wrap items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {CURSOR_OPTIONS.map((opt) => {
                    const isSelected = editingColorFor === opt.id;
                    const optColor = cursorColors[opt.id] || '#f59e0b';
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEditingColorFor(opt.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full border border-black/40"
                          style={{ backgroundColor: optColor }}
                        />
                        <span>{opt.name.replace('System ', '').replace('The ', '')}</span>
                      </button>
                    );
                  })}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
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
