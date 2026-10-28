import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  SunMedium,
  Palette,
  Sliders,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  Info,
  Maximize2,
  FileDown,
  Upload,
  Volume2,
  HelpCircle,
  Lightbulb,
  Compass,
} from 'lucide-react';

/**
 * Rollback Safeguard:
 * Set to false if needed to instantly rollback this tool while preserving navigation compatibility.
 */
export const ENABLE_LIGHTING_LUT_LAB = true;

// ---------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------

export interface StudioLight {
  id: 'key' | 'fill' | 'rim' | 'bg';
  name: string;
  enabled: boolean;
  angleDeg: number; // -180 to 180 degrees around subject (0 = directly behind camera)
  distanceMeters: number; // 0.5m to 6.0m
  lux: number; // 0 to 5000 lux
  kelvin: number; // 2000K to 8000K
  softness: number; // 0 (Hard Point/Fresnel) to 100 (120cm Octabox)
}

export interface LightingPreset {
  id: string;
  name: string;
  style: string;
  description: string;
  keyAngle: number;
  keyLux: number;
  fillAngle: number;
  fillLux: number;
  rimAngle: number;
  rimLux: number;
  bgLux: number;
  kelvin: number;
  softness: number;
  mood: string;
}

export interface LutPreset {
  id: string;
  name: string;
  filmStock: string;
  description: string;
  lift: number; // -50 to 50
  gamma: number; // -50 to 50
  gain: number; // -50 to 50
  saturation: number; // 0 to 200 (100 = neutral)
  temperature: number; // -50 (cool) to 50 (warm)
  tint: number; // -50 (green) to 50 (magenta)
  previewColor: string;
}

// ---------------------------------------------------------
// Lighting Physics Helpers (Kelvin to RGB & Falloff)
// ---------------------------------------------------------

/**
 * Tanner Helland algorithm for approximate Kelvin to RGB conversion.
 */
function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

function rgbToCss(rgb: { r: number; g: number; b: number }, alpha = 1): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// Calculate effective lux reaching subject using Inverse-Square Law (E = I / d^2)
function getEffectiveLux(light: StudioLight): number {
  if (!light.enabled) return 0;
  const d = Math.max(0.5, light.distanceMeters);
  return light.lux / (d * d);
}

// ---------------------------------------------------------
// Lighting Presets (Hollywood DP Standards)
// ---------------------------------------------------------

const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'rembrandt',
    name: 'Rembrandt Triangle',
    style: 'Classic Cinema & Golden Age',
    description: '45° Key elevated above eye-line creates signature cheek triangle shadow. 4:1 dramatic ratio.',
    keyAngle: 45,
    keyLux: 2400,
    fillAngle: -45,
    fillLux: 600,
    rimAngle: 140,
    rimLux: 1500,
    bgLux: 400,
    kelvin: 3200,
    softness: 45,
    mood: 'Intimate, painterly, character-driven drama',
  },
  {
    id: 'split',
    name: 'Split Lighting',
    style: 'Psychological Thriller & Dual Nature',
    description: '90° lateral Key casts one entire hemisphere of the face in deep shadow. 8:1 contrast.',
    keyAngle: 90,
    keyLux: 2800,
    fillAngle: -60,
    fillLux: 350,
    rimAngle: 160,
    rimLux: 1200,
    bgLux: 250,
    kelvin: 4000,
    softness: 20,
    mood: 'Conflict, moral ambiguity, mystery',
  },
  {
    id: 'butterfly',
    name: 'Butterfly / Paramount',
    style: 'Glamour & Classic Hollywood',
    description: 'Key positioned directly in front and elevated 45°, creating a symmetrical butterfly under the nose.',
    keyAngle: 0,
    keyLux: 2200,
    fillAngle: 30,
    fillLux: 1100,
    rimAngle: 180,
    rimLux: 1800,
    bgLux: 800,
    kelvin: 5600,
    softness: 75,
    mood: 'Flattering, sculpted cheekbones, beauty & fashion',
  },
  {
    id: 'loop',
    name: 'Loop Lighting',
    style: 'Commercial & Narrative Standard',
    description: 'Key light 30° off-axis casting a small shadow from the nose looping slightly toward cheek.',
    keyAngle: 30,
    keyLux: 2000,
    fillAngle: -35,
    fillLux: 1000,
    rimAngle: 150,
    rimLux: 900,
    bgLux: 600,
    kelvin: 4500,
    softness: 60,
    mood: 'Natural, rounded, universally pleasing',
  },
  {
    id: 'film-noir',
    name: 'Film Noir Chiaroscuro',
    style: 'Hard Venetian & Crime Drama',
    description: 'Punchy un-diffused Key, negligible fill, and razor-sharp rim edge. 16:1 hard contrast ratio.',
    keyAngle: 65,
    keyLux: 3500,
    fillAngle: -40,
    fillLux: 220,
    rimAngle: 135,
    rimLux: 2800,
    bgLux: 150,
    kelvin: 3200,
    softness: 5,
    mood: 'Danger, cynicism, extreme tonal contrast',
  },
  {
    id: 'high-key',
    name: 'High-Key Commercial',
    style: 'Comedy, Tech & Studio Bright',
    description: 'Generous diffusion with 1.5:1 ratio. Virtually zero deep shadow, rich vibrant skin tonality.',
    keyAngle: 25,
    keyLux: 1800,
    fillAngle: -25,
    fillLux: 1400,
    rimAngle: 180,
    rimLux: 1200,
    bgLux: 1600,
    kelvin: 5600,
    softness: 90,
    mood: 'Optimistic, sterile, clean, daylight clarity',
  },
];

// ---------------------------------------------------------
// LUT Color Presets
// ---------------------------------------------------------

