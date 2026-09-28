import React, { useEffect, useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

export const CustomCursor: React.FC = () => {
  const {
    cursorType,
    cursorColor,
    cursorDefaultMode,
    flashColor,
    pageChangeEventId,
    lastClickPos,
    uiStyle,
  } = useSettings();

  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isClapping, setIsClapping] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const prevEventIdRef = useRef(pageChangeEventId);

  // Check if device has fine pointer (mouse/trackpad) and is NOT a mobile/touch device
  useEffect(() => {
    const checkPointer = () => {
      // Must support hover, fine pointer, and not be a pure touch viewport
      const fine =
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        window.innerWidth >= 640 &&
        !('ontouchstart' in window && window.innerWidth < 768);
      setIsFinePointer(fine);
    };

    checkPointer();
    window.addEventListener('resize', checkPointer);
    return () => window.removeEventListener('resize', checkPointer);
  }, []);

  // Determine if custom cursor should be rendered:
  // Render if fine pointer AND (manual cursor selected OR movie-themed UI style active with non-native mode)
  const isMovieStyleWithThemeCursor =
    uiStyle !== 'default' &&
    uiStyle !== 'apple-glass' &&
    uiStyle !== 'grand-budapest' &&
    uiStyle !== 'kubrick-space' &&
    cursorDefaultMode !== 'native';

  const shouldRenderCustom =
    isFinePointer &&
    (cursorType !== 'default' ||
      (cursorType === 'default' && cursorDefaultMode === 'precision') ||
      isMovieStyleWithThemeCursor);

  // Track mouse coordinates on desktop
  useEffect(() => {
    if (!shouldRenderCustom) {
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
        setIsHovering(!!interactive);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [shouldRenderCustom]);

  // Trigger Flash / Clap ONLY when page changing button triggers pageChangeEventId
  useEffect(() => {
    if (pageChangeEventId === 0 || pageChangeEventId === prevEventIdRef.current) return;
    prevEventIdRef.current = pageChangeEventId;

    if (cursorType === 'camera') {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 280);
      return () => clearTimeout(timer);
    } else if (cursorType === 'slate') {
      setIsClapping(true);
      const timer = setTimeout(() => setIsClapping(false), 320);
      return () => clearTimeout(timer);
    }
  }, [pageChangeEventId, cursorType]);

  // If touch screen or mobile or hidden or native mode on default cursor, do not render custom element
  if (!shouldRenderCustom || !isVisible) {
    return null;
  }

  const burstCoord = lastClickPos || pos;

  return (
    <>
      {/* 1. Main Custom Floating Cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        }}
      >
        {/* Style A: Precision Cinema Arrow (Default cursor with custom color) */}
        {cursorType === 'default' && cursorDefaultMode === 'precision' && !isMovieStyleWithThemeCursor && (
          <div
            className={`relative -translate-x-0.5 -translate-y-0.5 transition-transform duration-100 ${
              isHovering ? 'scale-105' : 'scale-100'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            >
              <path
                d="M3.5 2.5L10.5 20.5L13.8 13.8L20.5 10.5L3.5 2.5Z"
                fill="#121216"
                stroke={cursorColor}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 5.5L10 17L12.5 12L17 10L5.5 5.5Z"
                fill={cursorColor}
                fillOpacity="0.25"
              />
              <circle cx="10" cy="10" r="1" fill={cursorColor} />
            </svg>
            {isHovering && (
              <span
                className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full animate-ping pointer-events-none opacity-60"
                style={{ backgroundColor: cursorColor }}
              />
            )}
          </div>
        )}

        {/* ===================================================================
            CINEMATIC MOVIE-THEMED & ANIMATED CUSTOM CURSORS
            =================================================================== */}

        {/* 1. THE GOTHAM BAT: Anatomically authentic predatory nocturnal bat with pointed ears, skeletal finger bone wings & sharp scallops (NO butterfly) */}
        {cursorType === 'batman-bat' && (
          <div
            className={`relative -translate-x-6 -translate-y-2 transition-transform duration-100 ${
              isHovering ? 'scale-115' : 'scale-100'
            }`}
          >
            <div className="animate-batPredatorGlide drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              <svg
                width="48"
                height="24"
                viewBox="0 0 48 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Bat Main Body & Sharp Chiropteran Scalloped Flight Wings */}
                <path
                  d="M24 3.5 L22 1 L20 4.5 C16 3.5 12 2.5 10 3.5 L1 8 Q4 13 8 15 Q11 17 15 16 Q18 16.5 22 15 L24 17.5 L26 15 Q30 16.5 33 16 Q37 17 40 15 Q44 13 47 8 L38 3.5 C36 2.5 32 3.5 28 4.5 L26 1 Z"
                  fill="#09090b"
                  stroke={cursorColor || '#f97316'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Sharp Pointed Nocturnal Bat Ears */}
                <polygon points="20.5,3.5 22,0.8 23.5,3.8" fill={cursorColor || '#f97316'} />
                <polygon points="27.5,3.5 26,0.8 24.5,3.8" fill={cursorColor || '#f97316'} />

                {/* Thumb Claws (Alula hooks at wing apex) */}
                <path d="M10 3.5L8.5 1.5" stroke={cursorColor || '#f97316'} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M38 3.5L39.5 1.5" stroke={cursorColor || '#f97316'} strokeWidth="1.2" strokeLinecap="round" />

                {/* Glowing Predatory Slit Eyes */}
                <circle cx="22.2" cy="5.2" r="0.75" fill="#ffffff" />
                <circle cx="25.8" cy="5.2" r="0.75" fill="#ffffff" />

                {/* Elongated Skeletal Finger Struts (Defining bat wing anatomy, prevents butterfly look) */}
                <line x1="10" y1="3.5" x2="1" y2="8" stroke={cursorColor || '#f97316'} strokeWidth="0.8" opacity="0.65" />
                <line x1="10" y1="3.5" x2="8" y2="15" stroke={cursorColor || '#f97316'} strokeWidth="0.8" opacity="0.65" />
                <line x1="10" y1="3.5" x2="15" y2="16" stroke={cursorColor || '#f97316'} strokeWidth="0.8" opacity="0.65" />

                <line x1="38" y1="3.5" x2="47" y2="8" stroke={cursorColor || '#f97316'} strokeWidth="0.8" opacity="0.65" />
                <line x1="38" y1="3.5" x2="40" y2="15" stroke={cursorColor || '#f97316'} strokeWidth="0.8" opacity="0.65" />
                <line x1="38" y1="3.5" x2="33" y2="16" stroke={cursorColor || '#f97316'} strokeWidth="0.8" opacity="0.65" />

                {/* Wayne Sonar Echo Pulse on Hover */}
                {isHovering && (
                  <circle cx="24" cy="5" r="9" stroke={cursorColor || '#f97316'} strokeWidth="1" strokeDasharray="2 2" className="animate-ping opacity-60" />
                )}
              </svg>
            </div>
            {/* Precision Aim Dot at Head/Ears */}
            <span
              className="absolute top-1.5 left-[24px] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: cursorColor || '#f97316' }}
            />
          </div>
        )}

        {/* 2. THE GODFATHER / REVOLVER: Authentic .357 Snubnose Police Revolver with 6-chamber fluted cylinder & walnut grip */}
        {(cursorType === 'revolver' || (cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'godfather')) && (
          <div
            className={`relative -translate-x-1 -translate-y-1 transition-transform duration-100 ${
              isHovering ? 'scale-115' : 'scale-100'
            }`}
          >
            <svg
              width="48"
              height="34"
              viewBox="0 0 48 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
            >
              {/* Front Sight Blade with High-Vis Target Dot at Muzzle Tip (Cursor Aim Point) */}
              <path d="M4 5L5.5 2H7.5L7.5 5H4Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx="6" cy="3.5" r="1.1" fill={cursorColor || '#ef4444'} />

              {/* Steel Barrel with Top Ventilated Rib */}
              <path d="M3 5H18V11H3C2.2 11 1.8 10.4 1.8 9.5V6.5C1.8 5.6 2.2 5 3 5Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
              {/* Ventilated Rib Cooling Ports on Top of Barrel */}
              <rect x="8" y="5.4" width="2.5" height="0.8" rx="0.3" fill="#09090b" />
              <rect x="13" y="5.4" width="2.5" height="0.8" rx="0.3" fill="#09090b" />
              <line x1="3" y1="5.5" x2="18" y2="5.5" stroke="#475569" strokeWidth="0.8" />

              {/* Under-Barrel Heavy Lug & Knurled Ejector Rod */}
              <path d="M5 11H17V13.8H6C5.4 13.8 5 13.4 5 12.8V11Z" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
              <rect x="3.2" y="11.4" width="2.2" height="1.8" rx="0.4" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.4" />

              {/* Heavy Frame Top Strap over Cylinder with Rear Sight Notch */}
              <path d="M17 5H32V7.5H17V5Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
              <rect x="30.5" y="4" width="1.8" height="1.8" fill="#0f172a" />

              {/* Authentic 6-Chamber Revolver Cylinder with Deep Longitudinal Flutes */}
              <g className="origin-[23.5px_12px]">
                <rect x="17.5" y="7.5" width="12" height="10" rx="1.8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                {/* 3 Visible Flutes (The unmistakable signature of a revolver) */}
                <path d="M18.5 9.2H28.5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M18 12.5H29" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M18.5 15.6H28.5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
                {/* Cylinder Stop Notches */}
                <rect x="21" y="16.8" width="1.6" height="0.8" fill="#64748b" />
                <rect x="26" y="16.8" width="1.6" height="0.8" fill="#64748b" />
                {/* Crane Axis Hinge under Cylinder */}
                <rect x="18" y="15" width="3.5" height="2" rx="0.5" fill="#334155" stroke="#0f172a" strokeWidth="0.5" />
              </g>

              {/* Recoil Shield & Frame behind Cylinder */}
              <path d="M29 6H34C35.2 6 36.2 7.2 36.2 8.8V15.2C36.2 17 34.8 18 33 18.5L29 18.5V6Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
              {/* Checkered Cylinder Release Thumb Latch */}
              <rect x="30.5" y="9.8" width="3.4" height="2.2" rx="0.5" fill="#64748b" stroke="#0f172a" strokeWidth="0.5" />
              <line x1="31.8" y1="10.2" x2="31.8" y2="11.6" stroke="#0f172a" strokeWidth="0.6" />

              {/* Cocked Spurred Combat Hammer with Serrations */}
              <path d="M33 7L37.5 2.5C38.2 2 39.2 2.6 39 3.5L38 6.5L35 8.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.9" />
              <line x1="36.5" y1="3.2" x2="38" y2="4.2" stroke="#334155" strokeWidth="0.6" />

              {/* Deep Combat Trigger Guard & Curved Steel Trigger */}
              <path d="M19 18V21C19 25 23.5 26.5 27 25C28.5 24.2 29.5 22.2 29.5 19.5" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M23 19.5C23.5 21.5 24.8 22.8 25.5 23.5" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" fill="none" />

              {/* Contoured Checkered Walnut Wood Grip Handle */}
              <path d="M30 18.5C31.5 19.8 33 21.5 33 24.5C33 27.5 31.5 30.5 29.5 33C28 34.5 25.5 34.5 23.8 33.5C22 32.5 21.5 30.8 22 28C22.5 25 24.2 22.5 26 20L28 18.5" fill="#78350f" stroke="#451a03" strokeWidth="1.3" strokeLinejoin="round" />
              {/* Inset Checkered Grip Panel */}
              <path d="M28.5 21C29.8 22.8 30.5 25 30.5 27.2C30.5 29.2 29.8 31 28.5 32C27.5 32.8 26 32.8 25 32C24.2 31.2 24 29.8 24.2 27.5C24.5 25.2 25.8 23 27 21.8Z" fill="#92400e" stroke="#451a03" strokeWidth="0.6" />
              {/* Diamond Checkering Lines */}
              <line x1="26" y1="24" x2="29.5" y2="28" stroke="#451a03" strokeWidth="0.7" opacity="0.8" />
              <line x1="25" y1="27" x2="28.5" y2="31" stroke="#451a03" strokeWidth="0.7" opacity="0.8" />
              <line x1="29" y1="24" x2="25.5" y2="28" stroke="#451a03" strokeWidth="0.7" opacity="0.8" />
              <line x1="30" y1="27" x2="26.5" y2="31" stroke="#451a03" strokeWidth="0.7" opacity="0.8" />
              {/* Brass Grip Medallion */}
              <circle cx="27.5" cy="26.5" r="1.5" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
            </svg>
            {/* Front Target Sight Dot / Muzzle Flash at Muzzle Tip */}
            <span
              className="absolute top-[3px] left-[6px] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full animate-ping opacity-85"
              style={{ backgroundColor: cursorColor || '#ef4444' }}
            />
          </div>
        )}

        {/* 3. THE BATMAN: Genuine Wayne Tactical Combat Batarang (Razor-sharp aerodynamic throwing blade, NO butterfly wings) */}
        {(cursorType === 'batarang' || (cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'batman')) && (
          <div
            className={`relative -translate-x-6 -translate-y-2 transition-transform duration-100 ${
              isHovering ? 'scale-115' : 'scale-100'
            }`}
          >
            <div className={isHovering ? 'animate-batarangTacticalSpin' : ''}>
              <svg
                width="48"
                height="20"
                viewBox="0 0 48 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
              >
                {/* Razor-sharp Aerodynamic Batarang Body (Single-piece titanium bat-wing weapon) */}
                <path
                  d="M24 3 L22 1 L20 4 C14 2 8 2 0 4.5 Q3.5 8 7 10 Q11 12 15 12 Q19 14 24 18.5 Q29 14 33 12 Q37 12 41 10 Q44.5 8 48 4.5 C40 2 34 2 28 4 L26 1 Z"
                  fill="#09090b"
                  stroke={cursorColor || '#eab308'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Center Chiseled Spine Bevel Lines */}
                <path
                  d="M20 4L24 7.5L28 4"
                  stroke="#71717a"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <line x1="24" y1="7.5" x2="24" y2="18.5" stroke="#71717a" strokeWidth="1" />

                {/* Ground Cutting Blade Edge Bevels */}
                <path d="M20 4C14 3.2 8 3.2 0 4.5" stroke={cursorColor || '#eab308'} strokeWidth="1" opacity="0.8" />
                <path d="M28 4C34 3.2 40 3.2 48 4.5" stroke={cursorColor || '#eab308'} strokeWidth="1" opacity="0.8" />

                {/* Tactical Flight Speed Slots (Weight Reduction Holes on Blades) */}
                <line x1="9" y1="6" x2="16" y2="7" stroke={cursorColor || '#eab308'} strokeWidth="1.4" strokeLinecap="round" />
                <line x1="39" y1="6" x2="32" y2="7" stroke={cursorColor || '#eab308'} strokeWidth="1.4" strokeLinecap="round" />

                {/* Central Wayne Gyroscope Pivot Rivet & Targeting Diamond */}
                <circle cx="24" cy="9.5" r="2.2" fill="#18181b" stroke={cursorColor || '#eab308'} strokeWidth="1" />
                <polygon points="24,8.2 25.4,9.6 24,11 22.6,9.6" fill={cursorColor || '#facc15'} />
              </svg>
            </div>
            {isHovering && (
              <span
                className="absolute top-2 left-[24px] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border animate-ping"
                style={{ borderColor: cursorColor || '#eab308' }}
              />
            )}
          </div>
        )}

        {/* 4. DUNE: Fremen Crysknife & Sand Compass Reticle */}
        {(cursorType === 'crysknife' || (cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'dune')) && (
          <div
            className={`relative -translate-x-2 -translate-y-2 transition-transform duration-100 ${
              isHovering ? 'scale-115 rotate-6' : 'scale-100'
            }`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_3px_8px_rgba(217,119,6,0.6)]"
            >
              {/* Sand Compass Outer Orbit */}
              <circle cx="14" cy="14" r="11" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              {/* Crysknife Curved Shai-Hulud Blade */}
              <path
                d="M6 22L12 16L18 8C20 5 22 3 24 4C25 6 23 8 20 10L14 16L8 22H6Z"
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M6 22L9 25L11 23L8 20L6 22Z" fill="#78350f" stroke="#b45309" strokeWidth="1" />
              <circle cx="21" cy="7" r="1.5" fill="#f59e0b" />
            </svg>
          </div>
        )}

        {/* 5. AVATAR: Sacred Woodsprite (Atokirina) Bioluminescent Spore */}
        {(cursorType === 'sacred-spore' || (cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'avatar')) && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-120 ${
              isHovering ? 'scale-120' : 'scale-100'
            }`}
          >
            <div className="animate-sporeDrift">
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]"
              >
                {/* Glowing Jellyfish Spore Bell */}
                <path
                  d="M7 14C7 8 10 4 15 4C20 4 23 8 23 14C23 16 20 16 18 15C16 14 14 14 12 15C10 16 7 16 7 14Z"
                  fill="rgba(56, 189, 248, 0.45)"
                  stroke={cursorColor || '#38bdf8'}
                  strokeWidth="1.4"
                />
                {/* Trailing Bioluminescent Tendrils */}
                <path d="M10 16C10 20 9 24 8 26" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M13 16C13 22 14 24 13 27" stroke={cursorColor || '#38bdf8'} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M17 16C17 22 16 24 17 27" stroke={cursorColor || '#38bdf8'} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M20 16C20 20 21 24 22 26" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />
                {/* Nucleus Core */}
                <circle cx="15" cy="10" r="2.5" fill="#ffffff" />
              </svg>
            </div>
          </div>
        )}

        {/* 5. RESIDENT EVIL: Umbrella Corp Biohazard Reticle */}
        {cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'resident-evil' && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-100 ${
              isHovering ? 'scale-115 rotate-12' : 'scale-100'
            }`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_10px_rgba(239,68,68,0.85)]"
            >
              <circle cx="14" cy="14" r="12" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
              {/* Biohazard Blades */}
              <circle cx="14" cy="9" r="3.5" stroke="#ef4444" strokeWidth="1.5" fill="none" />
              <circle cx="9.5" cy="17" r="3.5" stroke="#ef4444" strokeWidth="1.5" fill="none" />
              <circle cx="18.5" cy="17" r="3.5" stroke="#ef4444" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2" fill="#ef4444" />
            </svg>
          </div>
        )}

        {/* 6. THE BACKROOMS: 1990s VHS Camcorder HUD Cursor */}
        {cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'backrooms' && (
          <div
            className={`relative -translate-x-3 -translate-y-2.5 transition-transform duration-75 ${
              isHovering ? 'scale-110' : 'scale-100'
            }`}
          >
            <div className="flex flex-col items-start gap-0.5">
              <svg
                width="28"
                height="22"
                viewBox="0 0 28 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                {/* 4 Corner Camcorder Brackets */}
                <path d="M1 5V1H6" stroke="#eab308" strokeWidth="1.8" />
                <path d="M27 5V1H22" stroke="#eab308" strokeWidth="1.8" />
                <path d="M1 17V21H6" stroke="#eab308" strokeWidth="1.8" />
                <path d="M27 17V21H22" stroke="#eab308" strokeWidth="1.8" />
                {/* Center Cross */}
                <line x1="14" y1="8" x2="14" y2="14" stroke="#eab308" strokeWidth="1.2" />
                <line x1="11" y1="11" x2="17" y2="11" stroke="#eab308" strokeWidth="1.2" />
              </svg>
              <span className="font-mono text-[8px] text-red-500 font-bold tracking-widest pl-1 bg-black/60 px-1 py-0.2 rounded-xs">
                ● REC
              </span>
            </div>
          </div>
        )}

        {/* 7. THE MATRIX: Terminal Cyber Glyph Prompt Cursor */}
        {cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'matrix-code' && (
          <div
            className={`relative -translate-x-1 -translate-y-1 transition-transform duration-75 ${
              isHovering ? 'scale-115' : 'scale-100'
            }`}
          >
            <div className="px-1.5 py-0.5 rounded-xs bg-black/80 border border-emerald-500/70 text-emerald-400 font-mono text-xs font-bold shadow-[0_0_8px_rgba(16,185,129,0.7)] flex items-center gap-1">
              <span>&gt;_</span>
              <span className="w-1.5 h-3 bg-emerald-400 animate-pulse inline-block" />
            </div>
          </div>
        )}

        {/* 8. BLADE RUNNER 2049: Spinner Blaster Laser Crosshair */}
        {(cursorType === 'laser-crosshair' || (cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'blade-runner')) && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-75 ${
              isHovering ? 'scale-125' : 'scale-100'
            }`}
          >
            <div className="animate-laserCrosshairPulse">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
              >
                <circle cx="13" cy="13" r="10" stroke={cursorColor || '#f97316'} strokeWidth="1.4" strokeDasharray="6 4" />
                <line x1="13" y1="1" x2="13" y2="7" stroke={cursorColor || '#f97316'} strokeWidth="1.5" />
                <line x1="13" y1="19" x2="13" y2="25" stroke={cursorColor || '#f97316'} strokeWidth="1.5" />
                <line x1="1" y1="13" x2="7" y2="13" stroke={cursorColor || '#f97316'} strokeWidth="1.5" />
                <line x1="19" y1="13" x2="25" y2="13" stroke={cursorColor || '#f97316'} strokeWidth="1.5" />
                <circle cx="13" cy="13" r="1.5" fill="#ffffff" />
              </svg>
            </div>
          </div>
        )}

        {/* 9. ONCE UPON A TIME IN HOLLYWOOD: 35mm Film Reel pointer */}
        {cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'hollywood-1969' && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-100 ${
              isHovering ? 'scale-115 rotate-90' : 'scale-100'
            }`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]"
            >
              <circle cx="13" cy="13" r="11" fill="#171717" stroke="#f59e0b" strokeWidth="1.6" />
              <circle cx="13" cy="13" r="3" fill="#f59e0b" />
              <circle cx="13" cy="6.5" r="2" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
              <circle cx="7.5" cy="16.5" r="2" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
              <circle cx="18.5" cy="16.5" r="2" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
            </svg>
          </div>
        )}

        {/* 10. INTERSTELLAR: Endurance Modular Ring Spacecraft Cursor */}
        {(cursorType === 'endurance' || (cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'interstellar')) && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-100 ${
              isHovering ? 'scale-120' : 'scale-100'
            }`}
          >
            <div className="animate-enduranceStationSpin">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]"
              >
                {/* Endurance Outer Ring */}
                <circle cx="14" cy="14" r="10" stroke={cursorColor || '#38bdf8'} strokeWidth="1.2" strokeDasharray="3 2" />
              {/* 12 Modular Pods */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI) / 4;
                const px = 14 + 10 * Math.cos(angle);
                const py = 14 + 10 * Math.sin(angle);
                return (
                  <rect
                    key={i}
                    x={px - 1.5}
                    y={py - 1.5}
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#e0f2fe"
                    stroke="#0284c7"
                    strokeWidth="0.8"
                  />
                );
              })}
              {/* Central Docking Hub */}
              <circle cx="14" cy="14" r="2.5" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="14" cy="14" r="1" fill="#ffffff" />
            </svg>
            </div>
          </div>
        )}

        {/* 11. TRAIN TO BUSAN: KTX Rail Biohazard Reticle */}
        {cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'train-to-busan' && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-100 ${
              isHovering ? 'scale-115 rotate-45' : 'scale-100'
            }`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            >
              {/* Crosshair Outer Rail Frame */}
              <circle cx="13" cy="13" r="11" stroke="#78716c" strokeWidth="1.4" />
              {/* Train Rail Track Cross */}
              <line x1="13" y1="2" x2="13" y2="24" stroke="#a8a29e" strokeWidth="1.5" />
              <line x1="2" y1="13" x2="24" y2="13" stroke="#a8a29e" strokeWidth="1.5" />
              {/* Emergency Infection Center Node */}
              <circle cx="13" cy="13" r="3.5" fill="#881337" stroke="#e11d48" strokeWidth="1.2" />
            </svg>
            {isHovering && (
              <span className="absolute top-3 left-3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600 animate-ping" />
            )}
          </div>
        )}

        {/* 12. OBSESSION: Hypnotic Vertigo Surveillance Iris */}
        {cursorType === 'default' && isMovieStyleWithThemeCursor && uiStyle === 'obsession' && (
          <div
            className={`relative -translate-x-3.5 -translate-y-3.5 transition-transform duration-100 ${
              isHovering ? 'scale-120' : 'scale-100'
            }`}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]"
            >
              {/* Concentric Vertigo Surveillance Iris */}
              <circle cx="15" cy="15" r="13" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 2" />
              <circle cx="15" cy="15" r="9" stroke="#e11d48" strokeWidth="1.2" />
              <circle cx="15" cy="15" r="5" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
              {/* Center Target Eye */}
              <circle cx="15" cy="15" r="2" fill="#e11d48" />
              {/* Surveillance Corner Ticks */}
              <line x1="15" y1="0" x2="15" y2="3" stroke="#e11d48" strokeWidth="1.5" />
              <line x1="15" y1="27" x2="15" y2="30" stroke="#e11d48" strokeWidth="1.5" />
              <line x1="0" y1="15" x2="3" y2="15" stroke="#e11d48" strokeWidth="1.5" />
              <line x1="27" y1="15" x2="30" y2="15" stroke="#e11d48" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {/* Style B: Cinema Camera Viewfinder */}
        {cursorType === 'camera' && (
          <div
            className={`relative -translate-x-3 -translate-y-3 transition-transform duration-120 ${
              isHovering ? 'scale-110' : 'scale-100'
            }`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
            >
              {/* Camera Body */}
              <rect
                x="3"
                y="8"
                width="22"
                height="15"
                rx="3"
                fill="#121216"
                stroke={cursorColor}
                strokeWidth="1.6"
              />
              {/* Top Viewfinder / Flash Hood */}
              <path
                d="M9 8L11 5H17L19 8H9Z"
                fill="#1c1c24"
                stroke={cursorColor}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Lens Barrel */}
              <circle
                cx="14"
                cy="15.5"
                r="4.5"
                fill="#050508"
                stroke={cursorColor}
                strokeWidth="1.4"
              />
              {/* Lens Optical Reflection */}
              <circle cx="15.5" cy="14" r="1" fill="#ffffff" opacity="0.8" />
              {/* Subtle Red Tally Light */}
              <circle cx="21" cy="11.5" r="1" fill="#ef4444" opacity="0.85" />
              {/* Viewfinder Center Crosshair Dot */}
              <circle cx="14" cy="15.5" r="0.75" fill={cursorColor} />
            </svg>

            {/* Subtle hovering focus ring */}
            {isHovering && (
              <span
                className="absolute inset-0 rounded-full border border-dashed pointer-events-none opacity-70"
                style={{
                  borderColor: cursorColor,
                }}
              />
            )}
          </div>
        )}

        {/* Style C: Movie Slate Clapperboard */}
        {cursorType === 'slate' && (
          <div
            className={`relative -translate-x-2 -translate-y-2 transition-transform duration-120 ${
              isHovering ? 'scale-110' : 'scale-100'
            }`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            >
              {/* Slate Lower Main Body */}
              <rect
                x="4"
                y="14"
                width="24"
                height="14"
                rx="2"
                fill="#141418"
                stroke={cursorColor}
                strokeWidth="1.6"
              />
              {/* Slate Production Text Lines */}
              <line x1="8" y1="18" x2="24" y2="18" stroke="#3f3f46" strokeWidth="1" />
              <line x1="8" y1="21" x2="16" y2="21" stroke={cursorColor} strokeWidth="1" opacity="0.85" />
              <line x1="8" y1="24" x2="20" y2="24" stroke="#52525b" strokeWidth="1" />

              {/* Slate Top Clapper Stick (Tactile snap down on Page Change) */}
              <g
                className={`origin-[4px_14px] transition-transform ${
                  isClapping ? 'animate-slateSnapClap' : ''
                }`}
                style={{
                  transform: isClapping ? undefined : 'rotate(-16deg)',
                }}
              >
                {/* Stick base */}
                <rect
                  x="4"
                  y="9"
                  width="24"
                  height="5.5"
                  rx="1.2"
                  fill="#1a1a22"
                  stroke={cursorColor}
                  strokeWidth="1.4"
                />
                {/* Chevron Zebra Stripes */}
                <path d="M8 9.5L11 14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M14 9.5L17 14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M20 9.5L23 14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* Hinge Pin */}
              <circle cx="5" cy="14" r="1.4" fill={cursorColor} />
            </svg>

            {/* Subtle hover accent */}
            {isHovering && (
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping pointer-events-none opacity-60"
                style={{ backgroundColor: cursorColor }}
              />
            )}
          </div>
        )}
      </div>

      {/* 2. REFINED CAMERA FLASH (LESS INTENSE, CUSTOMIZABLE COLOR, NO HARSH STROBE) */}
      {isFlashing && (
        <div
          className="fixed pointer-events-none z-[999995] -translate-x-1/2 -translate-y-1/2"
          style={{ left: burstCoord.x, top: burstCoord.y }}
        >
          {/* Gentle, soft feathered radial aperture flare using customizable flashColor */}
          <div
            className="w-16 h-16 rounded-full animate-cameraFlashSoft"
            style={{
              background: `radial-gradient(circle, ${flashColor} 0%, rgba(255,255,255,0.4) 35%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* 3. REFINED MOVIE SLATE CLAP EFFECT (CONCENTRIC CIRCLES REMOVED AS REQUESTED) */}
      {/* Notice: Concentric shockwaves removed. Only a whisper-subtle micro snap accent is displayed */}
      {isClapping && (
        <div
          className="fixed pointer-events-none z-[999995] -translate-x-1/2 -translate-y-1/2"
          style={{ left: burstCoord.x, top: burstCoord.y }}
        >
          {/* Subtle, non-bold micro-mark */}
          <div
            className="w-4 h-4 rounded-full animate-slateMicroSnap opacity-40"
            style={{
              backgroundColor: cursorColor,
            }}
          />
        </div>
      )}
    </>
  );
};
