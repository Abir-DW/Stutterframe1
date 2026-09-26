import React, { useEffect, useState } from 'react';

interface TypewriterHeroProps {
  text?: string;
  subtext?: string;
}

export const TypewriterHero: React.FC<TypewriterHeroProps> = ({
  text = 'A CINEMATIC TOOLKIT FOR FILMMAKERS & STORYTELLERS.',
  subtext = 'LIVE SEARCH-GROUNDED RESEARCH, COMPUTER VISION SHOT ANALYSIS, SCRIPT DOCTORING & REAL GEAR LOGISTICS.',
}) => {
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

  return (
    <div className="text-center max-w-4xl mx-auto px-4 py-8">
      {/* Film Slate / Scene Marker Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs tracking-widest font-mono uppercase mb-6 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        SCENE 01 / TAKE 01 &bull; 24FPS
      </div>

      {/* Main Typewriter Heading */}
      <h1 className="font-courier text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight min-h-[3.2em] sm:min-h-[2.6em] flex items-center justify-center">
        <span>
          {displayText}
          <span className="inline-block w-2.5 sm:w-3.5 h-6 sm:h-9 bg-amber-400 ml-1 translate-y-1 animate-pulse" />
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