const LUT_PRESETS: LutPreset[] = [
  {
    id: 'kodak-2383',
    name: 'Kodak Vision3 2383',
    filmStock: 'Print Stock 35mm',
    description: 'Warm organic highlights, lush golden skin tones, and rich teal-biased roll-off in the deep shadows.',
    lift: -12,
    gamma: 8,
    gain: 14,
    saturation: 110,
    temperature: 15,
    tint: -5,
    previewColor: '#d97706',
  },
  {
    id: 'teal-orange',
    name: 'Blockbuster Teal & Orange',
    filmStock: 'Modern Hollywood Action',
    description: 'Maximizes complementary chromatic separation between bronze skin tones and cold cyan backgrounds.',
    lift: -18,
    gamma: -5,
    gain: 22,
    saturation: 125,
    temperature: 20,
    tint: -15,
    previewColor: '#0ea5e9',
  },
  {
    id: 'technicolor-3',
    name: 'Technicolor 3-Strip (1938)',
    filmStock: 'Dye Transfer Celluloid',
    description: 'Hyper-vibrant primary reds, blues, and emerald greens with velvety blacks and period saturation.',
    lift: -5,
    gamma: 15,
    gain: 18,
    saturation: 145,
    temperature: 10,
    tint: 8,
    previewColor: '#ef4444',
  },
  {
    id: 'bleach-bypass',
    name: 'Bleach Bypass (Silver Retention)',
    filmStock: 'Saving Private Ryan / Fincher',
    description: 'Silver halide retained during processing yields crushing contrast, desaturated midtones, and grit.',
    lift: -22,
    gamma: -10,
    gain: 25,
    saturation: 55,
    temperature: -8,
    tint: -12,
    previewColor: '#a1a1aa',
  },
  {
    id: 'fuji-eterna',
    name: 'Fuji Eterna 500T',
    filmStock: 'Japanese Soft Narrative',
    description: 'Soft highlight rolloff, muted pastel greens, and romantic undertones tailored for subtle drama.',
    lift: 4,
    gamma: 6,
    gain: -8,
    saturation: 90,
    temperature: -10,
    tint: 12,
    previewColor: '#10b981',
  },
  {
    id: 'noir-monochrome',
    name: 'Fincher Noir B&W',
    filmStock: 'Panchromatic Ortho',
    description: 'Zero saturation with tailored spectral luminance curve accentuating skin micro-contrast.',
    lift: -25,
    gamma: 12,
    gain: 20,
    saturation: 0,
    temperature: 0,
    tint: 0,
    previewColor: '#71717a',
  },
  {
    id: 'neutral-rec709',
    name: 'Standard Rec.709 Clean',
    filmStock: 'Broadcast Standard',
    description: 'Linear baseline with standard 2.4 gamma and 6500K daylight balance for transparent monitoring.',
    lift: 0,
    gamma: 0,
    gain: 0,
    saturation: 100,
    temperature: 0,
    tint: 0,
    previewColor: '#3b82f6',
  },
];

// Sample frames available for grading testing
const SAMPLE_FRAMES = [
  {
    id: 'cinematic-portrait',
    name: 'Cinematic Actor Portrait',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'moody-interior',
    name: 'Film Noir Interior',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cyber-street',
    name: 'Neon Night Street',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'golden-sunset',
    name: 'Desert Golden Hour',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  },
];

