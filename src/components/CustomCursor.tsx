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

  const shouldRenderCustom =
    isFinePointer &&
    (cursorType === 'camera' ||
      cursorType === 'slate' ||
      (cursorType === 'default' && cursorDefaultMode === 'precision'));

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
        {cursorType === 'default' && cursorDefaultMode === 'precision' && (
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
