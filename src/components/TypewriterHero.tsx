import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

interface TypewriterHeroProps {
  text?: string;
  subtext?: string;
}

export const TypewriterHero: React.FC<TypewriterHeroProps> = ({
  text = 'A CINEMATIC TOOLKIT FOR FILMMAKERS & STORYTELLERS.',
  subtext = 'LIVE SEARCH-GROUNDED RESEARCH, COMPUTER VISION SHOT ANALYSIS, SCRIPT DOCTORING & REAL GEAR LOGISTICS.',
}) => {
  const { uiStyle } = useSettings();
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    let isStuttering = false;
    let isCancelled = false;

    // Defined stutter points for authentic analog typewriter feel
    const stutterPoints = [7, 16, 28]; // e.g. after 'CINEMA', 'TOOLKIT'

    const step = () => {
      if (isCancelled) return;

      if (currentIndex >= text.length) {
        setIsDone(true);
        return;
      }

      // Check if we trigger a stutter at this character
      if (stutterPoints.includes(currentIndex) && !isStuttering) {
        isStuttering = true;
        const char = text[currentIndex];
        // Intentionally duplicate the letter (the "stutter")
        setDisplayText((prev) => prev + char + char);

        setTimeout(() => {
          if (isCancelled) return;
          // Erase the stuttered duplicate
          setDisplayText((prev) => prev.slice(0, -1));
          isStuttering = false;
          currentIndex++;
          setTimeout(step, 140);
        }, 180);
        return;
      }

      setDisplayText(text.slice(0, currentIndex + 1));
      currentIndex++;

      // Natural variable typing speed (55ms - 110ms)
      const delay = Math.floor(Math.random() * 55) + 50;
      setTimeout(step, delay);
    };

    const initialDelay = setTimeout(step, 350);

    return () => {
      isCancelled = true;
      clearTimeout(initialDelay);
    };
  }, [text]);

  // Determine dynamic styling based on active UI theme
  const getHeroHeadingClass = () => {
    switch (uiStyle) {
      case 'godfather':
        return 'godfather-blood-text font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight';
      case 'matrix-code':
        return 'matrix-glitch-text font-mono text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-emerald-400';
      case 'batman':
        return 'batman-hero-text text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider';
      case 'interstellar':
        return 'interstellar-hero-text text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-sky-100';
      case 'train-to-busan':
        return 'busan-hero-text text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide text-zinc-200';
      case 'obsession':
        return 'obsession-hero-text text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white';
      case 'dune':
        return 'font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.2em] text-amber-500 uppercase';
      case 'avatar':
        return 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-cyan-300';
      default:
        return 'font-courier text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white';
    }
  };

  const getCursorColor = () => {
    switch (uiStyle) {
      case 'godfather':
        return 'bg-red-600';
      case 'batman':
        return 'bg-orange-500';
      case 'matrix-code':
        return 'bg-emerald-400';
      case 'interstellar':
        return 'bg-sky-400';
      case 'train-to-busan':
        return 'bg-red-700';
      case 'obsession':
        return 'bg-rose-500';
      case 'avatar':
        return 'bg-cyan-400';
      default:
        return 'bg-amber-400';
    }
  };

  return (
    <div className="text-center max-w-4xl mx-auto px-4 py-8">
      {/* Film Slate / Scene Marker Tag without encapsulating box */}
      <div className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-widest font-mono uppercase mb-6">
        <span className={`w-1.5 h-1.5 rounded-full ${getCursorColor()} animate-pulse`}></span>
        <span>
          {uiStyle === 'godfather'
            ? 'CORLEONE ARCHIVE • 1945'
            : uiStyle === 'batman'
            ? 'WAYNE TACTICAL HUD • GOTHAM'
            : uiStyle === 'interstellar'
            ? 'ENDURANCE MISSION • T-MINUS 0'
            : uiStyle === 'train-to-busan'
            ? 'KTX 101 OUTBREAK LOG • SEOUL'
            : uiStyle === 'obsession'
            ? 'PSYCHOLOGICAL SURVEILLANCE • FEED 04'
            : uiStyle === 'matrix-code'
            ? 'CONSTRUCT FEED • VER 2.0.4'
            : 'SCENE 01 / TAKE 01 • 24FPS'}
        </span>
      </div>

      {/* Main Typewriter Heading with Dynamic Animation */}
      <h1 className={`${getHeroHeadingClass()} mb-6 leading-tight min-h-[3.2em] sm:min-h-[2.6em] flex items-center justify-center`}>
        <span className="relative inline-flex items-center justify-center flex-wrap">
          <span className={uiStyle === 'godfather' ? 'godfather-blood-puddle-text' : ''}>
            {displayText}
          </span>
          <span className={`inline-block w-2.5 sm:w-3.5 h-6 sm:h-9 ${getCursorColor()} ml-1 translate-y-1 animate-pulse shrink-0`} />
        </span>
      </h1>

      {/* Subtext with smooth fade in */}
      <p
        className={`font-mono text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto tracking-wide uppercase transition-all duration-1000 ${
          isDone ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
        }`}
      >
        {subtext}
      </p>
    </div>
  );
};
