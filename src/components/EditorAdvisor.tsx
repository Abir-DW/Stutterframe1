import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Laptop,
  Smartphone,
  Tablet,
  Cpu,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  DollarSign,
  Gauge,
  Film,
  HardDrive,
  RefreshCw,
  Search,
  Check,
  HelpCircle,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { EditorAdvisorResult, EditorRecommendation, GroundingSource } from '../types';
import { ErrorState } from './ResearchingIndicator';
import { EditorLogo } from './EditorLogo';
import { fetchWithAuth } from '../utils/api';

type DevicePlatformType = 'computer' | 'phone' | 'tablet';

interface GuidedDeviceProfile {
  title: string;
  subtitle: string;
  platform: DevicePlatformType;
  category: string;
  os: string;
  cpuGpu: string;
  ram: number;
  vram?: string;
  hasGpu: boolean;
  recommendedWorkflow?: string;
  recommendedFootage?: string;
}

const GUIDED_PROFILES: GuidedDeviceProfile[] = [
  {
    title: 'iPhone 15 Pro / 16 Pro (Flagship)',
    subtitle: 'Apple A17 Pro / A18 Pro • 8GB RAM • ProRes 4K60 support',
    platform: 'phone',
    category: 'iPhone (Apple iOS)',
    os: 'iOS 17 / 18 (iPhone)',
    cpuGpu: 'Apple A17/A18 Pro with 6-core GPU & Neural Engine',
    ram: 8,
    vram: 'Apple Silicon Unified Memory (Dynamic GPU allocation)',
    hasGpu: true,
    recommendedWorkflow: 'Shorts, Reels & TikTok (Vertical 9:16 Mobile Cuts)',
    recommendedFootage: 'Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes',
  },
  {
    title: 'Standard iPhone (13, 14, 15, SE)',
    subtitle: 'Apple A15 / A16 Bionic • 6GB RAM • 4K HDR video',
    platform: 'phone',
    category: 'iPhone (Apple iOS)',
    os: 'iOS 17 / 18 (iPhone)',
    cpuGpu: 'Apple A15/A16 Bionic SoC',
    ram: 6,
    vram: 'Apple Silicon Unified Memory (Dynamic GPU allocation)',
    hasGpu: true,
    recommendedWorkflow: 'Shorts, Reels & TikTok (Vertical 9:16 Mobile Cuts)',
    recommendedFootage: 'Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes',
  },
  {
    title: 'Older iPhone (11, 12, XR, XS)',
    subtitle: 'Apple A12 / A13 / A14 Bionic • 4GB RAM',
    platform: 'phone',
    category: 'iPhone (Apple iOS)',
    os: 'iOS 15 / 16 (Older iPhone)',
    cpuGpu: 'Apple A12/A13/A14 Bionic SoC',
    ram: 4,
    vram: 'Apple Silicon Unified Memory (Dynamic GPU allocation)',
    hasGpu: true,
    recommendedWorkflow: 'Casual Social Media & Quick Stories',
    recommendedFootage: '1080p 30/60fps standard phone camera',
  },
  {
    title: 'High-End Android (Samsung S23/S24, OnePlus 12, Pixel 8/9)',
    subtitle: 'Snapdragon 8 Gen 2/3 / Tensor G3 • 12GB RAM',
    platform: 'phone',
    category: 'Android Smartphone (Samsung, Xiaomi, Pixel, OnePlus)',
    os: 'Android 14 / 15',
    cpuGpu: 'Qualcomm Snapdragon 8 Gen 2/3 Adreno GPU',
    ram: 12,
    vram: 'Integrated / Shared (No dedicated VRAM)',
    hasGpu: true,
    recommendedWorkflow: 'Anime, Velocity Edits & Motion Graphics',
    recommendedFootage: 'Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes',
  },
  {
    title: 'Mid-Range Android (Nothing, Galaxy A54/A55, Redmi Note)',
    subtitle: 'Snapdragon 7 / Dimensity 7050 • 8GB RAM',
    platform: 'phone',
    category: 'Android Smartphone (Samsung, Xiaomi, Pixel, OnePlus)',
    os: 'Android 14 / 15',
    cpuGpu: 'Qualcomm Snapdragon 7-series / MediaTek Dimensity',
    ram: 8,
    vram: 'Integrated / Shared (No dedicated VRAM)',
    hasGpu: true,
    recommendedWorkflow: 'Shorts, Reels & TikTok (Vertical 9:16 Mobile Cuts)',
    recommendedFootage: 'Smartphone 4K 30fps standard video',
  },
  {
    title: 'Budget Android Phone (Under $150 / ₹12,000)',
    subtitle: 'MediaTek Helio / Unisoc / Snapdragon 6 • 4GB RAM',
    platform: 'phone',
    category: 'Android Smartphone (Samsung, Xiaomi, Pixel, OnePlus)',
    os: 'Android 13 / 14',
    cpuGpu: 'Entry-level Octa-Core SoC (Helio G85/G99 or SD 680)',
    ram: 4,
    vram: 'Integrated / Shared (No dedicated VRAM)',
    hasGpu: false,
    recommendedWorkflow: 'Casual Social Media & Quick Stories',
    recommendedFootage: '1080p 30/60fps standard phone camera',
  },
  {
    title: 'Apple Mac (M1 / M2 / M3 / M4 MacBook Air or Pro)',
    subtitle: 'Apple Silicon Unified Memory • 16GB RAM • ProRes accelerator',
    platform: 'computer',
    category: 'Apple MacBook Pro / Air',
    os: 'macOS (Apple Silicon M1/M2/M3/M4)',
    cpuGpu: 'Apple Silicon M-Series with Unified GPU',
    ram: 16,
    vram: 'Apple Silicon Unified Memory (Dynamic GPU allocation)',
    hasGpu: true,
    recommendedWorkflow: 'Cinematic Indie Films & Color Grading',
    recommendedFootage: '4K 10-bit H.265 / Log (Sony, Canon, Fuji, Panasonic)',
  },
  {
    title: 'Gaming or High-End PC Tower / Laptop',
    subtitle: 'Intel Core i7/i9 or Ryzen 7/9 • NVIDIA RTX GPU • 32GB RAM',
    platform: 'computer',
    category: 'Desktop Tower PC',
    os: 'Windows 11 (64-bit)',
    cpuGpu: 'Intel Core i7 / AMD Ryzen 7 + Dedicated NVIDIA RTX GPU',
    ram: 32,
    vram: '10 GB – 12 GB (Prosumer e.g. RTX 4070 / 3080)',
    hasGpu: true,
    recommendedWorkflow: 'Cinematic Indie Films & Color Grading',
    recommendedFootage: '4K 10-bit H.265 / Log (Sony, Canon, Fuji, Panasonic)',
  },
  {
    title: 'Standard Work / University Laptop',
    subtitle: 'Intel Core i5 or Ryzen 5 • Integrated Graphics • 16GB RAM',
    platform: 'computer',
    category: 'Laptop / Notebook',
    os: 'Windows 11 (64-bit)',
    cpuGpu: 'Intel Core i5 / AMD Ryzen 5 (Integrated Iris Xe/UHD)',
    ram: 16,
    vram: 'Integrated / Shared (No dedicated VRAM)',
    hasGpu: false,
    recommendedWorkflow: 'YouTube Talking Head, Vlogs & Reviews',
    recommendedFootage: '1080p H.264 (Standard phone/DSLR video)',
  },
  {
    title: 'Older / Budget Family PC (4-8GB RAM)',
    subtitle: 'Older Dual/Quad-Core • Integrated Graphics • 8GB RAM',
    platform: 'computer',
    category: 'Budget / Low-Spec Office PC',
    os: 'Windows 10 (64-bit)',
    cpuGpu: 'Intel Core i3 / Celeron / Athlon Integrated Graphics',
    ram: 8,
    vram: 'Integrated / Shared (No dedicated VRAM)',
    hasGpu: false,
    recommendedWorkflow: 'Casual Home Video & Screen Recordings',
    recommendedFootage: '1080p H.264 (Standard phone/DSLR video)',
  },
  {
    title: 'iPad Pro / iPad Air (M-Series)',
    subtitle: 'Apple Silicon M1/M2/M4 • 8GB-16GB RAM • Liquid Retina',
    platform: 'tablet',
    category: 'iPad Pro / iPad Air (Apple Silicon M-Series)',
    os: 'iPadOS 17 / 18',
    cpuGpu: 'Apple M2 / M3 / M4 Apple Silicon SoC',
    ram: 8,
    vram: 'Apple Silicon Unified Memory (Dynamic GPU allocation)',
    hasGpu: true,
    recommendedWorkflow: 'Mobile Vlogging & Run-and-Gun Creator Videos',
    recommendedFootage: 'Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes',
  },
];