export const LightingLutLab: React.FC = () => {
  // If rollback flag is disabled
  if (!ENABLE_LIGHTING_LUT_LAB) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono">
        <h2 className="text-xl text-amber-400 mb-2">Lighting &amp; LUT Lab is in maintenance mode.</h2>
        <p className="text-zinc-400 text-sm">Please return to the primary studio tools.</p>
      </div>
    );
  }

  // Active top-level subtab: 'lighting' vs 'lut'
  const [activeSubTab, setActiveSubTab] = useState<'lighting' | 'lut'>('lighting');

  // ---------------------------------------------------------
  // 1. Lighting Studio State
  // ---------------------------------------------------------
  const [lights, setLights] = useState<StudioLight[]>([
    {
      id: 'key',
      name: 'Key Light',
      enabled: true,
      angleDeg: 45,
      distanceMeters: 1.8,
      lux: 2400,
      kelvin: 3200,
      softness: 45,
    },
    {
      id: 'fill',
      name: 'Fill Light',
      enabled: true,
      angleDeg: -45,
      distanceMeters: 2.5,
      lux: 600,
      kelvin: 4000,
      softness: 70,
    },
    {
      id: 'rim',
      name: 'Rim / Hair Light',
      enabled: true,
      angleDeg: 140,
      distanceMeters: 1.5,
      lux: 1500,
      kelvin: 5600,
      softness: 25,
    },
    {
      id: 'bg',
      name: 'Background Light',
      enabled: true,
      angleDeg: 180,
      distanceMeters: 3.2,
      lux: 400,
      kelvin: 3200,
      softness: 80,
    },
  ]);

  const [selectedLightId, setSelectedLightId] = useState<'key' | 'fill' | 'rim' | 'bg'>('key');
  const [activePresetId, setActivePresetId] = useState<string>('rembrandt');
  const [rigDraggingLight, setRigDraggingLight] = useState<'key' | 'fill' | 'rim' | 'bg' | null>(null);
  const [isCopiedGaffer, setIsCopiedGaffer] = useState(false);

  const rigSvgRef = useRef<SVGSVGElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedLight = lights.find((l) => l.id === selectedLightId)!;

  const updateSelectedLight = (changes: Partial<StudioLight>) => {
    setLights((prev) =>
      prev.map((l) => (l.id === selectedLightId ? { ...l, ...changes } : l))
    );
    setActivePresetId(''); // clear preset highlight on manual tweak
  };

  const applyLightingPreset = (preset: LightingPreset) => {
    setActivePresetId(preset.id);
    setLights([
      {
        id: 'key',
        name: 'Key Light',
        enabled: true,
        angleDeg: preset.keyAngle,
        distanceMeters: 1.8,
        lux: preset.keyLux,
        kelvin: preset.kelvin,
        softness: preset.softness,
      },
      {
        id: 'fill',
        name: 'Fill Light',
        enabled: true,
        angleDeg: preset.fillAngle,
        distanceMeters: 2.4,
        lux: preset.fillLux,
        kelvin: Math.min(8000, preset.kelvin + 600),
        softness: Math.min(100, preset.softness + 20),
      },
      {
        id: 'rim',
        name: 'Rim / Hair Light',
        enabled: true,
        angleDeg: preset.rimAngle,
        distanceMeters: 1.6,
        lux: preset.rimLux,
        kelvin: 5600,
        softness: Math.max(5, preset.softness - 20),
      },
      {
        id: 'bg',
        name: 'Background Light',
        enabled: true,
        angleDeg: 180,
        distanceMeters: 3.2,
        lux: preset.bgLux,
        kelvin: preset.kelvin,
        softness: 80,
      },
    ]);
  };

  // Contrast Stop & Ratio Calculation
  const keyEffectiveLux = getEffectiveLux(lights.find((l) => l.id === 'key')!);
  const fillEffectiveLux = getEffectiveLux(lights.find((l) => l.id === 'fill')!);
  const rimEffectiveLux = getEffectiveLux(lights.find((l) => l.id === 'rim')!);

  const ratioNumber =
    fillEffectiveLux > 0
      ? Math.max(1, (keyEffectiveLux + fillEffectiveLux) / fillEffectiveLux)
      : keyEffectiveLux > 0
      ? 16
      : 1;

  const contrastStops = Math.max(0, Math.log2(ratioNumber)).toFixed(1);
  const ratioDisplay = `${Math.round(ratioNumber)}:1`;

  // Draw 2.5D Shaded Viewfinder Portrait on Canvas
  useEffect(() => {
    const canvas = faceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const key = lights.find((l) => l.id === 'key')!;
    const fill = lights.find((l) => l.id === 'fill')!;
    const rim = lights.find((l) => l.id === 'rim')!;
    const bg = lights.find((l) => l.id === 'bg')!;

    const keyRgb = kelvinToRgb(key.kelvin);
    const fillRgb = kelvinToRgb(fill.kelvin);
    const rimRgb = kelvinToRgb(rim.kelvin);
    const bgRgb = kelvinToRgb(bg.kelvin);

    const keyEff = getEffectiveLux(key);
    const fillEff = getEffectiveLux(fill);
    const rimEff = getEffectiveLux(rim);
    const bgEff = getEffectiveLux(bg);

    // 1. Background Wall Gradient
    const bgGrad = ctx.createRadialGradient(
      w / 2,
      h / 2,
      10,
      w / 2,
      h / 2,
      w * 0.7
    );
    const bgBrightness = Math.min(0.4, (bgEff / 3000) * (bg.enabled ? 1 : 0));
    bgGrad.addColorStop(
      0,
      `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${bgBrightness})`
    );
    bgGrad.addColorStop(1, '#08080a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Head Center & Geometry
    const cx = w / 2;
    const cy = h / 2 - 10;
    const headRx = 75;
    const headRy = 95;

    // Convert angles to radian offsets relative to front facing subject
    // Angle 0° = direct front (towards camera at bottom), +45° = subject's right
    const keyRad = (key.angleDeg * Math.PI) / 180;
    const fillRad = (fill.angleDeg * Math.PI) / 180;

    // 3. Draw Ambient Base Head Oval
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, headRx, headRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#141416';
    ctx.fill();
    ctx.clip();

    // 4. Fill Light Layer (Broad diffuse wrap)
    if (fill.enabled && fillEff > 0) {
      const fillX = cx + Math.sin(fillRad) * headRx * 1.4;
      const fillY = cy + Math.cos(fillRad) * headRy * 0.8;
      const fillGrad = ctx.createRadialGradient(
        fillX,
        fillY,
        5,
        cx,
        cy,
        headRx * 1.5
      );
      const fillInt = Math.min(0.65, (fillEff / 1200) * (fill.softness / 80 + 0.5));
      fillGrad.addColorStop(0, `rgba(${fillRgb.r}, ${fillRgb.g}, ${fillRgb.b}, ${fillInt})`);
      fillGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fillGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // 5. Key Light Layer (Directional highlight & Rembrandt Cheek Triangle)
    if (key.enabled && keyEff > 0) {
      const keyX = cx + Math.sin(keyRad) * headRx * 1.2;
      const keyY = cy + Math.cos(keyRad) * headRy * 0.6;
      const keyGrad = ctx.createRadialGradient(
        keyX,
        keyY,
        headRx * (0.1 + (100 - key.softness) * 0.002),
        cx,
        cy,
        headRx * 1.4
      );
      const keyInt = Math.min(0.95, (keyEff / 1800) * 0.9);
      keyGrad.addColorStop(0, `rgba(${keyRgb.r}, ${keyRgb.g}, ${keyRgb.b}, ${keyInt})`);
      keyGrad.addColorStop(0.7, `rgba(${keyRgb.r}, ${keyRgb.g}, ${keyRgb.b}, ${keyInt * 0.3})`);
      keyGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = keyGrad;
      ctx.fillRect(0, 0, w, h);

      // Rembrandt Triangle highlight on shadow side if key angle between 35° and 65°
      if (Math.abs(key.angleDeg) >= 35 && Math.abs(key.angleDeg) <= 65) {
        const shadowSign = key.angleDeg > 0 ? -1 : 1;
        ctx.beginPath();
        const triX = cx + shadowSign * 24;
        const triY = cy + 18;
        ctx.moveTo(triX, triY - 14);
        ctx.lineTo(triX + shadowSign * 16, triY + 14);
        ctx.lineTo(triX - shadowSign * 6, triY + 12);
        ctx.closePath();
        const triGrad = ctx.createRadialGradient(triX, triY, 2, triX, triY, 20);
        triGrad.addColorStop(0, `rgba(${keyRgb.r}, ${keyRgb.g}, ${keyRgb.b}, ${keyInt * 0.75})`);
        triGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = triGrad;
        ctx.fill();
      }
    }

    // 6. Facial Features Line Geometry (Eyes, Nose Bridge, Lips)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;

    // Nose bridge & tip
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + Math.sin(keyRad) * 4, cy + 15);
    ctx.lineTo(cx + 8, cy + 20);
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.ellipse(cx - 25, cy - 14, 10, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 25, cy - 14, 10, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lips
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 44);
    ctx.quadraticCurveTo(cx, cy + 40, cx + 16, cy + 44);
    ctx.quadraticCurveTo(cx, cy + 50, cx - 16, cy + 44);
    ctx.stroke();

    ctx.restore(); // remove head oval clipping

    // 7. Rim / Hair Light Edge Glow (Applied to outer silhouette)
    if (rim.enabled && rimEff > 0) {
      const rimRad = (rim.angleDeg * Math.PI) / 180;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, headRx + 2, headRy + 2, 0, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, 6 - rim.softness * 0.04);
      const rimInt = Math.min(0.95, (rimEff / 1500) * 0.9);
      ctx.strokeStyle = `rgba(${rimRgb.r}, ${rimRgb.g}, ${rimRgb.b}, ${rimInt})`;
      ctx.shadowColor = `rgba(${rimRgb.r}, ${rimRgb.g}, ${rimRgb.b}, 0.8)`;
      ctx.shadowBlur = 12 + rim.softness * 0.1;
      // Arc focused on the rim's angle
      const arcCenter = rimRad - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, headRx, arcCenter - 0.7, arcCenter + 0.7);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Cinematic Viewfinder Overlay (Crosshairs, Aspect Ratio Box, Stop Ratio)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1;
    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // Viewfinder corners
    const border = 18;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeRect(border, border, w - border * 2, h - border * 2);

    // Text specs overlay
    ctx.font = '10px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`RATIO: ${ratioDisplay} (${contrastStops} STOPS)`, border + 8, h - border - 8);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`KEY: ${Math.round(keyEffectiveLux)} lx`, border + 8, border + 18);
    ctx.fillText(`FILL: ${Math.round(fillEffectiveLux)} lx`, border + 8, border + 30);
  }, [lights, ratioDisplay, contrastStops, keyEffectiveLux, fillEffectiveLux, rimEffectiveLux]);

  // Handle Dragging in Top-Down SVG Soundstage
  const handleSvgPointerDown = (lightId: 'key' | 'fill' | 'rim' | 'bg') => {
    setSelectedLightId(lightId);
    setRigDraggingLight(lightId);
  };

  const handleSvgPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!rigDraggingLight || !rigSvgRef.current) return;
    const rect = rigSvgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;

    // Center of soundstage is (180, 180)
    const centerX = 180;
    const centerY = 180;
    const dx = svgX - centerX;
    const dy = svgY - centerY;

    // Angle in degrees (-180 to 180). 0° = straight south towards camera (dx=0, dy>0)
    let angle = (Math.atan2(dx, dy) * 180) / Math.PI;
    angle = Math.round(angle);

    // Distance in meters (scale: 180px ≈ 4.5m)
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distMeters = Math.max(0.5, Math.min(6.0, Number(((distPx / 180) * 4.5).toFixed(1))));

    setLights((prev) =>
      prev.map((l) =>
        l.id === rigDraggingLight
          ? { ...l, angleDeg: angle, distanceMeters: distMeters }
          : l
      )
    );
    setActivePresetId('');
  }, [rigDraggingLight]);

  const handleSvgPointerUp = () => {
    setRigDraggingLight(null);
  };

  // Copy Gaffer Sheet
  const copyGafferSheet = () => {
    const key = lights.find((l) => l.id === 'key')!;
    const fill = lights.find((l) => l.id === 'fill')!;
    const rim = lights.find((l) => l.id === 'rim')!;
    const bg = lights.find((l) => l.id === 'bg')!;

    const sheet = [
      `=== STUTTERFRAME GAFFER SETUP SHEET ===`,
      `Contrast Ratio: ${ratioDisplay} (${contrastStops} stops)`,
      `Preset / Style: ${activePresetId || 'Custom Setup'}`,
      `---------------------------------------`,
      `[KEY LIGHT]`,
      `  Status: ${key.enabled ? 'ACTIVE' : 'OFF'}`,
      `  Angle: ${key.angleDeg}°`,
      `  Distance: ${key.distanceMeters}m (${(key.distanceMeters * 3.28).toFixed(1)}ft)`,
      `  Output: ${key.lux} lux (~${Math.round(key.lux / 10.76)} fc)`,
      `  Subject Lux (E): ${Math.round(getEffectiveLux(key))} lux`,
      `  CCT: ${key.kelvin}K`,
      `  Diffusion: ${key.softness}%`,
      ``,
      `[FILL LIGHT]`,
      `  Status: ${fill.enabled ? 'ACTIVE' : 'OFF'}`,
      `  Angle: ${fill.angleDeg}°`,
      `  Distance: ${fill.distanceMeters}m`,
      `  Output: ${fill.lux} lux`,
      `  Subject Lux (E): ${Math.round(getEffectiveLux(fill))} lux`,
      `  CCT: ${fill.kelvin}K`,
      `  Diffusion: ${fill.softness}%`,
      ``,
      `[RIM / HAIR LIGHT]`,
      `  Status: ${rim.enabled ? 'ACTIVE' : 'OFF'}`,
      `  Angle: ${rim.angleDeg}°`,
      `  Distance: ${rim.distanceMeters}m`,
      `  Output: ${rim.lux} lux`,
      `  CCT: ${rim.kelvin}K`,
      ``,
      `[BACKGROUND FILL]`,
      `  Status: ${bg.enabled ? 'ACTIVE' : 'OFF'}`,
      `  Output: ${bg.lux} lux | CCT: ${bg.kelvin}K`,
      `=======================================`,
    ].join('\n');

    navigator.clipboard.writeText(sheet);
    setIsCopiedGaffer(true);
    setTimeout(() => setIsCopiedGaffer(false), 2500);
  };

  // ---------------------------------------------------------
  // 2. LUT Color Lab State
  // ---------------------------------------------------------
  const [activeLutId, setActiveLutId] = useState<string>('kodak-2383');
  const [customGrade, setCustomGrade] = useState({
    lift: -12,
    gamma: 8,
    gain: 14,
    saturation: 110,
    temperature: 15,
    tint: -5,
  });

  const [selectedFrameUrl, setSelectedFrameUrl] = useState<string>(SAMPLE_FRAMES[0].url);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([
    '#0c1b22',
    '#254b54',
    '#7c5c43',
    '#c88d5e',
    '#e5b98f',
    '#f4eadc',
  ]);
  const [copiedColorHex, setCopiedColorHex] = useState<string | null>(null);
  const [isGeneratingLut, setIsGeneratingLut] = useState(false);

  const lutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeLut = LUT_PRESETS.find((l) => l.id === activeLutId) || LUT_PRESETS[0];

  // Select LUT preset
  const selectLutPreset = (lut: LutPreset) => {
    setActiveLutId(lut.id);
    setCustomGrade({
      lift: lut.lift,
      gamma: lut.gamma,
      gain: lut.gain,
      saturation: lut.saturation,
      temperature: lut.temperature,
      tint: lut.tint,
    });
  };

  // Render LUT Graded Canvas and Extract 6 Dominant Hex Colors
  useEffect(() => {
    const canvas = lutCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedFrameUrl;

    img.onload = () => {
      canvas.width = 640;
      canvas.height = 360;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Color adjustment factors
      const satMul = customGrade.saturation / 100;
      const liftOffset = (customGrade.lift / 100) * 50;
      const gainMul = 1 + customGrade.gain / 100;
      const gammaPow = 1 / (1 + customGrade.gamma / 100);
      const tempR = (customGrade.temperature / 100) * 30;
      const tempB = -(customGrade.temperature / 100) * 30;
      const tintG = -(customGrade.tint / 100) * 20;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Lift, Gamma, Gain
        r = Math.pow(Math.max(0, (r + liftOffset) / 255), gammaPow) * 255 * gainMul;
        g = Math.pow(Math.max(0, (g + liftOffset) / 255), gammaPow) * 255 * gainMul;
        b = Math.pow(Math.max(0, (b + liftOffset) / 255), gammaPow) * 255 * gainMul;

        // Temperature & Tint
        r += tempR;
        g += tintG;
        b += tempB;

        // Saturation (Rec.709 Luma: 0.2126R + 0.7152G + 0.0722B)
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = luma + (r - luma) * satMul;
        g = luma + (g - luma) * satMul;
        b = luma + (b - luma) * satMul;

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imgData, 0, 0);

      // Extract 6 representative tonal swatches from graded buffer
      const samples: { r: number; g: number; b: number; luma: number }[] = [];
      const step = Math.floor(data.length / (4 * 120)); // Sample 120 pixels across the frame

      for (let p = 0; p < data.length; p += 4 * step) {
        const sr = data[p];
        const sg = data[p + 1];
        const sb = data[p + 2];
        const sluma = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
        samples.push({ r: sr, g: sg, b: sb, luma: sluma });
      }

      // Sort by luma to extract highlights, skin midtones, deep shadows
      samples.sort((a, b) => a.luma - b.luma);

      if (samples.length >= 6) {
        const pickedIndices = [
          Math.floor(samples.length * 0.05), // deep black
          Math.floor(samples.length * 0.2), // shadows
          Math.floor(samples.length * 0.4), // lower midtone
          Math.floor(samples.length * 0.6), // skin/key midtone
          Math.floor(samples.length * 0.8), // upper midtone
          Math.floor(samples.length * 0.95), // highlights
        ];

        const hexPalette = pickedIndices.map((idx) => {
          const s = samples[idx];
          const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
          return `#${toHex(s.r)}${toHex(s.g)}${toHex(s.b)}`;
        });

        setExtractedPalette(hexPalette);
      }
    };
  }, [selectedFrameUrl, customGrade]);

  // Handle Custom User Image Upload
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedFrameUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy Color Hex
  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColorHex(hex);
    setTimeout(() => setCopiedColorHex(null), 2000);
  };

  // Generate Real .CUBE 3D LUT File (Standard 17x17x17 format)
  const downloadCubeLut = () => {
    setIsGeneratingLut(true);

    try {
      const size = 17;
      let cubeContent = `# StutterFrame Cinema 3D LUT\n`;
      cubeContent += `# Generated by StutterFrame Lighting & LUT Lab\n`;
      cubeContent += `# Compatible with DaVinci Resolve, Adobe Premiere, Final Cut Pro\n`;
      cubeContent += `TITLE "${activeLut.name}"\n`;
      cubeContent += `LUT_3D_SIZE ${size}\n\n`;

      const satMul = customGrade.saturation / 100;
      const liftOffset = (customGrade.lift / 100) * 50;
      const gainMul = 1 + customGrade.gain / 100;
      const gammaPow = 1 / (1 + customGrade.gamma / 100);
      const tempR = (customGrade.temperature / 100) * 30;
      const tempB = -(customGrade.temperature / 100) * 30;
      const tintG = -(customGrade.tint / 100) * 20;

      for (let bIdx = 0; bIdx < size; bIdx++) {
        for (let gIdx = 0; gIdx < size; gIdx++) {
          for (let rIdx = 0; rIdx < size; rIdx++) {
            let r = (rIdx / (size - 1)) * 255;
            let g = (gIdx / (size - 1)) * 255;
            let b = (bIdx / (size - 1)) * 255;

            // Lift, Gamma, Gain
            r = Math.pow(Math.max(0, (r + liftOffset) / 255), gammaPow) * 255 * gainMul;
            g = Math.pow(Math.max(0, (g + liftOffset) / 255), gammaPow) * 255 * gainMul;
            b = Math.pow(Math.max(0, (b + liftOffset) / 255), gammaPow) * 255 * gainMul;

            // Temp & Tint
            r += tempR;
            g += tintG;
            b += tempB;

            // Saturation
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            r = luma + (r - luma) * satMul;
            g = luma + (g - luma) * satMul;
            b = luma + (b - luma) * satMul;

            // Normalize between 0.0 and 1.0 with 6 decimal places
            const normR = Math.max(0, Math.min(1, r / 255)).toFixed(6);
            const normG = Math.max(0, Math.min(1, g / 255)).toFixed(6);
            const normB = Math.max(0, Math.min(1, b / 255)).toFixed(6);

            cubeContent += `${normR} ${normG} ${normB}\n`;
          }
        }
      }

      const blob = new Blob([cubeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeFilename = activeLut.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `stutterframe_${safeFilename}.cube`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setIsGeneratingLut(false), 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              LIGHTING &amp; COLOR SCIENCE LAB
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-xs font-mono text-zinc-400">
              Real-time 3-Point Soundstage &amp; .CUBE Generator
            </span>
          </div>
          <h1 className="font-courier text-2xl sm:text-3xl font-bold text-white tracking-wide">
            LIGHTING RIG &amp; CINEMATIC LUT LAB
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
            Calculate physical inverse-square falloff, light Kelvin blackbody radiation, and contrast stop ratios — paired with genuine 3D .cube LUT exports for DaVinci Resolve and Premiere.
          </p>
        </div>

        {/* Top Segmented Sub-Tab Switcher */}
        <div className="inline-flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveSubTab('lighting')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeSubTab === 'lighting'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <SunMedium className="w-4 h-4" />
            <span>3-POINT LIGHTING STUDIO</span>
          </button>
          <button
            onClick={() => setActiveSubTab('lut')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeSubTab === 'lut'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>LUT COLOR &amp; PALETTE LAB</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB A: 3-POINT LIGHTING STUDIO                           */}
      {/* ========================================================= */}
      {activeSubTab === 'lighting' && (
        <div className="space-y-6">
          {/* Quick Hollywood Presets Bar */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold text-zinc-300 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Hollywood Standard Lighting Presets
              </span>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Instant gaffer ratio calibration
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {LIGHTING_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyLightingPreset(preset)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-courier text-white line-clamp-1">
                        {preset.name}
                      </div>
                      <div className="text-[10px] font-mono text-amber-400/90 mt-0.5">
                        {preset.style}
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-500 line-clamp-1 mt-2">
                      {preset.mood}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Visualizer Columns: Studio Soundstage & Viewfinder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Interactive Top-Down SVG Soundstage (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <h3 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                    Soundstage Rig (Top-Down)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  Drag lights to position
                </span>
              </div>

              {/* Soundstage SVG Canvas */}
              <div className="relative my-4 flex items-center justify-center select-none bg-black/40 rounded-xl border border-zinc-900 p-2">
                <svg
                  ref={rigSvgRef}
                  viewBox="0 0 360 360"
                  className="w-full max-w-[340px] aspect-square cursor-crosshair touch-none"
                  onPointerMove={handleSvgPointerMove}
                  onPointerUp={handleSvgPointerUp}
                  onPointerLeave={handleSvgPointerUp}
                >
                  {/* Grid Rings for Distance (1m, 2m, 3m, 4m) */}
                  {[40, 80, 120, 160].map((r, i) => (
                    <circle
                      key={r}
                      cx="180"
                      cy="180"
                      r={r}
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="1"
                      strokeDasharray={i === 3 ? '4,4' : undefined}
                    />
                  ))}
                  <text x="184" y="105" fill="#52525b" fontSize="9" fontFamily="monospace">
                    2.0m
                  </text>
                  <text x="184" y="65" fill="#52525b" fontSize="9" fontFamily="monospace">
                    3.5m
                  </text>

                  {/* Backdrop Wall at Top */}
                  <line
                    x1="40"
                    y1="30"
                    x2="320"
                    y2="30"
                    stroke="#3f3f46"
                    strokeWidth="3"
                  />
                  <text x="145" y="24" fill="#71717a" fontSize="9" fontFamily="monospace">
                    BACKDROP CYC WALL
                  </text>

                  {/* Central Subject / Actor Head */}
                  <g transform="translate(180, 180)">
                    {/* Head Oval */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="22"
                      ry="28"
                      fill="#27272a"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    {/* Nose pointing towards camera (Down) */}
                    <polygon points="-4,22 4,22 0,34" fill="#fbbf24" />
                    {/* Ears */}
                    <ellipse cx="-23" cy="0" rx="3" ry="8" fill="#52525b" />
                    <ellipse cx="23" cy="0" rx="3" ry="8" fill="#52525b" />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ACTOR
                    </text>
                  </g>

                  {/* Camera at Bottom (180, 335) */}
                  <g transform="translate(180, 330)">
                    <rect
                      x="-18"
                      y="-12"
                      width="36"
                      height="20"
                      rx="4"
                      fill="#18181b"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                    />
                    <polygon points="-10,-12 10,-12 16,-20 -16,-20" fill="#3f3f46" />
                    <circle cx="0" cy="-2" r="4" fill="#fbbf24" />
                    <text
                      x="0"
                      y="20"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      CAMERA
                    </text>
                  </g>

                  {/* Lights Projection Beams & Heads */}
                  {lights.map((l) => {
                    const isSelected = selectedLightId === l.id;
                    const rad = (l.angleDeg * Math.PI) / 180;
                    // Pixel distance: 180px corresponds to 4.5m
                    const distPx = (l.distanceMeters / 4.5) * 180;
                    const lx = 180 + Math.sin(rad) * distPx;
                    const ly = 180 + Math.cos(rad) * distPx;

                    const color = kelvinToRgb(l.kelvin);
                    const rgbStr = rgbToCss(color, l.enabled ? 0.35 : 0.08);

                    return (
                      <g key={l.id} className="cursor-pointer">
                        {/* Light throw cone towards subject */}
                        {l.enabled && (
                          <line
                            x1={lx}
                            y1={ly}
                            x2="180"
                            y2="180"
                            stroke={rgbToCss(color, 0.4)}
                            strokeWidth={Math.max(1, l.softness * 0.06)}
                            strokeDasharray={isSelected ? '3,3' : undefined}
                          />
                        )}

                        {/* Outer Glow Halo */}
                        <circle
                          cx={lx}
                          cy={ly}
                          r={isSelected ? 18 : 14}
                          fill={rgbStr}
                          stroke={isSelected ? '#fbbf24' : '#52525b'}
                          strokeWidth={isSelected ? 2 : 1}
                          onPointerDown={() => handleSvgPointerDown(l.id)}
                        />

                        {/* Inner Light Bulb */}
                        <circle
                          cx={lx}
                          cy={ly}
                          r="6"
                          fill={l.enabled ? rgbToCss(color, 1) : '#3f3f46'}
                          onPointerDown={() => handleSvgPointerDown(l.id)}
                        />

                        {/* Light Label */}
                        <text
                          x={lx}
                          y={ly - 16}
                          textAnchor="middle"
                          fill={isSelected ? '#fbbf24' : '#d4d4d8'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {l.name.split(' ')[0].toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Light Selection Switcher Tabs */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-900">
                {lights.map((l) => {
                  const isSelected = selectedLightId === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLightId(l.id)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black font-bold border-amber-400'
                          : l.enabled
                          ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-950 text-zinc-600 border-zinc-900'
                      }`}
                    >
                      {l.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Live Viewfinder Preview & Shading (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <h3 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                    Viewfinder Face Sim
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-zinc-400">LIVE RENDER</span>
                </div>
              </div>

              {/* Canvas Shading Render */}
              <div className="my-3 flex items-center justify-center">
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
                  <canvas
                    ref={faceCanvasRef}
                    width={320}
                    height={320}
                    className="w-full max-w-[280px] aspect-square block"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-amber-400">
                    35mm f/2.0
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-zinc-300">
                    ISO 800
                  </div>
                </div>
              </div>

              {/* Real-Time Contrast Stop Meter Card */}
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Contrast Ratio (Key:Fill)</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {ratioDisplay}
                  </span>
                </div>
                {/* Visual Ratio Bar */}
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-200"
                    style={{
                      width: `${Math.min(100, (ratioNumber / 16) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>1:1 High Key</span>
                  <span>4:1 Dramatic</span>
                  <span>16:1 Film Noir</span>
                </div>
              </div>
            </div>

            {/* Column 3: Precision Physics Sliders (3 cols) */}
            <div className="lg:col-span-3 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                    {selectedLight.name}
                  </h3>
                </div>
                {/* Enable / Disable Toggle */}
                <button
                  onClick={() => updateSelectedLight({ enabled: !selectedLight.enabled })}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                    selectedLight.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {selectedLight.enabled ? 'POWER ON' : 'DISABLED'}
                </button>
              </div>

              {/* Slider 1: Intensity (Lux) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Fixture Output</span>
                  <span className="text-amber-400 font-bold">{selectedLight.lux} lx</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={selectedLight.lux}
                  onChange={(e) => updateSelectedLight({ lux: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>~{Math.round(selectedLight.lux / 10.76)} fc</span>
                  <span>Falloff: {Math.round(getEffectiveLux(selectedLight))} lx at subject</span>
                </div>
              </div>

              {/* Slider 2: Distance (Meters) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Stand Distance</span>
                  <span className="text-amber-400 font-bold">{selectedLight.distanceMeters} m</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={selectedLight.distanceMeters}
                  onChange={(e) => updateSelectedLight({ distanceMeters: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>0.5m Close</span>
                  <span>{(selectedLight.distanceMeters * 3.28).toFixed(1)} ft</span>
                  <span>6.0m Wide</span>
                </div>
              </div>

              {/* Slider 3: Color Temperature (Kelvin) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Kelvin (CCT)</span>
                  <span className="text-amber-400 font-bold">{selectedLight.kelvin}K</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="8000"
                  step="100"
                  value={selectedLight.kelvin}
                  onChange={(e) => updateSelectedLight({ kelvin: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>3200K Tungsten</span>
                  <span>5600K Daylight</span>
                </div>
              </div>

              {/* Slider 4: Softness / Diffusion */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Diffusion Softness</span>
                  <span className="text-amber-400 font-bold">{selectedLight.softness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedLight.softness}
                  onChange={(e) => updateSelectedLight({ softness: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Hard Fresnel</span>
                  <span>120cm Octabox</span>
                </div>
              </div>

              {/* Slider 5: Angle (Degrees) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Horizontal Angle</span>
                  <span className="text-amber-400 font-bold">{selectedLight.angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={selectedLight.angleDeg}
                  onChange={(e) => updateSelectedLight({ angleDeg: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Action: Copy Gaffer Setup Sheet */}
              <button
                onClick={copyGafferSheet}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                {isCopiedGaffer ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">GAFFER SHEET COPIED!</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>EXPORT GAFFER SETUP SHEET</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB B: LUT COLOR LAB & PALETTE EXTRACTOR                  */}
      {/* ========================================================= */}
      {activeSubTab === 'lut' && (
        <div className="space-y-6">
          {/* LUT Presets Bar */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold text-zinc-300 uppercase">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Master Film Print Stocks &amp; Cinema Looks
              </span>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Click preset to apply 3D transformation
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {LUT_PRESETS.map((lut) => {
                const isSelected = activeLutId === lut.id;
                return (
                  <button
                    key={lut.id}
                    onClick={() => selectLutPreset(lut)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: lut.previewColor }}
                        />
                        <span className="text-xs font-bold font-courier text-white line-clamp-1">
                          {lut.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1">
                        {lut.filmStock}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graded Frame Preview & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Graded Canvas & Frame Selector (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <h3 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                    Graded Frame Preview ({activeLut.name})
                  </h3>
                </div>

                {/* Custom upload frame button */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Own Frame</span>
                  </button>
                </div>
              </div>

              {/* The Live Graded HTML5 Canvas */}
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                <canvas
                  ref={lutCanvasRef}
                  width={640}
                  height={360}
                  className="w-full aspect-video block object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-amber-400">
                  {activeLut.filmStock} &bull; 10-BIT SIM
                </div>
              </div>

              {/* Sample Test Frames Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Test Frame Library:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrameUrl(f.url)}
                      className={`relative rounded-lg overflow-hidden border aspect-video transition-all cursor-pointer ${
                        selectedFrameUrl === f.url
                          ? 'border-amber-500 ring-2 ring-amber-500/30'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 px-1 py-0.5 text-[9px] font-mono text-white truncate text-center">
                        {f.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extracted 6-Tone Frame Palette */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Extracted Frame Hex Palette (6 Dominant Swatches)
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Click swatch to copy hex code
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {extractedPalette.map((hex, index) => {
                    const isCopied = copiedColorHex === hex;
                    return (
                      <button
                        key={index}
                        onClick={() => copyHex(hex)}
                        title={`Copy ${hex}`}
                        className="group flex flex-col items-center gap-1 p-1 rounded-lg border border-zinc-800 hover:border-amber-500/50 bg-black/40 transition-all cursor-pointer"
                      >
                        <div
                          className="w-full h-8 rounded shadow-inner border border-white/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-[10px] font-mono text-zinc-400 group-hover:text-amber-300 uppercase">
                          {isCopied ? 'COPIED!' : hex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Fine-Tuning Grade & .CUBE Export (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 space-y-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <h3 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                      Grade Parameters
                    </h3>
                  </div>
                  <button
                    onClick={() => selectLutPreset(activeLut)}
                    className="text-[10px] font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Preset</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-400 mt-2 font-sans">
                  {activeLut.description}
                </p>

                {/* Lift Slider (Shadows) */}
                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Lift (Shadows)</span>
                    <span className="text-amber-400 font-bold">{customGrade.lift}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={customGrade.lift}
                    onChange={(e) =>
                      setCustomGrade({ ...customGrade, lift: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Gamma Slider (Midtones) */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Gamma (Midtones)</span>
                    <span className="text-amber-400 font-bold">{customGrade.gamma}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={customGrade.gamma}
                    onChange={(e) =>
                      setCustomGrade({ ...customGrade, gamma: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Gain Slider (Highlights) */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Gain (Highlights)</span>
                    <span className="text-amber-400 font-bold">{customGrade.gain}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={customGrade.gain}
                    onChange={(e) =>
                      setCustomGrade({ ...customGrade, gain: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Saturation Slider */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Saturation</span>
                    <span className="text-amber-400 font-bold">{customGrade.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={customGrade.saturation}
                    onChange={(e) =>
                      setCustomGrade({ ...customGrade, saturation: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Color Temperature (Warm / Cool) */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Warmth / Coolness</span>
                    <span className="text-amber-400 font-bold">{customGrade.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={customGrade.temperature}
                    onChange={(e) =>
                      setCustomGrade({ ...customGrade, temperature: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>Cool Blue (-50)</span>
                    <span>Golden Amber (+50)</span>
                  </div>
                </div>

                {/* Tint (Green / Magenta) */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Tint (Green vs Magenta)</span>
                    <span className="text-amber-400 font-bold">{customGrade.tint}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={customGrade.tint}
                    onChange={(e) =>
                      setCustomGrade({ ...customGrade, tint: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>Emerald (-50)</span>
                    <span>Magenta (+50)</span>
                  </div>
                </div>
              </div>

              {/* Download .CUBE LUT Card */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">EXPORT 3D .CUBE LUT FILE</span>
                </div>
                <p className="text-[11px] font-sans text-zinc-400 leading-relaxed">
                  Generate a standard 17x17x17 3D LUT text file compatible with DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro, and camera monitors (Atomos, SmallHD).
                </p>
                <button
                  onClick={downloadCubeLut}
                  disabled={isGeneratingLut}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isGeneratingLut ? 'COMPUTING 3D MESH...' : `DOWNLOAD ${activeLut.name.toUpperCase()} (.CUBE)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
