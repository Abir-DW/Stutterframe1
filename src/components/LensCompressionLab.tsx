import React, { useState, useMemo } from 'react';
import {
  Camera,
  Maximize2,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Sliders,
  Grid,
  Eye,
  Crosshair,
  Compass,
  Building2,
  Trees,
  Ruler,
  HelpCircle,
  Play,
  Check,
  Film,
  Zap,
  Sun,
  Home,
  Activity,
} from 'lucide-react';

// Preset focal lengths common in cinema primes & zooms
const FOCAL_PRESETS = [
  { mm: 16, label: '16mm', desc: 'Ultra-Wide (Extreme Warp)', fov: 96.7 },
  { mm: 24, label: '24mm', desc: 'Wide Cinema (Environmental)', fov: 84.1 },
  { mm: 35, label: '35mm', desc: 'Street / Reportage (Natural Wide)', fov: 63.4 },
  { mm: 50, label: '50mm', desc: 'Normal Prime (Human Vision Equiv)', fov: 39.6 },
  { mm: 85, label: '85mm', desc: 'Portrait Master (Flattering Planes)', fov: 23.9 },
  { mm: 135, label: '135mm', desc: 'Telephoto Prime (Background Pull)', fov: 15.2 },
  { mm: 200, label: '200mm', desc: 'Super-Tele (Intense Compression)', fov: 10.3 },
];

// Iconic cinematic presets that demonstrate optical principles
const CINEMA_PRESETS = [
  {
    id: 'vertigo',
    title: 'Hitchcock Vertigo Squeeze',
    director: 'Alfred Hitchcock (Vertigo, 1958)',
    focalLength: 135,
    camDistance: 3.8,
    bgDistance: 20.0,
    aperture: 2.8,
    dollyMode: true,
    bg: 'city',
    note: 'The camera dollies back while zooming telephoto: the subject stays anchored while background architecture hurtles forward.',
  },
  {
    id: 'ultra-wide-gilliam',
    title: 'Gilliam Paranoia Close-Up',
    director: 'Terry Gilliam (Brazil / 12 Monkeys)',
    focalLength: 16,
    camDistance: 0.5,
    bgDistance: 12.0,
    aperture: 5.6,
    dollyMode: false,
    bg: 'cyberpunk',
    note: 'Extreme wide lens placed inches away: spherical facial distortion stretches the nose, arcs forehead wrinkles, and wraps ears back.',
  },
  {
    id: 'blade-runner-neon',
    title: 'Scott Cyberpunk Compressed',
    director: 'Ridley Scott (Blade Runner)',
    focalLength: 85,
    camDistance: 2.7,
    bgDistance: 15.0,
    aperture: 1.8,
    dollyMode: true,
    bg: 'cyberpunk',
    note: '85mm portrait prime: facial wrinkles soften and flatten into classic film geometry, drawing vibrant neon signage directly behind the actor.',
  },
  {
    id: 'desert-standoff',
    title: 'Leone Desert Standoff',
    director: 'Sergio Leone (The Good, the Bad and the Ugly)',
    focalLength: 200,
    camDistance: 5.5,
    bgDistance: 30.0,
    aperture: 4.0,
    dollyMode: true,
    bg: 'desert',
    note: '200mm super-tele: subject facial planes become strictly parallel, crow’s feet compress, and distant desert mesas feel inches away.',
  },
  {
    id: 'fincher-loft',
    title: 'Fincher Analytical Interior',
    director: 'David Fincher (Mindhunter / The Social Network)',
    focalLength: 35,
    camDistance: 1.2,
    bgDistance: 7.0,
    aperture: 2.8,
    dollyMode: true,
    bg: 'loft',
    note: '35mm subtle environmental portrait: slight facial dimension with expansive interior factory window architecture in sharp perspective.',
  },
  {
    id: 'soundstage-production',
    title: 'Classic Hollywood Stage',
    director: 'Studio System Reference',
    focalLength: 50,
    camDistance: 1.6,
    bgDistance: 10.0,
    aperture: 2.0,
    dollyMode: true,
    bg: 'soundstage',
    note: 'True 50mm optical baseline: natural human anatomy with overhead fresnel lighting grid and stage marks perfectly calibrated.',
  },
];

export type BackgroundType =
  | 'soundstage'
  | 'cyberpunk'
  | 'desert'
  | 'loft'
  | 'city'
  | 'trees'
  | 'grid';