// Rotating loading banner mirroring GearSuggestor style
const EditorSearchLoading: React.FC = () => {
  const steps = [
    'Benchmarking hardware specs & GPU bottlenecks…',
    'Filtering Free vs One-time vs Subscription suites…',
    'Assessing timeline playback & proxy requirements…',
    'Selecting premier editing tool & verified downloads…',
  ];
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-xl bg-zinc-950/90 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden backdrop-blur-sm animate-fadeIn">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono tracking-wider uppercase mb-4">
        <Scissors className="w-3.5 h-3.5 animate-pulse" />
        Post-Production Architecture Advisor
      </div>
      <div className="font-courier text-lg sm:text-xl font-bold text-white mb-2 transition-all duration-300">
        {steps[stepIdx]}
      </div>
      <p className="text-xs font-mono text-zinc-500">
        Hardware matching &bull; Codec playback evaluation &bull; Official installers
      </p>
      <div className="w-48 h-1 bg-zinc-800 rounded-full mx-auto mt-5 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full animate-indeterminate"></div>
      </div>
    </div>
  );
};

const VRAM_OPTIONS = [
  "I don't know / Shared memory",
  "Integrated / Shared (No dedicated VRAM)",
  "2 GB – 4 GB (Entry / Older discrete GPU)",
  "6 GB – 8 GB (Mid-tier e.g. RTX 3060 / 4060 / RX 6600)",
  "10 GB – 12 GB (Prosumer e.g. RTX 4070 / 3080)",
  "16 GB – 24 GB+ (High-End Studio / RTX 4080 / 4090)",
  "Apple Silicon Unified Memory (Dynamic GPU allocation)",
];

