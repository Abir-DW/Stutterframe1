import React, { useState, useEffect } from 'react';
import { Film, Scissors } from 'lucide-react';

interface EditorLogoProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
}

export const EditorLogo: React.FC<EditorLogoProps> = ({ name, logoUrl, className = 'w-full h-full' }) => {
  const [hasError, setHasError] = useState(false);

  // Reset error when logoUrl or name changes
  useEffect(() => {
    setHasError(false);
  }, [logoUrl, name]);

  const norm = (name || '').toLowerCase().trim();

  // If external image provided and has not errored, attempt to load it
  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt=""
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${className} object-contain filter drop-shadow select-none`}
        loading="lazy"
      />
    );
  }

  // Graceful authentic vector fallback based on software name
  if (norm.includes('alight motion')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Alight Motion">
        <defs>
          <linearGradient id="am-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5D4" />
            <stop offset="50%" stopColor="#00BBF9" />
            <stop offset="100%" stopColor="#7209B7" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#am-grad)" />
        {/* Dynamic Motion Curve & AM mark */}
        <path
          d="M20 62 C32 40, 48 38, 56 50 C64 62, 74 62, 82 42"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="82" cy="42" r="5" fill="#ffffff" />
        <text
          x="50"
          y="78"
          fill="#ffffff"
          fontSize="17"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          ALIGHT
        </text>
      </svg>
    );
  }

  if (norm.includes('davinci')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="DaVinci Resolve">
        <rect width="100" height="100" rx="22" fill="#121218" />
        {/* DaVinci 4-petal color pinwheel */}
        <path d="M50 50 L50 20 A30 30 0 0 1 78 40 Z" fill="#FF4D4D" />
        <path d="M50 50 L80 50 A30 30 0 0 1 60 78 Z" fill="#FFC837" />
        <path d="M50 50 L50 80 A30 30 0 0 1 22 60 Z" fill="#00D2FF" />
        <path d="M50 50 L20 50 A30 30 0 0 1 40 22 Z" fill="#9D4EDD" />
        <circle cx="50" cy="50" r="8" fill="#121218" />
      </svg>
    );
  }

  if (norm.includes('premiere')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Adobe Premiere Pro">
        <rect width="100" height="100" rx="22" fill="#00005B" stroke="#9999FF" strokeWidth="3" />
        <text
          x="50"
          y="68"
          fill="#9999FF"
          fontSize="50"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          Pr
        </text>
      </svg>
    );
  }

  if (norm.includes('final cut')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Final Cut Pro">
        <rect width="100" height="100" rx="22" fill="#1a1c23" />
        {/* Clapperboard chevron stripes */}
        <path d="M16 36 L84 36 L84 76 A10 10 0 0 1 74 86 L26 86 A10 10 0 0 1 16 76 Z" fill="#2d303e" />
        {/* Top clapper with rainbow angled bars */}
        <g transform="rotate(-6 50 28)">
          <rect x="14" y="20" width="72" height="16" rx="4" fill="#1e2029" />
          <polygon points="18,20 28,20 22,36 12,36" fill="#00F5D4" />
          <polygon points="34,20 44,20 38,36 28,36" fill="#FFE600" />
          <polygon points="50,20 60,20 54,36 44,36" fill="#FF5E7E" />
          <polygon points="66,20 76,20 70,36 60,36" fill="#7B2CBF" />
        </g>
        <circle cx="50" cy="62" r="14" fill="#3f4457" />
        <polygon points="46,55 58,62 46,69" fill="#ffffff" />
      </svg>
    );
  }

  if (norm.includes('capcut')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="CapCut">
        <rect width="100" height="100" rx="22" fill="#08080a" stroke="#27272a" strokeWidth="2" />
        {/* CapCut Chevron ribbons */}
        <path d="M26 30 L50 48 L26 66 L34 72 L58 54 L58 42 L34 24 Z" fill="#ffffff" />
        <path d="M74 30 L50 48 L74 66 L66 72 L42 54 L42 42 L66 24 Z" fill="#ffffff" />
      </svg>
    );
  }

  if (norm.includes('vn')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="VN Video Editor">
        <defs>
          <linearGradient id="vn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4361EE" />
            <stop offset="100%" stopColor="#3A0CA3" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#vn-grad)" />
        <text
          x="50"
          y="64"
          fill="#ffffff"
          fontSize="42"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="2"
        >
          VN
        </text>
      </svg>
    );
  }

  if (norm.includes('luma')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="LumaFusion">
        <defs>
          <linearGradient id="lf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9E00" />
            <stop offset="100%" stopColor="#FF5400" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#lf-grad)" />
        <circle cx="50" cy="50" r="26" fill="#18181b" />
        <polygon points="44,38 64,50 44,62" fill="#ffffff" />
      </svg>
    );
  }

  if (norm.includes('shotcut')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Shotcut">
        <rect width="100" height="100" rx="22" fill="#1b2838" />
        <path d="M25 30 L65 30 L55 70 L15 70 Z" fill="#00adb5" opacity="0.8" />
        <polygon points="45,40 75,50 45,60" fill="#ffffff" />
      </svg>
    );
  }

  if (norm.includes('kdenlive')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Kdenlive">
        <rect width="100" height="100" rx="22" fill="#1a2634" />
        {/* Timeline track bars & cutter */}
        <rect x="22" y="32" width="56" height="7" rx="3" fill="#3daee9" />
        <rect x="22" y="46" width="38" height="7" rx="3" fill="#2ecc71" />
        <rect x="22" y="60" width="50" height="7" rx="3" fill="#e74c3c" />
        <polygon points="56,38 72,50 56,62" fill="#ffffff" />
      </svg>
    );
  }

  if (norm.includes('kinemaster')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="KineMaster">
        <circle cx="50" cy="50" r="48" fill="#F43F5E" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="4" />
        <text
          x="50"
          y="68"
          fill="#ffffff"
          fontSize="48"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          K
        </text>
      </svg>
    );
  }

  if (norm.includes('inshot')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="InShot">
        <defs>
          <linearGradient id="inshot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF416C" />
            <stop offset="100%" stopColor="#FF4B2B" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#inshot-grad)" />
        <rect x="28" y="28" width="44" height="44" rx="12" fill="none" stroke="#ffffff" strokeWidth="5" />
        <circle cx="50" cy="50" r="11" fill="#ffffff" />
      </svg>
    );
  }

  if (norm.includes('filmora')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Filmora">
        <rect width="100" height="100" rx="22" fill="#0b1b1a" />
        <path d="M30 25 L70 25 L50 55 Z" fill="#00E5FF" opacity="0.9" />
        <path d="M50 45 L70 75 L30 75 Z" fill="#00FF87" opacity="0.9" />
      </svg>
    );
  }

  if (norm.includes('blender')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Blender">
        <rect width="100" height="100" rx="22" fill="#18181b" />
        <circle cx="50" cy="55" r="22" fill="#E87D0D" />
        <circle cx="50" cy="55" r="9" fill="#226CE0" />
        <path d="M50 33 L50 18" stroke="#E87D0D" strokeWidth="6" strokeLinecap="round" />
        <path d="M36 40 L22 28" stroke="#E87D0D" strokeWidth="6" strokeLinecap="round" />
        <path d="M64 40 L78 28" stroke="#E87D0D" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm.includes('avid')) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="Avid Media Composer">
        <rect width="100" height="100" rx="22" fill="#4B0082" />
        <polygon points="26,30 46,30 36,70 16,70" fill="#ffffff" />
        <polygon points="50,30 70,30 60,70 40,70" fill="#E0AAFF" />
        <polygon points="74,30 94,30 84,70 64,70" fill="#9D4EDD" />
      </svg>
    );
  }

  // Universal Fallback: Elegant cinematic monogram badge with initials
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ED';

  return (
    <div
      className={`${className} rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-amber-500/30 flex flex-col items-center justify-center p-2 text-center select-none shadow-inner`}
    >
      <Scissors className="w-5 h-5 text-amber-400 mb-0.5 opacity-90" />
      <span className="font-courier font-bold text-xs tracking-wider text-white">
        {initials}
      </span>
    </div>
  );
};