export const LensCompressionLab: React.FC = () => {
  // Optical variables
  const [focalLength, setFocalLength] = useState<number>(50); // mm
  const [camDistance, setCamDistance] = useState<number>(1.6); // meters
  const [bgDistance, setBgDistance] = useState<number>(8.0); // meters
  const [aperture, setAperture] = useState<number>(2.8); // f-stop
  const [isDollyZoomLocked, setIsDollyZoomLocked] = useState<boolean>(true); // Auto-compensate distance
  const [selectedBg, setSelectedBg] = useState<BackgroundType>('city');
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showAnatomyHUD, setShowAnatomyHUD] = useState<boolean>(true); // Wrinkles & anatomy distortion indicators
  const [isPlayingVertigoDemo, setIsPlayingVertigoDemo] = useState<boolean>(false);

  // Full-Frame 35mm Sensor width is 36mm
  const sensorWidth = 36;

  // 1. Calculate Horizontal Field of View (FOV) in degrees
  const horizontalFovDeg = useMemo(() => {
    const rad = 2 * Math.atan(sensorWidth / (2 * focalLength));
    return (rad * 180) / Math.PI;
  }, [focalLength]);

  // 2. Base reference for framing: At 50mm and 1.6m distance, face height fills ~60% of the viewfinder
  const referenceRatio = 50 / 1.6;

  // When Dolly-Zoom is locked, calculate effective camera distance to keep the subject face at a constant frame height
  const effectiveCamDistance = useMemo(() => {
    if (!isDollyZoomLocked) return camDistance;
    return focalLength / referenceRatio;
  }, [isDollyZoomLocked, focalLength, camDistance, referenceRatio]);

  // Handle focal length slider change
  const handleFocalChange = (newFocal: number) => {
    setFocalLength(newFocal);
    if (isDollyZoomLocked) {
      // Auto dolly distance
      setCamDistance(Number((newFocal / referenceRatio).toFixed(2)));
    }
  };

  // 3. Subject apparent scale inside frame
  const subjectScale = useMemo(() => {
    if (isDollyZoomLocked) {
      return 1.0; // locked framing
    }
    // Manual mode scale: proportional to focalLength / camDistance
    const base = focalLength / (camDistance * referenceRatio);
    return Math.max(0.35, Math.min(2.4, base));
  }, [isDollyZoomLocked, focalLength, camDistance, referenceRatio]);

  // 4. Background magnification relative to subject (Compression Effect)
  const bgScale = useMemo(() => {
    const totalDist = effectiveCamDistance + bgDistance;
    const base50 = 50 / (1.6 + 8.0);
    const normalized = (focalLength / totalDist) / base50;
    return Math.max(0.4, Math.min(3.8, normalized));
  }, [focalLength, effectiveCamDistance, bgDistance]);

  // 5. Facial Perspective Distortion Factor
  // Real 3D projection ratio: the nose is ~0.12m in front of the ears.
  // At close camera distance (0.5m), 0.5m vs 0.62m is a 24% difference in perspective magnification!
  // At 5m camera distance, 5.0m vs 5.12m is only a 2.4% difference.
  const facialDistortion = useMemo(() => {
    const dist = Math.max(0.4, effectiveCamDistance);
    // Higher value means more bulbous/fisheye, lower means telephoto flat
    // 0 = completely flat telephoto, 1 = extreme wide fisheye
    const raw = 1.0 / (dist * 1.5);
    return Math.max(0.05, Math.min(1.2, raw));
  }, [effectiveCamDistance]);

  // 6. Aperture Depth of Field Blur (Bokeh)
  const blurPx = useMemo(() => {
    const fFactor = focalLength / 50;
    const apertureFactor = 5.6 / aperture;
    const distRatio = bgDistance / Math.max(0.5, effectiveCamDistance);
    const calculated = fFactor * apertureFactor * Math.min(3, distRatio) * 1.6;
    return Math.max(0, Math.min(18, calculated));
  }, [focalLength, aperture, bgDistance, effectiveCamDistance]);

  // 7. Background Compression Multiplier badge
  const compressionRatio = useMemo(() => {
    const ratio = (bgScale / 0.5).toFixed(1);
    return `${ratio}×`;
  }, [bgScale]);

  // Vertigo Dolly-Zoom Animation playback
  const runVertigoDemo = () => {
    if (isPlayingVertigoDemo) return;
    setIsPlayingVertigoDemo(true);
    setIsDollyZoomLocked(true);

    const startFocal = 16;
    const endFocal = 200;
    const duration = 3000; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth sinusoidal ease in-out
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
      const currentF = Math.round(startFocal + (endFocal - startFocal) * ease);

      setFocalLength(currentF);
      setCamDistance(Number((currentF / referenceRatio).toFixed(2)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPlayingVertigoDemo(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const resetToStandard = () => {
    setFocalLength(50);
    setCamDistance(1.6);
    setBgDistance(8.0);
    setAperture(2.8);
    setIsDollyZoomLocked(true);
    setSelectedBg('city');
  };

  const applyCinemaPreset = (preset: (typeof CINEMA_PRESETS)[0]) => {
    setFocalLength(preset.focalLength);
    setCamDistance(preset.camDistance);
    setBgDistance(preset.bgDistance);
    setAperture(preset.aperture);
    setIsDollyZoomLocked(preset.dollyMode);
    setSelectedBg(preset.bg as BackgroundType);
  };

  // Facial feature physics parameters based on distortion
  // In wide angle (distortion ~ 1.0): forehead lines curve like a dome, glabellar lines spread, crow's feet wrap back, nasolabial folds flare out.
  // In telephoto (distortion ~ 0.08): forehead lines are parallel straight lines, glabellar lines narrow, crow's feet are flat parallel dashes, nasolabial folds are subtle and narrow.
  const foreheadArc = facialDistortion * 18; // px vertical bow
  const glabellaSpread = (facialDistortion - 0.3) * 6; // px spread
  const crowFeetAngle = facialDistortion * 22; // degrees rotation
  const nasolabialFlare = facialDistortion * 14; // px outward curve
  const eyelidArch = (facialDistortion - 0.2) * 4; // px upper eyelid crease arch

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Studio Header & Purpose Banner */}
      <div className="border border-zinc-800/80 bg-zinc-950/70 rounded-xl p-4 sm:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase mb-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Optical Physics Lab · 35mm Full Frame</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">Anatomical Distortion &amp; Compression</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-courier text-zinc-100 tracking-tight">
              LENS COMPRESSION &amp; FACIAL PERSPECTIVE
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
              Observe how focal length and camera distance warp human facial features (forehead lines, eyes, crow&apos;s feet, nasolabial folds) and compress cinematic backgrounds into razor-thin perspective planes.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center flex-wrap gap-2 self-start md:self-center shrink-0">
            <button
              onClick={runVertigoDemo}
              disabled={isPlayingVertigoDemo}
              className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                isPlayingVertigoDemo
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-amber-500/30 hover:border-amber-500/60'
              }`}
              title="Play 1-click Hitchcock Dolly-Zoom Animation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlayingVertigoDemo ? 'Dolly-Zooming...' : 'Play Dolly-Zoom Demo'}</span>
            </button>

            <button
              onClick={() => setShowAnatomyHUD(!showAnatomyHUD)}
              className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showAnatomyHUD
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title="Toggle Anatomical Wrinkle & Feature Annotations"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Anatomy Warp HUD</span>
            </button>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">The Optical Truth</span>
            </button>

            <button
              onClick={resetToStandard}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Reset to 50mm Standard"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The "Compression Myth" Collapsible Educational Callout */}
        {showExplanation && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300 font-mono space-y-2 bg-black/40 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-6 rounded-b-xl">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>OPTICAL FACT: Camera Proximity Distorts Faces — Lenses Merely Frame It!</span>
            </div>
            <p className="leading-relaxed text-zinc-300">
              When a camera is positioned 0.5 meters from a human face, the nose is 12 cm closer to the glass than the ears (a massive 24% depth difference). This causes spherical perspective distortion: forehead wrinkles bow into arcs, the nose tip balloons, and the ears recede out of view.
            </p>
            <p className="leading-relaxed text-zinc-400">
              At 5 meters away with a 200mm telephoto lens, that same 12 cm nose-to-ear distance represents only a 2.4% depth difference. The facial features flatten completely: wrinkles become parallel horizontal lines, ears appear wide and planar alongside the cheeks, and the distant background zooms in tight behind the actor.
            </p>
          </div>
        )}
      </div>

      {/* Main Dual-Viewport Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera Viewfinder (Primary Visual Output) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-zinc-800 bg-black rounded-xl overflow-hidden shadow-2xl relative">
            {/* Viewfinder Header HUD Bar */}
            <div className="bg-zinc-950/90 border-b border-zinc-800/90 px-3 py-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-red-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  REC
                </span>
                <span className="text-zinc-200">00:04:12:18</span>
                <span className="hidden sm:inline text-zinc-500">·</span>
                <span className="hidden sm:inline text-zinc-400">3840×2160 UHD</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGridLines(!showGridLines)}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    showGridLines ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Toggle Framing Guides"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <span className="text-zinc-500">|</span>
                <span className="text-amber-400 font-bold">{focalLength}mm</span>
                <span className="text-zinc-400">f/{aperture.toFixed(1)}</span>
                <span className="text-zinc-400">ISO 800</span>
              </div>
            </div>

            {/* Viewfinder Screen Area (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-[16/9] bg-zinc-950 overflow-hidden select-none">
              {/* Layer 1: Background Scene with Parallax Compression & Depth-of-Field Blur */}
              <div
                className="absolute inset-0 transition-transform duration-100 ease-out flex items-center justify-center pointer-events-none"
                style={{
                  transform: `scale(${bgScale})`,
                  filter: `blur(${blurPx}px)`,
                }}
              >
                {/* 1. SOUNDSTAGE BACKGROUND */}
                {selectedBg === 'soundstage' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="stageSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0a0a0c" />
                        <stop offset="100%" stopColor="#18181b" />
                      </linearGradient>
                      <linearGradient id="warmLightBeam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="blueLightBeam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Dark Stage Wall */}
                    <rect width="1000" height="600" fill="url(#stageSky)" />

                    {/* Acoustic Sound Baffle Panels on Studio Back Wall */}
                    <g fill="#141418" stroke="#27272a" strokeWidth="1.5">
                      <rect x="60" y="80" width="160" height="260" rx="4" />
                      <rect x="250" y="80" width="160" height="260" rx="4" />
                      <rect x="440" y="80" width="120" height="260" rx="4" />
                      <rect x="590" y="80" width="160" height="260" rx="4" />
                      <rect x="780" y="80" width="160" height="260" rx="4" />
                    </g>

                    {/* Overhead Stage Truss & Rigging */}
                    <rect x="0" y="20" width="1000" height="20" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
                    <line x1="0" y1="30" x2="1000" y2="30" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6,4" />

                    {/* Hanging Fresnel Stage Lights */}
                    <g>
                      {/* Left Fresnel Spotlight */}
                      <polygon points="180,40 165,85 215,85 200,40" fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />
                      <circle cx="190" cy="88" r="10" fill="#fbbf24" />
                      <polygon points="160,95 220,95 320,440 60,440" fill="url(#warmLightBeam)" />

                      {/* Right Rim Spotlight */}
                      <polygon points="800,40 785,85 835,85 820,40" fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />
                      <circle cx="810" cy="88" r="10" fill="#38bdf8" />
                      <polygon points="780,95 840,95 950,440 680,440" fill="url(#blueLightBeam)" />
                    </g>

                    {/* Stage Floor */}
                    <rect x="0" y="440" width="1000" height="160" fill="#09090b" />
                    <line x1="0" y1="440" x2="1000" y2="440" stroke="#3f3f46" strokeWidth="2" />

                    {/* Camera Dolly Tracks & Markings on Stage Floor */}
                    <line x1="120" y1="480" x2="880" y2="480" stroke="#52525b" strokeWidth="3" />
                    <line x1="80" y1="520" x2="920" y2="520" stroke="#52525b" strokeWidth="3" />
                    {Array.from({ length: 15 }).map((_, i) => (
                      <line key={`tie-${i}`} x1={120 + i * 52} y1="475" x2={120 + i * 52} y2="525" stroke="#71717a" strokeWidth="2" />
                    ))}

                    {/* Floor Distance Chalk Marks */}
                    <g fontFamily="monospace" fontSize="12" fill="#eab308">
                      <text x="300" y="465" textAnchor="middle">▼ MARK A (3M)</text>
                      <text x="500" y="465" textAnchor="middle">▼ FOCUS POINT (1.6M)</text>
                      <text x="700" y="465" textAnchor="middle">▼ MARK B (8M)</text>
                    </g>
                  </svg>
                )}

                {/* 2. CYBERPUNK NEON STREET */}
                {selectedBg === 'cyberpunk' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#05050f" />
                        <stop offset="60%" stopColor="#170624" />
                        <stop offset="100%" stopColor="#2e083a" />
                      </linearGradient>
                      <radialGradient id="cyberGlow1" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="cyberGlow2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <rect width="1000" height="600" fill="url(#cyberSky)" />

                    {/* Megastructure Skyscrapers */}
                    <path
                      d="M 30 420 L 30 140 L 140 140 L 140 420 L 170 420 L 170 190 L 260 190 L 260 420 L 310 420 L 310 80 L 410 80 L 410 420 L 580 420 L 580 90 L 700 90 L 700 420 L 740 420 L 740 160 L 850 160 L 850 420 L 890 420 L 890 120 L 980 120 L 980 420 Z"
                      fill="#0b0b14"
                      stroke="#1e1830"
                      strokeWidth="2"
                    />

                    {/* Giant Holographic Billboards */}
                    <rect x="325" y="110" width="70" height="130" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                    <text x="360" y="160" fill="#06b6d4" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">AI</text>
                    <text x="360" y="195" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle">NEURAL</text>

                    <rect x="600" y="120" width="85" height="150" fill="#0f172a" stroke="#f43f5e" strokeWidth="2" />
                    <text x="642" y="170" fill="#f43f5e" fontSize="20" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">電脳</text>
                    <text x="642" y="210" fill="#fb7185" fontSize="11" fontFamily="monospace" textAnchor="middle">TOKYO</text>

                    {/* Floating Neon Signboards */}
                    <g fontFamily="sans-serif" fontWeight="bold">
                      <rect x="180" y="230" width="65" height="24" rx="4" fill="#a855f7" />
                      <text x="212" y="247" fill="#ffffff" fontSize="11" textAnchor="middle">RAMEN</text>

                      <rect x="760" y="200" width="75" height="26" rx="4" fill="#ec4899" />
                      <text x="797" y="218" fill="#ffffff" fontSize="12" textAnchor="middle">CYBER</text>
                    </g>

                    {/* Optical Neon Fog & Ambient Bokeh Orbs */}
                    <circle cx="210" cy="245" r="40" fill="url(#cyberGlow1)" pointerEvents="none" />
                    <circle cx="640" cy="180" r="70" fill="url(#cyberGlow1)" pointerEvents="none" />
                    <circle cx="360" cy="170" r="60" fill="url(#cyberGlow2)" pointerEvents="none" />
                    <circle cx="820" cy="340" r="28" fill="#06b6d4" opacity="0.6" />
                    <circle cx="150" cy="360" r="22" fill="#eab308" opacity="0.6" />
                    <circle cx="480" cy="350" r="30" fill="#ec4899" opacity="0.5" />

                    {/* Wet Rain-slick Asphalt Ground with Reflection Streaks */}
                    <rect x="0" y="420" width="1000" height="180" fill="#05050a" />
                    <line x1="0" y1="420" x2="1000" y2="420" stroke="#3b1d52" strokeWidth="2" />
                    <rect x="330" y="430" width="60" height="100" fill="#06b6d4" opacity="0.15" />
                    <rect x="610" y="430" width="70" height="110" fill="#f43f5e" opacity="0.15" />
                    <rect x="180" y="430" width="60" height="80" fill="#a855f7" opacity="0.15" />
                  </svg>
                )}

                {/* 3. DESERT SUNSET / LAWRENCE STANDOFF */}
                {selectedBg === 'desert' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="desertSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e1b4b" />
                        <stop offset="35%" stopColor="#7c2d12" />
                        <stop offset="65%" stopColor="#c2410c" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="30%" stopColor="#fef08a" />
                        <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <rect width="1000" height="600" fill="url(#desertSky)" />

                    {/* Giant Cinematic Low Sun Disk */}
                    <circle cx="500" cy="340" r="130" fill="url(#sunGlow)" />

                    {/* Distant Layered Sandstone Mesas and Buttes */}
                    {/* Furthest Ridge */}
                    <polygon
                      points="0,420 80,330 180,330 240,360 380,310 460,310 520,350 640,300 750,300 820,350 920,320 1000,340 1000,420"
                      fill="#451a03"
                      opacity="0.85"
                    />

                    {/* Mid Desert Plateau */}
                    <polygon
                      points="0,430 140,360 220,360 310,400 480,370 560,370 680,410 820,380 940,380 1000,430"
                      fill="#290e02"
                    />

                    {/* Silhouetted Saguaro Cacti */}
                    <g fill="#160802">
                      {/* Left Cactus */}
                      <rect x="180" y="320" width="10" height="110" rx="4" />
                      <path d="M 170 360 L 180 360 L 180 340 L 170 340 Z" />
                      <rect x="165" y="335" width="8" height="30" rx="3" />
                      <path d="M 190 375 L 200 375 L 200 355 L 190 355 Z" />
                      <rect x="198" y="350" width="8" height="30" rx="3" />

                      {/* Right Giant Cactus */}
                      <rect x="820" y="270" width="14" height="160" rx="6" />
                      <path d="M 805 330 L 820 330 L 820 300 L 805 300 Z" />
                      <rect x="800" y="295" width="10" height="45" rx="4" />
                      <path d="M 834 350 L 850 350 L 850 320 L 834 320 Z" />
                      <rect x="845" y="315" width="10" height="45" rx="4" />
                    </g>

                    {/* Desert Sand Dunes Ground with Heat Waves */}
                    <rect x="0" y="420" width="1000" height="180" fill="#1c0a03" />
                    <line x1="0" y1="420" x2="1000" y2="420" stroke="#f59e0b" strokeWidth="2" opacity="0.4" />
                  </svg>
                )}

                {/* 4. INDUSTRIAL ARTIST LOFT */}
                {selectedBg === 'loft' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="loftSkyOutside" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                      <radialGradient id="edisonGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Loft Exposed Brick Wall */}
                    <rect width="1000" height="600" fill="#2d1510" />

                    {/* Brick Pattern Texture */}
                    <g stroke="#1a0b08" strokeWidth="2" fill="#3b1d17" opacity="0.6">
                      {Array.from({ length: 12 }).map((_, r) =>
                        Array.from({ length: 14 }).map((_, c) => (
                          <rect
                            key={`brick-${r}-${c}`}
                            x={(c * 80) + (r % 2 === 0 ? 0 : 40)}
                            y={r * 35}
                            width="76"
                            height="30"
                            rx="2"
                          />
                        ))
                      )}
                    </g>

                    {/* Huge Steel Mullion Factory Window (Revealing Twilight Sky) */}
                    <rect x="180" y="60" width="640" height="340" fill="url(#loftSkyOutside)" stroke="#09090b" strokeWidth="8" rx="6" />

                    {/* Window Mullion Grid Lines */}
                    <g stroke="#18181b" strokeWidth="4">
                      {/* Vertical Mullions */}
                      <line x1="340" y1="60" x2="340" y2="400" />
                      <line x1="500" y1="60" x2="500" y2="400" />
                      <line x1="660" y1="60" x2="660" y2="400" />
                      {/* Horizontal Mullions */}
                      <line x1="180" y1="170" x2="820" y2="170" />
                      <line x1="180" y1="285" x2="820" y2="285" />
                    </g>

                    {/* Hanging Warm Edison Filament Bulbs */}
                    <g>
                      <line x1="300" y1="0" x2="300" y2="130" stroke="#18181b" strokeWidth="2" />
                      <circle cx="300" cy="140" r="12" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                      <circle cx="300" cy="140" r="45" fill="url(#edisonGlow)" pointerEvents="none" />

                      <line x1="700" y1="0" x2="700" y2="110" stroke="#18181b" strokeWidth="2" />
                      <circle cx="700" cy="120" r="12" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                      <circle cx="700" cy="120" r="45" fill="url(#edisonGlow)" pointerEvents="none" />
                    </g>

                    {/* Distant City Water Tower Outside Window */}
                    <rect x="420" y="240" width="40" height="40" fill="#0f172a" opacity="0.6" />
                    <polygon points="410,240 440,215 470,240" fill="#0f172a" opacity="0.6" />

                    {/* Polished Hardwood Loft Floor */}
                    <rect x="0" y="400" width="1000" height="200" fill="#1c110b" />
                    <line x1="0" y1="400" x2="1000" y2="400" stroke="#0f0906" strokeWidth="4" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`board-${i}`} x1={i * 140} y1="400" x2={i * 140 + 60} y2="600" stroke="#120b07" strokeWidth="1.5" />
                    ))}
                  </svg>
                )}

                {/* 5. CITY SKYLINE */}
                {selectedBg === 'city' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0b0f19" />
                        <stop offset="70%" stopColor="#1e182e" />
                        <stop offset="100%" stopColor="#3b202e" />
                      </linearGradient>
                    </defs>

                    {/* Night Sky */}
                    <rect width="1000" height="600" fill="url(#skyGrad)" />

                    {/* Far Skyline */}
                    <path
                      d="M 50 420 L 50 250 L 120 250 L 120 420 L 180 420 L 180 180 L 260 180 L 260 420 L 320 420 L 320 300 L 400 300 L 400 420 L 520 420 L 520 150 L 570 120 L 620 150 L 620 420 L 710 420 L 710 240 L 780 240 L 780 420 L 880 420 L 880 210 L 960 210 L 960 420 Z"
                      fill="#121421"
                      stroke="#1e2238"
                      strokeWidth="2"
                    />

                    {/* Glowing Window Lights in Distant Towers */}
                    <g fill="#fde047" opacity="0.6">
                      <rect x="200" y="200" width="8" height="12" />
                      <rect x="220" y="200" width="8" height="12" />
                      <rect x="200" y="230" width="8" height="12" />
                      <rect x="220" y="230" width="8" height="12" />
                      <rect x="540" y="170" width="10" height="15" fill="#f43f5e" />
                      <rect x="560" y="170" width="10" height="15" fill="#f43f5e" />
                      <rect x="580" y="170" width="10" height="15" fill="#38bdf8" />
                      <rect x="550" y="210" width="10" height="15" />
                      <rect x="570" y="210" width="10" height="15" />
                      <rect x="730" y="260" width="8" height="12" />
                      <rect x="750" y="260" width="8" height="12" />
                      <rect x="900" y="230" width="8" height="12" />
                      <rect x="920" y="230" width="8" height="12" />
                    </g>

                    {/* Midground Cinematic Neon Signs */}
                    <rect x="190" y="310" width="70" height="18" rx="4" fill="#ec4899" opacity="0.8" />
                    <text x="225" y="323" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">CINEMA</text>

                    <rect x="720" y="320" width="60" height="16" rx="4" fill="#06b6d4" opacity="0.8" />
                    <text x="750" y="332" fill="#ffffff" fontSize="9" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">HOTEL</text>

                    {/* Street Lights & Bokeh Discs */}
                    <circle cx="120" cy="380" r="14" fill="#fbbf24" opacity="0.75" />
                    <circle cx="280" cy="390" r="18" fill="#f43f5e" opacity="0.6" />
                    <circle cx="680" cy="385" r="16" fill="#38bdf8" opacity="0.65" />
                    <circle cx="860" cy="380" r="22" fill="#eab308" opacity="0.7" />

                    {/* Street Ground */}
                    <rect x="0" y="420" width="1000" height="180" fill="#08080c" />
                    <line x1="0" y1="420" x2="1000" y2="420" stroke="#333" strokeWidth="2" />
                  </svg>
                )}

                {/* 6. FOREST & TREES */}
                {selectedBg === 'trees' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="60%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                    </defs>
                    <rect width="1000" height="600" fill="url(#forestSky)" />

                    {/* Distant Mountain Peak */}
                    <polygon points="150,420 380,210 600,420" fill="#1e293b" />
                    <polygon points="450,420 700,160 920,420" fill="#0f172a" />
                    <polygon points="680,190 700,160 730,195" fill="#f8fafc" opacity="0.7" />

                    {/* Layered Pine Trees showing spatial depth */}
                    <g fill="#064e3b" opacity="0.6">
                      <polygon points="120,420 150,290 180,420" />
                      <polygon points="280,420 310,280 340,420" />
                      <polygon points="660,420 690,290 720,420" />
                      <polygon points="820,420 850,270 880,420" />
                    </g>
                    <g fill="#065f46" opacity="0.85">
                      <polygon points="70,450 110,260 150,450" />
                      <polygon points="210,450 250,240 290,450" />
                      <polygon points="720,450 760,250 800,450" />
                      <polygon points="870,450 910,230 950,450" />
                    </g>

                    {/* Ground */}
                    <rect x="0" y="420" width="1000" height="180" fill="#022c22" />
                  </svg>
                )}

                {/* 7. STUDIO GRID & CALIBRATION */}
                {selectedBg === 'grid' && (
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <rect width="1000" height="600" fill="#09090b" />
                    {/* Perspective grid lines */}
                    <g stroke="#27272a" strokeWidth="1.5">
                      {Array.from({ length: 21 }).map((_, i) => (
                        <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
                      ))}
                      {Array.from({ length: 13 }).map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
                      ))}
                    </g>

                    {/* Metric Depth Target Boards */}
                    <g fontFamily="monospace" fontSize="14" fill="#a1a1aa">
                      <rect x="180" y="240" width="120" height="160" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                      <text x="240" y="325" textAnchor="middle" fill="#f59e0b" fontWeight="bold">DEPTH: 5M</text>

                      <rect x="700" y="240" width="120" height="160" fill="#18181b" stroke="#3b82f6" strokeWidth="2" />
                      <text x="760" y="325" textAnchor="middle" fill="#3b82f6" fontWeight="bold">DEPTH: 15M</text>
                    </g>
                  </svg>
                )}
              </div>

              {/* Layer 2: 2D Subject Clipart (Man's Face) with Optical Perspective Distortion */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out pointer-events-none"
                style={{
                  transform: `scale(${subjectScale})`,
                }}
              >
                {/* Vector Clipart of Man's Face with Reactive Anatomical Wrinkles & Features */}
                <svg
                  viewBox="0 0 400 480"
                  className="w-72 sm:w-80 md:w-96 h-auto drop-shadow-2xl overflow-visible"
                >
                  <defs>
                    <radialGradient id="faceShade" cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stopColor="#fcd34d" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </radialGradient>
                    <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#27272a" />
                      <stop offset="100%" stopColor="#09090b" />
                    </linearGradient>
                    <linearGradient id="jacketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3f3f46" />
                      <stop offset="100%" stopColor="#18181b" />
                    </linearGradient>
                  </defs>

                  {/* Body & Shoulders */}
                  <path
                    d="M 60 480 C 70 400, 110 380, 150 370 L 250 370 C 290 380, 330 400, 340 480 Z"
                    fill="url(#jacketGrad)"
                    stroke="#52525b"
                    strokeWidth="2"
                  />
                  {/* Collar / Shirt */}
                  <polygon points="160,370 200,430 240,370 215,370 200,410 185,370" fill="#e4e4e7" />

                  {/* Neck */}
                  <rect x="175" y="320" width="50" height="60" fill="#d97706" rx="6" />

                  {/* Ears: In wide angle (close up), ears recede behind the head. In telephoto (far), ears become prominent and wide */}
                  {/* Left Ear */}
                  <g
                    transform={`translate(${(-facialDistortion * 22).toFixed(1)}, 0) scale(${Math.max(
                      0.65,
                      1.3 - facialDistortion * 0.7
                    )})`}
                    style={{ transformOrigin: '150px 240px' }}
                  >
                    <ellipse cx="120" cy="245" rx="14" ry="24" fill="#d97706" stroke="#92400e" strokeWidth="2" />
                    <path d="M 120 235 C 117 240, 117 250, 122 255" stroke="#92400e" strokeWidth="2" fill="none" />
                  </g>

                  {/* Right Ear */}
                  <g
                    transform={`translate(${(facialDistortion * 22).toFixed(1)}, 0) scale(${Math.max(
                      0.65,
                      1.3 - facialDistortion * 0.7
                    )})`}
                    style={{ transformOrigin: '250px 240px' }}
                  >
                    <ellipse cx="280" cy="245" rx="14" ry="24" fill="#d97706" stroke="#92400e" strokeWidth="2" />
                    <path d="M 280 235 C 283 240, 283 250, 278 255" stroke="#92400e" strokeWidth="2" fill="none" />
                  </g>

                  {/* Face Contour Base */}
                  {/* Jaw width expands or narrows based on perspective curvature */}
                  <path
                    d={`M 130 190 C 130 ${140 - facialDistortion * 10}, 270 ${
                      140 - facialDistortion * 10
                    }, 270 190 C 270 270, 255 ${320 + facialDistortion * 15}, 200 ${
                      340 + facialDistortion * 15
                    } C 145 ${320 + facialDistortion * 15}, 130 270, 130 190 Z`}
                    fill="url(#faceShade)"
                    stroke="#92400e"
                    strokeWidth="2.5"
                  />

                  {/* Hair */}
                  <path
                    d="M 125 180 C 120 120, 160 90, 200 90 C 240 90, 280 120, 275 180 C 265 150, 240 140, 200 140 C 160 140, 135 150, 125 180 Z"
                    fill="url(#hairGrad)"
                  />
                  <path
                    d="M 130 150 C 150 120, 190 125, 205 135 C 220 125, 255 125, 270 155 C 255 135, 225 130, 205 140 C 185 130, 150 135, 130 150 Z"
                    fill="#3f3f46"
                  />

                  {/* ===== REACTIVE ANATOMICAL FOREHEAD WRINKLES ===== */}
                  {/* In wide angle, spherical skull projection bows lines upward into domes. In telephoto, lines are straight & parallel. */}
                  <g stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75">
                    {/* Top Forehead Line */}
                    <path
                      d={`M 152 168 Q 200 ${168 - foreheadArc} 248 168`}
                    />
                    {/* Middle Forehead Line */}
                    <path
                      d={`M 156 177 Q 200 ${177 - foreheadArc * 0.9} 244 177`}
                    />
                    {/* Lower Forehead Line */}
                    <path
                      d={`M 162 186 Q 200 ${186 - foreheadArc * 0.8} 238 186`}
                    />
                  </g>

                  {/* ===== GLABELLAR FROWN LINES (Between Brows) ===== */}
                  {/* Spreads outward in wide-angle barrel perspective, tightly compresses in telephoto */}
                  <g stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7">
                    <path
                      d={`M ${195 - glabellaSpread} 198 Q ${194 - glabellaSpread * 0.8} 206 ${196 - glabellaSpread * 0.5} 214`}
                    />
                    <path
                      d={`M ${205 + glabellaSpread} 198 Q ${206 + glabellaSpread * 0.8} 206 ${204 + glabellaSpread * 0.5} 214`}
                    />
                  </g>

                  {/* ===== REACTIVE EYEBROWS ===== */}
                  {/* In wide angle: inner heads pull upward/forward, outer tails wrap around the skull plane */}
                  <path
                    d={`M 148 ${208 - facialDistortion * 2} Q 168 ${196 - facialDistortion * 6} 187 ${206 + facialDistortion * 3}`}
                    stroke="#18181b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M 213 ${206 + facialDistortion * 3} Q 232 ${196 - facialDistortion * 6} 252 ${208 - facialDistortion * 2}`}
                    stroke="#18181b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* ===== UPPER EYELID CREASES (Double Eyelid) ===== */}
                  <g stroke="#92400e" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.65">
                    <path d={`M 157 217 Q 168 ${215 - eyelidArch} 179 217`} />
                    <path d={`M 221 217 Q 232 ${215 - eyelidArch} 243 217`} />
                  </g>

                  {/* Eyes with cinematic catchlight */}
                  <ellipse cx="168" cy="225" rx="10" ry={Math.max(4.5, 6.2 - facialDistortion * 1.2)} fill="#ffffff" />
                  <ellipse cx="232" cy="225" rx="10" ry={Math.max(4.5, 6.2 - facialDistortion * 1.2)} fill="#ffffff" />
                  <circle cx="168" cy="225" r="5" fill="#1e293b" />
                  <circle cx="232" cy="225" r="5" fill="#1e293b" />
                  <circle cx="166" cy="223" r="1.5" fill="#ffffff" />
                  <circle cx="230" cy="223" r="1.5" fill="#ffffff" />

                  {/* ===== TEAR TROUGHS / UNDER-EYE HOLLOWS ===== */}
                  <g stroke="#b45309" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55">
                    <path d={`M 160 234 Q 168 ${236 + facialDistortion * 2} 177 234`} />
                    <path d={`M 223 234 Q 232 ${236 + facialDistortion * 2} 240 234`} />
                  </g>

                  {/* ===== CROW'S FEET (Lateral Canthal Wrinkles on Temples) ===== */}
                  {/* Left Temple Crow's Feet */}
                  <g
                    stroke="#92400e"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                    transform={`rotate(${-crowFeetAngle}, 152, 225)`}
                  >
                    <path d="M 153 221 L 140 216" />
                    <path d="M 152 225 L 138 225" />
                    <path d="M 153 229 L 141 234" />
                  </g>

                  {/* Right Temple Crow's Feet */}
                  <g
                    stroke="#92400e"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                    transform={`rotate(${crowFeetAngle}, 248, 225)`}
                  >
                    <path d="M 247 221 L 260 216" />
                    <path d="M 248 225 L 262 225" />
                    <path d="M 247 229 L 259 234" />
                  </g>

                  {/* Nose: The key anatomical element showing 3D perspective distortion */}
                  {/* Wide angle close-up expands the nose bridge and bulbous tip forward */}
                  <g
                    transform={`scale(${1.0 + facialDistortion * 0.48})`}
                    style={{ transformOrigin: '200px 255px' }}
                  >
                    {/* Nose Bridge */}
                    <path
                      d="M 197 215 L 194 255 L 188 262 L 200 266 L 212 262 L 206 255 L 203 215"
                      fill="#d97706"
                      stroke="#92400e"
                      strokeWidth="1.5"
                    />
                    {/* Nostril accents */}
                    <circle cx="188" cy="262" r="2.5" fill="#78350f" />
                    <circle cx="212" cy="262" r="2.5" fill="#78350f" />
                  </g>

                  {/* ===== REACTIVE NASOLABIAL FOLDS (Smile / Laugh Lines) ===== */}
                  {/* Cheek fullness bows wrinkles wide in close-up wide angle; flattens and lengthens softly in telephoto portrait */}
                  <g stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75">
                    {/* Left Nasolabial Fold */}
                    <path
                      d={`M 184 266 C ${178 - nasolabialFlare} 276, ${172 - nasolabialFlare} 290, 178 304`}
                    />
                    {/* Right Nasolabial Fold */}
                    <path
                      d={`M 216 266 C ${222 + nasolabialFlare} 276, ${228 + nasolabialFlare} 290, 222 304`}
                    />
                  </g>

                  {/* Mouth / Smile */}
                  <path
                    d={`M 175 295 Q 200 ${302 + facialDistortion * 8} 225 295`}
                    stroke="#78350f"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Subtle Stubble / Beard Shadow */}
                  <path
                    d="M 155 285 C 155 330, 245 330, 245 285"
                    stroke="#b45309"
                    strokeWidth="1"
                    strokeDasharray="2,3"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
              </div>

              {/* Layer 3: Cinematic Overlays & Grid Guides */}
              {showGridLines && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Rule of Thirds Lines */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-amber-400/20" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-amber-400/20" />
                  <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-amber-400/20" />
                  <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-amber-400/20" />

                  {/* Center Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-amber-400/40" />
                  </div>

                  {/* Safe Action Frame Border */}
                  <div className="absolute inset-4 border border-zinc-600/30 rounded" />
                </div>
              )}

              {/* Layer 4: Anatomical Distortion Radar Overlay */}
              {showAnatomyHUD && (
                <div className="absolute top-3 left-3 pointer-events-none bg-black/75 backdrop-blur-md border border-amber-500/30 rounded-lg p-2.5 text-[10px] font-mono text-zinc-300 space-y-1 shadow-lg">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold border-b border-zinc-800 pb-1">
                    <Activity className="w-3 h-3" />
                    <span>ANATOMICAL WARP METRICS</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Forehead Arch:</span>
                    <span className="text-amber-300 font-bold">+{foreheadArc.toFixed(1)}px (dome)</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Nose Bulb Ratio:</span>
                    <span className="text-emerald-400 font-bold">{(1.0 + facialDistortion * 0.48).toFixed(2)}×</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Crow&apos;s Feet Wrap:</span>
                    <span className="text-cyan-400 font-bold">{crowFeetAngle.toFixed(1)}° lateral</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Nasolabial Flare:</span>
                    <span className="text-purple-300 font-bold">+{nasolabialFlare.toFixed(1)}px</span>
                  </div>
                </div>
              )}

              {/* Viewfinder Bottom Telemetry HUD */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] sm:text-xs font-mono text-zinc-300 pointer-events-none drop-shadow">
                <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded border border-zinc-800 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{horizontalFovDeg.toFixed(1)}° FOV</span>
                  <span className="text-zinc-500">·</span>
                  <span>Dist: {effectiveCamDistance.toFixed(2)}m</span>
                </div>

                <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded border border-zinc-800 flex items-center gap-2">
                  <span className="text-zinc-400">Compression:</span>
                  <span className="text-emerald-400 font-bold">{compressionRatio}</span>
                </div>
              </div>
            </div>

            {/* Viewfinder Footer: Swappable Environments Picker */}
            <div className="bg-zinc-950 p-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">
                  {effectiveCamDistance < 0.9
                    ? 'Proximity Distortion: Arced forehead wrinkles & bulbous nose'
                    : effectiveCamDistance > 3.0
                    ? 'Telephoto Compression: Planar wrinkles, flat nose & compressed background'
                    : 'Standard Geometry: Flattering human portrait perspective'}
                </span>
              </div>

              {/* 7 Swappable Cinematic Backgrounds */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                <button
                  onClick={() => setSelectedBg('soundstage')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'soundstage'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Hollywood Soundstage with Lighting Grid & Marks"
                >
                  <Film className="w-3 h-3" />
                  <span>Stage</span>
                </button>

                <button
                  onClick={() => setSelectedBg('cyberpunk')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'cyberpunk'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Neon Cyberpunk Street with Holograms & Rain"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Cyber</span>
                </button>

                <button
                  onClick={() => setSelectedBg('desert')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'desert'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Lawrence Desert Sunset with Mesas & Giant Sun"
                >
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Desert</span>
                </button>

                <button
                  onClick={() => setSelectedBg('loft')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'loft'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Industrial Artist Loft with Exposed Brick & Edison Bulbs"
                >
                  <Home className="w-3 h-3" />
                  <span>Loft</span>
                </button>

                <button
                  onClick={() => setSelectedBg('city')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'city'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Night City Skyline with High Rises & Bokeh"
                >
                  <Building2 className="w-3 h-3" />
                  <span>City</span>
                </button>

                <button
                  onClick={() => setSelectedBg('trees')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'trees'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Forest Mountains & Layered Pine Trees"
                >
                  <Trees className="w-3 h-3" />
                  <span>Forest</span>
                </button>

                <button
                  onClick={() => setSelectedBg('grid')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
                    selectedBg === 'grid'
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title="Optical Calibration Grid with Metric Boards"
                >
                  <Ruler className="w-3 h-3" />
                  <span>Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Focal Length Cinema Primes Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Standard Prime Lenses (Full-Frame 35mm)</span>
              </span>
              <span className="text-zinc-500">Tap to snap</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {FOCAL_PRESETS.map((p) => {
                const isActive = focalLength === p.mm;
                return (
                  <button
                    key={p.mm}
                    onClick={() => handleFocalChange(p.mm)}
                    className={`py-2 px-1 text-center rounded-lg border transition-all cursor-pointer font-mono text-xs flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-black/70' : 'text-zinc-500'}`}>
                      {p.fov.toFixed(0)}°
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Top-Down Studio Rig & Sliders */}
        <div className="lg:col-span-5 space-y-5">
          {/* Top-Down 2D Studio Rig (Orthographic Diagram) */}
          <div className="border border-zinc-800 bg-zinc-950/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Top-Down Studio Rig (Birds-Eye)</span>
              </span>
              <span className="text-emerald-400 text-[11px] font-mono">Real Optical Angle</span>
            </div>

            {/* SVG Top-down Soundstage Diagram */}
            <div className="w-full h-48 bg-black/60 rounded-lg border border-zinc-800/80 relative overflow-hidden flex items-center justify-center p-2">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Stage Grid Lines */}
                <line x1="20" y1="100" x2="380" y2="100" stroke="#27272a" strokeDasharray="3,3" />

                {/* Background Wall Plane (Right side) */}
                {/* Position mapped based on bgDistance (range 0.5m to 40m) */}
                {(() => {
                  const maxDisplayDist = 30;
                  const camX = 40;
                  // Subject position
                  const subDistNorm = Math.min(effectiveCamDistance / 10, 1.0);
                  const subX = camX + 40 + subDistNorm * 110;
                  // Background position
                  const bgDistNorm = Math.min(bgDistance / maxDisplayDist, 1.0);
                  const bgX = Math.min(370, subX + 30 + bgDistNorm * 140);

                  // FOV Cone Angle calculation
                  const halfFovRad = ((horizontalFovDeg / 2) * Math.PI) / 180;
                  const coneLength = 330;
                  const coneYOffset = Math.tan(halfFovRad) * coneLength;

                  return (
                    <>
                      {/* Optical Frustum FOV Cone */}
                      <polygon
                        points={`${camX},100 ${camX + coneLength},${100 - coneYOffset} ${camX + coneLength},${
                          100 + coneYOffset
                        }`}
                        fill="rgba(245, 158, 11, 0.08)"
                        stroke="rgba(245, 158, 11, 0.35)"
                        strokeWidth="1.5"
                      />

                      {/* Background Plane Line */}
                      <line x1={bgX} y1="30" x2={bgX} y2="170" stroke="#60a5fa" strokeWidth="3" strokeDasharray="4,2" />
                      <text x={bgX} y="22" fill="#60a5fa" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        BG WALL ({bgDistance.toFixed(1)}m)
                      </text>

                      {/* Subject Dot & Annotation */}
                      <circle cx={subX} cy="100" r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      <text x={subX} y="80" fill="#fcd34d" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        SUBJECT (Man)
                      </text>
                      <text x={subX} y="125" fill="#a1a1aa" fontSize="8" fontFamily="monospace" textAnchor="middle">
                        d={effectiveCamDistance.toFixed(1)}m
                      </text>

                      {/* Camera Glyphs (Left side) */}
                      <g transform={`translate(${camX}, 100)`}>
                        <rect x="-24" y="-12" width="24" height="24" rx="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                        <polygon points="0,-6 8,-12 8,12 0,6" fill="#ef4444" />
                        <circle cx="-12" cy="0" r="4" fill="#ffffff" />
                        <text x="-12" y="24" fill="#ef4444" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          CAM ({focalLength}mm)
                        </text>
                      </g>

                      {/* Distance Bracket: Camera to Subject */}
                      <line x1={camX} y1="140" x2={subX} y2="140" stroke="#f59e0b" strokeWidth="1" />
                      <line x1={camX} y1="136" x2={camX} y2="144" stroke="#f59e0b" strokeWidth="1" />
                      <line x1={subX} y1="136" x2={subX} y2="144" stroke="#f59e0b" strokeWidth="1" />
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Precision Controls Drawer */}
          <div className="border border-zinc-800 bg-zinc-950/80 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                Virtual Optical Parameters
              </span>

              {/* Mode Toggle: Dolly-Zoom vs Free Manual */}
              <button
                onClick={() => setIsDollyZoomLocked(!isDollyZoomLocked)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDollyZoomLocked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isDollyZoomLocked ? 'Lock Face (Dolly-Zoom)' : 'Free Manual Framing'}</span>
              </button>
            </div>

            {/* Slider 1: Lens Focal Length */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Focal Length (mm)</span>
                <span className="text-amber-400 font-bold text-sm">{focalLength} mm</span>
              </div>
              <input
                type="range"
                min="14"
                max="300"
                step="1"
                value={focalLength}
                onChange={(e) => handleFocalChange(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>14mm (Ultrawide)</span>
                <span>50mm (Normal)</span>
                <span>300mm (Super-tele)</span>
              </div>
            </div>

            {/* Slider 2: Camera to Subject Distance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Camera to Subject Distance</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {effectiveCamDistance.toFixed(2)} m
                  {isDollyZoomLocked && <span className="text-[10px] text-zinc-500 ml-1">(auto-dolly)</span>}
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="10.0"
                step="0.05"
                disabled={isDollyZoomLocked}
                value={effectiveCamDistance}
                onChange={(e) => setCamDistance(Number(e.target.value))}
                className={`w-full h-2 rounded-lg ${
                  isDollyZoomLocked
                    ? 'accent-zinc-600 bg-zinc-800/50 cursor-not-allowed opacity-60'
                    : 'accent-emerald-500 bg-zinc-800 cursor-pointer'
                }`}
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0.4m (Extreme Close-up)</span>
                <span>2.0m (Medium Portrait)</span>
                <span>10.0m (Wide shot)</span>
              </div>
            </div>

            {/* Slider 3: Subject to Background Distance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Subject to Background Distance</span>
                <span className="text-blue-400 font-bold text-sm">{bgDistance.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="40.0"
                step="0.5"
                value={bgDistance}
                onChange={(e) => setBgDistance(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0.5m (Wall adjacent)</span>
                <span>15.0m (Mid street)</span>
                <span>40.0m (Deep vista)</span>
              </div>
            </div>

            {/* Slider 4: Aperture (f-stop bokeh) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Aperture (Depth of Field)</span>
                <span className="text-purple-400 font-bold text-sm">f/{aperture.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="16.0"
                step="0.2"
                value={aperture}
                onChange={(e) => setAperture(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>f/1.4 (Creamy Bokeh)</span>
                <span>f/5.6 (Deep)</span>
                <span>f/16 (Sharp BG)</span>
              </div>
            </div>
          </div>

          {/* Director Cinema Presets Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="text-zinc-300 font-bold">Director Cinema Configurations</span>
              <span className="text-zinc-500 text-[10px]">1-click setups</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CINEMA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyCinemaPreset(preset)}
                  className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/40 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-500/80">{preset.focalLength}mm</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{preset.director}</div>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{preset.note}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