export const EditorAdvisor: React.FC = () => {
  // Primary Platform Mode: Computer vs Mobile Phone vs Tablet
  const [platformType, setPlatformType] = useState<DevicePlatformType>('computer');

  // User Configuration State
  const [deviceCategory, setDeviceCategory] = useState('Laptop / Notebook');
  const [os, setOs] = useState('Windows 11 (64-bit)');
  const [cpuGpu, setCpuGpu] = useState('Intel Core i7 / AMD Ryzen 7');
  const [ramGB, setRamGB] = useState<number>(16);
  const [vram, setVram] = useState<string>("I don't know / Shared memory");
  const [hasDedicatedGPU, setHasDedicatedGPU] = useState<boolean>(true);
  const [editWorkflow, setEditWorkflow] = useState('Cinematic Indie Films & Color Grading');
  const [pricingPreference, setPricingPreference] = useState('Free / Open Source (No Watermark)');
  const [learningCurvePreference, setLearningCurvePreference] = useState('Intermediate');
  const [sourceFootageType, setSourceFootageType] = useState('4K 10-bit H.265 / Log (Sony, Canon, Fuji)');

  const [autoDetected, setAutoDetected] = useState(false);
  const [detectInfo, setDetectInfo] = useState<string | null>(null);
  const [showSpecGuide, setShowSpecGuide] = useState(false);

  // Results & network state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState<number | null>(null);
  const [result, setResult] = useState<EditorAdvisorResult | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  // Switch Platform Type smoothly and adjust dependent defaults
  const handleSwitchPlatform = (type: DevicePlatformType) => {
    setPlatformType(type);
    if (type === 'phone') {
      setDeviceCategory('iPhone (Apple iOS)');
      setOs('iOS 17 / 18 (iPhone)');
      setCpuGpu('Apple A17 Pro / A18 Neural & GPU');
      setRamGB(8);
      setVram('Apple Silicon Unified Memory (Dynamic GPU allocation)');
      setHasDedicatedGPU(true);
      setEditWorkflow('Shorts, Reels & TikTok (Vertical 9:16 Mobile Cuts)');
      setSourceFootageType('Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes');
    } else if (type === 'tablet') {
      setDeviceCategory('iPad Pro / iPad Air (Apple Silicon M-Series)');
      setOs('iPadOS 17 / 18');
      setCpuGpu('Apple M2 / M3 / M4 SoC');
      setRamGB(8);
      setVram('Apple Silicon Unified Memory (Dynamic GPU allocation)');
      setHasDedicatedGPU(true);
      setEditWorkflow('Mobile Vlogging & Run-and-Gun Creator Videos');
      setSourceFootageType('Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes');
    } else {
      setDeviceCategory('Laptop / Notebook');
      setOs('Windows 11 (64-bit)');
      setCpuGpu('Intel Core i7 / AMD Ryzen 7');
      setRamGB(16);
      setVram('6 GB – 8 GB (Mid-tier e.g. RTX 3060 / 4060 / RX 6600)');
      setHasDedicatedGPU(true);
      setEditWorkflow('Cinematic Indie Films & Color Grading');
      setSourceFootageType('4K 10-bit H.265 / Log (Sony, Canon, Fuji, Panasonic)');
    }
  };

  // Auto-detect browser/hardware specs via navigator & WebGL
  const handleAutoDetectSpecs = () => {
    try {
      const ua = navigator.userAgent;
      let detectedPlatform: DevicePlatformType = 'computer';
      let detectedCategory = 'Laptop / Notebook';
      let detectedOS = 'Windows 11 (64-bit)';
      let detectedCpuGpu = 'Modern Multi-Core Processor';
      let hasDedicated = false;
      let detectedRam = 16;
      let detectedVram = "I don't know / Shared memory";

      const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

      if (/iPhone/i.test(ua)) {
        detectedPlatform = 'phone';
        detectedCategory = 'iPhone (Apple iOS)';
        detectedOS = 'iOS 17 / 18 (iPhone)';
        detectedCpuGpu = 'Apple A16/A17 Pro / A18 Neural & GPU';
        detectedRam = 8;
        detectedVram = 'Apple Silicon Unified Memory (Dynamic GPU allocation)';
        hasDedicated = true;
      } else if (/iPad/i.test(ua)) {
        detectedPlatform = 'tablet';
        detectedCategory = 'iPad Pro / iPad Air (Apple Silicon M-Series)';
        detectedOS = 'iPadOS 17 / 18';
        detectedCpuGpu = 'Apple M2/M3 / A15 Bionic SoC';
        detectedRam = 8;
        detectedVram = 'Apple Silicon Unified Memory (Dynamic GPU allocation)';
        hasDedicated = true;
      } else if (/Android/i.test(ua)) {
        detectedPlatform = 'phone';
        detectedCategory = 'Android Smartphone (Samsung, Xiaomi, Pixel, OnePlus)';
        detectedOS = 'Android 14 / 15';
        detectedCpuGpu = 'Qualcomm Snapdragon 8 Gen 2/3 / Dimensity 9300';
        detectedRam = 12;
        detectedVram = 'Integrated / Shared (No dedicated VRAM)';
        hasDedicated = true;
      } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
        detectedPlatform = 'computer';
        detectedCategory = 'Apple MacBook Pro / Air';
        detectedOS = 'macOS (Apple Silicon M1/M2/M3/M4)';
        detectedCpuGpu = 'Apple Silicon M-Series (Unified Memory)';
        detectedRam = 16;
        detectedVram = 'Apple Silicon Unified Memory (Dynamic GPU allocation)';
        hasDedicated = true;
      } else if (ua.includes('Linux')) {
        detectedPlatform = 'computer';
        detectedCategory = 'Desktop Tower PC';
        detectedOS = 'Linux (Ubuntu / Fedora / Arch)';
      }

      // Hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 8;

      // Memory API (Note: browsers cap this at 8GB or 16GB for privacy)
      const navAny = navigator as any;
      if (navAny.deviceMemory) {
        detectedRam = Math.max(4, navAny.deviceMemory);
      }

      // WebGL GPU & VRAM Detection
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer) {
              if (detectedPlatform === 'computer') {
                detectedCpuGpu = `${cores}-Core CPU & ${renderer.substring(0, 38)}`;
              } else if (renderer.includes('Apple')) {
                detectedCpuGpu = `Apple A-Series / Neural GPU (${renderer.substring(0, 25)})`;
              } else if (/adreno/i.test(renderer)) {
                detectedCpuGpu = `Snapdragon Adreno GPU (${renderer.substring(0, 25)})`;
              } else if (/mali|immortalis/i.test(renderer)) {
                detectedCpuGpu = `MediaTek Dimensity GPU (${renderer.substring(0, 25)})`;
              }

              if (
                /nvidia|geforce|rtx|gtx|radeon|rx\s*\d+|apple\s*m\d+|apple\s*gpu|adreno/i.test(renderer)
              ) {
                hasDedicated = true;
              }

              // Detect approximate VRAM from GPU model signature
              if (/rtx\s*4090|rtx\s*3090/i.test(renderer)) {
                detectedVram = '16 GB – 24 GB+ (High-End Studio / RTX 4080 / 4090)';
              } else if (/rtx\s*4080|rtx\s*3080/i.test(renderer)) {
                detectedVram = '10 GB – 12 GB (Prosumer e.g. RTX 4070 / 3080)';
              } else if (/rtx\s*4070|rtx\s*3070/i.test(renderer)) {
                detectedVram = '10 GB – 12 GB (Prosumer e.g. RTX 4070 / 3080)';
              } else if (/rtx\s*4060|rtx\s*3060/i.test(renderer)) {
                detectedVram = '6 GB – 8 GB (Mid-tier e.g. RTX 3060 / 4060 / RX 6600)';
              } else if (/rtx\s*3050|gtx\s*1650|gtx\s*1660/i.test(renderer)) {
                detectedVram = '2 GB – 4 GB (Entry / Older discrete GPU)';
              } else if (/apple\s*m\d+|apple\s*gpu/i.test(renderer)) {
                detectedVram = 'Apple Silicon Unified Memory (Dynamic GPU allocation)';
              } else if (/intel.*(?:iris|uhd|hd graphics)|radeon\s*graphics/i.test(renderer)) {
                detectedVram = 'Integrated / Shared (No dedicated VRAM)';
              }
            }
          }
        }
      } catch {
        // Fallback
      }

      setPlatformType(detectedPlatform);
      setDeviceCategory(detectedCategory);
      setOs(detectedOS);
      setRamGB(detectedRam);
      setVram(detectedVram);
      setHasDedicatedGPU(hasDedicated);
      setCpuGpu(detectedCpuGpu);
      setAutoDetected(true);
      const vramTag = detectedVram !== "I don't know / Shared memory" ? ` • ${detectedVram.split('(')[0].trim()}` : '';
      setDetectInfo(
        `Auto-detected: ${detectedCategory} • ${detectedOS} • ~${detectedRam}GB RAM${vramTag} • ${detectedCpuGpu.substring(0, 35)}`
      );
    } catch (e) {
      console.warn('Auto-detect error:', e);
    }
  };

  // Apply a guided device profile
  const handleApplyGuidedProfile = (profile: GuidedDeviceProfile) => {
    setPlatformType(profile.platform);
    setDeviceCategory(profile.category);
    setOs(profile.os);
    setCpuGpu(profile.cpuGpu);
    setRamGB(profile.ram);
    if (profile.vram) {
      setVram(profile.vram);
    }
    setHasDedicatedGPU(profile.hasGpu);
    if (profile.recommendedWorkflow) {
      setEditWorkflow(profile.recommendedWorkflow);
    }
    if (profile.recommendedFootage) {
      setSourceFootageType(profile.recommendedFootage);
    }
    setShowSpecGuide(false);
    setDetectInfo(`Configured for: ${profile.title} (${profile.ram}GB RAM)`);
  };

  // DYNAMIC CATEGORY & OS LISTS PER PLATFORM (Strictly Separated!)
  const getDeviceCategoriesForPlatform = (): string[] => {
    if (platformType === 'phone') {
      return [
        'iPhone (Apple iOS)',
        'Android Smartphone (Samsung, Xiaomi, Pixel, OnePlus)',
      ];
    }
    if (platformType === 'tablet') {
      return [
        'iPad Pro / iPad Air (Apple Silicon M-Series)',
        'iPad Standard / iPad Mini (Apple A-Series)',
        'Samsung Galaxy Tab / Android Tablet',
      ];
    }
    return [
      'Laptop / Notebook',
      'Desktop Tower PC',
      'Apple MacBook Pro / Air',
      'Mac Mini / Mac Studio',
      'Budget / Low-Spec Office PC',
    ];
  };

  const getOsOptionsForPlatform = (): string[] => {
    if (platformType === 'phone') {
      if (deviceCategory.includes('iPhone')) {
        return ['iOS 17 / 18 (iPhone)', 'iOS 15 / 16 (Older iPhone)'];
      }
      return [
        'Android 14 / 15',
        'Android 12 / 13',
        'Android 10 / 11',
      ];
    }
    if (platformType === 'tablet') {
      if (deviceCategory.includes('iPad')) {
        return ['iPadOS 17 / 18', 'iPadOS 15 / 16'];
      }
      return ['Android 13 / 14 (Tablet)'];
    }
    // Computer options only
    return [
      'Windows 11 (64-bit)',
      'Windows 10 (64-bit)',
      'macOS (Apple Silicon M1/M2/M3/M4)',
      'macOS (Intel Core)',
      'Linux (Ubuntu / Arch / Fedora)',
    ];
  };

  // RAM Presets per Platform
  const getRamPresetsForPlatform = () => {
    if (platformType === 'phone') {
      return [
        { label: '4 GB', value: 4 },
        { label: '6 GB', value: 6 },
        { label: '8 GB', value: 8 },
        { label: '12 GB', value: 12 },
        { label: '16 GB', value: 16 },
      ];
    }
    if (platformType === 'tablet') {
      return [
        { label: '4 GB', value: 4 },
        { label: '6 GB', value: 6 },
        { label: '8 GB', value: 8 },
        { label: '12 GB', value: 12 },
        { label: '16 GB', value: 16 },
      ];
    }
    return [
      { label: '8 GB', value: 8 },
      { label: '16 GB', value: 16 },
      { label: '24 GB', value: 24 },
      { label: '32 GB', value: 32 },
      { label: '64 GB+', value: 64 },
    ];
  };

  // Quick SoC / CPU suggestions per Platform
  const getQuickChipPresets = (): string[] => {
    if (platformType === 'phone') {
      if (deviceCategory.includes('iPhone')) {
        return [
          'Apple A18 Pro / A18 (iPhone 16 / 16 Pro)',
          'Apple A17 Pro (iPhone 15 Pro / Max)',
          'Apple A16 Bionic (iPhone 15 / 14 Pro)',
          'Apple A15 Bionic (iPhone 14 / 13 / SE)',
          'Apple A13 / A14 Bionic (iPhone 11 / 12)',
        ];
      }
      return [
        'Snapdragon 8 Gen 3 (Galaxy S24, OnePlus 12)',
        'Snapdragon 8 Gen 2 / Gen 1 (Flagship)',
        'Snapdragon 7+ Gen 2 / 7 Gen 3 (Mid-range)',
        'MediaTek Dimensity 9300 / 9200 (Flagship)',
        'Google Tensor G3 / G4 (Pixel 8 / 9)',
        'MediaTek Dimensity 7050 / Helio G99',
      ];
    }
    if (platformType === 'tablet') {
      return [
        'Apple M2 / M3 / M4 (iPad Pro)',
        'Apple M1 (iPad Air)',
        'Apple A15 Bionic (iPad Mini)',
        'Snapdragon 8 Gen 2 (Galaxy Tab S9)',
      ];
    }
    return [
      'Intel Core i7 / AMD Ryzen 7 + Dedicated GPU',
      'Apple Silicon M1 / M2 / M3 / M4 (Unified GPU)',
      'Intel Core i9 / AMD Ryzen 9 + RTX 4070/4080',
      'Intel Core i5 / AMD Ryzen 5 (Integrated Iris/UHD)',
      'Budget Dual-Core / Celeron / Athlon',
    ];
  };

  // Workflow options tailored to device platform
  const getWorkflowOptions = (): string[] => {
    if (platformType === 'phone') {
      return [
        'Shorts, Reels & TikTok (Vertical 9:16 Mobile Cuts)',
        'Anime, Velocity Edits & Motion Graphics',
        'Mobile Vlogging & Run-and-Gun Creator Videos',
        'Casual Social Media & Quick Stories',
        'Cinematic Smartphone Filmmaking (LUTs & Log)',
      ];
    }
    if (platformType === 'tablet') {
      return [
        'Mobile Vlogging & Run-and-Gun Creator Videos',
        'Shorts, Reels & TikTok (Vertical 9:16 Mobile Cuts)',
        'Documentary & Multi-Camera Longform',
        'YouTube Talking Head, Vlogs & Reviews',
      ];
    }
    return [
      'Cinematic Indie Films & Color Grading',
      'Shorts, Reels & Fast Social Media Cuts',
      'YouTube Talking Head, Vlogs & Reviews',
      'Documentary & Multi-Camera Longform',
      'Music Videos & VFX Transitions',
      'Casual Home Video & Screen Recordings',
    ];
  };

  // Footage options tailored to device platform
  const getFootageOptions = (): string[] => {
    if (platformType === 'phone' || platformType === 'tablet') {
      return [
        'Smartphone 4K 60fps HDR / Dolby Vision / Apple ProRes',
        'Smartphone 4K 30fps standard video',
        '1080p 30/60fps standard phone camera',
        'Screen captures & 60fps Gameplay (Phone Screen)',
      ];
    }
    return [
      '4K 10-bit H.265 / Log (Sony, Canon, Fuji, Panasonic)',
      '6K / 8K RAW (RED, Blackmagic RAW, ProRes RAW)',
      '1080p H.264 (Standard phone/DSLR video)',
      'Screen captures & 60fps Gameplay (OBS)',
      'Old / Mixed low-resolution archival footage',
    ];
  };

  const pricingModels = [
    'Free / Open Source (No Watermark)',
    'Pay Once (Lifetime Perpetual License)',
    'Subscription (Monthly / Annual Cloud)',
    'Freemium (Free tier acceptable)',
    'Any Pricing (Best fit regardless of cost)',
  ];

  const learningCurves = [
    'Beginner / Instant (Click & export in 10 mins)',
    'Intermediate (Standard multi-track timeline)',
    'Advanced / Professional (Industry nodes & color wheels)',
  ];

  const handleConsult = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchWithAuth('/api/editor-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceCategory,
          os,
          cpuGpu,
          ramGB,
          vram,
          hasDedicatedGPU,
          editWorkflow,
          pricingPreference,
          learningCurvePreference,
          sourceFootageType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to analyze editing software compatibility.');
        if (data.retryDelaySeconds) {
          setRetryDelaySeconds(data.retryDelaySeconds);
        }
        return;
      }

      setResult(data.advisorResult);
      setSources(data.sources || []);
    } catch (err: any) {
      setError('Connection interrupted. Please verify server connectivity and retry.');
    } finally {
      setLoading(false);
    }
  };

  const renderBadgeForPricing = (pricing: string) => {
    if (pricing.includes('Free') || pricing.includes('Open Source')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider">
          {pricing}
        </span>
      );
    }
    if (pricing.includes('Pay Once')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 border border-amber-500/40 text-amber-400 font-bold uppercase tracking-wider">
          {pricing}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold uppercase tracking-wider">
        {pricing}
      </span>
    );
  };

  const renderHardwareFitBadge = (fit: string) => {
    if (fit === 'Perfect Match') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Hardware: Perfect Match
        </span>
      );
    }
    if (fit === 'Runs Well') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          Hardware: Runs Smoothly
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 border border-amber-500/40 text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        {fit}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 relative z-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-widest uppercase">
                Post-Production Architect
              </span>
              <span className="text-zinc-600 text-xs font-mono">&bull;</span>
              <span className="text-zinc-400 text-xs font-mono">
                Hardware Benchmark &amp; Suite Matcher
              </span>
            </div>
            <h1 className="font-courier text-2xl sm:text-4xl font-bold text-white tracking-tight">
              THE EDITING HELP LAB
            </h1>
            <p className="text-xs sm:text-sm font-sans text-zinc-400 mt-1 max-w-2xl">
              Match your computer or mobile phone hardware to the right video editor. Get official
              installer links, download footprints, proxy advice, and zero-watermark options.
            </p>
          </div>

          {/* Action Buttons: Auto-Detect & Guided Helper */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleAutoDetectSpecs}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-mono tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              title="Auto-detect operating system, CPU cores, RAM and graphics card from your browser"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Auto-Detect My Device</span>
            </button>

            <button
              onClick={() => setShowSpecGuide(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs font-mono tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              title="Don't know your specs? Pick your device model from a list"
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span>I Don&apos;t Know My Specs</span>
            </button>
          </div>
        </div>

        {/* Small disclaimer about browser auto-detect accuracy */}
        <div className="mt-3 p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-zinc-200">Auto-Detect Accuracy Note:</strong> Browser security &amp; anti-fingerprinting policies often cap reported RAM at 8GB or 16GB (even on 24GB+ or 32GB machines). You can manually fine-tune your exact RAM and VRAM below.
          </span>
        </div>

        {detectInfo && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{detectInfo}</span>
            </div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest hidden sm:inline">
              Inputs Updated
            </span>
          </div>
        )}
      </div>

      {/* Guided Spec Profile Drawer / Modal */}
      {showSpecGuide && (
        <div className="p-6 rounded-2xl bg-zinc-950 border-2 border-amber-500/40 shadow-2xl relative animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-courier text-base font-bold text-white uppercase tracking-wider">
                Select Your Device (We Will Fill In The Specs For You)
              </h3>
            </div>
            <button
              onClick={() => setShowSpecGuide(false)}
              className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-mono text-zinc-400 mb-4">
            Click whichever device matches yours most closely. We will instantly calibrate the exact CPU/SoC, RAM, operating system, and GPU parameters:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GUIDED_PROFILES.map((profile, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyGuidedProfile(profile)}
                className="text-left p-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {profile.platform === 'phone' && (
                    <Smartphone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  {profile.platform === 'computer' && (
                    <Laptop className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  {profile.platform === 'tablet' && (
                    <Tablet className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="font-courier text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    {profile.title}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 leading-tight">
                  {profile.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Interactive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Device & Hardware Specs */}
        <div className="lg:col-span-6 space-y-5 p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-xl backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              {platformType === 'phone' && <Smartphone className="w-4 h-4 text-amber-400" />}
              {platformType === 'computer' && <Laptop className="w-4 h-4 text-amber-400" />}
              {platformType === 'tablet' && <Tablet className="w-4 h-4 text-amber-400" />}
              <h2 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                1. Device Hardware Rig
              </h2>
            </div>

            {/* Quick Helper Button inside Rig Box */}
            <button
              onClick={() => setShowSpecGuide(true)}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Don&apos;t know specs?</span>
            </button>
          </div>

          {/* Primary Platform Segmented Switcher */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Device Type
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => handleSwitchPlatform('computer')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  platformType === 'computer'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptop / PC</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPlatform('phone')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  platformType === 'phone'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile Phone</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPlatform('tablet')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  platformType === 'tablet'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span>Tablet / iPad</span>
              </button>
            </div>
          </div>

          {/* Device Form Factor (Strictly Platform-specific) */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              {platformType === 'phone'
                ? 'Smartphone Brand / Ecosystem'
                : platformType === 'tablet'
                ? 'Tablet Type'
                : 'Computer Form Factor'}
            </label>
            <select
              value={deviceCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setDeviceCategory(newCat);
                // Synchronize OS default based on category selection
                if (platformType === 'phone') {
                  if (newCat.includes('iPhone')) {
                    setOs('iOS 17 / 18 (iPhone)');
                    setCpuGpu('Apple A17 Pro / A18 Neural & GPU');
                  } else {
                    setOs('Android 14 / 15');
                    setCpuGpu('Snapdragon 8 Gen 2 / Gen 3');
                  }
                }
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {getDeviceCategoriesForPlatform().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Operating System (Filtered: No Windows on Phone, No Android on PC!) */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Operating System
            </label>
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {getOsOptionsForPlatform().map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* RAM Selector & Uneven RAM Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {platformType === 'phone' ? 'Phone RAM' : 'System RAM / Unified Memory'}
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-amber-400 font-bold">{ramGB} GB</span>
                <span className="text-[10px] font-mono text-zinc-500">(Preset or Custom)</span>
              </div>
            </div>

            {/* Platform-tailored RAM Presets */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {getRamPresetsForPlatform().map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRamGB(r.value)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    ramGB === r.value
                      ? 'bg-amber-500 text-black shadow-xs font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Custom Uneven RAM direct input */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                Uneven RAM?
              </span>
              <div className="relative flex-1">
                <input
                  type="number"
                  min="2"
                  max="512"
                  value={ramGB || ''}
                  onChange={(e) => setRamGB(Math.max(2, parseInt(e.target.value) || 2))}
                  placeholder="e.g. 24, 20, 18, 10, 6..."
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-amber-400 text-xs font-mono outline-none"
                />
                <span className="absolute right-3 top-1.5 text-xs font-mono text-zinc-500 pointer-events-none">
                  GB
                </span>
              </div>
            </div>

            {ramGB <= 8 && platformType === 'computer' && (
              <p className="mt-2 text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Heavy PC suites (DaVinci/Premiere) will struggle on &le;8GB. Lightweight or proxy editors recommended.
              </p>
            )}
            {ramGB === 24 && (
              <p className="mt-2 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                24GB asymmetric/Apple Silicon unified RAM detected: Excellent for 4K timeline buffers &amp; DaVinci color nodes.
              </p>
            )}
          </div>

          {/* Processor, SoC & GPU Details */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              {platformType === 'phone'
                ? 'Phone Processor / Chipset (SoC)'
                : platformType === 'tablet'
                ? 'Tablet Processor / SoC'
                : 'Processor, CPU & GPU Details'}
            </label>

            {/* Quick Chipset Preset Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {getQuickChipPresets().slice(0, 4).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCpuGpu(chip)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                    cpuGpu === chip
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {chip.split('(')[0].trim()}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={cpuGpu}
              onChange={(e) => setCpuGpu(e.target.value)}
              placeholder={
                platformType === 'phone'
                  ? 'e.g. Apple A17 Pro / Snapdragon 8 Gen 3 / Dimensity 9300'
                  : 'e.g. Intel i7 + RTX 4070 / Apple M2 Silicon / AMD Ryzen 7'
              }
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none"
            />
          </div>

          {/* Dedicated GPU / Hardware Neural Acceleration Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={hasDedicatedGPU}
                onChange={(e) => setHasDedicatedGPU(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-zinc-950 border-zinc-700 cursor-pointer accent-amber-500"
              />
              <div className="text-xs font-mono">
                <span className="text-white font-semibold">
                  {platformType === 'phone' || platformType === 'tablet'
                    ? 'Hardware Neural Engine & Media Encoders (H.265 / ProRes)'
                    : 'Has Dedicated Graphics Card (NVIDIA RTX/GTX, AMD Radeon, Apple M-series)'}
                </span>
                <p className="text-zinc-500 text-[11px]">
                  {platformType === 'phone' || platformType === 'tablet'
                    ? 'Standard on modern Apple A-series and Snapdragon/Dimensity flagships.'
                    : 'Uncheck if running only Intel UHD/Iris or AMD basic integrated APU.'}
                </p>
              </div>
            </label>
          </div>

          {/* VRAM Detector & Selector with "I don't know" option */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                GPU VRAM (Video Memory)
              </label>
              <span className="text-[10px] font-mono text-amber-400">
                {vram === "I don't know / Shared memory" ? "I Don't Know" : vram.split('(')[0].trim()}
              </span>
            </div>

            <select
              value={vram}
              onChange={(e) => setVram(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {VRAM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <p className="text-[10px] font-mono text-zinc-500">
              DaVinci Resolve needs &ge;4-6GB VRAM for 4K timelines. Pick &ldquo;I don&apos;t know / Shared memory&rdquo; if you have integrated graphics or are unsure.
            </p>
          </div>
        </div>

        {/* Right Column: Editing Workflow, Budget & Learning Curve */}
        <div className="lg:col-span-6 space-y-5 p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-xl backdrop-blur-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Film className="w-4 h-4 text-amber-400" />
              <h2 className="font-courier text-sm font-bold text-white uppercase tracking-wider">
                2. Editing Needs &amp; Constraints
              </h2>
            </div>

            {/* Workflow (Platform-tailored) */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Editing Format &amp; Genre
              </label>
              <select
                value={editWorkflow}
                onChange={(e) => setEditWorkflow(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
              >
                {getWorkflowOptions().map((wf) => (
                  <option key={wf} value={wf}>
                    {wf}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Model */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Pricing Model Preference
              </label>
              <select
                value={pricingPreference}
                onChange={(e) => setPricingPreference(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
              >
                {pricingModels.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Learning Curve */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Learning Curve Willingness
              </label>
              <select
                value={learningCurvePreference}
                onChange={(e) => setLearningCurvePreference(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
              >
                {learningCurves.map((lc) => (
                  <option key={lc} value={lc}>
                    {lc}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Footage Type (Platform-tailored) */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Source Footage &amp; Resolution
              </label>
              <select
                value={sourceFootageType}
                onChange={(e) => setSourceFootageType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
              >
                {getFootageOptions().map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Consult Button */}
          <div className="pt-4">
            <button
              onClick={handleConsult}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-xl shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Scissors className="w-4 h-4 text-black" />
              <span>Diagnose &amp; Match Video Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && <EditorSearchLoading />}

      {/* Error state */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={handleConsult}
          toolName="Editing Help Lab"
          retryDelaySeconds={retryDelaySeconds}
        />
      )}

      {/* Results View */}
      {result && !loading && !error && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <h3 className="font-courier text-base font-bold text-white uppercase tracking-wider">
                  POST-PRODUCTION HARDWARE AUDIT
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {result.deviceSpecsAnalyzed}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              {result.executiveSummary}
            </p>
          </div>

          {/* #1 Top Pick Champion Banner */}
          {result.topPick && (
            <div className="rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500 shadow-2xl overflow-hidden relative group">
              {/* Gold Ribbon Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-6 py-2 flex items-center justify-between text-black font-courier font-bold text-xs tracking-widest uppercase">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  UNDISPUTED TOP PICK FOR YOUR HARDWARE RIG
                </span>
                <span>MATCH SCORE 98%</span>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Logo & Platform Info */}
                <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border border-amber-500/40 p-3 shadow-xl flex items-center justify-center overflow-hidden">
                    <EditorLogo
                      name={result.topPick.name}
                      logoUrl={result.topPick.logoUrl}
                      className="w-full h-full"
                    />
                  </div>

                  <div>
                    <h4 className="font-courier text-2xl font-bold text-white">
                      {result.topPick.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      {result.topPick.tagline}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {renderBadgeForPricing(result.topPick.pricingModel)}
                    {renderHardwareFitBadge(result.topPick.hardwareFitVerdict)}
                  </div>

                  {/* Price & Size stats */}
                  <div className="w-full p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Price:</span>
                      <span className="font-bold text-amber-400">{result.topPick.priceDisplay}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Installer Size:</span>
                      <span>{result.topPick.downloadSizeApprox}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Learning Curve:</span>
                      <span>{result.topPick.learningCurve}</span>
                    </div>
                  </div>

                  {/* Download CTA Button */}
                  <a
                    href={result.topPick.officialDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Get Official Software</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </a>
                </div>

                {/* Right Details: Technical Why It Fits, Pros & Cons */}
                <div className="md:col-span-8 space-y-4">
                  {/* Why it fits your machine */}
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      Hardware Synergy Breakdown
                    </h5>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                      {result.topPick.whyItFits}
                    </p>
                  </div>

                  {/* Minimum vs Recommended Specs */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs font-mono">
                    <span className="text-zinc-500 uppercase tracking-wider block mb-1">
                      System Requirements:
                    </span>
                    <span className="text-zinc-300">
                      {result.topPick.systemRequirementsSummary}
                    </span>
                  </div>

                  {/* Pros & Cons Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pros */}
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-emerald-500/20">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                        Strengths For You
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-300 font-sans">
                        {result.topPick.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/20">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">
                        Tradeoffs / Watchouts
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-300 font-sans">
                        {result.topPick.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternatives Grid */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-courier text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  VIABLE ALTERNATIVE SUITES (DIFFERENT TRADEOFFS)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-700 p-2 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <EditorLogo
                            name={alt.name}
                            logoUrl={alt.logoUrl}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="text-right">
                          {renderBadgeForPricing(alt.pricingModel)}
                          <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                            {alt.priceDisplay}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-courier text-lg font-bold text-white">
                          {alt.name}
                        </h4>
                        <p className="text-xs font-mono text-zinc-400 mt-0.5">
                          {alt.tagline}
                        </p>
                      </div>

                      <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                        {alt.whyItFits}
                      </p>

                      <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 space-y-1">
                        <div>
                          <span className="text-zinc-500">Download Size:</span>{' '}
                          <span className="text-zinc-200">{alt.downloadSizeApprox}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Learning Curve:</span>{' '}
                          <span className="text-zinc-200">{alt.learningCurve}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-zinc-900">
                      <a
                        href={alt.officialDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400/50 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download Page</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
